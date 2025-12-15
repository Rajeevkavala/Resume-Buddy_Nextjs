import { NextRequest, NextResponse } from 'next/server';

// Public routes that should be compiled for unauthenticated users
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
];

// Routes that need authentication
const AUTHENTICATED_ROUTES = [
  '/dashboard',
  '/analysis',
  '/qa', 
  '/interview',
  '/improvement',
  '/profile',
];

// All routes for authenticated users
const ALL_ROUTES = [
  ...PUBLIC_ROUTES,
  ...AUTHENTICATED_ROUTES,
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Add security headers to prevent data exposure
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy to prevent unauthorized data access
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://*.firebase.com wss://*.firebase.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // Check if user is authenticated (look for Firebase auth cookie)
  const authCookie = request.cookies.get('firebase-auth-token');
  const isAuthenticated = authCookie && authCookie.value !== '';

  // Determine which routes to compile based on authentication status
  const routesToCompile = isAuthenticated ? ALL_ROUTES : PUBLIC_ROUTES;

  // Add debug header for development
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Auth-Status', isAuthenticated ? 'authenticated' : 'unauthenticated');
    response.headers.set('X-Routes-Compiled', JSON.stringify(routesToCompile));
  }

  // Add performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Add cache control for static assets (aggressive caching)
  if (pathname.includes('/static/') || pathname.includes('/_next/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }
  
  // Add cache for page routes (short cache with revalidation)
  if (!pathname.includes('/api/') && !pathname.includes('/_next/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
    );
  }

  // Add preload hints for critical routes based on auth status
  if (routesToCompile.includes(pathname)) {
    const prefetchRoutes = routesToCompile
      .filter((route: string) => route !== pathname)
      .map((route: string) => `<${route}>; rel=prefetch`)
      .join(', ');
    
    if (prefetchRoutes) {
      response.headers.set('Link', prefetchRoutes);
    }
  }

  // Redirect unauthenticated users from protected routes
  if (!isAuthenticated && AUTHENTICATED_ROUTES.includes(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add early hints for critical resources
  if (pathname === '/') {
    response.headers.set(
      'Link',
      [
        '</fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
        '</fonts/space-grotesk.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
        '</_next/static/css/app.css>; rel=preload; as=style',
      ].join(', ')
    );
  }

  // Optimize for mobile
  if (request.headers.get('user-agent')?.includes('Mobile')) {
    response.headers.set('Vary', 'User-Agent');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (service worker)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js).*)',
  ],
};