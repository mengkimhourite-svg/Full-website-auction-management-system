import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar");
    const bodyImage = formData.get("image");

    let image: string | null = null;
    if (file instanceof File) {
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "Image must be under 2MB" },
          { status: 400 }
        );
      }
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: "File must be an image" },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      image = `data:${file.type};base64,${buffer.toString("base64")}`;
    } else if (typeof bodyImage === "string") {
      image = bodyImage;
    }

    if (!image) {
      return NextResponse.json(
        { success: false, error: "avatar file is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: image },
      select: { id: true, avatar: true },
    });

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
