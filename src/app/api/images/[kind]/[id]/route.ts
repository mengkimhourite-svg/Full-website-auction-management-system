import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * GET /api/images/[kind]/[id]
 *
 * Serves the raw bytes of an uploaded image stored as a base64 data URL in
 * MongoDB (products.image / users.avatar). List endpoints rewrite data URLs
 * to these URLs via `toImageUrl()` so API payloads stay small; the browser
 * fetches images separately, and the Cache-Control header keeps repeat
 * loads cheap.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  try {
    const { kind, id } = await params;

    const row =
      kind === "user"
        ? await prisma.user.findUnique({ where: { id } })
        : await prisma.product.findUnique({ where: { id } });

    const dataUrl = typeof row?.image === "string" ? row.image : row?.avatar ?? null;

    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      return new NextResponse(null, { status: 404 });
    }

    const mime = dataUrl.slice(5, dataUrl.indexOf(";")) || "image/png";
    const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    const body = Buffer.from(base64, "base64");

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
