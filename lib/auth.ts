import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export interface UserSession {
  userId: string;
  username: string;
  role: 'admin' | 'user';
  name: string;
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    return session as UserSession;
  } catch {
    return null;
  }
}

export async function setSession(session: UserSession) {
  const cookieStore = await cookies();
  cookieStore.set('session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export function getSessionFromRequest(request: NextRequest): UserSession | null {
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    return session as UserSession;
  } catch {
    return null;
  }
}

