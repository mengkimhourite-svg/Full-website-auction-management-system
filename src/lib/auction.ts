import prisma from "@/lib/db";
import type { AuctionStatus } from "@/types";
import { formatDateOnly } from "@/lib/utils";

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
  startTime: Date;
  endTime: Date;
}): AuctionStatus {
  const now = new Date();
  if (now >= auction.endTime) return "ENDED";
  if (auction.status === "UPCOMING" && now >= auction.startTime) return "ACTIVE";
  return auction.status;
}

export function serializeAuction(auction: AuctionWithRelations) {
  const product = auction.product ?? null;
  const bidCount = auction._count?.bids ?? auction.bids?.length ?? 0;
  return {
    id: auction.id,
    title: product?.title || "Untitled Auction",
    description: product?.description || "",
    image: product?.image || null,
    category: product?.category || "General",
    sellerId: product?.sellerId || null,
    seller: product?.seller || null,
    startPrice: auction.startPrice,
    currentPrice: auction.currentPrice,
    startTime: auction.startTime,
    endTime: auction.endTime,
    startDate: formatDateOnly(auction.startTime),
    endDate: formatDateOnly(auction.endTime),
    status: auction.status,
    bidCount,
    _count: { bids: bidCount },
    product,
    bids: auction.bids ?? [],
    createdAt: auction.createdAt,
    updatedAt: auction.updatedAt,
    createdDate: formatDateOnly(auction.createdAt),
  };
}

async function notifyAuctionEnded(auction: AuctionWithRelations): Promise<void> {
  const product = auction.product;
  if (!product) return;

  const topBid = auction.bids?.[0];
  if (topBid) {
    await prisma.notification.create({
      data: {
        userId: topBid.userId,
        message: `You won the auction "${product.title}"! Complete your payment to claim it.`,
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: product.sellerId,
      message: `Your auction "${product.title}" has ended.`,
    },
  });
}

export async function syncAuctionStatuses(): Promise<void> {
  const now = new Date();
  // Only auctions that could actually transition are scanned:
  // - any whose endTime has passed or is within the next minute (UPCOMING/ACTIVE -> ENDED)
  // - UPCOMING auctions whose startTime has passed (UPCOMING -> ACTIVE)
  const horizon = new Date(now.getTime() + 60_000);

  const auctions = await prisma.auction.findMany({
    where: {
      status: { in: ["UPCOMING", "ACTIVE"] },
      OR: [
        { endTime: { lte: horizon } },
        { status: "UPCOMING", startTime: { lte: now } },
      ],
    },
    include: { bids: { orderBy: { amount: "desc" }, take: 1 }, product: true },
  });

  for (const auction of auctions) {
    const effective = computeStatus(auction);
    if (effective === auction.status) continue;

    await prisma.auction.update({ where: { id: auction.id }, data: { status: effective } });

    if (effective === "ENDED") {
      await notifyAuctionEnded(auction);
    }
  }
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
