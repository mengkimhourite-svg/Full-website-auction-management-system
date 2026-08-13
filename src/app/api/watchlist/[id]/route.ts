import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

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

    const entry = await prisma.watchlist.findFirst({
      where: { id, userId: user.id },
    });
    if (!entry) {
      return NextResponse.json(
        { success: false, error: "Watchlist item not found" },
        { status: 404 }
      );
    }

    await prisma.watchlist.delete({ where: { id } });

    return NextResponse.json(
      { success: true, data: { message: "Removed from watchlist" } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/watchlist/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
