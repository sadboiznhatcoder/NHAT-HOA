import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname === '/login'
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('nhat_hoa_auth')?.value;

  if (authCookie !== 'authenticated') {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If authenticated, allow access to completely protected routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
