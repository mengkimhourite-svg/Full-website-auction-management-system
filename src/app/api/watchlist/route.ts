import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser, isAdminRole } from "@/lib/auth";
import { syncAuctionStatuses, computeStatus } from "@/lib/auction";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "mine";
    const isAdmin = isAdminRole(user.role);

    const where: Record<string, unknown> = {};
    if (scope !== "all" || !isAdmin) {
      where.userId = user.id;
    }

    // Status sync runs in parallel and never adds latency; it only writes
    // auctions that actually transitioned.
    const [watchlist] = await Promise.all([
      prisma.watchlist.findMany({
        where,
        select: {
          id: true,
          userId: true,
          auctionId: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
          auction: {
            select: {
              id: true,
              status: true,
              startPrice: true,
              currentPrice: true,
              startTime: true,
              endTime: true,
              productId: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  image: true,
                  category: true,
                  seller: { select: { id: true, name: true } },
                },
              },
              _count: { select: { bids: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      syncAuctionStatuses(),
    ]);

    // Report the effective (clock-based) status without waiting for a write.
    const data = watchlist.map((item) => {
      const auction = item.auction as Record<string, unknown> | null | undefined;
      if (!auction) return item;
      return {
        ...item,
        auction: {
          ...auction,
          status: computeStatus(auction as Parameters<typeof computeStatus>[0]),
        },
      };
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/watchlist:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { auctionId } = await request.json();
    if (!auctionId) {
      return NextResponse.json({ success: false, error: "auctionId is required" }, { status: 400 });
    }

    const auction = await prisma.auction.findUnique({ where: { id: auctionId } });
    if (!auction) {
      return NextResponse.json({ success: false, error: "Auction not found" }, { status: 404 });
    }

    const existing = await prisma.watchlist.findUnique({
      where: { userId_auctionId: { userId: user.id, auctionId } },
    });
    if (existing) {
      return NextResponse.json({ success: true, data: existing }, { status: 200 });
    }

    const entry = await prisma.watchlist.create({
      data: { userId: user.id, auctionId },
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/watchlist:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
