# 🏥 MEDICARE-AI — Full Codebase Audit Report

> **Audited on:** 2026-03-15 | **Version:** 2.1.0 | **Auditor:** Antigravity (Senior Codebase Analyst)

---

## 1. Project Architecture Overview

| Layer | Technology | Status |
|---|---|---|
| Framework | Next.js 16 (App Router) | ✅ Modern |
| Language | TypeScript 5 | ✅ |
| Database | MongoDB 6 (native driver) | ✅ |
| Auth | JWT (jose + jsonwebtoken) | ⚠️ Dual library |
| AI Engine | OpenRouter → OpenAI → DeepSeek (failover) | ✅ |
| Styling | Tailwind CSS 3 + Framer Motion | ✅ |
| Maps | Leaflet + react-leaflet-cluster | ✅ |
| 3D | Three.js + @react-three/fiber | ⚠️ Heavy |
| Rate Limiting | Upstash Redis | ✅ |
| Email | Nodemailer | ✅ |
| PDF | jsPDF | ✅ |

The app is a full-stack Next.js 16 project using the App Router. It has a clean three-tier architecture:
- **Frontend**: React Server Components + Client Components with Tailwind + Framer Motion animations
- **Backend**: Next.js API Routes acting as a REST API
- **Data**: MongoDB Atlas with collection-based modeling for users, predictions, hospitals, and activity logs

---

## 2. Folder Structure Analysis

```
MEDICARE-AI/
├── app/                        ← Next.js pages + API routes
│   ├── api/
│   │   ├── admin/              (activity, diseases, emergencies, feedback, hospitals, predictions, stats, users)
│   │   ├── auth/               (login, logout, me, signup)
│   │   ├── emergency/
│   │   ├── hospitals/          (+ specialties sub-route)
│   │   ├── news/
│   │   ├── predictions/
│   │   ├── profile/
│   │   └── stats/
│   ├── about/ | auth/ | developer/ | hospitals/ | predict/ | prevention/ | profile/
│   └── layout.tsx, page.tsx, globals.css, error.tsx, global-error.tsx
│
├── components/
│   ├── effects/                (GlassCard, LoadingOrbit)
│   ├── emergency/              (EmergencyButton, EmergencyModal)
│   ├── home/                   (9 components)
│   ├── layout/                 (ClientFooter)
│   ├── predict/                (4 components)
│   └── ui/                     (34 components) ← oversized
│
├── lib/
│   ├── ai/                     (providers.ts ✅, openai.ts ❌ dead, deepseek.ts ❌ dead, prompts.ts)
│   ├── auth/                   (jwt.ts)
│   ├── db/                     (mongodb.ts, schemas.ts)
│   ├── email/                  (emergency-mailer.ts)
│   ├── prediction/             (orchestrator.ts, rule-based.ts)
│   ├── validation/             (schemas.ts)
│   ├── activity-logger.ts
│   ├── rate-limit.ts
│   └── utils.ts
│
├── public/
│   ├── photo/                  (37 files — several 8–10 MB) ← CRITICAL
│   └── auth/
│
├── scripts/                    (4 dev/utility scripts)
│
└── ROOT LEVEL SCRIPTS (8 loose JS files)  ← should be in /scripts
```

---

## 3. File Connectivity Report

### ✅ Well-Connected Pipeline

```
app/predict/page.tsx
  → POST /api/predictions
    → lib/prediction/orchestrator.ts
      → lib/ai/providers.ts          (AI path)
      → lib/prediction/rule-based.ts (fallback)
    → lib/db/mongodb.ts
    → lib/auth/jwt.ts
    → lib/activity-logger.ts
    → lib/rate-limit.ts (Upstash Redis)
```

```
app/hospitals/page.tsx
  → GET /api/hospitals
    → lib/db/mongodb.ts
    → lib/validation/schemas.ts
```

```
app/auth/page.tsx
  → POST /api/auth/login → lib/auth/jwt.ts → cookie: token
middleware.ts
  → verifies cookie with jose (jwtVerify)
app/api/* routes
  → verify cookie with jsonwebtoken (verifyToken in lib/auth/jwt.ts)
```

### ⚠️ Issues Found

