import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('access_token')?.value;

    const isLoginPage = pathname === '/login';
    const isUiDemoPage = pathname === '/ui-demo' && process.env.NODE_ENV !== 'production';

    // 1. Nếu chưa có token và truy cập vào trang bảo vệ (không phải /login hoặc /ui-demo dev)
    if (!token && !isLoginPage && !isUiDemoPage) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 2. Nếu đã có token mà lại truy cập /login -> Chuyển thẳng về Dashboard
    if (token && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
