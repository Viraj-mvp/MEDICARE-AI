import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/jwt';
import { getDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const db = await getDatabase();
        const userId = new ObjectId(payload.userId as string);

        // Fetch user basic medical profile
        const user = await db.collection('users').findOne(
            { _id: userId },
            { projection: { password: 0 } }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch recent predictions
        const predictions = await db.collection('predictions')
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        // Format recent diagnoses for the passport
        const recentDiagnoses = predictions.map(p => ({
            id: p._id.toString(),
            date: p.createdAt,
            diagnosis: p.result?.primary_diagnosis || "Unknown",
            confidence: p.result?.confidence || 0,
            specialist: p.result?.specialist || "General Practitioner",
            symptoms: p.symptoms?.map((s: any) => s.name) || [],
            source: p.source
        }));

        return NextResponse.json({
            passport: {
                patientName: user.name,
                email: user.email,
                age: user.profile?.age || null, // Assuming age might be stored somewhere or asked
                bloodGroup: user.bloodGroup || 'Not Specified',
                currentMedications: user.currentMedications || [],
                recentDiagnoses: recentDiagnoses,
                generatedAt: new Date().toISOString(),
            }
        });

    } catch (error) {
        console.error('Passport generation error:', error);
        return NextResponse.json({ error: 'Failed to generate passport data' }, { status: 500 });
    }
}
