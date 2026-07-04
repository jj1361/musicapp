import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gigId = parseInt(params.id);
  const gig = await db.prepare(`
    SELECT g.*, u.first_name, u.last_name, u.profile_photo, u.headline as poster_headline, u.id as poster_user_id
    FROM gigs g JOIN users u ON g.poster_id = u.id WHERE g.id = ?
  `).get(gigId) as Record<string, unknown> | undefined;

  if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });

  // Check if current user has applied
  const application = await db.prepare(
    'SELECT * FROM gig_applications WHERE gig_id = ? AND user_id = ?'
  ).get(gigId, auth.userId);

  // If the poster is viewing, include applications
  let applications: unknown[] = [];
  if (gig.poster_id === auth.userId) {
    applications = await db.prepare(`
      SELECT ga.*, u.first_name, u.last_name, u.profile_photo, u.headline
      FROM gig_applications ga JOIN users u ON ga.user_id = u.id
      WHERE ga.gig_id = ? ORDER BY ga.created_at DESC
    `).all(gigId);
  }

  return NextResponse.json({ gig, userApplication: application || null, applications });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gigId = parseInt(params.id);
  const existing = await db.prepare('SELECT poster_id FROM gigs WHERE id = ?').get(gigId) as { poster_id: number } | undefined;
  if (!existing) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
  if (existing.poster_id !== auth.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  await db.prepare(`
    UPDATE gigs SET title = COALESCE(?, title), description = COALESCE(?, description),
    venue = COALESCE(?, venue), location = COALESCE(?, location), gig_date = COALESCE(?, gig_date),
    gig_time = COALESCE(?, gig_time), pay_min = COALESCE(?, pay_min), pay_max = COALESCE(?, pay_max),
    pay_type = COALESCE(?, pay_type), genre = COALESCE(?, genre), skills_needed = COALESCE(?, skills_needed),
    status = COALESCE(?, status), updated_at = datetime('now') WHERE id = ?
  `).run(body.title, body.description, body.venue, body.location, body.gigDate, body.gigTime,
    body.payMin, body.payMax, body.payType, body.genre, body.skillsNeeded, body.status, gigId);

  const gig = await db.prepare('SELECT * FROM gigs WHERE id = ?').get(gigId);
  return NextResponse.json({ gig });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gigId = parseInt(params.id);
  const existing = await db.prepare('SELECT poster_id FROM gigs WHERE id = ?').get(gigId) as { poster_id: number } | undefined;
  if (!existing) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
  if (existing.poster_id !== auth.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.prepare('DELETE FROM gigs WHERE id = ?').run(gigId);
  return NextResponse.json({ success: true });
}
