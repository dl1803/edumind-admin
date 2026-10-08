import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('access_token')?.value;

    const isLoginPage = pathname === '/login';
    const isDev = process.env.NODE_ENV !== 'production';
    const isUiDemoPage = pathname === '/ui-demo';

    // Trong môi trường dev (Sprint 4: Ngày 4 UI Demo, Ngày 5 Dashboard Layout),
    // cho phép truy cập để review giao diện Task 5.2 mà không bị redirect về /login (thuộc Ngày 7)
    if (isDev) {
        return NextResponse.next();
    }

    // 1. Nếu chưa có token và truy cập vào trang bảo vệ (không phải /login hoặc /ui-demo)
    if (!token && !isLoginPage && !isUiDemoPage) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 2. Nếu đã có token mà lại truy cập /login -> Chuyển thẳng về Dashboard
    if (token && isLoginPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
