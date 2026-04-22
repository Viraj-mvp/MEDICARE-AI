import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/auth/jwt';
import { hospitalCreateSchema } from '@/lib/validation/schemas';
import { Hospital } from '@/lib/db/schemas';

export const dynamic = 'force-dynamic';

// GET /api/admin/hospitals - List all hospitals with pagination
export async function GET(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '0');
        const limit = parseInt(searchParams.get('limit') || '25');
        const search = searchParams.get('search') || '';

        const db = await getDatabase();
        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { city: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const hospitals = await db.collection<Hospital>('hospitals')
            .find(query)
            .skip(page * limit)
            .limit(limit)
            .toArray();

        const total = await db.collection('hospitals').countDocuments(query);

        return NextResponse.json({ hospitals, total, page, limit });
    } catch (error) {
        console.error('Get hospitals error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/hospitals - Create new hospital
export async function POST(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = hospitalCreateSchema.parse(body);

        const hospital: Hospital = {
            ...validatedData,
            createdAt: new Date(),
        };

        const db = await getDatabase();
        const result = await db.collection<Hospital>('hospitals').insertOne(hospital);

        return NextResponse.json({
            message: 'Hospital created successfully',
            hospitalId: result.insertedId
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create hospital error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
