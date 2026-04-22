import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/jwt';
import { 
    generateDiseaseDescription, 
    generateTreatmentInfo, 
    generateSymptomDescription,
    generateHospitalSpecialties
} from '@/lib/ai/admin-assistant';

export async function POST(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, name, extra } = await req.json();

        let result;
        switch (type) {
            case 'disease_description':
                result = await generateDiseaseDescription(name, extra || '');
                break;
            case 'treatment_info':
                result = await generateTreatmentInfo(name);
                break;
            case 'symptom_description':
                result = await generateSymptomDescription(name);
                break;
            case 'hospital_specialties':
                result = await generateHospitalSpecialties(name, extra || '');
                break;
            default:
                return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 });
        }

        return NextResponse.json({ result });
    } catch (error: any) {
        console.error('AI Generation error:', error);
        return NextResponse.json({ error: error.message || 'AI Generation failed' }, { status: 500 });
    }
}
