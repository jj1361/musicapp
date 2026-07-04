import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from './auth';
import { TokenPayload } from '@/types';

export function getAuthUser(): TokenPayload | null {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
