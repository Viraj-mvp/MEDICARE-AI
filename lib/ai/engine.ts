import { SymptomInput, PredictionResult } from '../db/schemas'; 
import { ruleBasedPrediction } from '../prediction/rule-based'; 
import { SYSTEM_PROMPT } from '@/lib/ai/prompts'; 
import { z } from 'zod'; 

// ───────────────────────────────────────────── 
// TYPES 
// ───────────────────────────────────────────── 

export interface PredictionInput { 
    symptoms: SymptomInput[]; 
    age?: number; 
    gender?: string; 
    questionnaire?: Record<string, unknown>; 
} 

export type PredictionSource = 'Groq' | 'Gemini' | 'Rule-Based'; 

export interface PredictionEngineResult { 
    result: PredictionResult; 
    source: PredictionSource; 
    attempts: number; 
    fallback_reason?: string; 
} 

// ───────────────────────────────────────────── 
// ZOD SCHEMA — STRICT (no optional abuse) 
// ───────────────────────────────────────────── 

const DifferentialSchema = z.object({ 
    name: z.string().min(1), 
    probability: z.number().min(0).max(100), 
    distinguishing_factor: z.string().min(1), 
}); 

const UsefulLinkSchema = z.object({ 
    title: z.string().min(1), 
    url: z.string().url(), 
}); 

const PredictionSchema = z.object({ 
    primary_diagnosis: z.string().min(1), 
    icd11_code: z.string().optional().default('Unknown'), 
    confidence: z.number().int().min(0).max(100), 
    confidence_rationale: z.string().optional().default(''), 
    differential_diagnoses: z.array(DifferentialSchema).min(1).max(5).optional().default([]), 
    explanation: z.string().min(10), 
    red_flags: z.array(z.string()).optional().default([]), 
    emergency_alert: z.boolean(), 
    emergency_reason: z.string().nullable().optional().default(null), 
    recommendations: z.array(z.string()).min(1), 
    home_remedies: z.array(z.string()).optional().default([]), 
    precautions: z.array(z.string()).optional().default([]), 
    specialist: z.string().min(1), 
    specialist_urgency: z.enum(['immediate', 'within_48h', 'within_week', 'routine']).optional().default('routine'), 
    alternatives: z.array(z.string()).optional().default([]), 
    video_search_query: z.string().min(1), 
    visual_aid_keyword: z.string().optional().default(''), 
    useful_links: z.array(UsefulLinkSchema).optional().default([]), 
    lifestyle_modifications: z.array(z.string()).optional().default([]), 
    follow_up_symptoms: z.array(z.string()).optional().default([]), 
}); 

type ValidatedPrediction = z.infer<typeof PredictionSchema>; 

// ───────────────────────────────────────────── 
// PROMPT BUILDER — Context-Rich 
// ───────────────────────────────────────────── 

function buildUserPrompt(input: PredictionInput): string { 
    const symptomList = input.symptoms 
        .map(s => { 
            const duration = (s as any).duration ? ` | Duration: ${(s as any).duration}` : ''; 
            const location = (s as any).location ? ` | Location: ${(s as any).location}` : ''; 
            return `  • ${s.name} (Severity: ${s.severity}/10${duration}${location})`; 
        }) 
        .join('\n'); 

    const topSymptoms = [...input.symptoms] 
        .sort((a, b) => b.severity - a.severity) 
        .slice(0, 3) 
        .map(s => s.name) 
        .join(', '); 

    const questionnaireStr = input.questionnaire 
        ? Object.entries(input.questionnaire) 
              .map(([k, v]) => `  • ${k}: ${v}`) 
              .join('\n') 
        : '  • No additional questionnaire data provided'; 

    const ageRisk = getAgeRiskProfile(input.age ?? 30); 

    return `PATIENT PROFILE: 
  Age: ${input.age ?? 'Unknown'} (${ageRisk}) 
  Biological Sex: ${input.gender ?? 'Not specified'} 

PRESENTING SYMPTOMS (${input.symptoms.length} total): 
${symptomList} 

PRIMARY COMPLAINT (highest severity): ${topSymptoms} 

QUESTIONNAIRE RESPONSES: 
${questionnaireStr} 

DIAGNOSTIC TASK: 
Analyze the symptom cluster above. Consider age-specific risk factors for ${ageRisk}. 
Apply differential diagnosis methodology. Output strictly valid JSON per the schema provided. 
Do NOT include any text before or after the JSON object.`; 
} 

function getAgeRiskProfile(age: number): string { 
    if (age < 2) return 'Neonate/Infant — high infection/congenital risk'; 
    if (age < 12) return 'Pediatric — viral infections, developmental conditions'; 
    if (age < 18) return 'Adolescent — hormonal, stress, infectious'; 
    if (age < 40) return 'Young Adult — lifestyle, infectious, reproductive'; 
    if (age < 60) return 'Middle-aged Adult — metabolic, cardiovascular risk rising'; 
    if (age < 75) return 'Older Adult — chronic disease, polypharmacy, cancer screening age'; 
    return 'Geriatric — multi-morbidity, atypical presentations common'; 
} 

