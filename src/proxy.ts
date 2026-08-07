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
  "/api/auth/logout",
  "/api/contact",
  "/api/health",
  "/api/auctions",
];

const publicPrefixes = ["/auctions/"];

const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/seller": ["SELLER", "ADMIN"],
  "/bidder": ["BIDDER", "ADMIN"],
  "/profile": ["ADMIN", "SELLER", "BIDDER"],
  "/notifications": ["ADMIN", "SELLER", "BIDDER"],
  "/checkout": ["ADMIN", "SELLER", "BIDDER"],
};

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
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      if (!allowedRoles.includes(payload.role)) {
        const redirectTarget =
          payload.role === "ADMIN"
            ? "/admin"
            : payload.role === "SELLER"
              ? "/seller/auctions"
              : "/";
        return NextResponse.redirect(new URL(redirectTarget, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
