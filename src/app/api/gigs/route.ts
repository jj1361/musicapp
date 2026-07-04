import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function GET(request: Request) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const location = searchParams.get('location') || '';
  const skill = searchParams.get('skill') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (q) {
    conditions.push('(g.title LIKE ? OR g.description LIKE ? OR g.venue LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (genre) {
    conditions.push('g.genre LIKE ?');
    params.push(`%${genre}%`);
  }
  if (location) {
    conditions.push('g.location LIKE ?');
    params.push(`%${location}%`);
  }
  if (skill) {
    conditions.push('g.skills_needed LIKE ?');
    params.push(`%${skill}%`);
  }
  if (status) {
    conditions.push('g.status = ?');
    params.push(status);
  }

  const whereStr = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const gigs = await db.prepare(`
    SELECT g.*, u.first_name, u.last_name, u.profile_photo, u.headline as poster_headline
    FROM gigs g JOIN users u ON g.poster_id = u.id
    ${whereStr}
    ORDER BY g.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const { total } = await db.prepare(`SELECT COUNT(*) as total FROM gigs g ${whereStr}`).get(...params) as { total: number };

  return NextResponse.json({ gigs, total, page, limit });
}

export async function POST(request: Request) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, description, venue, location, gigDate, gigTime, payMin, payMax, payType, genre, skillsNeeded } = body;

  if (!title || !description || !location || !gigDate) {
    return NextResponse.json({ error: 'Title, description, location, and date are required' }, { status: 400 });
  }

  const result = await db.prepare(`
    INSERT INTO gigs (poster_id, title, description, venue, location, gig_date, gig_time, pay_min, pay_max, pay_type, genre, skills_needed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(auth.userId, title, description, venue || '', location, gigDate, gigTime || '', payMin || 0, payMax || 0, payType || 'fixed', genre || '', skillsNeeded || '');

  const gig = await db.prepare('SELECT * FROM gigs WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json({ gig }, { status: 201 });
}
