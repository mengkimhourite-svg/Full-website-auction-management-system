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

    const usersWithAuctionCount = await Promise.all(
      users.map(async (user) => {
        const auctionCount = await prisma.auction.count({
          where: {
            product: {
              sellerId: user.id,
            },
          },
        });

        return {
          ...user,
          auctionCount,
        };
      })
    );

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
