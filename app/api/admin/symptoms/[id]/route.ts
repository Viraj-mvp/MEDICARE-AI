import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/auth/jwt';
import { symptomUpdateSchema } from '@/lib/validation/schemas';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/symptoms/[id] - Update symptom
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = await getAuthUser(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = symptomUpdateSchema.parse(body);

        const { id } = await params;
        const db = await getDatabase();
        const result = await db.collection('symptoms').updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...validatedData, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Symptom not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Symptom updated successfully' });
    } catch (error: any) {
        console.error('Update symptom error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/symptoms/[id] - Delete symptom
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = await getAuthUser(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const db = await getDatabase();
        const result = await db.collection('symptoms').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Symptom not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Symptom deleted successfully' });
    } catch (error) {
        console.error('Delete symptom error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
