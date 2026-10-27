import { NextResponse, type NextRequest } from "next/server";

/**
 * Defence in depth for /api/admin/*.
 *
 * Every admin route already calls verifyAdmin() (signature + DB session check).
 * This proxy runs first and rejects any request that does not carry a validly
 * signed, unexpired admin token, so a future route that forgets verifyAdmin()
 * still cannot leak data. Session revocation stays in verifyAdmin() (needs DB).
 *
 * Open on purpose:
 *  - /api/admin/auth        (login POST, token check GET, logout DELETE: the route guards itself)
 *  - GET|HEAD /api/admin/content (public site copy; writes stay guarded)
 *
 * Uses Web Crypto only, so it works on both the Node and edge runtimes.
 */
const ADMIN_COOKIE = "__Host-ya-admin";
const ISSUER = "yaseen-portfolio";
const enc = new TextEncoder();
let keyPromise: Promise<CryptoKey> | null = null;
let keySecret = "";

function hmacKey(secret: string) {
  if (!keyPromise || keySecret !== secret) {
    keySecret = secret;
    keyPromise = crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  }
  return keyPromise;
}

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) return null;
  const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  try {
    const bin = atob(pad);
    const out = new Uint8Array(new ArrayBuffer(bin.length));
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch { return null; }
}

export async function hasValidAdminToken(token: string, secret: string, nowSec = Math.floor(Date.now() / 1000)): Promise<boolean> {
  if (!secret || !token || token.length > 4096) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [h, p, s] = parts;
  const sig = b64urlToBytes(s);
  if (!sig || sig.length !== 32) return false;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), sig, enc.encode(`${h}.${p}`));
    if (!ok) return false;
    const payloadBytes = b64urlToBytes(p);
    if (!payloadBytes) return false;
    const data = JSON.parse(new TextDecoder().decode(payloadBytes));
    return data?.iss === ISSUER && data?.aud === "admin" && typeof data.exp === "number" && data.exp > nowSec;
  } catch { return false; }
}

function isPublic(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/\/+$/, "");
  if (path === "/api/admin/auth") return true;
  if (path === "/api/admin/content" && (req.method === "GET" || req.method === "HEAD")) return true;
  return false;
}

export async function proxy(req: NextRequest) {
  if (isPublic(req)) return NextResponse.next();
  const token = req.cookies.get(ADMIN_COOKIE)?.value || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (await hasValidAdminToken(token, process.env.AUTH_SECRET || "")) return NextResponse.next();
  return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
}

export const config = { matcher: ["/api/admin/:path*"] };
