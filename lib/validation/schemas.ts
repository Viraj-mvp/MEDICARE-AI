import { z } from 'zod';

// Symptom Input Validation
export const symptomInputSchema = z.object({
    name: z.string().min(1).max(60).trim(),
    severity: z.number().min(1).max(10), // Matches prediction UI slider (1-10)
    source: z.enum(['static', 'custom']),
});


// Prediction Request Validation
export const predictionRequestSchema = z.object({
    userDetails: z.object({
        name: z.string().min(1),
        age: z.union([z.string(), z.number()]).transform(val => Number(val)),
        gender: z.string(),
        phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    }),
    symptoms: z.array(symptomInputSchema).min(1).max(3),
    answers: z.record(z.any()).optional(), // Renamed from questionnaire to match frontend
});

// Auth Schemas
export const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    medicalHistory: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

// Hospital Schema
export const hospitalSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
    }),
    phone: z.string().min(1),
    specialty: z.array(z.string()),
    rating: z.number().min(0).max(5).optional(),
});

// Feedback Schema
export const feedbackSchema = z.object({
    predictionId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().max(500).optional(),
    wasAccurate: z.boolean(),
});

// Hospital Search Schema (for GET requests)
export const hospitalSearchSchema = z.object({
    lat: z.string().optional(),
    lng: z.string().optional(),
    radius: z.string().optional(), // Kept for schema compat; no longer used for hard filtering
    specialty: z.string().optional(),
    search: z.string().optional(),
    type: z.string().optional(),
    page: z.string().optional().default('0'),
    limit: z.string().optional().default('25'),
});

// News Search Schema (for GET requests)
export const newsSearchSchema = z.object({
    q: z.string().optional().default('health'),
    limit: z.string().optional().default('6'),
});

// Disease Management Schemas
export const diseaseCreateSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.string().min(1).max(50),
    category: z.string().min(1).max(50),
    commonSymptoms: z.array(z.string()).optional(), // Symptom IDs
    treatmentInfo: z.string().min(1),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    specialist: z.string().min(1).max(100),
    confidence: z.number().min(0).max(100).optional().default(75),
});

export const diseaseUpdateSchema = diseaseCreateSchema.partial();

// Symptom Management Schemas
export const symptomCreateSchema = z.object({
    name: z.string().min(1).max(100),
    category: z.string().min(1).max(50),
    icon: z.string().optional(),
    description: z.string().optional(),
    commonDiseases: z.array(z.string()).optional(), // Disease Names or IDs
});

export const symptomUpdateSchema = symptomCreateSchema.partial();

// Hospital Management Schemas (for admin)
export const hospitalCreateSchema = hospitalSchema; // Reuse existing
export const hospitalUpdateSchema = hospitalSchema.partial();

// Activity Log Query Schema
export const activityLogQuerySchema = z.object({
    userId: z.string().optional(),
    action: z.enum(['login', 'logout', 'signup', 'prediction', 'hospital_search', 'profile_update']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.string().optional().default('50'),
    page: z.string().optional().default('0'),
});
