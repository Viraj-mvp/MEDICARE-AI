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

        // Check if feedback collection exists, if not return empty array
        const collections = await db.listCollections({ name: 'feedback' }).toArray();
        if (collections.length === 0) {
            return NextResponse.json({ feedbacks: [] });
        }

        // Fetch recent feedback
        const feedbacks = await db.collection('feedback')
            .find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        return NextResponse.json({
            feedbacks: feedbacks.map(f => ({
                id: f._id.toString(),
                user: f.userName || f.userEmail || 'Anonymous',
                type: f.type || 'General',
                message: f.message,
                date: f.createdAt?.toISOString().split('T')[0] || 'N/A'
            }))
        });
    } catch (error) {
        console.error('Feedback fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }
}
