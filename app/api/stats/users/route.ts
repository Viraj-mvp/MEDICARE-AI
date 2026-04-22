import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const db = await getDatabase();
        const count = await db.collection('users').countDocuments({ role: { $ne: 'admin' } });
        return NextResponse.json({ count });
    } catch (error) {
        console.error('User count error:', error);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}
