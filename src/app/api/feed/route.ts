import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function GET(request: Request) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  const posts = await db.prepare(`
    SELECT p.*, u.first_name, u.last_name, u.headline, u.profile_photo,
      (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as user_liked
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.author_id = ?
      OR p.author_id IN (
        SELECT CASE WHEN requester_id = ? THEN recipient_id ELSE requester_id END
        FROM connections WHERE status = 'accepted'
        AND (requester_id = ? OR recipient_id = ?)
      )
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(auth.userId, auth.userId, auth.userId, auth.userId, auth.userId, limit, offset);

  const { total } = await db.prepare(`
    SELECT COUNT(*) as total FROM posts p
    WHERE p.author_id = ?
      OR p.author_id IN (
        SELECT CASE WHEN requester_id = ? THEN recipient_id ELSE requester_id END
        FROM connections WHERE status = 'accepted'
        AND (requester_id = ? OR recipient_id = ?)
      )
  `).get(auth.userId, auth.userId, auth.userId, auth.userId) as { total: number };

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(request: Request) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { content, postType } = await request.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

  const result = await db.prepare(
    'INSERT INTO posts (author_id, content, post_type) VALUES (?, ?, ?)'
  ).run(auth.userId, content, postType || 'text');

  const post = await db.prepare(`
    SELECT p.*, u.first_name, u.last_name, u.headline, u.profile_photo, 0 as user_liked
    FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?
  `).get(result.lastInsertRowid);

  return NextResponse.json({ post }, { status: 201 });
}
