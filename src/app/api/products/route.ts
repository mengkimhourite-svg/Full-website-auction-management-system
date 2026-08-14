import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { toImageUrl } from "@/lib/images";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const where: Record<string, unknown> = {};

    if (user.role === "SELLER") {
      where.sellerId = user.id;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        seller: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        auction: { select: { id: true, status: true, currentPrice: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = products.map((product) => ({
      ...product,
      image: toImageUrl(product.image, "product", product.id),
      seller: product.seller
        ? { ...product.seller, avatar: toImageUrl(product.seller.avatar, "user", product.seller.id) }
        : undefined,
    }));

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
