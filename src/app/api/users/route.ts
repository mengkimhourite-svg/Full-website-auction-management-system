import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser, isAdminRole } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminRole(user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        banned: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bids: true,
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Auction counts per user in two passes instead of one count query
    // per user (N+1): map auctions -> products -> sellers.
    const [products, auctions] = await Promise.all([
      prisma.product.findMany({
        select: { id: true, sellerId: true },
      }),
      prisma.auction.findMany({
        select: { productId: true },
      }),
    ]);

    const auctionsPerProduct = new Map<string, number>();
    for (const auction of auctions) {
      const productId = auction.productId;
      auctionsPerProduct.set(
        productId,
        (auctionsPerProduct.get(productId) || 0) + 1
      );
    }

    const auctionsPerSeller = new Map<string, number>();
    for (const product of products) {
      const count = auctionsPerProduct.get(product.id) || 0;
      if (count > 0) {
        auctionsPerSeller.set(
          product.sellerId,
          (auctionsPerSeller.get(product.sellerId) || 0) + count
        );
      }
    }

    const usersWithAuctionCount = users.map((user) => ({
      ...user,
      auctionCount: auctionsPerSeller.get(user.id) || 0,
    }));

    return NextResponse.json(
      { success: true, data: usersWithAuctionCount },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
