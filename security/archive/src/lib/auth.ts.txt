import crypto from "crypto";

/**
 * Lightweight admin auth built on Node's built-in `crypto` — no external deps.
 *
 * A compact HS256 JWT (`header.payload.signature`, base64url) is signed with
 * AUTH_SECRET. Every admin/private route calls `verifyAdmin(request)`; the login
 * route issues a token via `signAdminToken(email)` after `verifyCredentials`.
 *
 * All of these routes touch Prisma, so they run on the Node.js runtime where
 * `crypto` is available (not the Edge runtime).
 */

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const AUTH_SECRET = process.env.AUTH_SECRET || "";

const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24h

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(data: string): string {
  return base64url(crypto.createHmac("sha256", AUTH_SECRET).update(data).digest());
}

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/** Constant-time string comparison that never throws on length mismatch. */
function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still burn a comparison to reduce timing signal, then fail.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Verify admin login credentials against the env-configured values. */
export function verifyCredentials(email: unknown, password: unknown): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) return false; // fail closed if unconfigured
  if (typeof email !== "string" || typeof password !== "string") return false;

  const emailOk = timingSafeEqualStr(email.toLowerCase().trim(), ADMIN_EMAIL);
  const passwordOk = timingSafeEqualStr(sha256Hex(password), ADMIN_PASSWORD_HASH);
  return emailOk && passwordOk;
}

/** Issue a signed 24h token for the given admin email. */
export function signAdminToken(email: string): string {
  if (!AUTH_SECRET) throw new Error("AUTH_SECRET is not configured");
  const nowSec = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ email, iat: nowSec, exp: nowSec + TOKEN_TTL_SECONDS })
  );
  const signature = sign(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

/**
 * Verify a token string: correct signature and not expired.
 * Returns the decoded payload on success, or null.
 */
export function verifyToken(token: string): { email: string; exp: number } | null {
  if (!AUTH_SECRET || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;

  const expected = sign(`${header}.${payload}`);
  if (!timingSafeEqualStr(signature, expected)) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    );
    if (typeof decoded?.exp !== "number" || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // expired or malformed
    }
    return decoded;
  } catch {
    return null;
  }
}

/** Extract and verify the Bearer token from a request. Fails closed. */
export function verifyAdmin(request: Request): boolean {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  const token = auth.slice("Bearer ".length).trim();
  return verifyToken(token) !== null;
}
