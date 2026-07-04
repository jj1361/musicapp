import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const postId = parseInt(params.id);
  const existing = db.prepare(
    'SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?'
  ).get(auth.userId, postId);

  if (existing) {
    await db.prepare('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?').run(auth.userId, postId);
    await db.prepare('UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(postId);
  } else {
    await db.prepare('INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)').run(auth.userId, postId);
    await db.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
  }

  const post = await db.prepare('SELECT likes_count FROM posts WHERE id = ?').get(postId) as { likes_count: number };
  return NextResponse.json({ liked: !existing, likesCount: post.likes_count });
}
