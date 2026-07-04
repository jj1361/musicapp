import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const convId = params.conversationId;

  // Handle "new" conversation case
  if (convId === 'new') {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ messages: [], otherUser: null });

    const otherUser = db.prepare(
      'SELECT id, first_name, last_name, profile_photo, headline FROM users WHERE id = ?'
    ).get(parseInt(userId));

    // Check if conversation already exists
    const minId = Math.min(auth.userId, parseInt(userId));
    const maxId = Math.max(auth.userId, parseInt(userId));
    const existing = db.prepare(
      'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?'
    ).get(minId, maxId) as { id: number } | undefined;

    if (existing) {
      const messages = db.prepare(
        'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
      ).all(existing.id);
      return NextResponse.json({ messages, otherUser, conversationId: existing.id });
    }

    return NextResponse.json({ messages: [], otherUser, conversationId: null });
  }

  const conversation = await db.prepare('SELECT * FROM conversations WHERE id = ?').get(parseInt(convId)) as Record<string, unknown> | undefined;
  if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  if (conversation.user1_id !== auth.userId && conversation.user2_id !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Mark messages as read
  db.prepare(
    'UPDATE messages SET read = 1 WHERE conversation_id = ? AND sender_id != ? AND read = 0'
  ).run(parseInt(convId), auth.userId);

  const messages = db.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
  ).all(parseInt(convId));

  const otherUserId = conversation.user1_id === auth.userId ? conversation.user2_id : conversation.user1_id;
  const otherUser = db.prepare(
    'SELECT id, first_name, last_name, profile_photo, headline FROM users WHERE id = ?'
  ).get(otherUserId);

  return NextResponse.json({ messages, otherUser, conversationId: parseInt(convId) });
}

export async function POST(request: Request, { params }: { params: { conversationId: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { content, recipientId } = await request.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

  let convId: number;

  if (params.conversationId === 'new' && recipientId) {
    // Create or find conversation
    const minId = Math.min(auth.userId, recipientId);
    const maxId = Math.max(auth.userId, recipientId);

    const existing = db.prepare(
      'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?'
    ).get(minId, maxId) as { id: number } | undefined;

    if (existing) {
      convId = existing.id;
    } else {
      const result = await db.prepare(
        'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)'
      ).run(minId, maxId);
      convId = Number(result.lastInsertRowid);
    }
  } else {
    convId = parseInt(params.conversationId);
    const conv = await db.prepare('SELECT * FROM conversations WHERE id = ?').get(convId) as Record<string, unknown> | undefined;
    if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    if (conv.user1_id !== auth.userId && conv.user2_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  await db.prepare('INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)').run(convId, auth.userId, content);
  await db.prepare("UPDATE conversations SET last_message_at = datetime('now') WHERE id = ?").run(convId);

  const messages = db.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
  ).all(convId);

  return NextResponse.json({ messages, conversationId: convId }, { status: 201 });
}
