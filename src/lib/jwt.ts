import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "token";

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Resolves the JWT signing secret. In production the secret MUST be set via
 * the JWT_SECRET environment variable - failing fast here is intentional so
 * a misconfigured deployment surfaces immediately instead of silently using
 * a shared fallback secret (which would break token verification and be a
 * security hole).
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET environment variable is not set. Add it to your Vercel project environment variables."
      );
    }
    return new TextEncoder().encode("dev-only-secret-do-not-use-in-production");
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}