import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function GET(request: Request) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'accepted';

  let connections;
  if (status === 'pending') {
    // Incoming requests only
    connections = await db.prepare(`
      SELECT c.*, u.id as user_id, u.first_name, u.last_name, u.profile_photo, u.headline, u.location
      FROM connections c
      JOIN users u ON c.requester_id = u.id
      WHERE c.recipient_id = ? AND c.status = 'pending'
      ORDER BY c.created_at DESC
    `).all(auth.userId);
  } else if (status === 'sent') {
    connections = await db.prepare(`
      SELECT c.*, u.id as user_id, u.first_name, u.last_name, u.profile_photo, u.headline, u.location
      FROM connections c
      JOIN users u ON c.recipient_id = u.id
      WHERE c.requester_id = ? AND c.status = 'pending'
      ORDER BY c.created_at DESC
    `).all(auth.userId);
  } else {
    connections = await db.prepare(`
      SELECT c.*,
        u.id as user_id, u.first_name, u.last_name, u.profile_photo, u.headline, u.location
      FROM connections c
      JOIN users u ON u.id = CASE
        WHEN c.requester_id = ? THEN c.recipient_id
        ELSE c.requester_id
      END
      WHERE (c.requester_id = ? OR c.recipient_id = ?) AND c.status = 'accepted'
      ORDER BY c.updated_at DESC
    `).all(auth.userId, auth.userId, auth.userId);
  }

  return NextResponse.json({ connections });
}

export async function POST(request: Request) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { recipientId } = await request.json();
  if (!recipientId || recipientId === auth.userId) {
    return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
  }

  // Check existing connection in either direction
  const existing = await db.prepare(
    'SELECT * FROM connections WHERE (requester_id = ? AND recipient_id = ?) OR (requester_id = ? AND recipient_id = ?)'
  ).get(auth.userId, recipientId, recipientId, auth.userId);

  if (existing) {
    return NextResponse.json({ error: 'Connection already exists' }, { status: 409 });
  }

  await db.prepare('INSERT INTO connections (requester_id, recipient_id) VALUES (?, ?)').run(auth.userId, recipientId);

  return NextResponse.json({ success: true }, { status: 201 });
}
