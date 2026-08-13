import { NextResponse } from 'next/server';

const WEBSITE_PREFIX = '/website';
const WEBSITE_ROOT_ROUTES = ['/', '/about', '/contact', '/book', '/my-bookings', '/profile', '/legal'];
const PUBLIC_FILE = /\.[^/]+$/;

const isWebsiteRoute = (pathname) => (
  pathname === '/'
  || WEBSITE_ROOT_ROUTES.some((route) => route !== '/' && (pathname === route || pathname.startsWith(`${route}/`)))
);

const shouldSkip = (pathname) => (
  pathname.startsWith('/_next')
  || pathname.startsWith('/api')
  || pathname.startsWith('/admin')
  || pathname.startsWith('/monitoring')
  || pathname === '/favicon.ico'
  || pathname === '/robots.txt'
  || pathname === '/sitemap.xml'
  || PUBLIC_FILE.test(pathname)
);

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (shouldSkip(pathname)) return NextResponse.next();

  if (pathname === WEBSITE_PREFIX || pathname.startsWith(`${WEBSITE_PREFIX}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(WEBSITE_PREFIX.length) || '/';
    return NextResponse.rewrite(url);
  }

  if (isWebsiteRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? WEBSITE_PREFIX : `${WEBSITE_PREFIX}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
