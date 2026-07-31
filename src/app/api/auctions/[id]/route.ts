import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { syncAuctionStatuses } from "@/lib/auction";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await syncAuctionStatuses();

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
              },
            },
          },
        },
        bids: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!auction) {
      return NextResponse.json(
        { success: false, error: "Auction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: auction },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.auction.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Auction not found" },
        { status: 404 }
      );
    }

    if (user.role !== "ADMIN" && existing.product.sellerId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.startPrice !== undefined) data.startPrice = body.startPrice;
    if (body.currentPrice !== undefined) data.currentPrice = body.currentPrice;
    if (body.endTime !== undefined) data.endTime = new Date(body.endTime);
    if (body.status !== undefined) data.status = body.status;

    const auction = await prisma.$transaction(async (tx) => {
      await tx.auction.update({
        where: { id },
        data,
        include: { product: true },
      });

      if (
        body.productTitle !== undefined ||
        body.productDescription !== undefined ||
        body.productImage !== undefined ||
        body.category !== undefined
      ) {
        await tx.product.update({
          where: { id: existing.productId },
          data: {
            ...(body.productTitle !== undefined && { title: body.productTitle }),
            ...(body.productDescription !== undefined && { description: body.productDescription }),
            ...(body.productImage !== undefined && { image: body.productImage }),
            ...(body.category !== undefined && { category: body.category }),
          },
        });
      }

      return tx.auction.findUnique({
        where: { id },
        include: { product: true },
      });
    });

    return NextResponse.json(
      { success: true, data: auction },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!auction) {
      return NextResponse.json(
        { success: false, error: "Auction not found" },
        { status: 404 }
      );
    }

    if (user.role !== "ADMIN" && auction.product.sellerId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await prisma.bid.deleteMany({ where: { auctionId: id } });
    await prisma.payment.deleteMany({ where: { auctionId: id } });
    await prisma.watchlist.deleteMany({ where: { auctionId: id } });
    await prisma.auction.delete({ where: { id } });
    await prisma.product.delete({ where: { id: auction.productId } });

    return NextResponse.json(
      { success: true, data: { message: "Auction and associated product deleted" } },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
