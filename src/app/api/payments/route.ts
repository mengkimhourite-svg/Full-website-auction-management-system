import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { syncAuctionStatuses } from "@/lib/auction";

export async function GET() {
  try {
    const actor = await getAuthUser();
    if (!actor) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (actor.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        auction: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { success: true, data: payments },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthUser();
    if (!actor) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (actor.banned) {
      return NextResponse.json({ success: false, error: "Account suspended" }, { status: 403 });
    }

    const { auctionId, method } = await request.json();

    if (!auctionId) {
      return NextResponse.json(
        { success: false, error: "auctionId is required" },
        { status: 400 }
      );
    }

    await syncAuctionStatuses();

    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: { product: true },
    });
    if (!auction) {
      return NextResponse.json(
        { success: false, error: "Auction not found" },
        { status: 404 }
      );
    }

    if (auction.status !== "ENDED") {
      return NextResponse.json(
        { success: false, error: "Payment is only available after the auction ends" },
        { status: 400 }
      );
    }

    const existingPayment = await prisma.payment.findFirst({
      where: { auctionId, userId: actor.id, status: "SUCCESS" },
    });
    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: "You have already paid for this auction" },
        { status: 400 }
      );
    }

    const topBid = await prisma.bid.findFirst({
      where: { auctionId },
      orderBy: { amount: "desc" },
    });
    if (!topBid || topBid.userId !== actor.id) {
      return NextResponse.json(
        { success: false, error: "Only the winning bidder can pay" },
        { status: 403 }
      );
    }

    const amount = auction.currentPrice;

    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          amount,
          userId: actor.id,
          auctionId,
          status: "SUCCESS",
          method: method || "card",
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          auction: {
            include: {
              product: { select: { id: true, title: true } },
            },
          },
        },
      });

      await tx.notification.create({
        data: {
          userId: actor.id,
          message: `Payment of $${amount} for "${auction.product.title}" confirmed.`,
        },
      });

      const admins = await tx.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });
      for (const admin of admins) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            message: `Payment of $${amount} received from ${actor.name} for "${auction.product.title}".`,
          },
        });
      }

      return created;
    });

    return NextResponse.json(
      { success: true, data: payment },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
