import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/auth/jwt';
import { diseaseUpdateSchema } from '@/lib/validation/schemas';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/diseases/[id] - Update disease
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
        const validatedData = diseaseUpdateSchema.parse(body);

        // Build update object
        const updateData: any = { ...validatedData, updatedAt: new Date() };

        // Convert symptom IDs if provided
        if (validatedData.commonSymptoms) {
            updateData.commonSymptoms = validatedData.commonSymptoms.map((id: string) => new ObjectId(id));
        }

        const { id } = await params;
        const db = await getDatabase();
        const result = await db.collection('diseases').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Disease not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Disease updated successfully' });
    } catch (error: any) {
        console.error('Update disease error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/diseases/[id] - Delete disease
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
        const result = await db.collection('diseases').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Disease not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Disease deleted successfully' });
    } catch (error) {
        console.error('Delete disease error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
