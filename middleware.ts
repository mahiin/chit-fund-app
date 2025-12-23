import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/create-admin'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Admin-only routes
  const adminRoutes = ['/admin', '/upload', '/api/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // If accessing public route, allow
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no session and trying to access protected route, redirect to login
  if (!sessionCookie) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin access for admin routes
  if (isAdminRoute) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.role !== 'admin') {
        if (pathname.startsWith('/api')) {
          return NextResponse.json(
            { error: 'Forbidden - Admin access required' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Invalid session
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

