import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { read } = await request.json();

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 });
    }

    if (notification.userId !== currentUser.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: read ?? true },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
