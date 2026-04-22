import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/auth/jwt';
import { symptomCreateSchema } from '@/lib/validation/schemas';
import { Symptom } from '@/lib/db/schemas';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET /api/admin/symptoms - List all symptoms
export async function GET(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDatabase();
        const symptoms = await db.collection<Symptom>('symptoms')
            .find({})
            .sort({ name: 1 })
            .toArray();

        return NextResponse.json({ symptoms });
    } catch (error) {
        console.error('Get symptoms error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/symptoms - Create new symptom
export async function POST(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = symptomCreateSchema.parse(body);

        const symptom: Symptom = {
            name: validatedData.name,
            category: validatedData.category,
            icon: validatedData.icon,
            description: validatedData.description,
            commonDiseases: validatedData.commonDiseases || [],
            createdAt: new Date(),
        };

        const db = await getDatabase();
        const result = await db.collection<Symptom>('symptoms').insertOne(symptom);

        return NextResponse.json({
            message: 'Symptom created successfully',
            symptomId: result.insertedId
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create symptom error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
