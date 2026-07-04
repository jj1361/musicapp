import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const comments = await db.prepare(`
    SELECT c.*, u.first_name, u.last_name, u.profile_photo, u.headline
    FROM comments c JOIN users u ON c.author_id = u.id
    WHERE c.post_id = ? ORDER BY c.created_at ASC
  `).all(parseInt(params.id));

  return NextResponse.json({ comments });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { content } = await request.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

  const postId = parseInt(params.id);

  await db.transaction(async () => {
    await db.prepare('INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)').run(postId, auth.userId, content);
    await db.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').run(postId);
  });

  const comments = await db.prepare(`
    SELECT c.*, u.first_name, u.last_name, u.profile_photo, u.headline
    FROM comments c JOIN users u ON c.author_id = u.id
    WHERE c.post_id = ? ORDER BY c.created_at ASC
  `).all(postId);

  return NextResponse.json({ comments }, { status: 201 });
}
