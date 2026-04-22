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

        // Get statistics (exclude admins from user counts)
        const usersCount = await db.collection('users').countDocuments({ role: { $ne: 'admin' } });
        const predictionsCount = await db.collection('predictions').countDocuments();
        const feedbackCount = await db.collection('feedback').countDocuments();

        // Get active sessions (users who logged in in last 2 hours, excluding admins)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const activeSessions = await db.collection('users').countDocuments({
            role: { $ne: 'admin' },
            lastLogin: { $gte: twoHoursAgo }
        });

        // Get disease and hospital counts
        const diseasesCount = await db.collection('diseases').countDocuments();
        const hospitalsCount = await db.collection('hospitals').countDocuments();

        // Get activity breakdown (excluding admin actions, last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const activityBreakdown = await db.collection('activity_logs').aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $match: { 'user.role': { $ne: 'admin' } } },
            { $group: { _id: '$action', count: { $sum: 1 } } }
        ]).toArray();

        // Get total recent activity (excluding admin actions)
        const recentActivity = activityBreakdown.reduce((sum, item) => sum + item.count, 0);

        return NextResponse.json({
            users: usersCount,
            predictions: predictionsCount,
            feedback: feedbackCount,
            activeSessions,
            diseases: diseasesCount,
            hospitals: hospitalsCount,
            recentActivity,
            activityBreakdown: activityBreakdown.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {} as Record<string, number>),
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
