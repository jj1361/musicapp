import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const postId = parseInt(params.id);
  const post = await db.prepare('SELECT author_id FROM posts WHERE id = ?').get(postId) as { author_id: number } | undefined;
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  if (post.author_id !== auth.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
  return NextResponse.json({ success: true });
}
