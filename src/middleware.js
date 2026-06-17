import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Paths that are always public — no auth check needed
const PUBLIC_PATHS = new Set(['/', '/login', '/signup']);
const PUBLIC_PREFIXES = ['/auth', '/_next', '/favicon', '/logo', '/og'];

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
}

export async function middleware(request) {
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, allow all traffic through
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[middleware] Missing Supabase env vars — skipping auth check');
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  // Refresh session if expired — wrapped in try/catch to protect edge runtime
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (err) {
    console.error('[middleware] supabase.auth.getUser() failed:', err?.message);
  }

  const { pathname } = request.nextUrl;

  // ── Routing logic ──────────────────────────────────────────────────────────

  // 1. Logged-in user visits landing page (/) → send to dashboard
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Logged-in user visits /login or /signup → send to dashboard
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Not logged in + protected route → send to login
  if (!user && !isPublicPath(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname); // preserve intended destination
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Match everything except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