| # | File | Issue |
|---|---|---|
| 1 | [lib/ai/openai.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/openai.ts) | **Never imported** by any file. Dead code. |
| 2 | [lib/ai/deepseek.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/deepseek.ts) | **Never imported** by any file. Dead code. |
| 3 | [lib/ai/openai.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/openai.ts) | **Hardcoded OpenAI API key** in source (line 5) — CRITICAL SECURITY BREACH |
| 4 | [lib/ai/openai.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/openai.ts) | Top-level floating promise `openai.responses.create(...)` — throws on import |
| 5 | [middleware.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/middleware.ts) | Uses `jose` for JWT verification |
| 6 | [lib/auth/jwt.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/auth/jwt.ts) | Uses `jsonwebtoken` for JWT verification |
| 7 | Both | Two different JWT libraries for the same token — inconsistent, doubles bundle size |
| 8 | [app/layout.tsx](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/app/layout.tsx) | `ScrollNavigation` component commented out (line 4) — dead import |
| 9 | [components/ui/select-1.tsx](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/components/ui/select-1.tsx) | Appears to be a duplicate/variant of [select.tsx](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/components/ui/select.tsx) — likely unused |

---

## 4. Unused / Duplicate Files

### ❌ Dead Code — Safe to Delete

| File | Reason |
|---|---|
| [lib/ai/openai.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/openai.ts) | Never imported. Superseded by [providers.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/providers.ts). Contains a **HARDCODED API KEY**. |
| [lib/ai/deepseek.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/deepseek.ts) | Never imported. Raw `fetch()` approach superseded by [providers.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/providers.ts) SDK integration. |
| [components/ui/select-1.tsx](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/components/ui/select-1.tsx) | Likely a renamed draft of [select.tsx](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/components/ui/select.tsx), review for usage before deleting. |

### 🗑️ Root-Level Dev/Utility Scripts (should be in `scripts/` or deleted after use)

| File | Purpose | Status |
|---|---|---|
| [check-db.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/check-db.js) | DB connectivity check | Dev-only, move to `scripts/` |
| [create-admin.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/create-admin.js) | One-time admin creation | Dev-only, move to `scripts/` |
| [geocode_debug.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/geocode_debug.js) | Geocoding debug helper | Dev-only, move to `scripts/` |
| [geocode_hospitals_root.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/geocode_hospitals_root.js) | Root-level duplicate of [scripts/geocode-hospitals.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/scripts/geocode-hospitals.js) | **Duplicate — Delete** |
| [insert-gandhinagar.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/insert-gandhinagar.js) | One-time DB seed (34KB!) | Already run, safe to delete |
| [seed-database.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/seed-database.js) | One-time DB seed (20KB!) | Already run, safe to delete |
| [test-connection.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/test-connection.js) | DB connection test | Dev-only, move to `scripts/` |
| [test-fuzzy.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/test-fuzzy.js) | Search test | Dev-only, move to `scripts/` |
| [test-hospitals.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/test-hospitals.js) | Hospital query test | Dev-only, move to `scripts/` |
| [test-search.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/test-search.js) | Search test | Dev-only, move to `scripts/` |

### 📄 Redundant Documentation Files at Root

| File | Note |
|---|---|
| [architecture_analysis.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/architecture_analysis.md) | Overlap with [ARCHITECTURE.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/ARCHITECTURE.md) — consolidate |
| [backend_audit.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/backend_audit.md) | Old audit, superseded by this report |
| [frontend_audit.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/frontend_audit.md) | Old audit, superseded by this report |
| [project_analysis.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/project_analysis.md) | Old analysis — consolidate into README |
| [PROJECT_STRUCTURE.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/PROJECT_STRUCTURE.md) | Outdated, can be regenerated — remove or update |
| [THREE_JS_FIXED.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/THREE_JS_FIXED.md) | One-time fix note — delete |
| `Medical AI Prediction Engine Integration.md` | Dev note — delete after reviewing |
| [Startup.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/Startup.md) | Very short (82 bytes), merge into README |

---

## 5. Performance Issues

> [!CAUTION]
> These issues are likely the primary cause of slow page loads.

### 🔴 CRITICAL — Unoptimized Background Images

**Location:** `public/photo/`

