import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const development = process.env.NODE_ENV === 'development';
  let supabase = '';
  try { supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').origin; } catch { /* Unconfigured backend stays blocked. */ }
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data: blob:", "font-src 'self'", "object-src 'none'", "base-uri 'self'",
    "form-action 'self'", "frame-ancestors 'none'",
    `connect-src 'self' ${supabase} ${supabase.replace(/^http/, 'ws')}${development ? ' ws://localhost:* ws://127.0.0.1:*' : ''}`,
    ...(!development ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  if (/^\/(admin|login)(\/|$)/.test(request.nextUrl.pathname) && request.cookies?.getAll().some(cookie => cookie.name.includes('-auth-token')) && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      cookieOptions: { httpOnly: true, secure: !development, sameSite: 'lax', path: '/' },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: cookies => {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value));
          requestHeaders.set('cookie', request.cookies.toString());
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    try { await client.auth.getUser(); } catch { /* The server guard remains authoritative. */ }
  }
  response.headers.set('Content-Security-Policy', csp);
  if (/^\/(admin|login|api)(\/|$)/.test(request.nextUrl.pathname)) response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'] };
