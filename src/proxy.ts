import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/about",
  "/contact",
  "/how-it-works",
  "/auctions",
  "/forgot-password",
  "/categories",
  "/faq",
  "/privacy",
  "/terms",
  "/shipping",
  "/api/auth/login",
  "/api/auth/register",
  "/api/contact",
];

const publicPrefixes = ["/auctions/"];

const authPages = ["/login", "/register"];
const apiPrefix = "/api";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isApiRoute = pathname.startsWith(apiPrefix);
  const isStaticAsset = pathname.startsWith("/_next") || pathname.startsWith("/favicon");
  const isPublic = publicRoutes.includes(pathname) || publicPrefixes.some((p) => pathname.startsWith(p));
  const isStaticFile = /\.(png|svg|jpg|jpeg|webp|gif|ico|avif|css|js|woff2?|ttf|eot|mp4|webm)$/i.test(pathname);

  if (isStaticAsset || isStaticFile) return NextResponse.next();

  let payload: { id: string; role: string } | null = null;
  if (token) {
    const verified = await verifyToken(token);
    if (verified) {
      payload = { id: verified.id, role: verified.role };
    }
  }

  if (isApiRoute) return NextResponse.next();

  if (isPublic) {
    if (payload && authPages.includes(pathname)) {
      const target =
        payload.role === "ADMIN"
          ? "/admin"
          : payload.role === "SELLER"
            ? "/seller/auctions"
            : "/";
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/bidder/reports", request.url));
  }
  if (pathname.startsWith("/seller") && payload.role !== "SELLER") {
    return NextResponse.redirect(new URL("/bidder/reports", request.url));
  }
  if (pathname.startsWith("/bidder") && payload.role !== "BIDDER") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
