import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/jwt';
import { getCoordinates } from '@/lib/geocoder';

export async function POST(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { address } = await req.json();
        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        const coords = await getCoordinates(address);
        if (!coords) {
            return NextResponse.json({ error: 'Could not find coordinates for this address' }, { status: 404 });
        }

        return NextResponse.json(coords);
    } catch (error: any) {
        console.error('Geocoding API error:', error);
        return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
    }
}
