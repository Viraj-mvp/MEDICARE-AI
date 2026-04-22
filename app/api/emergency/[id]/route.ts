import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET /api/emergency/[id] - Poll for status (used for live acknowledgement)
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = await getDatabase();
        const doc = await db.collection('emergency_requests').findOne({
            _id: new ObjectId(id)
        });
        if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({
            status: doc.status,
            acknowledgedBy: doc.acknowledgedBy ?? null,
            acknowledgedAt: doc.acknowledgedAt ?? null,
        });
    } catch {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
}
