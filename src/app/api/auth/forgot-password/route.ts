import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { SignJWT } from "jose";
import { getJwtSecret } from "@/lib/jwt";
import { forgotPasswordSchema } from "@/lib/validation";
import { rateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit("forgot-password", { windowMs: 60000, maxRequests: 5 });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          data: { message: "If an account exists with that email, a reset link has been sent." },
        },
        { status: 200 }
      );
    }

    // Generate a short-lived reset token (1 hour)
    const resetToken = await new SignJWT({
      id: user.id,
      email: user.email,
      purpose: "password-reset",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(getJwtSecret());

    // In production, you would send this token via email.
    // For demo purposes, we return it in the response.
    return NextResponse.json(
      {
        success: true,
        data: {
          message: "If an account exists with that email, a reset link has been sent.",
          // Demo only: include token so the user can reset without email
          resetToken,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/auth/forgot-password] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
