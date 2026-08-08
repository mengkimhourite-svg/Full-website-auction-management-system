import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jwtVerify } from "jose";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validation";
import { rateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production"
);

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit("reset-password", { windowMs: 60000, maxRequests: 5 });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Verify the reset token
    let payload;
    try {
      const result = await jwtVerify(token, JWT_SECRET);
      payload = result.payload as { id: string; email: string; purpose: string };
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    if (payload.purpose !== "password-reset") {
      return NextResponse.json(
        { success: false, error: "Invalid reset token" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Hash the new password and update
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { success: true, data: { message: "Password reset successful. You can now log in." } },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
