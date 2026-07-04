import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { seedDatabase } from '@/lib/db-seed';

export async function POST() {
  try {
    await seedDatabase(db);
    return NextResponse.json({ success: true, message: 'Database seeded successfully!' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
