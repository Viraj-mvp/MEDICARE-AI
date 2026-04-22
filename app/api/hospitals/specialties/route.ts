import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';

/**
 * GET /api/hospitals/specialties
 * Returns all distinct specialty names from the hospital collection,
 * sorted alphabetically, with their occurrence count.
 */
export async function GET(req: NextRequest) {
    try {
        const db = await getDatabase();
        const hospitalsCollection = db.collection('hospitals');

        // MongoDB aggregation: unwind the specialty array, group by unique value, count
        const result = await hospitalsCollection.aggregate([
            { $unwind: '$specialty' },
            {
                $group: {
                    _id: '$specialty',
                    count: { $sum: 1 }
                }
            },
            { $match: { _id: { $nin: [null, ''] } } },
            { $sort: { count: -1, _id: 1 } },  // Most common first
        ]).toArray();

        const specialties = result
            .map(r => ({ name: r._id as string, count: r.count as number }))
            .filter(s => s.name && s.name.trim().length > 0);

        return NextResponse.json({ specialties });
    } catch (error) {
        console.error('Get specialties error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
