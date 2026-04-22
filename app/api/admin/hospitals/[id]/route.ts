import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/auth/jwt';
import { hospitalUpdateSchema } from '@/lib/validation/schemas';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/hospitals/[id]
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
        const validatedData = hospitalUpdateSchema.parse(body);

        const { id } = await params;
        const db = await getDatabase();
        const result = await db.collection('hospitals').updateOne(
            { _id: new ObjectId(id) },
            { $set: validatedData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Hospital updated successfully' });
    } catch (error: any) {
        console.error('Update hospital error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/hospitals/[id]
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
        const result = await db.collection('hospitals').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Hospital deleted successfully' });
    } catch (error) {
        console.error('Delete hospital error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
