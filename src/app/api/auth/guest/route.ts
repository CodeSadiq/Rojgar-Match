import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export async function POST() {
  const token = jwt.sign(
    { id: 'guest', email: 'guest@rojgarmatch.local', role: 'guest' },
    process.env.JWT_SECRET || 'ROJGAR_MATCH_SECURE_TOKEN_2026',
    { expiresIn: '1d' }
  );

  const response = NextResponse.json({
    fullName: 'Anonymous Guest',
    email: 'guest@rojgarmatch.local'
  }, { status: 200 });

  response.headers.set('Set-Cookie', serialize('rojgarmatch_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  }));

  return response;
}
