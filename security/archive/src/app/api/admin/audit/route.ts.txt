import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

// GET — content audit log (admin only).
// Returns CONTENT_EDIT security events with safely-parsed detail payloads.
// Query params:
//   action: updated | created | deleted (optional filter)
//   key:    content-key substring       (optional filter)
//   search: free text over summary/key/actor/ip (optional)
//   limit:  1-200, default 50
//   cursor: opaque pagination cursor (events older than the cursor)
//
// Pagination is a stable (createdAt, id) keyset cursor: ids are cuids, so a
// bare id comparison cannot order events chronologically. Filters live inside
// the `detail` text column, so the server runs a bounded scan: it walks raw
// events newest-first until `limit` matching entries are collected or the
// table (or scan budget) is exhausted. nextCursor always points at the last
// raw event scanned, so filtered pages never skip or repeat entries.

const SCAN_PAGE = 200; // raw events per scan iteration
const MAX_SCAN_PAGES = 5; // hard bound: 1000 raw events per request

type RawCursor = { t: string; id: string } | null;

function parseCursor(raw: string | null): RawCursor {
  if (!raw) return null;
  const i = raw.indexOf("|");
  if (i < 0) return null;
  const t = raw.slice(0, i);
  const id = raw.slice(i + 1);
  if (!t || !id || Number.isNaN(Date.parse(t))) return null;
  return { t, id };
}

function encodeCursor(createdAt: Date, id: string): string {
  return `${createdAt.toISOString()}|${id}`;
}

function normalizeAction(detail: Record<string, unknown>): string {
  return String(detail.action || "")
    .replace(/^update$/, "updated")
    .replace(/^reset$/, "deleted");
}

export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action")?.trim() || null;
    const key = url.searchParams.get("key")?.trim().toLowerCase() || null;
    const search = url.searchParams.get("search")?.trim().toLowerCase() || null;
    const cursor = parseCursor(url.searchParams.get("cursor")?.trim() || null);
    const limit = Math.min(
      Math.max(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 1),
      200
    );

    type AuditEntry = {
      id: string;
      createdAt: Date;
      ip: string;
      path: string | null;
      actor: string;
      action: string;
      key: string;
      summary: string;
      oldValue: unknown;
      newValue: unknown;
    };

    const entries: AuditEntry[] = [];
    let scanCursor: RawCursor = cursor;
    let lastRaw: { createdAt: Date; id: string } | null = null;
    let tableExhausted = false;

    for (let page = 0; page < MAX_SCAN_PAGES && entries.length < limit; page++) {
      const where: Record<string, unknown> = { type: "CONTENT_EDIT" };
      if (scanCursor) {
        const at = new Date(scanCursor.t);
        where.OR = [
          { createdAt: { lt: at } },
          { createdAt: at, id: { lt: scanCursor.id } },
        ];
      }
      const raws = await db.securityEvent.findMany({
        where: where as never,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: SCAN_PAGE,
      });
      if (raws.length < SCAN_PAGE) tableExhausted = true;
      if (!raws.length) break;

      for (const e of raws) {
        lastRaw = { createdAt: e.createdAt, id: e.id };
        let detail: Record<string, unknown> = {};
        try {
          if (e.detail) detail = JSON.parse(e.detail) as Record<string, unknown>;
        } catch {
          detail = {};
        }
        const entryAction = normalizeAction(detail);
        const entryKey = String(detail.key || "");
        if (action && entryAction !== action) continue;
        if (key && !entryKey.toLowerCase().includes(key)) continue;
        if (search) {
          const haystack =
            `${detail.summary || ""} ${entryKey} ${detail.actor || ""} ${e.ip}`.toLowerCase();
          if (!haystack.includes(search)) continue;
        }
        entries.push({
          id: e.id,
          createdAt: e.createdAt,
          ip: e.ip,
          path: e.path,
          actor: String(detail.actor || "admin"),
          action: entryAction,
          key: entryKey,
          summary: String(detail.summary || ""),
          oldValue: detail.oldValue ?? null,
          newValue: detail.newValue ?? null,
        });
        if (entries.length >= limit) break;
      }
      scanCursor = lastRaw
        ? { t: lastRaw.createdAt.toISOString(), id: lastRaw.id }
        : scanCursor;
    }

    return NextResponse.json({
      entries,
      nextCursor: tableExhausted || !lastRaw ? null : encodeCursor(lastRaw.createdAt, lastRaw.id),
    });
  } catch (err) {
    console.error("audit log error:", err);
    return NextResponse.json(
      { error: "Failed to load audit log" },
      { status: 500 }
    );
  }
}
