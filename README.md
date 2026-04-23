# MEDICARE-AI

<p align="center">
  <img src="public/logo.png" alt="Medicare AI Logo" width="80" />
</p>

<p align="center">
  <strong>AI-Powered Healthcare Platform — Diagnose. Discover. Respond.</strong>
</p>

<p align="center">
  <a href="https://github.com/Viraj-mvp/MEDICARE-AI/stargazers"><img src="https://img.shields.io/github/stars/Viraj-mvp/MEDICARE-AI?style=social" alt="Stars" /></a>
  <a href="https://github.com/Viraj-mvp/MEDICARE-AI/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Viraj-mvp/MEDICARE-AI" alt="License" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb" alt="MongoDB" />
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Pages & Features](#-pages--features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Security Model](#-security-model)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧠 Overview

**Medicare AI** is a full-stack healthcare platform that combines AI-driven disease prediction with real-world clinical tools. Users can input symptoms, receive AI-generated diagnoses with confidence scores and ICD-11 codes, find nearby hospitals on an interactive map, and trigger emergency SOS alerts — all from a single web application.

### What problems does it solve?

| Problem | How Medicare AI solves it |
|---|---|
| AI diagnostics fail when APIs go down | 3-layer fallback: Groq → Gemini → Rule-Based Engine (works offline) |
| No way to find nearby hospitals quickly | Geo-proximity search across 900+ Gujarat hospitals with live map |
| Emergency response is slow | One-tap SOS button sends SMS with nearest 3 hospitals |
| Health records are scattered | Profile page stores prediction history, patient details, and medications |
| No instant medical guidance | Medi AI Assistant — a Gemini-powered chatbot available on every page |

---

## 🖥️ Pages & Features

### 🏠 Home (`/`)
- **Hero section** with glassmorphism trust banner
- **Mission stats** — live platform metrics
- **Intelligent Hospital Search** — animated wave visualization
- **Emergency Contacts** — quick-dial important numbers
- **Seasonal Alerts** — current health advisories
- **BMI Calculator** — height/weight input with category classification and tips
- **Health News** — live medical news feed
- **Health Education Videos** — curated YouTube health content
- **Global Disease Map** — outbreak statistics visualized on an interactive Leaflet map
- **Feedback Section** — user feedback form

### 🤖 Predict (`/predict`) — *Requires Login*
- **Symptom Selection** — browse by category or search, add custom symptoms
- **Severity Rating** — 1–10 scale per symptom
- **Dynamic Questionnaire** — follow-up questions based on selected symptoms
- **Relationship Mode** — predict for yourself or someone else (child, parent, etc.)
- **ECG Loading Animation** — real-time waveform during AI analysis
- **Prediction Results**:
  - Primary diagnosis with confidence arc gauge
  - Differential diagnoses with probabilities
  - ICD-11 codes
  - Red flags and emergency alerts
  - Specialist recommendation with urgency level
  - Home remedies, precautions, and lifestyle modifications
  - PubMed clinical evidence links
  - YouTube health video suggestions
  - Feedback bar (was this helpful?)

### 🏥 Hospitals (`/hospitals`)
- **900+ Gujarat hospitals** from seeded database
- **Geo-proximity sorting** — MongoDB `$geoNear` aggregation using browser geolocation
- **Specialty filtering** — multi-select filters loaded live from DB
- **Hospital type filtering** — Government, Private (For Profit), Private (Non Profit), Trust
- **Search** — animated glowing search bar with real-time filtering
- **Interactive Leaflet Map** — markers with popups, one-click Google Maps directions
- **Pagination** — paginated hospital cards with page navigation

### 🛡️ Prevention (`/prevention`)
- Disease prevention tips for **9 common conditions**: Common Cold, Flu, Heart Disease, Diabetes, Hypertension, COVID-19, Asthma, Osteoporosis, Depression
- Each disease card shows 5 actionable prevention tips with icons

### 👤 Profile (`/profile`) — *Requires Login*
- **User details** — name, email, age, gender, phone
- **Edit profile** — update patient information via dialog
- **Prediction history** — all past AI diagnoses with timestamps
- **Health Passport** — download PDF with QR code linking to digital record

### 🔐 Auth (`/auth`)
- **Login / Register** — toggle between modes via URL param (`?m=register`)
- **Modern auth card** — glassmorphism design with password visibility toggle
- **HttpOnly JWT cookies** — secure session management

### 👨‍💻 Developer Console (`/developer`) — *Admin Only*
- **Dashboard** — live stats (users, predictions, feedback counts)
- **Hospital Management** — CRUD operations for hospital records
- **Disease Management** — CRUD for disease knowledge base
- **Symptom Management** — CRUD for symptom catalog
- **AI Admin Assistant** — Gemini-powered chat for database queries
- **Activity Log** — real-time feed of admin actions

### 📜 Legal (`/legal`)
- Privacy Policy
- Terms of Service
- Contact Support information

### 🚨 Emergency SOS — *Global, Every Page*
- **Floating pulsing red button** — bottom-right corner, always visible
- **Emergency modal** — hold-to-confirm SOS trigger
- **Automated SMS** — Fast2SMS sends nearest 3 hospitals to registered phone
- **MongoDB TTL index** — emergency records auto-expire after 24 hours

### 💬 Medi AI Assistant — *Global, Every Page*
- **Floating chat bubble** — Gemini-powered health chatbot
- **Multi-turn conversation** — context-aware responses
- **Available on all pages** — persistent across navigation

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                           │
│   Next.js App Router · React 19 · Tailwind CSS · Framer Motion     │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────────────┐
│                      EDGE MIDDLEWARE                                │
│              JWT Verification · Route Protection                    │
└──────────┬────────────────────────────────────────┬────────────────┘
           │                                        │
┌──────────▼──────────┐              ┌──────────────▼──────────────┐
│   Next.js API Routes │              │     Public Pages            │
│   (Server-side)      │              │  Home, Hospitals, Legal     │
└──────────┬──────────┘              └─────────────────────────────┘
           │
┌──────────▼────────────────────────────────────────────────────────┐
│                     AI DIAGNOSTIC ENGINE                          │
│                                                                   │
│  ┌─────────────┐   fail   ┌───────────────┐   fail   ┌─────────┐│
│  │ Layer 1     │ ──────►  │ Layer 2       │ ──────►  │Layer 3  ││
│  │ Groq/LLaMA3 │          │ Gemini 1.5    │          │Rule Eng.││
│  │ (primary)   │          │ (fallback)    │          │(offline)││
│  └─────────────┘          └───────────────┘          └─────────┘│
└──────────┬────────────────────────────────────────────────────────┘
           │
┌──────────▼────────────────────────────────────────────────────────┐
│                         MONGODB ATLAS                             │
│   Geospatial Index · TTL Index · Hashed Passwords · Audit Logs   │
└──────────┬────────────────────────────────────────────────────────┘
           │
┌──────────▼────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                            │
│   Fast2SMS · OpenCage Geocoding · PubMed E-Utilities · Leaflet   │
└───────────────────────────────────────────────────────────────────┘
```

### Design Philosophy: **Stability-First AI**

> The system is designed so that a complete external API failure still returns a clinically valid response — Layer 3 rule engine operates with zero external dependencies.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | SSR, API routes, edge middleware |
| **UI** | React 19, Tailwind CSS, Framer Motion | Components, styling, animations |
| **Database** | MongoDB (Native Driver) | Geospatial queries, TTL indexes, auth |
| **AI — Primary** | Groq + LLaMA-3.3-70b-versatile | Fast inference, primary diagnostics |
| **AI — Fallback** | Google Gemini 1.5 Flash | Redundancy, admin assistant, Medi chatbot |
| **Auth** | jose (JWT), bcryptjs | HttpOnly cookies, edge verification |
| **PDF** | jsPDF (client-side) | Health Passport generation |
| **Maps** | Leaflet + OpenStreetMap + react-leaflet-cluster | Hospital visualization with clustering |
| **SMS** | Fast2SMS | Emergency SOS alerts |
| **Geocoding** | OpenCage API | GPS → address conversion |
| **Evidence** | PubMed / NCBI E-Utilities | Clinical citation retrieval |
| **Rate Limiting** | Upstash Redis | IP-based throttle on AI endpoints |
| **Notifications** | Sonner | Toast notifications |
| **Forms** | React Hook Form + Zod | Input validation |

---

## 🛡️ Security Model

Medicare AI implements **Zero-Trust by Default**:

| Control | Implementation |
|---|---|
| **Auth Tokens** | HttpOnly, Secure, SameSite=Strict cookies — no JS access |
| **JWT Validation** | Verified at Edge Middleware before any protected route is served |
| **Fail-Secure Boot** | App refuses to start if `JWT_SECRET` < 64 characters |
| **Rate Limiting** | Upstash Redis IP-based throttle on AI endpoints |
| **Password Storage** | bcryptjs with cost factor 12 |
| **Account Lockout** | Brute-force protection after N failed attempts |
| **Input Validation** | Zod schemas on all API inputs |
| **Audit Trail** | Admin actions logged with actor, action, timestamp, IP |

> **Security Disclosure**: Found a vulnerability? Open a [security advisory](https://github.com/Viraj-mvp/MEDICARE-AI/security/advisories/new) — do not file a public issue.

---

## 📊 Database Schema

```
MongoDB: medicare_ai
│
├── users
│   ├── _id, email, password (bcrypt), name, role
│   ├── age, gender, phone
│   ├── bloodGroup, medications[], medicalHistory
│   ├── loginAttempts, lockUntil
│   └── createdAt, updatedAt
│
├── predictions
│   ├── userId (ref: users), symptoms[]
│   ├── diagnosis, icd11Code, confidence
│   ├── differentialDiagnoses[], homeRemedies[]
│   ├── recommendations[], redFlags[]
│   ├── specialist, specialistUrgency
│   └── timestamp
│
├── hospitals
│   ├── name, contact, specialties[]
│   ├── location: { type: "Point", coordinates: [lng, lat] }  ← 2dsphere index
│   ├── address, city, rating, type
│   └── source (seeded)
│
├── diseases
│   ├── name, icdCode, symptoms[]
│   ├── remedies[], severity, precautions[]
│   └── description
│
├── symptoms
│   ├── name, category, severity
│   └── description
│
└── emergencies
    ├── userId, coordinates, nearestHospitals[]
    ├── status, timestamp
    └── expiresAt  ← TTL index: auto-delete after 24h
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas URI)
- API keys for Groq, Gemini, Fast2SMS, OpenCage