| File | Size | Problem |
|---|---|---|
| [SA.png](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/public/photo/SA.png) | **10.4 MB** | Background image, served raw |
| [HS.png](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/public/photo/HS.png) | **8.9 MB** | Background image |
| [HS1.png](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/public/photo/HS1.png) | **8.5 MB** | Background image used on home page |
| [OM.png](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/public/photo/OM.png) | **8.7 MB** | Background image |
| [bg.png](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/public/photo/bg.png) | **8.6 MB** | Background image |
| [bg01.png](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/public/photo/bg01.png) | **8.4 MB** | Background image |
| [bg-image.png](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/public/photo/bg-image.png) | **7.7 MB** | Background image |
| [LHN.png](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/public/photo/LHN.png) | **8.3 MB** | Background image |
| [login1.gif](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/public/photo/login1.gif) | **3.2 MB** | GIF in login flow |
| [login.png](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/public/photo/login.png) | **1.8 MB** | Login image |
| **Total** | **~75 MB** | Background images alone |

**Impact:** Every user downloading these images experiences 10–20+ second load times on even a fast connection. These should be converted to WebP (70–80% smaller) and served via Next.js `<Image />` with lazy loading.

### 🔴 CRITICAL — In-Memory Full Collection Sort (Hospitals API)

```typescript
// app/api/hospitals/route.ts — line 106
let hospitals = await hospitalsCollection.find(query).toArray(); // fetches ALL ~1008 hospitals into RAM
hospitals = hospitals.sort(...)  // sorts in Node.js memory
```

**Problem:** With 1008+ hospital documents, the API fetches the **entire collection into memory on every request**, then sorts in JavaScript. As the DB grows, this will become a bottleneck.
**Fix:** Use MongoDB's `$geoNear` aggregation stage with a geospatial index for location-based queries, and MongoDB `sort()` + `skip()` + `limit()` for non-geo queries.

### 🟡 MEDIUM — Dual JWT Library Bundle Cost

Both `jose` (used in middleware) and `jsonwebtoken` (used in API routes) are bundled. These serve the same purpose. `jose` is the Edge-compatible option that works in both the middleware and Node.js runtime — `jsonwebtoken` can be removed.

### 🟡 MEDIUM — Three.js + @react-three/fiber in Dependencies

`three` and `@react-three/fiber` are listed as full production dependencies. If only one or two pages use them, they should be **dynamically imported** with `dynamic(() => import(...), { ssr: false })` to prevent them from being included in the initial bundle.

### 🟡 MEDIUM — No MongoDB Indexing Defined in Code

The code accesses collections with complex queries but there's no index creation logic visible in the codebase. Collections like `hospitals` (text search on `name`, `city`, `nameSearch`; geo-queries on `coordinates`) need compound indexes for fast lookups.

### 🟡 MEDIUM — `console.log` Debug Statements in Production

Multiple API routes have `console.log(JSON.stringify(prediction, null, 2))` in the hot path. While [next.config.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/next.config.ts) removes them in production builds (`compiler.removeConsole`), they are still noise in development and should be replaced with a structured logger.

---

## 6. Recommended Project Updates

### Priority 1 — 🚨 Security (Do Immediately)

**Remove the hardcoded API key from [lib/ai/openai.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/openai.ts)**

