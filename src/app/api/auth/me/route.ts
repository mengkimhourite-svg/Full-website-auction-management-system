import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toImageUrl } from "@/lib/images";

// Only the fields the client renders (header, profile, role checks).
// Previously the full row — including the base64 avatar, which can be
// hundreds of KB — was fetched and returned.
const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  banned: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: true, data: null },
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: USER_SELECT,
    });

    if (!user) {
      return NextResponse.json(
        { success: true, data: null },
        { status: 200 }
      );
    }

    const data = {
      ...user,
      avatar: toImageUrl(user.avatar, "user", user.id),
    };

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/auth/me] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}