// ───────────────────────────────────────────── 
// PARSER — Resilient Multi-Strategy 
// ───────────────────────────────────────────── 

function parseAIResponse(raw: string): ValidatedPrediction { 
    // Strategy 1: Direct parse 
    const strategies: Array<() => unknown> = [ 
        () => JSON.parse(raw.trim()), 
        () => { 
            // Strip markdown fences 
            const stripped = raw 
                .replace(/^```(?:json)?\s*/im, '') 
                .replace(/```\s*$/im, '') 
                .trim(); 
            return JSON.parse(stripped); 
        }, 
        () => { 
            // Extract first complete JSON object 
            const match = raw.match(/\{[\s\S]*\}/); 
            if (!match) throw new Error('No JSON object found'); 
            return JSON.parse(match[0]); 
        }, 
        () => { 
            // Handle escaped newlines (common in Groq responses) 
            return JSON.parse(raw.replace(/\\n/g, ' ').replace(/\n/g, ' ').trim()); 
        }, 
    ]; 

    let lastError: Error | null = null; 

    for (const strategy of strategies) { 
        try { 
            const parsed = strategy(); 
            const validated = PredictionSchema.safeParse(parsed); 

            if (validated.success) { 
                return validated.data; 
            } 

            // Log Zod issues for debugging 
            console.warn('[PredictionEngine] Zod validation issues:', validated.error.issues); 
            lastError = new Error(validated.error.issues.map(i => i.message).join('; ')); 
        } catch (err) { 
            lastError = err as Error; 
        } 
    } 

    throw new Error(`All parse strategies failed. Last error: ${lastError?.message}`); 
} 

// ───────────────────────────────────────────── 
// AI CALLER — With Retry + Exponential Backoff 
// ───────────────────────────────────────────── 

const MAX_RETRIES = 2; 
const RETRY_DELAY_MS = 500; 

