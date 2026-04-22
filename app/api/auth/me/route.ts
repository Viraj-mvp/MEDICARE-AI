import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // Read from both possible cookies to support concurrent isolated sessions
    const token = req.cookies.get('token')?.value;
    const adminToken = req.cookies.get('admin_token')?.value;

    // Use whichever token is available, prioritizing the one matching the requested context if any
    const context = req.nextUrl.searchParams.get('context');
    const effectiveToken = context === 'admin' ? (adminToken || token) : (token || adminToken);

    if (!effectiveToken) {
        return NextResponse.json({ user: null });
    }

    const payload = await verifyToken(effectiveToken);

    if (!payload) {
        return NextResponse.json({ user: null });
    }

    try {
        const db = await getDatabase();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(payload.userId) },
            { projection: { password: 0, loginAttempts: 0, lockUntil: 0 } } // Exclude sensitive fields
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Ensure we only return admin info if we are using an admin token or if the user is actually an admin
        if (context === 'admin' && user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized context' }, { status: 403 });
        }

        return NextResponse.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone || '',
                age: user.age || '',
                gender: user.gender || '',
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Me endpoint error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
