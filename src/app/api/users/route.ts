import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function GET(request: Request) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const skill = searchParams.get('skill') || '';
  const genre = searchParams.get('genre') || '';
  const location = searchParams.get('location') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  let query = `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, u.headline, u.bio, u.location, u.profile_photo, u.availability, u.account_type, u.created_at FROM users u`;
  let countQuery = `SELECT COUNT(DISTINCT u.id) as total FROM users u`;
  const joins: string[] = [];
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (skill) {
    joins.push('JOIN user_skills us ON u.id = us.user_id JOIN skills s ON us.skill_id = s.id');
    conditions.push('s.name LIKE ?');
    params.push(`%${skill}%`);
  }

  if (genre) {
    joins.push('JOIN user_genres ug ON u.id = ug.user_id JOIN genres g ON ug.genre_id = g.id');
    conditions.push('g.name LIKE ?');
    params.push(`%${genre}%`);
  }

  if (q) {
    conditions.push("(u.first_name LIKE ? OR u.last_name LIKE ? OR u.headline LIKE ? OR u.bio LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (location) {
    conditions.push('u.location LIKE ?');
    params.push(`%${location}%`);
  }

  // Exclude current user from results
  conditions.push('u.id != ?');
  params.push(auth.userId);

  const joinStr = joins.join(' ');
  const whereStr = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

  query += ' ' + joinStr + whereStr + ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
  countQuery += ' ' + joinStr + whereStr;

  const users = await db.prepare(query).all(...params, limit, offset);
  const { total } = await db.prepare(countQuery).get(...params) as { total: number };

  return NextResponse.json({ users, total, page, limit });
}
