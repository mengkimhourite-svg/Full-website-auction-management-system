import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { rateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit("register", { windowMs: 300000, maxRequests: 5 });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "BIDDER",
      },
    });

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await setAuthCookie(token);

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { success: true, data: userWithoutPassword },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
