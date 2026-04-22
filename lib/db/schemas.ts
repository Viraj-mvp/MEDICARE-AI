import { ObjectId } from 'mongodb';

// User Schema
export interface User {
    _id?: ObjectId;
    email: string;
    password: string; // hashed
    name: string;
    phone?: string;   // optional contact number (used by emergency panel)
    age?: string;
    gender?: string;
    role: 'user' | 'admin';
    medicalHistory?: string[]; // Optional medical history
    bloodGroup?: string;       // For Health Passport & Emergency
    currentMedications?: string[]; // Ongoing medications
    lastLogin?: Date;
    loginAttempts?: number;
    lockUntil?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// Symptom Schema
export interface Symptom {
    _id?: ObjectId;
    name: string;
    category: string;
    icon?: string;
    description?: string;
    commonDiseases: string[];
    createdAt: Date;
}

// Symptom Input (from user)
export interface SymptomInput {
    name: string;
    severity: number; // 1-10 (matches the prediction UI slider)
    source: 'static' | 'custom';
}

// Prediction Schema
export interface Prediction {
    _id?: ObjectId;
    userId?: ObjectId;
    userDetails: {
        name: string;
        age: number;
        gender: string;
        phone: string;
    };
    symptoms: SymptomInput[];
    symptomIds?: ObjectId[]; // Normalized symptom references
    answers?: Record<string, any>;
    result: PredictionResult;
    diseaseId?: ObjectId; // Normalized disease reference
    source: 'Groq' | 'Gemini' | 'Rule-Based' | 'AI';
    relationship?: string;
    createdAt: Date;
}

// Prediction Result
export interface PredictionResult {
    primary_diagnosis: string;
    confidence: number; // 0-95
    alternatives?: string[];
    explanation: string;
    recommendations?: string[];
    home_remedies?: string[];
    video_search_query?: string;
    specialist?: string;
    precautions?: string[];
    emergency_alert?: boolean;
    visual_aid_keyword?: string;
    useful_links?: { title: string; url: string }[];
    // Extended Production Fields
    icd11_code?: string;
    confidence_rationale?: string;
    differential_diagnoses?: {
        name: string;
        probability: number;
        distinguishing_factor: string;
    }[];
    red_flags?: string[];
    emergency_reason?: string | null;
    specialist_urgency?: 'immediate' | 'within_48h' | 'within_week' | 'routine';
    lifestyle_modifications?: string[];
    follow_up_symptoms?: string[];
}

// Hospital Schema
export interface Hospital {
    _id?: ObjectId;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    phone: string;
    specialty: string[];
    rating?: number;
    type?: string;
    createdAt: Date;
}

// Feedback Schema
export interface Feedback {
    _id?: ObjectId;
    predictionId: ObjectId;
    userId?: ObjectId;
    rating: number; // 1-5
    comment?: string;
    wasAccurate: boolean;
    createdAt: Date;
}

// Disease Schema
export interface Disease {
    _id?: ObjectId;
    name: string;
    type: string; // "infectious", "chronic", "neurological", etc.
    category: string;
    commonSymptoms: ObjectId[]; // References to Symptom._id
    treatmentInfo: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    specialist: string;
    confidence: number; // Base confidence for rule-based matching
    createdAt: Date;
    updatedAt: Date;
}

// Activity Log Schema
export interface ActivityLog {
    _id?: ObjectId;
    userId?: ObjectId; // Optional for anonymous users
    action: 'login' | 'logout' | 'signup' | 'prediction' | 'hospital_search' | 'profile_update' | 'emergency';
    details?: Record<string, any>; // Additional context
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

// Emergency Request Schema
export type EmergencyType =
    | 'Heart Attack'
    | 'Accident / Trauma'
    | 'Breathing Problem'
    | 'Poisoning'
    | 'Severe Bleeding'
    | 'Severe Pain'
    | 'Other';

export type EmergencyStatus = 'pending' | 'sent' | 'accepted' | 'cancelled';

export interface NearestHospital {
    hospitalId: string;
    name: string;
    phone: string;
    address: string;
    distanceKm: number;    // km
    etaMinutes: number;    // estimated drive time
}

export interface EmergencyRequest {
    _id?: ObjectId;
    userId?: ObjectId;          // null for guests
    name: string;
    phone: string;
    latitude: number;
    longitude: number;
    address: string;            // reverse-geocoded or manually entered
    emergencyType: EmergencyType;
    message?: string;           // optional additional info
    medicalHistory?: string[];  // pulled from user profile
    nearestHospitals: NearestHospital[];
    status: EmergencyStatus;
    acknowledgedBy?: string;    // hospital name that accepted
    acknowledgedAt?: Date;
    createdAt: Date;
}
