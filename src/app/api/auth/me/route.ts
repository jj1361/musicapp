import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/middleware-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = getAuthUser();
  if (!auth) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = db.prepare(
    'SELECT id, email, first_name, last_name, headline, bio, location, profile_photo, cover_photo, phone, website, youtube_url, soundcloud_url, spotify_url, instagram_url, availability, account_type, created_at, updated_at FROM users WHERE id = ?'
  ).get(auth.userId);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user });
}
