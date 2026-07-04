import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const connId = parseInt(params.id);
  const conn = await db.prepare('SELECT * FROM connections WHERE id = ?').get(connId) as Record<string, unknown> | undefined;
  if (!conn) return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
  if (conn.recipient_id !== auth.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { status } = await request.json();
  if (!['accepted', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await db.prepare("UPDATE connections SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, connId);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const connId = parseInt(params.id);
  const conn = await db.prepare('SELECT * FROM connections WHERE id = ?').get(connId) as Record<string, unknown> | undefined;
  if (!conn) return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
  if (conn.requester_id !== auth.userId && conn.recipient_id !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.prepare('DELETE FROM connections WHERE id = ?').run(connId);
  return NextResponse.json({ success: true });
}
