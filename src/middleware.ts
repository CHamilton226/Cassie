import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const protectedPaths = ['/dashboard', '/onboarding', '/admin'];
const authPaths = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Check if the path is a protected path or starts with a protected prefix
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isApiProtected = pathname.startsWith('/api/') && 
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/public') &&
    !pathname.startsWith('/api/growth-score') &&
    !pathname.startsWith('/api/stripe/webhook');

  // Redirect unauthenticated users away from protected routes
  if ((isProtected || isApiProtected) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only routes: redirect non-admin users to dashboard
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApi = pathname.startsWith('/api/admin/');
  if ((isAdminRoute || isAdminApi) && token && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect authenticated users away from auth pages
  if (authPaths.some((path) => pathname === path) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
    '/api/:path*',
  ],
};
