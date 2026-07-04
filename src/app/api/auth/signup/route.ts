import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { validateEmail, validatePassword, validateRequired } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, accountType } = body;

    const reqErrors = validateRequired(
      { email, password, firstName, lastName },
      ['email', 'password', 'firstName', 'lastName']
    );
    if (reqErrors.length) {
      return NextResponse.json({ error: reqErrors[0] }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const pwErrors = validatePassword(password);
    if (pwErrors.length) {
      return NextResponse.json({ error: pwErrors[0] }, { status: 400 });
    }

    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const password_hash = hashPassword(password);
    const result = await db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, account_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, password_hash, firstName, lastName, accountType || 'musician');

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;
    const token = signToken({ userId: user.id as number, email: user.email as string });

    const { password_hash: _ph, ...safeUser } = user;
    void _ph;
    const response = NextResponse.json({ user: safeUser }, { status: 201 });
    return setAuthCookie(response, token);
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
