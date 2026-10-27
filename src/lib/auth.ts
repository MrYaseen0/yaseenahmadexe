import crypto from 'crypto';
import { db } from '@/lib/db';
export const ADMIN_COOKIE = '__Host-ya-admin';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const AUTH_SECRET = process.env.AUTH_SECRET || '';
const TTL = 3600;
const ISSUER = 'yaseen-portfolio';
function same(a: string, b: string) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); }
export function verifyCredentials(email: unknown, password: unknown): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH || typeof email !== 'string' || typeof password !== 'string' || password.length > 1024) return false;
  let valid = false;
  if (ADMIN_PASSWORD_HASH.startsWith('scrypt$')) {
    const [, salt, hash] = ADMIN_PASSWORD_HASH.split('$');
    if (/^[a-f0-9]{32}$/.test(salt || '') && /^[a-f0-9]{128}$/.test(hash || '')) valid = same(crypto.scryptSync(password, salt, 64).toString('hex'), hash);
  } else if (/^[a-f0-9]{64}$/.test(ADMIN_PASSWORD_HASH)) {
    // Legacy compatibility only. Rotate env to scrypt$salt$hash using scripts/hash-password.mjs.
    valid = same(crypto.createHash('sha256').update(password).digest('hex'), ADMIN_PASSWORD_HASH);
  }
  return same(email.toLowerCase().trim(), ADMIN_EMAIL) && valid;
}
let table: Promise<unknown> | undefined;
function ensureSessions() {
  return table ??= db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AdminSession" ("id" TEXT PRIMARY KEY, "expiresAt" TIMESTAMP(3) NOT NULL)` ).catch(e => { table = undefined; throw e; });
}
function signature(data: string) { return crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url'); }
export async function signAdminToken(email: string): Promise<string> {
  if (!AUTH_SECRET || email !== ADMIN_EMAIL) throw new Error('Auth configuration unavailable');
  await ensureSessions(); const id = crypto.randomUUID(); const now = Math.floor(Date.now()/1000);
  await db.$executeRawUnsafe(`INSERT INTO "AdminSession" ("id", "expiresAt") VALUES ($1,$2)`, id, new Date((now+TTL)*1000));
  await db.$executeRawUnsafe(`DELETE FROM "AdminSession" WHERE "expiresAt" < NOW()`);
  const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const p = Buffer.from(JSON.stringify({ email, sub: ADMIN_EMAIL, iss: ISSUER, aud: 'admin', jti: id, iat: now, exp: now+TTL })).toString('base64url');
  return `${h}.${p}.${signature(`${h}.${p}`)}`;
}
export function verifyToken(token: string): { email: string; exp: number; jti: string } | null {
  if (!AUTH_SECRET || !token || token.length > 4096) return null;
  const [h,p,s,...rest] = token.split('.'); if (!h || !p || !s || rest.length || !same(s, signature(`${h}.${p}`))) return null;
  try {
    const header = JSON.parse(Buffer.from(h,'base64url').toString()); const data = JSON.parse(Buffer.from(p,'base64url').toString()); const now = Math.floor(Date.now()/1000);
    if (header.alg !== 'HS256' || header.typ !== 'JWT' || data.email !== ADMIN_EMAIL || data.sub !== ADMIN_EMAIL || data.iss !== ISSUER || data.aud !== 'admin' || typeof data.jti !== 'string' || typeof data.iat !== 'number' || data.iat > now || typeof data.exp !== 'number' || data.exp <= now || data.exp-data.iat > TTL) return null;
    return data;
  } catch { return null; }
}
export function requestToken(request: Request): string {
  const cookie = request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length+1);
  return cookie || request.headers.get('authorization')?.replace(/^Bearer\s+/i,'') || '';
}
export async function verifyAdmin(request: Request): Promise<boolean> {
  if (!['GET','HEAD','OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const expected = process.env.NEXT_PUBLIC_SITE_URL || 'https://yaseenahmadexe.vercel.app';
    if (origin && origin !== expected && !(process.env.NODE_ENV !== 'production' && origin === new URL(request.url).origin)) return false;
    if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  }
  const data = verifyToken(requestToken(request)); if (!data) return false;
  try {
    await ensureSessions();
    const rows = await db.$queryRawUnsafe<{id:string}[]>(`SELECT "id" FROM "AdminSession" WHERE "id"=$1 AND "expiresAt">NOW()`, data.jti);
    return rows.length === 1;
  } catch { return false; } // fail closed, including missing database/schema permissions
}
export async function revokeAdmin(request: Request) {
  const data = verifyToken(requestToken(request)); if (!data) return;
  await ensureSessions(); await db.$executeRawUnsafe(`DELETE FROM "AdminSession" WHERE "id"=$1`, data.jti);
}
