import prisma from "@/lib/db";
import type { Auction, AuctionStatus } from "@prisma/client";

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
