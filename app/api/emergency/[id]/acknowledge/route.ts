import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

// POST /api/emergency/[id]/acknowledge
// Hospital dashboard (or email link) calls this to mark alert as accepted
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const hospitalName: string = body.hospitalName || 'A nearby hospital';

        const db = await getDatabase();
        const result = await db.collection('emergency_requests').updateOne(
            {
                _id: new ObjectId(id),
                status: { $ne: 'cancelled' } // do not update cancelled requests
            },
            {
                $set: {
                    status: 'accepted',
                    acknowledgedBy: hospitalName,
                    acknowledgedAt: new Date(),
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Emergency not found or already cancelled' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: `Alert acknowledged by ${hospitalName}` });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
