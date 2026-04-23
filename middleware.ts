import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define protected routes
const protectedRoutes = ['/predict', '/dashboard', '/profile'];
const adminRoutes = ['/developer', '/api/admin'];

// JWT_SECRET is validated at runtime inside the handler below and in lib/auth/jwt.ts
// (not at module level, to avoid crashing the Next.js build phase)

// CSP Header - Relaxed for development to allow IP-based access
const isDev = process.env.NODE_ENV === 'development';

const CSP_HEADER = isDev
    ? `
        default-src * 'unsafe-inline' 'unsafe-eval';
        script-src * 'unsafe-inline' 'unsafe-eval';
        style-src * 'unsafe-inline';
        img-src * blob: data:;
        font-src *;
        connect-src *;
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
    `.replace(/\s{2,}/g, ' ').trim()
    : `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google-analytics.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: https:;
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' https://api.groq.com https://generativelanguage.googleapis.com https://api.ncbi.nlm.nih.gov wss://www.fast2sms.com;
        frame-src 'self' https://www.youtube.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Check if route is protected
    // Matches if pathname starts with any protected route
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    // Initialize response
    const response = NextResponse.next();

    // 2. CSP Headers
    response.headers.set(
        'Content-Security-Policy',
        CSP_HEADER
    );

    // 3. HSTS Header
    if (!isDev) {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // 4. Auth Check for Protected Routes or Admin Route
    if (isProtected || isAdminRoute) {
        // Use separate cookies for isolation
        const token = isAdminRoute
            ? request.cookies.get('admin_token')?.value
            : request.cookies.get('token')?.value;

        if (!token) {
            console.log(`[Middleware] No token found for ${pathname}. Redirecting.`);

            // For API routes, return 401 instead of redirecting
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
            }

            const url = request.nextUrl.clone();
            url.pathname = '/auth';
            url.searchParams.set('redirect', pathname);
            return NextResponse.redirect(url);
        }

        try {
            const jwtSecret = process.env.JWT_SECRET || '';
            if (jwtSecret.length < 64) {
                console.error(`[Middleware] JWT_SECRET is too short (${jwtSecret.length} chars, need 64). Rejecting request.`);
                if (pathname.startsWith('/api/')) {
                    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
                }
                const url = request.nextUrl.clone();
                url.pathname = '/auth';
                return NextResponse.redirect(url);
            }
            const secret = new TextEncoder().encode(jwtSecret);
            const { payload } = await jwtVerify(token, secret);

            // For admin routes, ensure role is admin
            if (isAdminRoute && payload.role !== 'admin') {
                if (pathname.startsWith('/api/')) {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
                }
                const url = request.nextUrl.clone();
                url.pathname = '/'; // Redirect to home instead of unauthorized if they are a user but in admin area
                return NextResponse.redirect(url);
            }

            // Valid token
            return response;
        } catch (error) {
            console.error(`[Middleware] Token verification failed for ${pathname}:`, error);

            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
            }

            // Invalid token - clear the problematic cookie
            const url = request.nextUrl.clone();
            url.pathname = '/auth';
            url.searchParams.set('redirect', pathname);
            const redirectResponse = NextResponse.redirect(url);
            redirectResponse.cookies.delete(isAdminRoute ? 'admin_token' : 'token');
            return redirectResponse;
        }
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
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
