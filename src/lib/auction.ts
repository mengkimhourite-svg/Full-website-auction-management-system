import prisma from "@/lib/db";
import type { AuctionStatus } from "@/types";
import { formatDateOnly } from "@/lib/utils";
import { invalidateCache } from "@/lib/cache";
import { toImageUrl } from "@/lib/images";

export type { AuctionStatus };
export { cleanText, cleanOptionalText, formatDateOnly } from "@/lib/utils";

type AuctionRecord = {
  id: string;
  startPrice: number;
  currentPrice: number;
  startTime: Date | string;
  endTime: Date | string;
  status: AuctionStatus;
  productId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type AuctionWithRelations = AuctionRecord & {
  product?: {
    id: string;
    title: string;
    description: string;
    image: string | null;
    category: string;
    sellerId: string;
    seller?: { id: string; name: string; email: string; role: string; avatar: string | null } | null;
  } | null;
  bids?: { id: string; amount: number; userId: string; auctionId: string; createdAt: Date }[];
  _count?: { bids: number };
};

export function computeStatus(auction: {
  status: AuctionStatus;
  startTime: Date | string;
  endTime: Date | string;
}): AuctionStatus {
  const now = new Date();
  if (now >= new Date(auction.endTime)) return "ENDED";
  if (auction.status === "UPCOMING" && now >= new Date(auction.startTime)) return "ACTIVE";
  return auction.status;
}

export function serializeAuction(auction: AuctionWithRelations) {
  const product = auction.product ?? null;
  const bidCount = auction._count?.bids ?? auction.bids?.length ?? 0;

  // Base64 data URLs can be hundreds of KB each; rewrite them to
  // /api/images/... URLs so list payloads stay small (UI is unchanged —
  // the client still receives a plain src-able string).
  const image = product ? toImageUrl(product.image, "product", product.id) : null;
  const seller = product?.seller
    ? {
        ...product.seller,
        avatar: toImageUrl(product.seller.avatar, "user", product.seller.id),
      }
    : null;

  return {
    id: auction.id,
    title: product?.title || "Untitled Auction",
    description: product?.description || "",
    image,
    category: product?.category || "General",
    sellerId: product?.sellerId || null,
    seller,
    startPrice: auction.startPrice,
    currentPrice: auction.currentPrice,
    startTime: auction.startTime,
    endTime: auction.endTime,
    startDate: formatDateOnly(auction.startTime),
    endDate: formatDateOnly(auction.endTime),
    status: computeStatus(auction),
    bidCount,
    _count: { bids: bidCount },
    product: product ? { ...product, image, seller } : null,
    bids: auction.bids ?? [],
    createdAt: auction.createdAt,
    updatedAt: auction.updatedAt,
    createdDate: formatDateOnly(auction.createdAt),
  };
}

async function notifyAuctionEnded(
  auction: AuctionWithRelations,
  client: Pick<typeof prisma, "notification"> = prisma
): Promise<void> {
  const product = auction.product;
  if (!product) return;

  const topBid = auction.bids?.[0];
  if (topBid) {
    await client.notification.create({
      data: {
        userId: topBid.userId,
        message: `You won the auction "${product.title}"! Complete your payment to claim it.`,
      },
    });
  }

  await client.notification.create({
    data: {
      userId: product.sellerId,
      message: `Your auction "${product.title}" has ended.`,
    },
  });
}

/**
 * Brings stored auction statuses in line with the clock.
 *
 * Serverless-safe design:
 * - Only auctions that can actually transition are touched (bounded where).
 * - Transitions are applied with two batched updateMany calls inside a single
 *   transaction, so at most a handful of Mongo writes happen no matter how
 *   many auctions transitioned (the store persists only changed rows).
 * - When nothing transitioned, zero rows are written.
 * - Winner/seller notifications are created in the same transaction so the
 *   notifications collection is persisted once.
 *
 * Throttled: list/dashboard endpoints call this on every request, but the
 * stored status is only used for data-at-rest consistency — every API
 * response reports the effective clock-based status via `computeStatus()`.
 * Running the write-back at most once per interval removes the heaviest
 * work (full-collection scans + potential Mongo writes) from ~every request
 * without changing what clients see.
 */
const STATUS_SYNC_INTERVAL_MS = 30_000;

let lastStatusSyncAt = 0;

export async function syncAuctionStatuses(
  options?: { force?: boolean }
): Promise<void> {
  if (
    !options?.force &&
    Date.now() - lastStatusSyncAt < STATUS_SYNC_INTERVAL_MS
  ) {
    return;
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const endedCandidates = await tx.auction.findMany({
      where: {
        status: { in: ["UPCOMING", "ACTIVE"] },
        endTime: { lte: now },
      },
      select: { id: true },
    });

    if (endedCandidates.length > 0) {
      const endedIds = endedCandidates.map((auction) => String(auction.id));

      await tx.auction.updateMany({
        where: { id: { in: endedIds } },
        data: { status: "ENDED" },
      });

      const endedAuctions = await tx.auction.findMany({
        where: { id: { in: endedIds } },
        include: { bids: { orderBy: { amount: "desc" }, take: 1 }, product: true },
      });

      for (const auction of endedAuctions) {
        await notifyAuctionEnded(auction, tx);
      }
    }

    await tx.auction.updateMany({
      where: {
        status: "UPCOMING",
        startTime: { lte: now },
        endTime: { gt: now },
      },
      data: { status: "ACTIVE" },
    });
  });

  // Stored statuses changed (or were re-verified): drop the cached
  // status-count aggregate so the dashboard shows the synced numbers.
  invalidateCache("auction-status-counts");

  lastStatusSyncAt = Date.now();
}

export async function syncAuctionById(id: string): Promise<AuctionRecord | null> {
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: { bids: { orderBy: { amount: "desc" }, take: 1 }, product: true },
  });

  if (!auction) return null;

  const effective = computeStatus(auction);
  if (effective !== auction.status) {
    await prisma.auction.update({ where: { id: auction.id }, data: { status: effective } });

    if (effective === "ENDED") {
      await notifyAuctionEnded(auction);
    }
  }

  return prisma.auction.findUnique({ where: { id } });
}
