import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('rojgarmatch_token')?.value;
  const { pathname } = request.nextUrl;

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'ROJGAR_MATCH_SECURE_TOKEN_2026');

  // 1. Protected User Routes
  if (pathname.startsWith('/profile') || pathname.startsWith('/for-you')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Admin Routes (Strict ENV-based check)
  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    
    try {
        const { payload } = await jwtVerify(token, secret);
        const userEmail = payload.email as string;

        // Get admin emails from ENV
        const adminEmailsStr = process.env.ADMIN_EMAILS || '';
        const adminEmails = adminEmailsStr.split(',').map(e => e.trim().toLowerCase());

        if (!adminEmails.includes(userEmail.toLowerCase())) {
          console.warn(`Unauthorized admin attempt by: ${userEmail}`);
          // Redirect to a specific "Unauthorized" page or back to home
          return NextResponse.redirect(new URL('/', request.url));
        }

        return NextResponse.next();
    } catch (err) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Config to match only private routes
export const config = {
  matcher: [
    '/profile/:path*',
    '/for-you/:path*',
    '/admin/:path*'
  ],
};
