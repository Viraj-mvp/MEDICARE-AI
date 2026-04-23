import { getDatabase } from './db/mongodb';
import { ActivityLog } from './db/schemas';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

/**
 * Log user activity to the activity_logs collection
 * @param action - Type of action performed
 * @param userId - User ID (optional for anonymous users)
 * @param details - Additional context about the action
 * @param request - Request object to extract IP and user agent
 */
export async function logActivity(
    action: ActivityLog['action'],
    userId?: string | ObjectId,
    details?: Record<string, any>,
    request?: Request
): Promise<void> {
    try {
        const db = await getDatabase();

        const activity: ActivityLog = {
            userId: userId ? (typeof userId === 'string' ? new ObjectId(userId) : userId) : undefined,
            action,
            details,
            ipAddress: request?.headers.get('x-forwarded-for') || undefined,
            userAgent: request?.headers.get('user-agent') || undefined,
            createdAt: new Date(),
        };

        await db.collection<ActivityLog>('activity_logs').insertOne(activity);

        // File logging only works in environments with writable filesystem (not serverless)
        try {
            const logDir = path.join(process.cwd(), 'logs');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            const logLine = `[${activity.createdAt.toISOString()}] ACTION: ${action} | USER: ${userId || 'anonymous'} | IP: ${activity.ipAddress || 'unknown'} | DETAILS: ${JSON.stringify(details || {})}\n`;
            fs.appendFileSync(path.join(logDir, 'app.log'), logLine);

        } catch {
            // Silently skip file logging on read-only filesystems (e.g., Netlify serverless)
        }
    } catch (error) {
        // Log error but don't throw - activity logging should not break the main flow
        console.error('Activity logging error:', error);
    }
}
