import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // កែពី "@/lib/db"
import { getAuthUser } from "@/lib/auth";
import { syncAuctionStatuses, serializeAuction, cleanText, cleanOptionalText } from "@/lib/auction";

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
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "ADMIN" && user.role !== "SELLER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Normalize field names + clean values
    const productTitle = cleanText(body.productTitle ?? body.title ?? "");
    const productDescription = cleanText(body.productDescription ?? body.description ?? "");
    const productImage = cleanOptionalText(body.productImage ?? body.image ?? "");
    const category = cleanText(body.category ?? "", "General");
    const startPrice = Number(body.startPrice ?? body.startingPrice ?? 0);
    const endTime = body.endTime;
    const startTime = body.startTime || new Date().toISOString();

    // Validation
    if (!productTitle || !Number.isFinite(startPrice) || startPrice < 0 || !endTime) {
      return NextResponse.json(
        { success: false, error: "productTitle, startPrice (>=0), and endTime are required" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return NextResponse.json(
        { success: false, error: "endTime must be after startTime" },
        { status: 400 }
      );
    }

    // Create Product
    const product = await prisma.product.create({
      data: {
        title: productTitle,
        description: productDescription,
        image: productImage,
        category,
        sellerId: user.id,
      },
    });

    // Create Auction
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