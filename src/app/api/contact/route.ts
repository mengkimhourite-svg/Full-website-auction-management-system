import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { contactSchema } from "@/lib/validation";
import { rateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit("contact", { windowMs: 300000, maxRequests: 3 });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many contact attempts. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          message: `Contact message from ${name} (${email})${subject ? ` - ${subject}` : ""}: ${message}`,
        },
      });
    }

    return NextResponse.json(
      { success: true, data: { message: "Message sent successfully" } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
