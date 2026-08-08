import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { syncAuctionStatuses } from "@/lib/auction";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await syncAuctionStatuses();

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "mine";

    const isAdmin = user.role === "ADMIN";
    const where: Record<string, unknown> = {};

    if (scope === "all" && isAdmin) {
      // Admin sees all bids
    } else {
      where.userId = user.id;
    }

    const bids = await prisma.bid.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        auction: {
          include: {
            product: {
              include: {
                seller: { select: { id: true, name: true } },
              },
            },
            payments: isAdmin ? {} : {
              where: { userId: user.id },
              select: { id: true, status: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (scope === "won") {
      const wonByAuction = new Map<string, { bid: (typeof bids)[number]; auction: (typeof bids)[number]["auction"] }>();
      for (const bid of bids) {
        const auction = bid.auction;
        if (auction.status !== "ENDED") continue;
        const current = wonByAuction.get(auction.id);
        if (!current || bid.amount > current.bid.amount) {
          wonByAuction.set(auction.id, { bid, auction });
        }
      }
      const won = Array.from(wonByAuction.values()).filter(({ bid, auction }) => bid.amount >= auction.currentPrice);
      const withPayment = won.map(({ bid, auction }) => ({
        ...bid,
        auction: {
          ...auction,
          paymentStatus: Array.isArray(auction.payments) && auction.payments.length > 0
            ? auction.payments[0]?.status || "PENDING"
            : "PENDING",
        },
      }));
      return NextResponse.json({ success: true, data: withPayment }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: bids }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
