import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { comparePassword, createToken, setAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit("login", { windowMs: 60000, maxRequests: 10 });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.banned) {
      return NextResponse.json(
        { success: false, error: "Your account has been suspended" },
        { status: 403 }
      );
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await setAuthCookie(token);

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { success: true, data: userWithoutPassword },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
