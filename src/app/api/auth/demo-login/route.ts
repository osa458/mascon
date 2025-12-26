import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { encode } from 'next-auth/jwt'

export async function GET(request: Request) {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'NEXTAUTH_SECRET not set' }, { status: 500 })
  }

  // Create the JWT token with user info
  const token = await encode({
    token: {
      id: 'demo-user-123',
      sub: 'demo-user-123',
      email: 'demo@example.com',
      name: 'Demo User',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    },
    secret,
  })

  // Create response with redirect
  const url = new URL('/events', request.url)
  const response = NextResponse.redirect(url)
  
  // Set the session token cookie
  response.cookies.set('next-auth.session-token', token, {
    httpOnly: true,
    secure: false, // false for localhost
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  })

  console.log('[Demo Login] Token created, redirecting to /events')
  
  return response
}
