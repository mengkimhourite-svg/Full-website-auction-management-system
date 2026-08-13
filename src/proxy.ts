import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/jwt";

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  ADMIN: "/admin",
  SELLER: "/seller/auctions",
  BIDDER: "/bidder",
};

function roleCanAccess(role: string, pathname: string): boolean {
  const normalized = (role || "").toUpperCase();
  if (pathname.startsWith("/admin")) {
    return normalized === "ADMIN" || normalized === "SUPER_ADMIN";
  }
  if (pathname.startsWith("/seller")) {
    return normalized === "SELLER";
  }
  if (pathname.startsWith("/bidder")) {
    return normalized === "BIDDER";
  }
  return true;
}

function loginRedirect(request: NextRequest) {
  const url = new URL("/login", request.url);
  url.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
  return url;
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(loginRedirect(request));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(loginRedirect(request));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  if (!roleCanAccess(payload.role, request.nextUrl.pathname)) {
    const home = ROLE_HOME[payload.role.toUpperCase()] ?? "/";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/bidder/:path*"],
};