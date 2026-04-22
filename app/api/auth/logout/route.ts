import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const role = req.nextUrl.searchParams.get('role'); // 'user' or 'admin'
        
        // Determine which cookies to clear
        const cookiesToClear = role === 'admin' ? ['admin_token'] : (role === 'user' ? ['token'] : ['token', 'admin_token']);

        // Log activity for each session being cleared
        const { verifyToken } = await import('@/lib/auth/jwt');
        const { logActivity } = await import('@/lib/activity-logger');

        for (const cookieName of cookiesToClear) {
            const token = req.cookies.get(cookieName)?.value;
            if (token) {
                try {
                    const payload = await verifyToken(token);
                    if (payload) {
                        await logActivity('logout', payload.userId, { cookie: cookieName }, req);
                    }
                } catch (e) {
                    // Ignore token errors
                }
            }
        }

        const response = NextResponse.json({ message: 'Logged out successfully' });

        // Clear the specified cookies
        for (const cookieName of cookiesToClear) {
            response.cookies.set({
                name: cookieName,
                value: '',
                httpOnly: true,
                expires: new Date(0),
                path: '/',
            });
        }

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        const response = NextResponse.json({ message: 'Logged out successfully' });
        response.cookies.delete('token');
        response.cookies.delete('admin_token');
        return response;
    }
}
