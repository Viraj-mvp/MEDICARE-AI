import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/auth/jwt';
import { activityLogQuerySchema } from '@/lib/validation/schemas';
import { ActivityLog } from '@/lib/db/schemas';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET /api/admin/activity - Get activity logs
export async function GET(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        const validated = activityLogQuerySchema.parse(queryParams);

        const page = parseInt(validated.page);
        const limit = parseInt(validated.limit);

        // Build query
        const query: any = {};
        if (validated.userId) {
            query.userId = new ObjectId(validated.userId);
        }
        if (validated.action) {
            query.action = validated.action;
        }
        if (validated.startDate || validated.endDate) {
            query.createdAt = {};
            if (validated.startDate) {
                query.createdAt.$gte = new Date(validated.startDate);
            }
            if (validated.endDate) {
                query.createdAt.$lte = new Date(validated.endDate);
            }
        }

        const db = await getDatabase();
        const activities = await db.collection<ActivityLog>('activity_logs')
            .find(query)
            .sort({ createdAt: -1 })
            .skip(page * limit)
            .limit(limit)
            .toArray();

        const total = await db.collection('activity_logs').countDocuments(query);

        return NextResponse.json({ activities, total, page, limit });
    } catch (error) {
        console.error('Get activity logs error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
