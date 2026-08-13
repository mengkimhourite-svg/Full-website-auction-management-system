import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifyToken } from "@/lib/jwt";

export {
  COOKIE_NAME,
  createToken,
  verifyToken,
  getJwtSecret,
  type JWTPayload,
} from "@/lib/jwt";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value || null;
}

export async function getCurrentUser() {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  banned: boolean;
}

export function isAdminRole(role?: string | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const token = await getAuthToken();
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    banned: user.banned,
  };
}
