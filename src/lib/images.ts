/**
 * Uploaded images are stored as base64 data URLs in MongoDB (see
 * /api/upload/image). Embedding those strings in list responses turns an
 * 80-row auctions payload into a ~100MB JSON body, which dominates every
 * list/dashboard request's latency and bandwidth.
 *
 * `toImageUrl` rewrites a data URL to a same-origin endpoint that serves
 * the raw bytes (with cache headers), keeping the API payload small while
 * the client still receives an ordinary `src`-able URL — the UI is
 * unchanged. Already-external URLs and empty values pass through untouched.
 */
export function toImageUrl(
  value: string | null | undefined,
  kind: "product" | "user",
  id: string
): string | null {
  if (!value) return null;
  if (typeof value === "string" && value.startsWith("data:")) {
    return `/api/images/${kind}/${encodeURIComponent(id)}`;
  }
  return value;
}
