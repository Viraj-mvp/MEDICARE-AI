import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/jwt';
import { callAI } from '@/lib/ai/providers';

export async function POST(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages } = await req.json();
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        const systemPrompt = `You are a MEDICARE-AI Admin Assistant. You help administrators manage the medical database, hospitals, diseases, and symptoms.
        You have deep knowledge of the current database structure:
        - Hospitals: name, address, city, state, zipCode, coordinates, phone, specialty, type.
        - Diseases: name, type, category, commonSymptoms, treatmentInfo, severity, specialist.
        - Symptoms: name, category, description, commonDiseases.
        
        Answer questions about how to use the admin panel, help with medical content generation, and provide insights into data management. 
        Keep responses concise, professional, and helpful. 
        Always remind the admin that medical data should be verified by professionals.`;

        // Limit message history to last 10 messages to keep context window manageable
        const messageHistory = messages.slice(-10);

        const response = await callAI(
            messageHistory,
            systemPrompt
        );

        return NextResponse.json({ 
            message: {
                role: 'assistant',
                content: response.text
            }
        });
    } catch (error: any) {
        console.error('Admin AI Chat error:', error);
        return NextResponse.json({ error: error.message || 'Chat failed' }, { status: 500 });
    }
}
