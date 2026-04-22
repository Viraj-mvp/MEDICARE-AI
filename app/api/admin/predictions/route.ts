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

        // Fetch recent predictions (last 20) with user info
        const predictions = await db.collection('predictions')
            .aggregate([
                { $sort: { createdAt: -1 } },
                { $limit: 20 },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
                }
            ])
            .toArray();

        return NextResponse.json({
            predictions: predictions.map(pred => ({
                id: pred._id.toString(),
                user: pred.userInfo[0]?.name || pred.name || 'Guest',
                result: pred.result?.primary_diagnosis || 'Unknown',
                confidence: pred.result?.confidence || 0,
                date: getRelativeTime(pred.createdAt)
            }))
        });
    } catch (error) {
        console.error('Predictions fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
    }
}

function getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
}
