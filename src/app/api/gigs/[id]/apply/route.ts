import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gigId = parseInt(params.id);
  const gig = await db.prepare('SELECT * FROM gigs WHERE id = ?').get(gigId) as Record<string, unknown> | undefined;
  if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
  if (gig.poster_id === auth.userId) {
    return NextResponse.json({ error: 'Cannot apply to your own gig' }, { status: 400 });
  }
  if (gig.status !== 'open') {
    return NextResponse.json({ error: 'This gig is no longer open' }, { status: 400 });
  }

  const body = await request.json();

  try {
    await db.transaction(async () => {
      await db.prepare('INSERT INTO gig_applications (gig_id, user_id, message) VALUES (?, ?, ?)')
        .run(gigId, auth.userId, body.message || '');
      await db.prepare('UPDATE gigs SET applications = applications + 1 WHERE id = ?').run(gigId);
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('UNIQUE')) {
      return NextResponse.json({ error: 'You have already applied to this gig' }, { status: 409 });
    }
    throw e;
  }

  const application = db.prepare(
    'SELECT * FROM gig_applications WHERE gig_id = ? AND user_id = ?'
  ).get(gigId, auth.userId);

  return NextResponse.json({ application }, { status: 201 });
}
