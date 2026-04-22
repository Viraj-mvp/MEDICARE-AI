import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);

        // Verify admin access
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDatabase();
        
        // Fetch all emergency requests, sorted by most recent first
        const emergencies = await db.collection('emergency_requests')
            .find({})
            .sort({ createdAt: -1 })
            .limit(100) // Keep reasonable limits for now
            .toArray();

        // Map to a cleaner format for the frontend
        const mappedEmergencies = emergencies.map(e => ({
            id: e._id.toString(),
            name: e.name,
            phone: e.phone,
            type: e.emergencyType,
            address: e.address,
            hospitals: e.nearestHospitals || [],
            status: e.status,
            date: e.createdAt,
            message: e.message || 'No message provided'
        }));

        return NextResponse.json({ emergencies: mappedEmergencies });

    } catch (error) {
        console.error('Get emergency requests error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
