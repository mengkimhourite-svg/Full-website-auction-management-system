import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { syncAuctionStatuses, serializeAuction, cleanText, cleanOptionalText } from "@/lib/auction";
import { auctionSchema } from "@/lib/validation";
import { rateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  try {
    await syncAuctionStatuses();

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (sellerId) where.product = { sellerId };
    if (status) where.status = status;

    const auctions = await prisma.auction.findMany({
      where,
      include: {
        product: {
          include: {
            seller: {
              select: { id: true, name: true, email: true, role: true, avatar: true },
            },
          },
        },
        _count: { select: { bids: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { success: true, data: auctions.map(serializeAuction) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/auctions:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit("create-auction", { windowMs: 60000, maxRequests: 10 });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "ADMIN" && user.role !== "SELLER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = auctionSchema.safeParse({
      productTitle: body.productTitle ?? body.title ?? "",
      productDescription: body.productDescription ?? body.description ?? "",
      productImage: body.productImage ?? body.image ?? undefined,
      category: body.category ?? "General",
      startPrice: Number(body.startPrice ?? body.startingPrice ?? 0),
      startTime: body.startTime || new Date().toISOString(),
      endTime: body.endTime,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { productTitle, productDescription, productImage, category, startPrice, endTime, startTime } = parsed.data;

    const start = new Date(startTime!);
    const end = new Date(endTime);
    if (end <= start) {
      return NextResponse.json(
        { success: false, error: "endTime must be after startTime" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        title: productTitle,
        description: productDescription || "",
        image: productImage || null,
        category: category || "General",
        sellerId: user.id,
      },
    });

    const now = new Date();
    const auction = await prisma.auction.create({
      data: {
        productId: product.id,
        startPrice,
        currentPrice: startPrice,
        startTime: start,
        endTime: end,
        status: now >= start ? "ACTIVE" : "UPCOMING",
      },
      include: {
        product: true,
        _count: { select: { bids: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: serializeAuction(auction) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/auctions:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
