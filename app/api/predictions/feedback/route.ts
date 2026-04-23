import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { diseaseName, vote, comment, predictionId } = body;

        if (!diseaseName || !vote) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDatabase();

        await db.collection('prediction_feedback').insertOne({
            predictionId,
            diseaseName,
            vote,
            comment: comment || '',
            createdAt: new Date(),
            // Store user-agent or basic anonymous tracking info if needed to prevent spam
        });

        return NextResponse.json({ success: true, message: 'Feedback recorded anonymously.' });
    } catch (error) {
        console.error("Feedback API error:", error);
        return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
    }
}
