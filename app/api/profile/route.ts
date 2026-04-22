import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/auth/jwt';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional(),
    age: z.union([z.string(), z.number()]).transform(v => String(v)).optional(),
    gender: z.string().optional(),
    medicalHistory: z.array(z.string()).optional(),
});

// GET /api/profile - Get user profile
export async function GET(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDatabase();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(payload.userId) },
            { projection: { password: 0 } } // Exclude password
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/profile - Update user profile
export async function PATCH(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = updateProfileSchema.parse(body);

        const updateFields: any = { updatedAt: new Date() };
        if (validatedData.name) updateFields.name = validatedData.name;
        if (validatedData.phone !== undefined) updateFields.phone = validatedData.phone;
        if (validatedData.age !== undefined) updateFields.age = validatedData.age;
        if (validatedData.gender !== undefined) updateFields.gender = validatedData.gender;
        if (validatedData.medicalHistory !== undefined) {
            updateFields.medicalHistory = validatedData.medicalHistory;
        }

        const db = await getDatabase();
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(payload.userId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Log activity
        const { logActivity } = await import('@/lib/activity-logger');
        await logActivity('profile_update', payload.userId, {
            fields: Object.keys(validatedData)
        }, req);

        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error: any) {
        console.error('Update profile error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
