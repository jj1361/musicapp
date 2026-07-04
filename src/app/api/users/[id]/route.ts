import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = parseInt(params.id);
  const user = await db.prepare(
    'SELECT id, email, first_name, last_name, headline, bio, location, profile_photo, cover_photo, phone, website, youtube_url, soundcloud_url, spotify_url, instagram_url, availability, account_type, created_at FROM users WHERE id = ?'
  ).get(userId);

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const skills = await db.prepare(
    'SELECT s.id, s.name FROM skills s JOIN user_skills us ON s.id = us.skill_id WHERE us.user_id = ?'
  ).all(userId);

  const genres = await db.prepare(
    'SELECT g.id, g.name FROM genres g JOIN user_genres ug ON g.id = ug.genre_id WHERE ug.user_id = ?'
  ).all(userId);

  const experiences = await db.prepare(
    'SELECT * FROM experiences WHERE user_id = ? ORDER BY start_date DESC'
  ).all(userId);

  const connectionCount = await db.prepare(
    "SELECT COUNT(*) as count FROM connections WHERE (requester_id = ? OR recipient_id = ?) AND status = 'accepted'"
  ).get(userId, userId) as { count: number };

  // Check connection status with current user
  let connectionStatus = 'none';
  const conn = await db.prepare(
    'SELECT * FROM connections WHERE (requester_id = ? AND recipient_id = ?) OR (requester_id = ? AND recipient_id = ?)'
  ).get(auth.userId, userId, userId, auth.userId) as Record<string, unknown> | undefined;

  if (conn) {
    if (conn.status === 'accepted') connectionStatus = 'accepted';
    else if (conn.status === 'pending' && conn.requester_id === auth.userId) connectionStatus = 'sent';
    else if (conn.status === 'pending') connectionStatus = 'pending';
  }

  return NextResponse.json({
    user: { ...user, skills, genres, experiences, connection_count: connectionCount.count, connection_status: connectionStatus },
  });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = parseInt(params.id);
  if (auth.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const {
    firstName, lastName, headline, bio, location, phone, website,
    youtubeUrl, soundcloudUrl, spotifyUrl, instagramUrl, availability, profilePhoto, skills, genres
  } = body;

  const updateUser = db.prepare(`
    UPDATE users SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      headline = COALESCE(?, headline),
      bio = COALESCE(?, bio),
      location = COALESCE(?, location),
      phone = COALESCE(?, phone),
      website = COALESCE(?, website),
      youtube_url = COALESCE(?, youtube_url),
      soundcloud_url = COALESCE(?, soundcloud_url),
      spotify_url = COALESCE(?, spotify_url),
      instagram_url = COALESCE(?, instagram_url),
      availability = COALESCE(?, availability),
      profile_photo = COALESCE(?, profile_photo),
      updated_at = datetime('now')
    WHERE id = ?
  `);

  await db.transaction(async () => {
    await updateUser.run(
      firstName, lastName, headline, bio, location, phone, website,
      youtubeUrl, soundcloudUrl, spotifyUrl, instagramUrl, availability, profilePhoto, userId
    );

    if (skills && Array.isArray(skills)) {
      await db.prepare('DELETE FROM user_skills WHERE user_id = ?').run(userId);
      for (const skillName of skills) {
        await db.prepare('INSERT OR IGNORE INTO skills (name) VALUES (?)').run(skillName);
        const skill = await db.prepare('SELECT id FROM skills WHERE name = ?').get(skillName) as { id: number };
        await db.prepare('INSERT OR IGNORE INTO user_skills (user_id, skill_id) VALUES (?, ?)').run(userId, skill.id);
      }
    }

    if (genres && Array.isArray(genres)) {
      await db.prepare('DELETE FROM user_genres WHERE user_id = ?').run(userId);
      for (const genreName of genres) {
        await db.prepare('INSERT OR IGNORE INTO genres (name) VALUES (?)').run(genreName);
        const genre = await db.prepare('SELECT id FROM genres WHERE name = ?').get(genreName) as { id: number };
        await db.prepare('INSERT OR IGNORE INTO user_genres (user_id, genre_id) VALUES (?, ?)').run(userId, genre.id);
      }
    }
  });

  const user = await db.prepare(
    'SELECT id, email, first_name, last_name, headline, bio, location, profile_photo, cover_photo, phone, website, youtube_url, soundcloud_url, spotify_url, instagram_url, availability, account_type, created_at, updated_at FROM users WHERE id = ?'
  ).get(userId);

  return NextResponse.json({ user });
}
