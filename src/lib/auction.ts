import prisma from "@/lib/db";
import type { Auction, AuctionStatus, Product, User } from "@prisma/client";
import type { Bid } from "@prisma/client";

type AuctionWithRelations = Auction & {
  product?: Product & { seller?: Partial<User> | null };
  bids?: Bid[];
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

export function cleanText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

export function cleanOptionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function formatDateOnly(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

export async function syncAuctionStatuses(): Promise<void> {
  const auctions = await prisma.auction.findMany({
    where: { status: { in: ["UPCOMING", "ACTIVE"] } },
    include: { bids: { orderBy: { amount: "desc" }, take: 1 }, product: true },
  });

  for (const auction of auctions) {
    const effective = computeStatus(auction);
    if (effective === auction.status) continue;

    await prisma.auction.update({ where: { id: auction.id }, data: { status: effective } });

    if (effective === "ENDED") {
      const topBid = auction.bids[0];
      if (topBid) {
        await prisma.notification.create({
          data: {
            userId: topBid.userId,
            message: `You won the auction "${auction.product.title}"! Complete your payment to claim it.`,
          },
        });
      }
      await prisma.notification.create({
        data: {
          userId: auction.product.sellerId,
          message: `Your auction "${auction.product.title}" has ended.`,
        },
      });
    }
  }
}

export async function syncAuctionById(id: string): Promise<Auction | null> {
  await syncAuctionStatuses();
  return prisma.auction.findUnique({ where: { id } });
}
