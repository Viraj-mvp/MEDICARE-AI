import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai/providers';

export async function POST(req: NextRequest) {
    try {
        const { messages, context, analytics } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        // Knowledge base for Medicare AI
        const medicareKnowledge = `
        You are "Medi", the friendly and professional AI health assistant for MEDICARE-AI.
        MEDICARE-AI is a next-generation healthcare platform that uses AI for disease prediction and healthcare assistance.
        
        Key Services:
        1. Disease Prediction: Users can input symptoms to get AI-powered health risk assessments.
        2. Hospital Search: Find nearby hospitals and specialized medical centers.
        3. Emergency Alerts: Quick access to emergency medical services.
        4. Health Passport: Secure storage for medical history and reports.
        5. Prevention & Wellness: Tips for maintaining a healthy lifestyle.
        
        Platform Features:
        - Real-time analytics for healthcare data.
        - Privacy-first approach with secure medical records.
        - Integration with top Indian medical facilities.
        - 24/7 AI-powered health support.
        
        Planned for v3.0 (mention only if asked):
        - Real-time chat with professionals.
        - AI medication interaction checker.
        - Mental health assessment module.
        
        Your Tone:
        - Friendly, approachable, and empathetic.
        - Professional but not overly clinical.
        - Concise and helpful.
        
        Guidelines:
        - ALWAYS include a medical disclaimer: "I am an AI assistant, not a doctor. Please consult a healthcare professional for medical advice."
        - If asked about specific symptoms, suggest using our "Disease Prediction" tool.
        - If asked about an emergency, direct them to the "Emergency" button immediately.
        - Use the provided page context to give more relevant answers.
        `;

        const pageContext = context ? `Current Page Context: ${JSON.stringify(context)}` : "";
        
        const systemPrompt = `${medicareKnowledge}\n${pageContext}`;

        // Limit message history to last 10 messages to keep context window manageable
        const messageHistory = messages.slice(-10);

        // Call AI provider (will prioritize Groq then Gemini as per lib/ai/providers.ts)
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
        console.error('Public AI Chat error:', error);
        return NextResponse.json({ error: 'Failed to generate response. Please try again later.' }, { status: 500 });
    }
}
