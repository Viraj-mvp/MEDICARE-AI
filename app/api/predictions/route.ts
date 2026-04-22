import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/auth/jwt';
import { runPredictionEngine } from '@/lib/prediction/orchestrator';
import { predictionRequestSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/rate-limit';
import { Prediction } from '@/lib/db/schemas';
import { ObjectId } from 'mongodb';



export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const { success, reset } = await checkRateLimit(ip);

        if (!success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Reset': reset.toString()
                    }
                }
            );
        }

        const body = await req.json();

        // Validate input
        const validatedData = predictionRequestSchema.parse(body);
        const { relationship } = body; // Extract relationship from body (schema might strip it if not updated)

        // Sanitize custom symptoms (remove HTML/scripts)
        const sanitizedSymptoms = validatedData.symptoms.map(symptom => ({
            ...symptom,
            name: symptom.name.replace(/<[^>]*>/g, '').trim(),
        }));

        // Run prediction engine
        const { result, source } = await runPredictionEngine({
            symptoms: sanitizedSymptoms,
            age: validatedData.userDetails.age,
            gender: validatedData.userDetails.gender,
            questionnaire: validatedData.answers,
        });

        // Save prediction to database
        const db = await getDatabase();
        const predictionsCollection = db.collection<Prediction>('predictions');

        // Get user ID from token if available (optional, but good for linking)
        const payload = await getAuthUser(req);
        let userId: ObjectId | undefined;

        if (payload) {
            userId = new ObjectId(payload.userId);
        }

        const prediction: Prediction = {
            userId,
            userDetails: {
                name: validatedData.userDetails.name,
                age: validatedData.userDetails.age,
                gender: validatedData.userDetails.gender,
                phone: validatedData.userDetails.phone
            },
            symptoms: sanitizedSymptoms,
            answers: validatedData.answers,
            result,
            source,
            relationship: relationship || 'Myself',
            createdAt: new Date(),
        };

        console.log(`[Prediction] Generated via ${source}. Result: ${result.primary_diagnosis} (${result.confidence}%)`);

        const insertResult = await predictionsCollection.insertOne(prediction);

        // Log activity
        const { logActivity } = await import('@/lib/activity-logger');
        await logActivity('prediction', userId, {
            predictionId: insertResult.insertedId.toString(),
            diagnosis: result.primary_diagnosis
        }, req);

        return NextResponse.json({
            predictionId: insertResult.insertedId,
            result,
            source,
            message: source !== 'Rule-Based'
                ? `Prediction generated using ${source} AI analysis`
                : 'Prediction generated using rule-based analysis',
        });

    } catch (error: any) {
        console.error('Prediction error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// GET endpoint for prediction history (requires auth)
export async function GET(req: NextRequest) {
    try {
        let token = req.cookies.get('token')?.value;
        if (!token) {
            token = req.headers.get('authorization')?.replace('Bearer ', '');
        }

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { verifyToken } = await import('@/lib/auth/jwt');
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const db = await getDatabase();
        const predictionsCollection = db.collection<Prediction>('predictions');

        const predictions = await predictionsCollection
            .find({ userId: new ObjectId(payload.userId) })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        return NextResponse.json({ predictions });

    } catch (error) {
        console.error('Get predictions error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
