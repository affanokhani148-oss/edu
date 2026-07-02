import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminProtected = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isStudentProtected = pathname.startsWith('/student');

  if (isAdminProtected || isStudentProtected) {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-local-dev-only');
      const { payload } = await jwtVerify(token, secretKey);

      if (!payload.role) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (isAdminProtected && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/student', request.url));
      }

      if (isStudentProtected && payload.role !== 'STUDENT') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*'],
};
