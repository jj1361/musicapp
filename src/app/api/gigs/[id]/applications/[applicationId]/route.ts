import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function PUT(request: Request, { params }: { params: { id: string; applicationId: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gigId = parseInt(params.id);
  const applicationId = parseInt(params.applicationId);

  const gig = await db.prepare('SELECT poster_id FROM gigs WHERE id = ?').get(gigId) as { poster_id: number } | undefined;
  if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
  if (gig.poster_id !== auth.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const application = await db.prepare(
    'SELECT * FROM gig_applications WHERE id = ? AND gig_id = ?'
  ).get(applicationId, gigId) as Record<string, unknown> | undefined;
  if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

  const { status } = await request.json();
  if (!['accepted', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await db.prepare('UPDATE gig_applications SET status = ? WHERE id = ?').run(status, applicationId);

  return NextResponse.json({ success: true });
}
