import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Simple check for isLoggedIn cookie or local storage (using cookies as middleware can't access localStorage)
    // For this demo, let's look for a 'isLoggedIn' cookie
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true'
    const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register'

    if (!isLoggedIn && !isAuthPage) {
        // Redirect to register page if not logged in and not already on an auth page
        return NextResponse.redirect(new URL('/register', request.url))
    }

    if (isLoggedIn && isAuthPage) {
        // Redirect to home page if already logged in and trying to access auth pages
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

// Config to match all pages except public assets and internal next stuff
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
    ],
}
