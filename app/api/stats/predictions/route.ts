import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const db = await getDatabase();
        const count = await db.collection('predictions').countDocuments();
        return NextResponse.json({ count });
    } catch (error) {
        console.error('Predictions count error:', error);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}
