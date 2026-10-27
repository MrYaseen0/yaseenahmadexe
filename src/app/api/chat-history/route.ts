import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { readJson, RequestError } from '@/lib/request-json';

// Retired visitor chat: private history is available only to authenticated admin.
// Old anonymous session IDs are not ownership credentials. Do not re-enable them.
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sessionId = new URL(request.url).searchParams.get('sessionId');
  if (!sessionId || sessionId.length > 200) return NextResponse.json({ error: 'Invalid sessionId' }, { status: 400 });
  try {
    const messages = await db.chatMessage.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' }, take: 100 });
    return NextResponse.json({ messages }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'History unavailable' }, { status: 503 }); }
}
export async function POST(request: Request) {
  // Parse bounded syntax before auth, but never access records before auth.
  let body: Record<string, unknown>;
  try { body = await readJson(request); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Invalid body' }, { status: e instanceof RequestError ? e.status : 400 }); }
  if (!(await verifyAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { sessionId, content, name } = body;
  if (typeof sessionId !== 'string' || !sessionId.trim() || sessionId.length > 200 || typeof content !== 'string' || !content.trim() || content.length > 4000 || (name !== undefined && (typeof name !== 'string' || name.length > 120))) return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
  try {
    const saved = await db.chatMessage.create({ data: { sessionId, sender: 'owner', content, name: typeof name === 'string' ? name : null } });
    return NextResponse.json({ success: true, id: saved.id });
  } catch { return NextResponse.json({ error: 'Message unavailable' }, { status: 503 }); }
}
