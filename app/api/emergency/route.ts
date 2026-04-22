import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import type { EmergencyRequest, EmergencyType, NearestHospital, Hospital } from '@/lib/db/schemas';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// Haversine distance calculation
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(req: NextRequest) {
    try {
        // --- Rate limiting: max 3 emergency requests per IP per 10 minutes ---
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const rl = await checkRateLimit(`emergency:${ip}`);
        if (!rl.success) {
            return NextResponse.json(
                { error: 'Too many emergency requests. Please call 112 directly.' },
                { status: 429 }
            );
        }

        const body = await req.json();
        let {
            name, phone, latitude, longitude, address,
            emergencyType, message, hospitalId
        }: {
            name: string; phone: string;
            latitude: number; longitude: number; address: string;
            emergencyType: EmergencyType; message?: string;
            hospitalId?: string;
        } = body;

        // Ensure we have a human-readable address using OpenCage
        if (!address || /^[0-9.-]+,\s*[0-9.-]+$/.test(address) || address.includes('undefined')) {
            const { reverseGeocode } = await import('@/lib/geocoder');
            address = await reverseGeocode(latitude, longitude);
        }

        // Basic validation
        if (!name || !phone || !latitude || !longitude || !emergencyType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDatabase();

        // --- Identify authenticated user (optional) ---
        let userId: ObjectId | undefined;
        let medicalHistory: string[] | undefined;
        const payload = await getAuthUser(req);
        if (payload) {
            userId = new ObjectId(payload.userId);
            const user = await db.collection('users').findOne({ _id: userId });
            medicalHistory = user?.medicalHistory;
        }

        let nearestHospitals: NearestHospital[] = [];

        if (hospitalId) {
            // User manually selected a specific hospital
            const h = await db.collection<Hospital>('hospitals').findOne({
                _id: new ObjectId(hospitalId)
            });

            if (h) {
                const distanceKm = haversineKm(latitude, longitude, h.coordinates.lat, h.coordinates.lng);
                nearestHospitals = [{
                    hospitalId: h._id.toString(),
                    name: h.name,
                    phone: h.phone || 'N/A',
                    address: `${h.address}, ${h.city}`,
                    distanceKm: parseFloat(distanceKm.toFixed(2)),
                    etaMinutes: Math.round((distanceKm / 30) * 60)
                }];
            }
        } 
        
        if (nearestHospitals.length === 0) {
            // Find 3 nearest hospitals using the new GeoJSON location index
            const allHospitals = await db.collection<Hospital>('hospitals').find(
                {
                    location: {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates: [longitude, latitude] // GeoJSON order: [lng, lat]
                            }
                        }
                    }
                }
            ).limit(3).toArray();

            nearestHospitals = allHospitals.map(h => {
                const distanceKm = haversineKm(latitude, longitude, h.coordinates.lat, h.coordinates.lng);
                return {
                    hospitalId: h._id.toString(),
                    name: h.name,
                    phone: h.phone || 'N/A',
                    address: `${h.address}, ${h.city}`,
                    distanceKm: parseFloat(distanceKm.toFixed(2)),
                    etaMinutes: Math.round((distanceKm / 30) * 60),
                };
            });
        }

        // --- Create emergency record in MongoDB ---
        const emergency: EmergencyRequest = {
            userId,
            name,
            phone,
            latitude,
            longitude,
            address,
            emergencyType,
            message: message || undefined,
            medicalHistory,
            nearestHospitals,
            status: 'sent',
            createdAt: new Date(),
        };

        const result = await db.collection<EmergencyRequest>('emergency_requests').insertOne(emergency);
        const emergencyId = result.insertedId.toString();

        // --- Send SMS alerts via Fast2SMS (primary notification channel) ---
        try {
            const { sendIndianSMS } = await import('@/lib/alerts/sms-india');
            
            // 1. Alert the Patient
            const topHospitals = nearestHospitals.slice(0, 2).map(h => h.name.substring(0, 20)).join(', ');
            const patientMsg = `MEDICARE SOS: Alert for ${emergencyType} active. Nearest: ${topHospitals}. Help is arriving.`;
            sendIndianSMS(phone, patientMsg).catch(() => {});

            // 2. Alert the Hospitals (if they have a valid mobile number)
            nearestHospitals.forEach(h => {
                const cleanPhone = h.phone.replace(/\D/g, '');
                const hospMobile = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : null;
                
                if (hospMobile && hospMobile.length === 10) {
                    const hospMsg = `MEDICARE EMERGENCY: ${name} (${phone}) declared ${emergencyType}. Address: ${address.substring(0, 40)}`;
                    sendIndianSMS(hospMobile, hospMsg).catch(() => {});
                }
            });
        } catch (error) {
            console.error('[Fast2SMS] Init failed:', error);
        }

        // --- Log activity ---
        try {
            const { logActivity } = await import('@/lib/activity-logger');
            await logActivity('emergency', userId?.toString(), {
                emergencyType, latitude, longitude
            }, req);
        } catch { /* non-fatal */ }

        return NextResponse.json({
            success: true,
            emergencyId,
            nearestHospitals,
            address,
            message: 'Emergency alert sent. Help is on the way.',
        }, { status: 201 });

    } catch (error) {
        console.error('[ESRS] Emergency POST error:', error);
        return NextResponse.json({ error: 'Failed to process emergency request' }, { status: 500 });
    }
}
