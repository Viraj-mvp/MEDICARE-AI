# 🏗️ Medicare AI - Architecture & Engineering Documentation

## 1. System Overview

Medicare AI is a Next.js 16 application providing AI-driven medical predictions. It uses a hybrid architecture of serverless API routes, Edge middleware for security, and MongoDB for persistence.

The **Tri-Engine Prediction System** routes to Groq LLaMA-3, Gemini, or a deterministic rule-based fallback depending on availability.

---

## 2. High-Level Architecture

```mermaid
graph TD
    Client[Client Browser]
    Middleware[Edge Middleware]
    Server[Next.js Server API]
    DB[(MongoDB)]
    AI[External AI Services]
    SMS[Fast2SMS Gateway]

    Client -->|HTTPS| Middleware
    Middleware -->|Auth Check JWT| Server
    Middleware -->|Reject| Client

    subgraph "Application Core"
        Server -->|CRUD| DB
        Server -->|Inference| AI
        Server -->|SOS Alerts| SMS
    end

    subgraph "AI Providers"
        AI -->|Tier 1| Groq[Groq LLaMA-3 70B]
        AI -->|Tier 2| Gemini[Gemini 1.5 Flash]
    end
```

---

## 3. 🧠 Prediction Engine Logic

The `Prediction Orchestrator` (`lib/prediction/orchestrator.ts`) routes user requests.

```mermaid
flowchart TD
    Start([User Submits Symptoms]) --> Validate[Zod Schema Validation]
    Validate -->|Invalid| Error[Return 400]
    Validate -->|Valid| CheckKeys{API Keys Set?}
    CheckKeys -->|Groq Key| Groq[Call Groq LLaMA-3]
    CheckKeys -->|No Keys| RuleBased
    Groq -->|Success| SaveResult[Save to MongoDB]
    Groq -->|Error| Gemini[Call Gemini 1.5 Flash]
    Gemini -->|Success| SaveResult
    Gemini -->|Error| RuleBased[Rule-Based Fallback]
    RuleBased --> SaveResult
    SaveResult --> End([Return JSON Response])
```

---

## 4. 🗄️ Database Schema

```mermaid
erDiagram
    User ||--o{ Prediction : "has"
    User {
        ObjectId _id
        string email
        string password_hash
        string name
        string role
    }
    Prediction {
        ObjectId _id
        ObjectId userId
        object userDetails
        object[] symptoms
        object result
        string source
    }
    Hospital {
        ObjectId _id
        string name
        object coordinates
        string[] specialty
        string city
    }
    EmergencyRequest {
        ObjectId _id
        ObjectId userId
        string emergencyType
        object[] nearestHospitals
        string status
    }
```

---

## 5. 🚨 Emergency SOS Pipeline

```mermaid
sequenceDiagram
    participant User
    participant SOS Button
    participant API
    participant OpenCage
    participant MongoDB
    participant Fast2SMS

    User->>SOS Button: Long Press
    SOS Button->>API: POST /api/emergency (lat, lng, emergencyType)
    API->>OpenCage: Reverse geocode lat/lng
    OpenCage-->>API: Readable address
    API->>MongoDB: Find 3 nearest hospitals (Haversine)
    API->>MongoDB: Save emergency record
    API->>Fast2SMS: SMS to Patient
    API->>Fast2SMS: SMS to each Hospital
    API-->>SOS Button: { nearestHospitals, address }
```

---

## 6. 🔒 Security Architecture

1. **HttpOnly Cookies** — JWT never exposed to JavaScript
2. **Edge Middleware** — Authentication happens at CDN edge before pages render
3. **Content Security Policy** — Headers injected in `middleware.ts`
4. **Zod Validation** — All API inputs strictly typed and validated
5. **`force-dynamic`** — All user data endpoints must export `export const dynamic = 'force-dynamic'` to prevent response caching

---

## 7. 📁 Directory Map

| Path | Purpose |
|---|---|
| `app/api/predictions` | Core prediction POST endpoint |
| `app/api/emergency` | SOS alert handler (Fast2SMS + OpenCage) |
| `app/api/youtube` | YouTube Data API v3 proxy |
| `app/api/medical-evidence` | PubMed NCBI clinical evidence proxy |
| `app/api/medlineplus` | MedlinePlus specialty summary proxy |
| `app/api/admin/outbreak-stats` | disease.sh India stats |
| `lib/prediction/orchestrator.ts` | AI → Rule fallback routing |
| `lib/prediction/rule-based.ts` | Offline deterministic fallback engine |
| `lib/ai/providers.ts` | Groq + Gemini API wrappers |
| `lib/alerts/sms-india.ts` | Fast2SMS dispatch utility |
| `lib/geocoder.ts` | OpenCage reverse geocoder |
| `lib/auth/jwt.ts` | JWT sign/verify via jose |
| `lib/db/mongodb.ts` | MongoDB singleton connection |
| `lib/db/schemas.ts` | TypeScript types for all collections |
| `middleware.ts` | Edge security, JWT guard, CSP |
| `docs/ARCHITECTURE.md` | This document |
| `AI_CONTEXT.md` | AI agent onboarding context |
