import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateSessionToken } from '@/lib/auth';
import { checkRateLimit, getRemainingAttempts } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - get IP address
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit (5 attempts per 15 minutes)
    if (!checkRateLimit(ip, 5, 15 * 60 * 1000)) {
      const remainingTime = Math.ceil(15); // 15 minutes
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many attempts. Please try again later.',
          rateLimited: true
        },
        { status: 429 }
      );
    }

    const { password } = await request.json();

    // Get password from environment variable
    const sitePassword = process.env.SITE_PASSWORD;

    if (!sitePassword) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify password
    if (password === sitePassword) {
      // Generate secure session token
      const sessionToken = await generateSessionToken();
      
      // Set authentication cookie (expires in 30 days)
      const cookieStore = await cookies();
      cookieStore.set('site-auth', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      return NextResponse.json({ success: true });
    } else {
      const remainingAttempts = getRemainingAttempts(ip, 5);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid password',
          remainingAttempts: Math.max(0, remainingAttempts - 1)
        },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}

