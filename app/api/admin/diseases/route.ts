import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/auth/jwt';
import { diseaseCreateSchema } from '@/lib/validation/schemas';
import { Disease } from '@/lib/db/schemas';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET /api/admin/diseases - List all diseases
export async function GET(req: NextRequest) {
    try {
        // Verify admin access
        const payload = await getAuthUser(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDatabase();
        const diseases = await db.collection<Disease>('diseases')
            .find({})
            .sort({ name: 1 })
            .toArray();

        return NextResponse.json({ diseases });
    } catch (error) {
        console.error('Get diseases error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/diseases - Create new disease
export async function POST(req: NextRequest) {
    try {
        // Verify admin access
        const payload = await getAuthUser(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = diseaseCreateSchema.parse(body);

        // Convert symptom IDs from strings to ObjectIds
        const symptomIds = validatedData.commonSymptoms?.map((id: string) => new ObjectId(id)) || [];

        const disease: Disease = {
            name: validatedData.name,
            type: validatedData.type,
            category: validatedData.category,
            commonSymptoms: symptomIds,
            treatmentInfo: validatedData.treatmentInfo,
            severity: validatedData.severity,
            specialist: validatedData.specialist,
            confidence: validatedData.confidence || 75,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const db = await getDatabase();
        const result = await db.collection<Disease>('diseases').insertOne(disease);

        return NextResponse.json({
            message: 'Disease created successfully',
            diseaseId: result.insertedId
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create disease error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
