import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/auth/jwt';
import { Hospital } from '@/lib/db/schemas';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const { hospitalSearchSchema } = await import('@/lib/validation/schemas');

        // Parse and validate params (using safeParse to allow defaults handling logic or we can just parse)
        // Using object.fromEntries to convert searchParams to plain object for Zod
        const rawParams = Object.fromEntries(searchParams.entries());
        const validatedParams = hospitalSearchSchema.parse(rawParams);

        const { lat, lng, radius, specialty, search, type, page: pageStr, limit: limitStr } = validatedParams;

        // Pagination Params
        const page = parseInt(pageStr || '0');
        const limit = parseInt(limitStr || '25');
        const skip = page * limit;

        const db = await getDatabase();
        const hospitalsCollection = db.collection<Hospital>('hospitals');

        let query: any = {};

        // Search functionality — fuzzy + normalized matching
        // normalizedSearch strips spaces/hyphens/dots and lowercases,
        // so "gandhinagar" matches "Gandhi Nagar", "civil hosp" matches "Civil Hospital", etc.
        if (search) {
            const normalizedSearch = search.toLowerCase().replace(/[\s\-_\.]+/g, '');
            const rawRegex = { $regex: search, $options: 'i' };
            const normRegex = { $regex: normalizedSearch, $options: 'i' };
            query.$or = [
                { name: rawRegex },
                { city: rawRegex },
                { nameSearch: normRegex },
                { citySearch: normRegex },
                { specialty: { $elemMatch: { $regex: search, $options: 'i' } } }
            ];
        }

        // Filter by specialty if provided — supports comma-separated values with case-insensitive regex
        if (specialty) {
            const specialties = specialty.split(',').map(s => s.trim()).filter(Boolean);
            if (specialties.length === 1) {
                query.specialty = { $elemMatch: { $regex: specialties[0], $options: 'i' } };
            } else {
                // OR: hospital must have at least one of the requested specialties
                const specialtyConditions = specialties.map(sp => ({
                    specialty: { $elemMatch: { $regex: sp, $options: 'i' } }
                }));
                if (query.$or) {
                    query = { $and: [{ $or: query.$or }, { $or: specialtyConditions }] };
                } else if (query.$and) {
                    query.$and.push({ $or: specialtyConditions });
                } else {
                    query.$or = specialtyConditions;
                }
            }
        }

        // Filter by Type (Multi-select support)
        if (type) {
            const types = type.split(',');
            const typeConditions: any[] = [];

            // Map frontend values to regex/queries
            if (types.includes('government')) {
                typeConditions.push({ type: { $regex: /(government|civil|public|municipal|corporation)/i } });
            }
            if (types.includes('Trust')) {
                typeConditions.push({ type: { $regex: /trust/i } });
            }
            if (types.includes('Private(For Profit)')) {
                typeConditions.push({ type: 'Private(For Profit)' });
            }
            if (types.includes('Private(Not For Profit)')) {
                typeConditions.push({ type: 'Private(Not For Profit)' });
            }

            // Legacy/Fallback for simple 'private'
            if (types.includes('private')) {
                typeConditions.push({ type: { $regex: /private/i } });
            }

            if (typeConditions.length > 0) {
                if (query.$or) {
                    // If search exists, we need ($or search) AND ($or types)
                    query = {
                        $and: [
                            { $or: query.$or },
                            { $or: typeConditions }
                        ]
                    };
                } else {
                    query.$or = typeConditions;
                }
            }
        } else {
            // Default Sort logic only applies if no specific filter? 
            // Actually sorting happens after fetch. We usually want to filter first.
        }

        // 1. Fetch lightweight map markers for all matches
        const mapMarkersCursor = await hospitalsCollection.find(query, {
            projection: { _id: 1, coordinates: 1, name: 1, address: 1, city: 1, type: 1 }
        }).toArray();

        const mapMarkers = mapMarkersCursor
            .filter(h => h.coordinates && h.coordinates.lat && h.coordinates.lng)
            .map(h => ({
                id: h._id,
                position: [h.coordinates.lat, h.coordinates.lng],
                name: h.name,
                address: h.address,
                city: h.city,
                type: h.type
            }));

        let paginatedHospitals: any[] = [];
        let total = await hospitalsCollection.countDocuments(query);

        // 2. Fetch paginated list
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            // Use aggregation with $geoNear for distance sorting
            const geoNearStage = {
                $geoNear: {
                    near: { type: "Point", coordinates: [userLng, userLat] },
                    distanceField: "distance",
                    spherical: true,
                    query: query,
                    distanceMultiplier: 0.001 // meters to km
                }
            };
            
            paginatedHospitals = await hospitalsCollection.aggregate([
                geoNearStage,
                { $skip: skip },
                { $limit: limit }
            ]).toArray();
        } else {
            // Standard sort: approximate government/trust first then name
            paginatedHospitals = await hospitalsCollection
                .find(query)
                .sort({ type: -1, name: 1 })
                .skip(skip)
                .limit(limit)
                .toArray();
        }

        const totalPages = Math.ceil(total / limit);

        // Log activity (get userId from token if available)
        try {
            const payload = await getAuthUser(req);
            if (payload) {
                const { logActivity } = await import('@/lib/activity-logger');
                await logActivity('hospital_search', payload.userId, {
                    resultsCount: total,
                    hasLocation: !!(lat && lng),
                    specialty: specialty || undefined,
                    searchTerm: search || undefined
                }, req);
            }
        } catch (e) {
            // Ignore activity logging errors
        }

        return NextResponse.json({
            hospitals: paginatedHospitals,
            mapMarkers,
            total,
            page,
            limit,
            totalPages
        });

    } catch (error) {
        console.error('Get hospitals error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// POST endpoint for adding hospitals (admin only)
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { verifyToken } = await import('@/lib/auth/jwt');
        const payload = await verifyToken(token);

        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { hospitalSchema } = await import('@/lib/validation/schemas');

        const validatedData = hospitalSchema.parse(body);

        const db = await getDatabase();
        const hospitalsCollection = db.collection<Hospital>('hospitals');

        const hospital: Hospital = {
            ...validatedData,
            createdAt: new Date(),
        };

        const result = await hospitalsCollection.insertOne(hospital);

        return NextResponse.json({
            message: 'Hospital added successfully',
            hospitalId: result.insertedId,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Add hospital error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