The file contains a real OpenAI API key directly in source code:
```typescript
// lib/ai/openai.ts — line 5
const openai = new OpenAI({
    apiKey: "sk-proj-VQevD7r...",  // ← EXPOSED KEY
});
```
**Action:** Delete this file entirely (it's dead code), then **immediately rotate/revoke this API key** in your OpenAI dashboard. If this file has ever been committed to git, the key should be treated as compromised.

### Priority 2 — 🔴 Performance (Image Optimization)

1. Convert all `public/photo/*.png` background images to **WebP** format
2. Reduce dimensions to maximum display size (most backgrounds don't need > 1920×1080)
3. Replace `<img>` tags with Next.js `<Image />` component (auto-optimization, lazy load)
4. Move [login1.gif](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/public/photo/login1.gif) to an optimized WebP animation or CSS animation

### Priority 3 — 🟡 Architecture (Clean Up Dead Code)

1. Delete [lib/ai/openai.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/openai.ts) and [lib/ai/deepseek.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/deepseek.ts) — they are 100% unused
2. Remove the 8 loose JS scripts from root into `scripts/` or delete if already done
3. Consolidate the 5+ overlapping [.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/README.md) documentation files
4. Unify JWT library: replace `jsonwebtoken` with `jose` across all API routes

### Priority 4 — 🟢 Code Quality

1. Add MongoDB geospatial index for hospitals collection
2. Add a `db/indexes.ts` init script that ensures required indexes exist on startup
3. Review [components/ui/select-1.tsx](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/components/ui/select-1.tsx) for duplication with [select.tsx](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/components/ui/select.tsx)

---

## 7. Files Safe to Delete

> [!WARNING]
> **CRITICAL FIRST**: Before deleting [lib/ai/openai.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/openai.ts), rotate the hardcoded OpenAI API key at [platform.openai.com](https://platform.openai.com/api-keys).

### Confirmed Dead Code

| File | Reason | Safe? |
|---|---|---|
| [lib/ai/openai.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/openai.ts) | Never imported; contains hardcoded key | ✅ After key rotation |
| [lib/ai/deepseek.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/deepseek.ts) | Never imported; logic superseded | ✅ |
| [insert-gandhinagar.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/insert-gandhinagar.js) (root) | One-time seeder — already executed | ✅ |
| [seed-database.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/seed-database.js) (root) | One-time seeder — already executed | ✅ |
| [geocode_hospitals_root.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/geocode_hospitals_root.js) (root) | Duplicate of [scripts/geocode-hospitals.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/scripts/geocode-hospitals.js) | ✅ |
| [THREE_JS_FIXED.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/THREE_JS_FIXED.md) | One-time fix note | ✅ |
| [Startup.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/Startup.md) | 82 byte file, content belongs in README | ✅ |
| [tsconfig.tsbuildinfo](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/tsconfig.tsbuildinfo) | Build artifact, auto-regenerated | ✅ |

### Consolidate / Clean Up

| File | Action |
|---|---|
| [architecture_analysis.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/architecture_analysis.md) | Merge useful content into [ARCHITECTURE.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/ARCHITECTURE.md), then delete |
| [backend_audit.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/backend_audit.md) + [frontend_audit.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/frontend_audit.md) + [project_analysis.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/project_analysis.md) | Replace with this report |
| [PROJECT_STRUCTURE.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/PROJECT_STRUCTURE.md) | Regenerate from final structure (currently outdated) |
| `Medical AI Prediction Engine Integration.md` | Review and delete if no longer needed |
| [check-db.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/check-db.js), `test-*.js`, [create-admin.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/create-admin.js), [geocode_debug.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/geocode_debug.js) | Move to `scripts/` |
| [components/ui/select-1.tsx](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/components/ui/select-1.tsx) | Verify if unused; delete if confirmed |

---

## 8. Optimized Folder Structure

```
MEDICARE-AI/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── activity/route.ts
│   │   │   ├── diseases/route.ts
│   │   │   ├── emergencies/route.ts
│   │   │   ├── feedback/route.ts
│   │   │   ├── hospitals/route.ts
│   │   │   ├── predictions/route.ts
│   │   │   ├── stats/route.ts
│   │   │   └── users/route.ts
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── signup/route.ts
│   │   ├── emergency/route.ts
│   │   ├── hospitals/
│   │   │   ├── route.ts
│   │   │   └── specialties/route.ts
│   │   ├── news/route.ts
│   │   ├── predictions/route.ts
│   │   ├── profile/route.ts
│   │   └── stats/route.ts
│   ├── about/page.tsx
│   ├── auth/page.tsx
│   ├── developer/page.tsx
│   ├── hospitals/page.tsx
│   ├── predict/page.tsx
│   ├── prevention/page.tsx
│   ├── profile/page.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── effects/
│   │   ├── GlassCard.tsx
│   │   └── LoadingOrbit.tsx
│   ├── emergency/
│   │   ├── EmergencyButton.tsx
│   │   └── EmergencyModal.tsx
│   ├── home/
│   │   ├── BMICalculator.tsx
│   │   ├── EmergencyContacts.tsx
│   │   ├── FeedbackSection.tsx
│   │   ├── GlobalDiseaseMap.tsx
│   │   ├── HealthEducationVideos.tsx
│   │   ├── HealthNews.tsx
│   │   ├── MedicareBentoSection.tsx
│   │   ├── MissionStats.tsx
│   │   └── SeasonalAlerts.tsx
│   ├── layout/
│   │   └── ClientFooter.tsx
│   ├── predict/
│   │   ├── DynamicQuestionnaire.tsx
│   │   ├── PredictionResults.tsx
│   │   ├── ReportActions.tsx
│   │   └── SeverityAssessment.tsx
│   └── ui/                         ← (remove select-1.tsx duplicate; keep all others)
│
├── lib/
│   ├── ai/
│   │   ├── prompts.ts              ← Keep
│   │   └── providers.ts            ← Keep (openai.ts + deepseek.ts DELETED)
│   ├── auth/
│   │   └── jwt.ts                  ← Migrate from jsonwebtoken → jose
│   ├── db/
│   │   ├── indexes.ts              ← [NEW] Ensures MongoDB indexes on startup
│   │   ├── mongodb.ts
│   │   └── schemas.ts
│   ├── email/
│   │   └── emergency-mailer.ts
│   ├── prediction/
│   │   ├── orchestrator.ts
│   │   └── rule-based.ts
│   ├── validation/
│   │   └── schemas.ts
│   ├── activity-logger.ts
│   ├── rate-limit.ts
│   └── utils.ts
│
├── public/
│   ├── logo.png
│   └── photo/                      ← All images converted to WebP, max 200KB each
│       ├── HS1.webp                 ← was 8.5 MB
│       ├── login.webp               ← was 1.8 MB
│       ├── [team photos]
│       └── [profile photos]
│
├── scripts/                        ← All dev scripts consolidated here
│   ├── check-db.js
│   ├── create-admin.js
│   ├── geocode-hospitals.js
│   ├── migrate-predictions.js
│   ├── test-connection.js
│   ├── test-fuzzy.js
│   ├── test-hospitals.js
│   ├── test-search.js
│   ├── verify_deepseek.js
│   └── verify_openai.js
│
├── docs/                           ← [NEW] Consolidate all documentation here
│   ├── ARCHITECTURE.md
│   └── AUDIT_REPORT.md
│
├── .env.local
├── .gitignore
├── middleware.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## 9. Final Codebase Optimization Summary

### 🔐 Security

| Issue | Severity | Fix |
|---|---|---|
| Hardcoded OpenAI API key in [lib/ai/openai.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/openai.ts) | 🔴 CRITICAL | Delete file, rotate key immediately |
| Dev script `console.log` statements | 🟡 Medium | Already handled by `removeConsole` in prod |
| No CSRF protection on auth routes | 🟡 Medium | Add `SameSite=Strict` cookie attribute |

### 🚀 Performance

| Issue | Estimated Gain | Fix |
|---|---|---|
| 75 MB of raw PNG background images | **80–90% reduction** | Convert to WebP, use `<Image />` |
| In-memory hospital sort (1008 docs) | **10–50x faster** | Use MongoDB `$geoNear` + server-side paging |
| Three.js imported at module level | **Reduce initial bundle** | `dynamic(() => import(...), { ssr: false })` |
| Dual JWT libraries in bundle | Minor | Remove `jsonwebtoken`, use only `jose` |

### 🧹 Cleanliness

| Action | Files Affected |
|---|---|
| Delete confirmed dead code | 2 files ([openai.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/openai.ts), [deepseek.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/deepseek.ts)) |
| Delete already-run seeder scripts | 2 files ([insert-gandhinagar.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/insert-gandhinagar.js), [seed-database.js](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/seed-database.js)) |
| Move 8 root scripts to `scripts/` | 8 files |
| Delete 6 redundant [.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/README.md) docs at root | 6 files |
| Consolidate [select-1.tsx](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/components/ui/select-1.tsx) duplicate | 1 file |
| **Total files to remove/move** | **~19 files** |

### 📐 Architecture Wins

| Area | Current | Recommended |
|---|---|---|
| AI providers | 3 files (1 used, 2 dead) | 1 file ([providers.ts](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/lib/ai/providers.ts)) |
| JWT verification | 2 libraries (`jose` + `jsonwebtoken`) | 1 library (`jose`) |
| DB indexes | None enforced in code | Add `lib/db/indexes.ts` |
| Root folder clutter | 8 loose JS scripts + 6 [.md](file:///e:/6-Project/MEDICARE-AI/MEDICARE-AI/README.md) docs | All in `scripts/` + `docs/` |
| Image assets | 75 MB raw PNG | < 10 MB WebP with compression |
