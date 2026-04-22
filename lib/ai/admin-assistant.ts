import { callAI } from './providers';

export async function generateDiseaseDescription(name: string, type: string): Promise<string> {
    const systemPrompt = `You are a medical content assistant. Generate a professional, concise description for a disease.
    Format the output as a clean paragraph without any markdown headers. Focus on what it is, common causes, and typical progression.`;
    
    const userPrompt = `Generate a description for the disease: ${name} (Type: ${type})`;
    
    const response = await callAI([{ role: 'user', content: userPrompt }], systemPrompt);
    return response.text;
}

export async function generateTreatmentInfo(name: string): Promise<string> {
    const systemPrompt = `You are a medical content assistant. Generate professional treatment information for a disease.
    Include common medications, lifestyle changes, and when to seek emergency care. Keep it concise and formatted as a list.`;
    
    const userPrompt = `Generate treatment info for: ${name}`;
    
    const response = await callAI([{ role: 'user', content: userPrompt }], systemPrompt);
    return response.text;
}

export async function generateSymptomDescription(name: string): Promise<string> {
    const systemPrompt = `You are a medical content assistant. Generate a concise, professional description for a medical symptom.
    Explain what the symptom feels like and what systems of the body it typically affects.`;
    
    const userPrompt = `Generate a description for the symptom: ${name}`;
    
    const response = await callAI([{ role: 'user', content: userPrompt }], systemPrompt);
    return response.text;
}

export async function generateHospitalSpecialties(name: string, address: string): Promise<string[]> {
    const systemPrompt = `You are a medical assistant. Based on a hospital's name and location, suggest a list of 5-8 common specialized departments they likely have.
    Return ONLY a comma-separated list of specialties. Examples: Cardiology, Neurology, Pediatrics, Oncology, Orthopedics, Emergency Medicine.`;
    
    const userPrompt = `Suggest specialties for: ${name} located at ${address}`;
    
    const response = await callAI([{ role: 'user', content: userPrompt }], systemPrompt);
    return response.text.split(',').map(s => s.trim()).filter(Boolean);
}
