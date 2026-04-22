# MEDICARE-AI

 ## 📌 Table of Contents 
  
 - [Overview](#-overview) 
 - [Architecture](#️-architecture) 
 - [Features](#-features) 
 - [Tech Stack](#-tech-stack) 
 - [Security Model](#-security-model) 
 - [Database Schema](#-database-schema) 
 - [Getting Started](#-getting-started) 
 - [Environment Variables](#️-environment-variables) 
 - [API Reference](#-api-reference) 
 - [Project Structure](#-project-structure) 
 - [Roadmap](#-roadmap) 
 - [Contributing](#-contributing) 
 - [License](#-license) 
  
 --- 
  
 ## 🧠 Overview 
  
 **Medicare AI** is a production-grade healthcare platform that bridges AI-driven diagnostics with real-world clinical workflows. Built for the Indian healthcare context — with 900+ Gujarat hospitals, SMS alerts, and Hindi-compatible interfaces — it provides a seamless, secure, and visually immersive experience for managing health, locating emergency care, and generating doctor-ready health records. 
  
 ### Why Medicare AI? 
  
 | Problem | Our Solution | 
 |---|---| 
 | AI diagnostic tools fail when APIs go down | 3-layer fallback: Groq → Gemini → Rule Engine | 
 | Medical records are fragmented and unportable | Digital Health Passport PDF with QR code | 
 | Emergency response is slow | One-tap SOS → nearest 3 hospitals in seconds | 
 | Hospital discovery is manual | Real-time geo-proximity search across 900+ hospitals | 
  
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
 │   Next.js API Routes │              │     Static / Public Routes  │ 
 │   (Server Actions)   │              │     (SSG / ISR pages)       │ 
 └──────────┬──────────┘              └─────────────────────────────┘ 
            │ 
 ┌──────────▼────────────────────────────────────────────────────────┐ 
 │                     AI DIAGNOSTIC ENGINE                          │ 
 │                                                                   │ 
 │  ┌─────────────┐   fail   ┌───────────────┐   fail   ┌─────────┐│ 
 │  │ Layer 1     │ ──────►  │ Layer 2       │ ──────►  │Layer 3  ││ 
 │  │ Groq/LLaMA3 │          │ Gemini 1.5    │          │Rule Eng.││ 
 │  │ (primary)   │          │ (validation)  │          │(offline)││ 
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
  
 ## ✨ Features 
  
 ### 🤖 AI Diagnostic Engine 
  
 - **3-Layer Fallback Architecture** — Groq LLaMA-3 → Gemini 1.5 Flash → Deterministic Rule Engine 
 - **Confidence Scoring** — Animated SVG arc gauge with probability-weighted differential diagnoses 
 - **PubMed Integration** — Live clinical evidence pulled from NCBI E-Utilities per diagnosis 
 - **ECG Animated UI** — Real-time waveform animation during analysis with dynamic status messages 
 - **ICD-11 / DSM-5 Grounding** — Diagnoses mapped to standard medical classification codes 
  
 ### 🏥 Smart Hospital Finder 
  
 - **Geo-Proximity Search** — 900+ Gujarat hospitals sorted by GPS distance in real time 
 - **Specialty Filtering** — Multi-select filters populated live from the database 
 - **Leaflet Maps** — Interactive markers with one-click Google Maps directions 
 - **OpenCage Geocoding** — Converts raw GPS coordinates to human-readable addresses 
  
 ### 📄 Digital Health Passport 
  
 - **PDF Export** — Client-side generation via jsPDF, no server roundtrip 
 - **QR Code Embedded** — Links to patient's digital record for instant doctor access 
 - **10-Prediction History** — Rolling window of most recent diagnostic sessions 
 - **Patient Profile** — Blood group, current medications, and medical history fields 
  
 ### 🚨 Emergency SOS System 
  
 - **3-Second Countdown UI** — Apple-style hold-to-confirm interaction pattern 
 - **Automated SMS Alerts** — Fast2SMS delivers nearest 3 hospitals to patient's registered number 
 - **TTL-Indexed Logging** — MongoDB auto-expires SOS records after 24 hours 
 - **Floating Pulsing Button** — Accessible from every page, always visible 
  
 ### 🔐 Admin Console 
  
 - **Isolated Sessions** — Admin and user JWTs are scoped separately; one cannot impersonate the other 
 - **AI Admin Assistant** — Gemini-backed chat interface for database management 
 - **Full Medical CRUD** — Hospitals, Diseases, and Symptoms management 
 - **Audit Logging** — All admin actions logged with timestamp and IP 
  
 --- 
  
 ## 🛠️ Tech Stack 
  
 | Layer | Technology | Purpose | 
 |---|---|---| 
 | **Framework** | Next.js 15 (App Router, Turbopack) | SSR, SSG, API routes, edge middleware | 
 | **UI** | React 19, Tailwind CSS, Framer Motion | Components, styling, animations | 
 | **Database** | MongoDB (Native Driver) | Geospatial queries, TTL indexes, auth | 
 | **AI — Primary** | Groq + LLaMA-3.3-70b-versatile | Fast inference, primary diagnostics | 
 | **AI — Fallback** | Google Gemini 1.5 Flash | Redundancy, admin assistant | 
 | **PDF** | jsPDF (client-side) | Health Passport generation | 
 | **Maps** | Leaflet + OpenStreetMap | Hospital visualization | 
 | **SMS** | Fast2SMS | Emergency alerts | 
 | **Geocoding** | OpenCage API | GPS → address conversion | 
 | **Evidence** | PubMed / NCBI E-Utilities | Clinical citation retrieval | 
  
 --- 
  
 ## 🛡️ Security Model 
  
 Medicare AI implements **Zero-Trust by Default**: 
  
 | Control | Implementation | 
 |---|---| 
 | **Auth Tokens** | HttpOnly, Secure, SameSite=Strict cookies — no JS access | 
 | **JWT Validation** | Verified at Edge Middleware before any route is served | 
 | **Fail-Secure Boot** | App refuses to start if `JWT_SECRET` < 64 characters | 
 | **Rate Limiting** | IP-based throttle: 10 req/min on AI endpoints | 
 | **Password Storage** | bcrypt with cost factor 12 | 
 | **Account Lockout** | Brute-force protection after N failed attempts | 
 | **CSP Headers** | Strict Content Security Policy blocks unauthorized scripts | 
 | **Audit Trail** | Admin actions logged with actor, action, timestamp, IP | 
  
 > **Security Disclosure**: Found a vulnerability? Open a [security advisory](https://github.com/Viraj-mvp/MEDICARE-AI/security/advisories/new)  — do not file a public issue. 
  
 --- 
  
 ## 📊 Database Schema 
  
 ``` 
 MongoDB: medicare_ai 
 │ 
 ├── users 
 │   ├── _id, email, password (bcrypt), role 
 │   ├── bloodGroup, medications[], medicalHistory 
 │   ├── loginAttempts, lockUntil 
 │   └── createdAt, updatedAt 
 │ 
 ├── predictions 
 │   ├── userId (ref: users), symptoms[] 
 │   ├── diagnosis, icdCode, confidence 
 │   ├── differentials[], remedies[] 
 │   └── timestamp 
 │ 
 ├── hospitals 
 │   ├── name, contact, specialties[] 
 │   ├── location: { type: "Point", coordinates: [lng, lat] }  ← 2dsphere index 
 │   └── address, rating 
 │ 
 ├── diseases 
 │   ├── name, icdCode, symptoms[] 
 │   ├── remedies[], severity 
 │   └── description 
 │ 
 └── emergencies 
     ├── userId, coordinates, nearestHospitals[] 
     ├── status, timestamp 
     └── expiresAt  ← TTL index: auto-delete after 24h 
 ``` 
  
 --- 
  
 ## � Getting Started 
  
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
 npm install --legacy-peer-deps 
  
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
 | `POST` | `/api/auth/login` | — | User login, returns HttpOnly cookie | 
 | `POST` | `/api/auth/register` | — | User registration | 
 | `POST` | `/api/auth/logout` | User | Clear session | 
 | `POST` | `/api/predict` | User | AI disease prediction | 
 | `GET` | `/api/predictions` | User | Fetch prediction history | 
 | `GET` | `/api/hospitals` | — | Geo-sorted hospital list | 
 | `POST` | `/api/sos` | User | Trigger emergency alert | 
 | `GET` | `/api/health-passport` | User | Generate PDF payload | 
 | `GET` | `/api/admin/stats` | Admin | Platform analytics | 
 | `POST` | `/api/admin/hospitals` | Admin | Add hospital | 
 | `PUT` | `/api/admin/diseases/:id` | Admin | Update disease record | 
  
 --- 
  
 ## 📁 Project Structure 
  
 ``` 
 medicare-ai/ 
 ├── app/ 
 │   ├── (auth)/              # Login, Register pages 
 │   ├── (dashboard)/         # Protected user routes 
 │   │   ├── predict/         # AI diagnosis interface 
 │   │   ├── hospitals/       # Hospital finder + map 
 │   │   ├── passport/        # Health Passport PDF 
 │   │   └── sos/             # Emergency interface 
 │   ├── admin/               # Admin console (isolated auth) 
 │   ├── api/                 # API route handlers 
 │   └── layout.tsx           # Root layout 
 ├── components/ 
 │   ├── ui/                  # Reusable primitives 
 │   ├── predict/             # ECG, confidence gauge, tabs 
 │   ├── hospital/            # Map, filter, cards 
 │   └── sos/                 # SOS button, countdown 
 ├── lib/ 
 │   ├── ai/                  # 3-layer AI engine 
 │   ├── db/                  # MongoDB connection + queries 
 │   ├── auth/                # JWT helpers, middleware 
 │   └── pdf/                 # Health Passport generator 
 ├── middleware.ts             # Edge JWT verification 
 ├── seed-database.js          # DB seeder (900+ hospitals) 
 └── .env.example 
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
