import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  const role = request.cookies.get('user_role')?.value;

  // Protect Admin routes
  if (pathname.startsWith('/admin')) {
    // Whitelist Admin Login page
    if (pathname === '/admin/login') {
      if (token && role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  }

  // Protect Student routes
  if (pathname.startsWith('/student')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Admin can also access student preview if needed, but students cannot access admin
  }

  // If already logged in, redirect away from login/register
  if (pathname === '/login' || pathname === '/register') {
    if (token && role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (token && role === 'STUDENT') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/login', '/register'],
};
