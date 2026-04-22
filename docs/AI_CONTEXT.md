# Medicare AI - AI Agent Context

## 🎯 Project Overview
**Medicare AI** is a production healthcare platform built with Next.js 16 (App Router), React 19, MongoDB, and Tailwind CSS. AI-driven disease prediction + real-time hospital routing + Emergency SOS dispatching via Fast2SMS.

---

## 🏗️ Core Architecture

### 1. Prediction Engine (`lib/prediction/orchestrator.ts`)
3-tier fallback chain:
- **Tier 1**: Groq LLaMA-3 70B (`GROQ_API_KEY`)
- **Tier 2**: Gemini 1.5 Flash (`GEMINI_API_KEY`)
- **Tier 3**: Local deterministic `rule-based.ts`

### 2. Emergency SOS (`app/api/emergency/route.ts`)
Flow: User presses SOS → Geolocation → OpenCage address → Haversine finds 3 nearest hospitals → MongoDB saves incident → **Fast2SMS fires to patient + hospitals**.

No email / Nodemailer. SMS is the sole alerting channel.

### 3. Free Clinical APIs (no keys needed)
| API | File | Purpose |
|---|---|---|
| PubMed NCBI | `lib/medical-search.ts` | Clinical citations on prediction results |
| MedlinePlus | `lib/medlineplus.ts` | Specialty summaries on hospital filter |
| disease.sh | `app/api/admin/outbreak-stats` | India live outbreak stats on admin panel |
| YouTube v3 | `app/api/youtube/route.ts` | Embedded remedy videos in predictions |

---

## 🔒 Mandatory Rules for AI Agents

1. **No localStorage for auth.** All user state derived from `HttpOnly` cookie JWT, verified against MongoDB.
2. **Add `export const dynamic = 'force-dynamic'`** to every GET route returning user-specific data.
3. **Wrap all external API calls in try/catch.** Return empty arrays or rule-based fallbacks — never crash.
4. **Phone numbers for Fast2SMS** must be strictly 10 digits (strip `+91` prefix before sending).
5. **No Nodemailer.** Its lib was removed. Fast2SMS is the only notification transport.

---

## 📁 Key Files

```
lib/
  ai/providers.ts         ← Groq + Gemini with fallover
  alerts/sms-india.ts     ← Fast2SMS dispatch
  geocoder.ts             ← OpenCage reverse geocode
  auth/jwt.ts             ← Jose JWT sign/verify
  prediction/
    orchestrator.ts       ← Primary routing logic
    rule-based.ts         ← Offline fallback engine
app/api/
  emergency/route.ts      ← SOS handler
  predictions/route.ts    ← Prediction endpoint
  youtube/route.ts        ← YouTube embed proxy
  medical-evidence/       ← PubMed proxy
  medlineplus/            ← MedlinePlus proxy
  admin/outbreak-stats/   ← disease.sh proxy
docs/
  ARCHITECTURE.md         ← Mermaid diagrams + directory map
AI_CONTEXT.md             ← This file (AI onboarding)
```

---

## 🚀 Future Scope
- Phase 3: WebRTC Telemedicine
- Phase 4: RxNorm medication checker (no key)
- Phase 5: Offline PWA + service worker caching
