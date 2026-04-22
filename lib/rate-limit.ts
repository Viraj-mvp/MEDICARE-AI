
import { getDatabase } from '@/lib/db/mongodb';

interface RateLimitEntry {
    ip: string;
    count: number;
    resetAt: number;
}

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

// Helper function to check limit using MongoDB
export async function checkRateLimit(identifier: string) {
    try {
        const db = await getDatabase();
        const collection = db.collection<RateLimitEntry>('rate_limits');

        const now = Date.now();

        // Find existing entry
        const entry = await collection.findOne({ ip: identifier });

        // If no entry or expired, create new/reset
        if (!entry || now > entry.resetAt) {
            await collection.updateOne(
                { ip: identifier },
                {
                    $set: {
                        count: 1,
                        resetAt: now + WINDOW_SIZE
                    }
                },
                { upsert: true }
            );
            return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - 1, reset: now + WINDOW_SIZE };
        }

        // If limit exceeded
        if (entry.count >= MAX_REQUESTS) {
            return { success: false, limit: MAX_REQUESTS, remaining: 0, reset: entry.resetAt };
        }

        // Increment count
        await collection.updateOne(
            { ip: identifier },
            { $inc: { count: 1 } }
        );

        return {
            success: true,
            limit: MAX_REQUESTS,
            remaining: MAX_REQUESTS - (entry.count + 1),
            reset: entry.resetAt
        };

    } catch (error) {
        console.error("Rate limit error:", error);
        // Fail open if DB error
        return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS, reset: 0 };
    }
}