### Installation

```bash
# Clone the repo
git clone https://github.com/Viraj-mvp/MEDICARE-AI.git
cd MEDICARE-AI

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your keys (see below)
nano .env.local

# Seed the database (900+ hospitals + disease knowledge base)
node seed-database.js

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Windows Quick Start

```bat
start.bat
```

Select **[1] First Time Setup** → **[2] Start Application**.

---

## ⚙️ Environment Variables

Create `.env.local` from the template:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/medicare_ai

# Auth — MUST be 64+ characters or app won't boot
JWT_SECRET=your_super_long_secret_at_least_64_characters_or_startup_fails_hard

# AI Models (both free tiers are sufficient)
GROQ_API_KEY=                  # https://console.groq.com
GEMINI_API_KEY=                # https://aistudio.google.com

# External APIs
FAST2SMS_API_KEY=              # https://www.fast2sms.com  (SMS alerts)
OPENCAGE_API_KEY=              # https://opencagedata.com  (geocoding)

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> All required external services have **free tiers** sufficient for full functionality.

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | — | User registration |
| `POST` | `/api/auth/login` | — | User login, returns HttpOnly cookie |
| `GET` | `/api/auth/me` | User | Get current user profile |
| `POST` | `/api/auth/logout` | User | Clear session |
| `POST` | `/api/predict` | User | AI disease prediction (3-layer engine) |
| `GET` | `/api/predictions` | User | Fetch prediction history |
| `POST` | `/api/predictions/feedback` | User | Submit prediction feedback |
| `GET` | `/api/hospitals` | — | Geo-sorted hospital list with pagination |
| `GET` | `/api/hospitals/specialties` | — | All specialties with counts |
| `POST` | `/api/emergency` | User | Trigger SOS alert |
| `GET` | `/api/emergency/:id` | User | Get emergency status |
| `POST` | `/api/emergency/:id/acknowledge` | User | Acknowledge emergency |
| `GET` | `/api/user/passport` | User | Generate Health Passport PDF payload |
| `GET` | `/api/profile` | User | Get/update user profile |
| `GET` | `/api/medical-evidence` | — | PubMed evidence for a diagnosis |
| `GET` | `/api/medlineplus` | — | MedlinePlus health topic lookup |
| `GET` | `/api/news` | — | Health news feed |
| `GET` | `/api/youtube` | — | Health education video search |
| `POST` | `/api/chat` | User | Medi AI Assistant conversation |
| `GET` | `/api/admin/stats` | Admin | Platform analytics |
| `GET` | `/api/admin/outbreak-stats` | Admin | Disease outbreak map data |
| `GET` | `/api/admin/predictions` | Admin | All predictions list |
| `GET` | `/api/admin/users` | Admin | All users list |
| `POST` | `/api/admin/hospitals` | Admin | Add hospital |
| `PUT` | `/api/admin/hospitals/:id` | Admin | Update hospital |
| `DELETE` | `/api/admin/hospitals/:id` | Admin | Delete hospital |
| `POST` | `/api/admin/diseases` | Admin | Add disease |
| `PUT` | `/api/admin/diseases/:id` | Admin | Update disease |
| `DELETE` | `/api/admin/diseases/:id` | Admin | Delete disease |
| `POST` | `/api/admin/symptoms` | Admin | Add symptom |
| `PUT` | `/api/admin/symptoms/:id` | Admin | Update symptom |
| `DELETE` | `/api/admin/symptoms/:id` | Admin | Delete symptom |
| `GET` | `/api/admin/feedback` | Admin | All user feedback |
| `GET` | `/api/admin/activity` | Admin | Audit log |
| `POST` | `/api/admin/ai/generate` | Admin | AI Admin Assistant query |
| `POST` | `/api/admin/chat` | Admin | Admin AI chat |

---

## 📁 Project Structure

```
medicare-ai/
├── app/
│   ├── page.tsx              # Home page
│   ├── predict/page.tsx      # AI diagnosis (auth required)
│   ├── hospitals/page.tsx    # Hospital finder + map
│   ├── prevention/page.tsx   # Disease prevention tips
│   ├── profile/page.tsx      # User profile + prediction history (auth required)
│   ├── about/page.tsx        # About, milestones, team
│   ├── legal/page.tsx        # Privacy, terms, support
│   ├── auth/page.tsx         # Login / Register
│   ├── developer/            # Admin console (isolated auth)
│   ├── api/                  # API route handlers
│   │   ├── auth/             # Login, signup, logout, me
│   │   ├── predict           # AI prediction endpoint
│   │   ├── predictions/      # History + feedback
│   │   ├── hospitals/        # Hospital search + specialties
│   │   ├── emergency/        # SOS alerts
│   │   ├── user/passport/    # Health Passport PDF
│   │   ├── profile/          # User profile CRUD
│   │   ├── chat/             # Medi AI Assistant
│   │   ├── medical-evidence/ # PubMed lookup
│   │   ├── medlineplus/      # MedlinePlus health topics
│   │   ├── news/             # Health news
│   │   ├── youtube/          # Health videos
│   │   └── admin/            # All admin CRUD + AI assistant
│   └── layout.tsx            # Root layout (navbar, footer, SOS button, chatbot)
├── components/
│   ├── ui/                   # Reusable primitives (buttons, cards, dialogs, etc.)
│   ├── predict/              # ECG loading, confidence arc, results, questionnaire
│   ├── emergency/            # SOS button, modal, map
│   ├── chat/                 # Medi AI Assistant
│   ├── admin/                # Hospital/Disease/Symptom management, AI assistant
│   ├── home/                 # BMI calculator, news, videos, disease map, etc.
│   ├── effects/              # GlassCard, LoadingOrbit
│   └── layout/               # ClientFooter
├── lib/
│   ├── ai/                   # 3-layer engine, prompts, providers
│   ├── prediction/           # Rule-based engine, orchestrator
│   ├── db/                   # MongoDB connection, indexes, schemas
│   ├── auth/                 # JWT helpers
│   ├── alerts/               # Fast2SMS integration
│   ├── validation/           # Zod schemas
│   ├── rate-limit.ts         # Upstash rate limiter
│   ├── geocoder.ts           # OpenCage geocoding
│   ├── medical-search.ts     # PubMed E-Utilities
│   ├── medlineplus.ts        # MedlinePlus API
│   └── utils.ts              # Tailwind merge, helpers
├── data/
│   └── symptoms.ts           # Static symptom catalog with categories
├── sample-data/
│   ├── Hospitals.json        # 900+ Gujarat hospital seed data
│   └── symptoms.json         # Symptom seed data
├── middleware.ts             # Edge JWT verification
├── seed-database.js          # DB seeder script
├── start.bat / start.sh      # Quick start scripts
└── .env.example              # Environment template
```

---

## 🗺️ Roadmap

- [ ] **v1.1** — WhatsApp SOS alerts (Twilio / Meta API)
- [ ] **v1.2** — Multilingual support (Hindi, Gujarati)
- [ ] **v1.3** — ABDM / ABHA health ID integration
- [ ] **v1.4** — Telemedicine video link generation
- [ ] **v2.0** — Mobile app (React Native)

---

## 🤝 Contributing

```bash
# Fork → clone → branch
git checkout -b feat/your-feature-name

# Make changes
npm run lint           # ESLint must pass
npx tsc --noEmit       # TypeScript must compile clean

# Commit using Conventional Commits
git commit -m "feat: add whatsapp sos channel"

# Push and open PR against main
```

**Commit convention**: `feat:` `fix:` `docs:` `refactor:` `chore:`

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a PR.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with precision by [Viraj-mvp](https://github.com/Viraj-mvp)**

*If this helped, a ⭐ goes a long way.*

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0ea5e9,50:1e3a5f,100:0f172a&height=120&section=footer" width="100%" />

</div>
