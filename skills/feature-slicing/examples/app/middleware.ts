// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js middleware for route protection and authentication redirects.
 *
 * @param request - The incoming request object
 * @returns NextResponse to redirect or continue to the requested route
 *
 * @remarks
 * Handles two main scenarios:
 * 1. Protected routes without auth token → redirect to login
 * 2. Auth pages with valid token → redirect to dashboard
 *
 * This middleware runs on the edge before the request reaches the page,
 * providing fast route protection without client-side checks.
 *
 * @example
 * ```ts
 * // The middleware automatically runs for matched routes
 * // No manual invocation needed - Next.js handles this
 * ```
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

/**
 * Configuration object defining which routes trigger the middleware.
 *
 * @remarks
 * Uses Next.js path matching patterns:
 * - `/dashboard/:path*` - All dashboard routes and sub-routes
 * - `/login` - The login page only
 */
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
