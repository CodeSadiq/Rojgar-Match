import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('rojgarmatch_token')?.value;

  const { pathname } = request.nextUrl;

  // 1. Protected User Routes
  if (pathname.startsWith('/profile') || pathname.startsWith('/for-you')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'ROJGAR_MATCH_SECURE_TOKEN_2026');
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Admin Routes (Optional: add extra check for admin role if needed)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'ROJGAR_MATCH_SECURE_TOKEN_2026');
        const { payload } = await jwtVerify(token, secret);
        
        // Simple admin check: just example. 
        // In real app, check if payload.role === 'admin'
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
