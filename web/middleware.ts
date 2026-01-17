import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user is authenticated via cookie
  const authCookie = request.cookies.get('site-auth');
  const isAuthenticated = authCookie?.value 
    ? await verifySessionToken(authCookie.value)
    : false;
  
  // Allow access to login page, auth API, and robots.txt
  if (pathname === '/login' || pathname.startsWith('/api/auth') || pathname === '/robots.txt') {
    // If already authenticated and trying to access login, redirect to home
    if (isAuthenticated && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
  
  // Protect all other routes
  if (!isAuthenticated) {
    // Redirect to login page
    const loginUrl = new URL('/login', request.url);
    // Preserve the original URL for redirect after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (but we want to protect these too)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

