import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { computeStatus } from "@/lib/auction";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (user.banned) {
      return NextResponse.json({ success: false, error: "Account suspended" }, { status: 403 });
    }
    if (user.role !== "BIDDER") {
      return NextResponse.json({ success: false, error: "Only bidders can place bids" }, { status: 403 });
    }

    const { id } = await params;
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid bid amount" }, { status: 400 });
    }

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!auction) {
      return NextResponse.json({ success: false, error: "Auction not found" }, { status: 404 });
    }

    if (auction.product.sellerId === user.id) {
      return NextResponse.json({ success: false, error: "You cannot bid on your own auction" }, { status: 400 });
    }

    const effectiveStatus = computeStatus(auction);
    if (effectiveStatus === "ENDED" || effectiveStatus === "UPCOMING") {
      await prisma.auction.update({
        where: { id },
        data: { status: effectiveStatus },
      });
      return NextResponse.json(
        { success: false, error: effectiveStatus === "UPCOMING" ? "Auction has not started yet" : "Auction has ended" },
        { status: 400 }
      );
    }

    if (amount <= auction.currentPrice) {
      return NextResponse.json(
        { success: false, error: `Bid must be greater than current price of $${auction.currentPrice}` },
        { status: 400 }
      );
    }

    const [bid] = await prisma.$transaction([
      prisma.bid.create({
        data: {
          amount,
          userId: user.id,
          auctionId: id,
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        },
      }),
      prisma.auction.update({
        where: { id },
        data: { currentPrice: amount, status: "ACTIVE" },
      }),
      prisma.notification.create({
        data: {
          userId: auction.product.sellerId,
          message: `New bid of $${amount} placed on "${auction.product.title}".`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: bid }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const bids = await prisma.bid.findMany({
      where: { auctionId: id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: bids }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
