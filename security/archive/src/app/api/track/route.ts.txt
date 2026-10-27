import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  hashIp,
  parseUserAgent,
  getCountry,
  logSecurityEvent,
  isIpBlocked,
  blockIp,
  shouldLogBlockedHit,
} from "@/lib/security";

// POST — record a pageview or section view (anonymous, privacy-respecting).
// Body: { section, path?, referrer?, sessionId?, pageview? }
export async function POST(request: Request) {
  const ip = getClientIp(request);

  // 1) Blocked IPs get nothing.
  if (await isIpBlocked(ip)) {
    if (shouldLogBlockedHit(ip)) {
      await logSecurityEvent(
        "BLOCKED_HIT",
        ip,
        new URL(request.url).pathname,
        "Request from blocked IP",
        request.headers.get("user-agent") || undefined
      );
    }
    return NextResponse.json({ success: false }, { status: 403 });
  }

  // 2) Burst guard: >300 hits/min from one IP is not a human — auto-block.
  const burst = rateLimit(`burst:${ip}`, { limit: 300, windowMs: 60_000 });
  if (!burst.ok) {
    await logSecurityEvent("BURST", ip, "/api/track", "Auto-blocked: >300 requests/min", request.headers.get("user-agent") || undefined);
    await blockIp(ip, "Auto-block: request burst (>300/min on /api/track)");
    return NextResponse.json({ success: false }, { status: 429 });
  }

  // 3) Normal rate limit: 60/min per IP.
  const limit = rateLimit(`track:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!limit.ok) {
    await logSecurityEvent("RATE_LIMIT", ip, "/api/track", "60/min exceeded", request.headers.get("user-agent") || undefined);
    return NextResponse.json({ success: false }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { section, path, sessionId, pageview } = body;

    if (!section) {
      return NextResponse.json(
        { error: "section is required" },
        { status: 400 }
      );
    }

    // Extract referrer origin only (no full URL for privacy)
    const referrer = body.referrer
      ? (() => {
          try {
            const url = new URL(body.referrer);
            return url.origin;
          } catch {
            return null;
          }
        })()
      : null;

    const ua = request.headers.get("user-agent") || "";
    const { browser, os, device } = parseUserAgent(ua);

    await db.visit.create({
      data: {
        section: String(section).slice(0, 100),
        path: String(path || "/").slice(0, 200),
        referrer,
        sessionId:
          typeof sessionId === "string" ? sessionId.slice(0, 64) : null,
        ipHash: hashIp(ip),
        country: getCountry(request),
        device,
        browser,
        os,
        isPageview: pageview === true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Silent fail — tracking should never break the UX
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
