import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth';

/** Files in /public — must not hit auth (otherwise <img src="/x.svg"> gets HTML login redirect). */
const PUBLIC_ASSET = /\.(?:svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|mp4|webm|txt|xml|json|map)$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ASSET.test(pathname)) {
    return NextResponse.next();
  }

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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

