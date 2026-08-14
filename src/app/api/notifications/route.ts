import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const summary = searchParams.get("summary") === "1";
    const limitParam = Number(searchParams.get("limit") || "0");

    // `?summary=1` is used by the dashboard header which only needs the
    // unread/total counts — it avoids loading the full notification list
    // (which grows over time) on every 30s poll.
    if (summary) {
      const [total, unread] = await Promise.all([
        prisma.notification.count({ where: { userId: currentUser.id } }),
        prisma.notification.count({
          where: { userId: currentUser.id, read: { not: true } },
        }),
      ]);

      return NextResponse.json(
        { success: true, data: [], total, unread },
        { status: 200 }
      );
    }

    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : undefined;

    const [notifications, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: currentUser.id },
        orderBy: { createdAt: "desc" },
        ...(limit !== undefined ? { take: limit } : {}),
      }),
      prisma.notification.count({
        where: { userId: currentUser.id, read: { not: true } },
      }),
    ]);

    return NextResponse.json(
      { success: true, data: notifications, total: notifications.length, unread },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
