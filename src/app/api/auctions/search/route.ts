import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { serializeAuction } from "@/lib/auction";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      const auctions = await prisma.auction.findMany({
        include: {
          product: true,
          _count: { select: { bids: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(
        { success: true, data: auctions.map(serializeAuction) },
        { status: 200 }
      );
    }

    const auctions = await prisma.auction.findMany({
      where: {
        product: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { category: { contains: q } },
          ],
        },
      },
      include: {
        product: true,
        _count: { select: { bids: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { success: true, data: auctions.map(serializeAuction) },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