async function callAIWithRetry( 
    userPrompt: string 
): Promise<{ text: string; source: PredictionSource; attempts: number }> { 
    const { callAI } = await import('@/lib/ai/providers'); 
    let lastError: Error | null = null; 

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) { 
        try { 
            const { text, source } = await callAI([{ role: 'user', content: userPrompt }], SYSTEM_PROMPT); 

            if (!text?.trim()) { 
                throw new Error('Empty response from AI provider'); 
            } 

            // Validate parseable before returning 
            parseAIResponse(text); // throws if invalid 

            return { 
                text, 
                source: source as PredictionSource, 
                attempts: attempt, 
            }; 
        } catch (err) { 
            lastError = err as Error; 
            console.warn(`[PredictionEngine] Attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message); 

            if (attempt < MAX_RETRIES) { 
                // Add retry hint to prompt on subsequent attempts 
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt)); 
            } 
        } 
    } 

    throw lastError ?? new Error('AI call failed after all retries'); 
} 

// ───────────────────────────────────────────── 
// SAFETY LAYER — Emergency Override 
// ───────────────────────────────────────────── 

const EMERGENCY_KEYWORDS = [ 
    'chest pain', 'chest tightness', 'difficulty breathing', 'shortness of breath', 
    'sudden severe headache', 'thunderclap headache', 'facial drooping', 'arm weakness', 
    'slurred speech', 'loss of consciousness', 'seizure', 'anaphylaxis', 'throat swelling', 
    'coughing blood', 'vomiting blood', 'severe abdominal pain', 'suicidal', 'self harm', 
    'overdose', 'unresponsive', 'no pulse', 'not breathing', 
]; 

function applyEmergencySafetyOverride( 
    result: ValidatedPrediction, 
    symptoms: SymptomInput[] 
): ValidatedPrediction { 
    const symptomText = symptoms.map(s => s.name.toLowerCase()).join(' '); 
    const hasEmergencySymptom = EMERGENCY_KEYWORDS.some(kw => symptomText.includes(kw)); 

    if (hasEmergencySymptom && !result.emergency_alert) { 
        console.warn('[PredictionEngine] Safety override: Emergency symptoms detected, AI missed flag'); 
        return { 
            ...result, 
            emergency_alert: true, 
            emergency_reason: result.emergency_reason ?? 'Symptom pattern matches emergency indicators. Seek immediate medical care.', 
            specialist_urgency: 'immediate', 
            recommendations: [ 
                'CALL EMERGENCY SERVICES IMMEDIATELY (112 / 911)', 
                ...result.recommendations.slice(0, 3), 
            ], 
        }; 
    } 

    return result; 
} 

// ───────────────────────────────────────────── 
// MAIN ENGINE 
// ───────────────────────────────────────────── 

export async function runPredictionEngine( 
    input: PredictionInput 
): Promise<PredictionEngineResult> { 
    const { symptoms, age, gender, questionnaire } = input; 

    // Guard: no symptoms at all 
    if (!symptoms.length) { 
        return buildInsufficientDataResult(); 
    } 

    const hasGroq = Boolean(process.env.GROQ_API_KEY); 
    const hasGemini = Boolean(process.env.GEMINI_API_KEY); 
    const aiAvailable = hasGroq || hasGemini; 

    // ── PRIORITY 1: AI Engine ────────────────── 
    if (aiAvailable) { 
        try { 
            const userPrompt = buildUserPrompt(input); 
            const { text, source, attempts } = await callAIWithRetry(userPrompt); 
            let aiResult = parseAIResponse(text); 
            aiResult = applyEmergencySafetyOverride(aiResult, symptoms); 

            return { 
                result: mapToLegacySchema(aiResult), 
                source, 
                attempts, 
            }; 
        } catch (error) { 
            console.error('[PredictionEngine] AI pipeline fully failed:', (error as Error).message); 
            // Fall through to rule-based 
        } 
    } 

    // ── PRIORITY 2: Rule-Based Fallback ──────── 
    return buildRuleBasedResult(symptoms, age, gender, aiAvailable); 
} 

// ───────────────────────────────────────────── 
// HELPERS 
// ───────────────────────────────────────────── 

function mapToLegacySchema(data: ValidatedPrediction): PredictionResult { 
    return { 
        primary_diagnosis: data.primary_diagnosis, 
        confidence: data.confidence, 
        explanation: data.explanation, 
        recommendations: data.recommendations, 
        home_remedies: data.home_remedies, 
        precautions: data.precautions, 
        video_search_query: data.video_search_query, 
        specialist: data.specialist, 
        alternatives: data.alternatives, 
        emergency_alert: data.emergency_alert, 
        visual_aid_keyword: data.visual_aid_keyword, 
        useful_links: data.useful_links, 
        // Extended fields — add to PredictionResult schema 
        icd11_code: data.icd11_code, 
        confidence_rationale: data.confidence_rationale, 
        differential_diagnoses: data.differential_diagnoses, 
        red_flags: data.red_flags, 
        emergency_reason: data.emergency_reason, 
        specialist_urgency: data.specialist_urgency, 
        lifestyle_modifications: data.lifestyle_modifications, 
        follow_up_symptoms: data.follow_up_symptoms, 
    } as any; 
} 

function buildRuleBasedResult( 
    symptoms: SymptomInput[], 
    age: number | undefined, 
    gender: string | undefined, 
    aiWasAvailable: boolean 
): PredictionEngineResult { 
    const result = ruleBasedPrediction(symptoms, age, gender); 
    const fallbackNote = aiWasAvailable 
        ? ' [AI temporarily unavailable — rule-based analysis applied]' 
        : ' [AI not configured — rule-based analysis applied]'; 

    return { 
        result: { 
            primary_diagnosis: result.primary_diagnosis ?? 'Undetermined Condition', 
            confidence: result.confidence ?? 35, 
            explanation: (result.explanation ?? 'Symptom-pattern matching applied.') + fallbackNote, 
            recommendations: result.recommendations?.length 
                ? result.recommendations 
                : ['Consult a General Practitioner for definitive evaluation.'], 
            home_remedies: result.home_remedies ?? [], 
            precautions: result.precautions ?? ['Monitor your symptoms closely.'], 
            video_search_query: result.video_search_query ?? `${result.primary_diagnosis ?? 'condition'} symptoms treatment`, 
            specialist: result.specialist ?? 'General Practitioner', 
            alternatives: result.alternatives ?? [], 
            emergency_alert: result.emergency_alert ?? false, 
            useful_links: result.useful_links ?? [], 
        }, 
        source: 'Rule-Based', 
        attempts: 0, 
        fallback_reason: aiWasAvailable ? 'AI provider exhausted retries' : 'No AI keys configured', 
    }; 
} 

function buildInsufficientDataResult(): PredictionEngineResult { 
    return { 
        result: { 
            primary_diagnosis: 'Insufficient Data', 
            confidence: 0, 
            explanation: 'No symptoms provided. Accurate diagnosis requires symptom input.', 
            recommendations: [ 
                'Describe your symptoms in detail', 
                'Note severity, duration, and location of each symptom', 
                'Visit a General Practitioner for in-person evaluation', 
            ], 
            home_remedies: [], 
            precautions: ['Do not self-diagnose without clinical data'], 
            video_search_query: 'how to describe symptoms to a doctor', 
            specialist: 'General Practitioner', 
            alternatives: [], 
            emergency_alert: false, 
            useful_links: [
                { title: 'MedlinePlus: Talking to Your Doctor', url: 'https://medlineplus.gov/talkingwithyourdoctor.html' },
            ],
        }, 
        source: 'Rule-Based', 
        attempts: 0, 
        fallback_reason: 'No symptoms provided', 
    }; 
}
