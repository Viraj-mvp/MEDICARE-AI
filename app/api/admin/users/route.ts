import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/jwt';
import { getDatabase } from '@/lib/db/mongodb';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        // Verify admin access
        const payload = await getAuthUser(request);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Connect to database
        const db = await getDatabase();

        // Fetch recent users (last 10, excluding admins)
        const users = await db.collection('users')
            .find({ role: { $ne: 'admin' } })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        return NextResponse.json({
            users: users.map(user => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                status: 'Active', // You can add an active status field to users collection
                date: user.createdAt?.toISOString().split('T')[0] || 'N/A'
            }))
        });
    } catch (error) {
        console.error('Users fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
