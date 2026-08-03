import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // កែពី "@/lib/db"
import { getAuthUser } from "@/lib/auth";
import { syncAuctionStatuses, serializeAuction, cleanText, cleanOptionalText } from "@/lib/auction";

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
      { success: true, data: serializeAuction(auction) },
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
    if (body.startPrice !== undefined) {
      const price = Number(body.startPrice);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ success: false, error: "startPrice must be a positive number" }, { status: 400 });
      }
      data.startPrice = price;
    }
    if (body.currentPrice !== undefined) {
      const price = Number(body.currentPrice);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ success: false, error: "currentPrice must be a non-negative number" }, { status: 400 });
      }
      data.currentPrice = price;
    }
    if (body.endTime !== undefined) data.endTime = new Date(body.endTime);
    if (body.status !== undefined) {
      const status = cleanText(body.status, "");
      if (!["UPCOMING", "ACTIVE", "ENDED"].includes(status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }
      data.status = status;
    }

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
            ...(body.productTitle !== undefined && { title: cleanText(body.productTitle, "") }),
            ...(body.productDescription !== undefined && { description: cleanText(body.productDescription, "") }),
            ...(body.productImage !== undefined && { image: cleanOptionalText(body.productImage) }),
            ...(body.category !== undefined && { category: cleanText(body.category, "General") }),
          },
        });
      }

      return tx.auction.findUnique({
        where: { id },
        include: { product: true },
      });
    });

    return NextResponse.json(
      { success: true, data: auction ? serializeAuction(auction) : null },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// នេះជាកូដ DELETE ថ្មីដែលអ្នកបានផ្ញើមក ត្រូវបានដាក់បញ្ចូលនៅទីនេះ
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
      return NextResponse.json({ success: false, error: "Auction not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && auction.product.sellerId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // ប្រើ Transaction ដើម្បីលុបទាំងអស់គ្នាជាមួយគ្នា
    await prisma.$transaction([
      prisma.bid.deleteMany({ where: { auctionId: id } }),
      prisma.payment.deleteMany({ where: { auctionId: id } }),
      prisma.watchlist.deleteMany({ where: { auctionId: id } }),
      prisma.auction.delete({ where: { id } }),
      prisma.product.delete({ where: { id: auction.productId } }),
    ]);

    return NextResponse.json(
      { success: true, data: { message: "Auction and associated product deleted" } },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}