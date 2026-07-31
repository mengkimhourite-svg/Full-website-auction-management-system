import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { syncAuctionStatuses } from "@/lib/auction";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await syncAuctionStatuses();

    const watchlist = await prisma.watchlist.findMany({
      where: { userId: user.id },
      include: {
        auction: {
          include: {
            product: {
              include: {
                seller: { select: { id: true, name: true } },
              },
            },
            _count: { select: { bids: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: watchlist }, { status: 200 });
  } catch {
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
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
