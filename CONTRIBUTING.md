# 🤝 Contributing to Medicare AI

Thank you for your interest in contributing! This guide will help you get started.

---

## 📜 Code of Conduct

- Be respectful and constructive in all interactions.
- Focus on what is best for the community.
- Report unacceptable behavior to the maintainers.

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas URI)
- API keys for Groq, Gemini, Fast2SMS, OpenCage (free tiers suffice)

### Quick Start

```bash
# Fork & clone the repo
git clone https://github.com/<your-username>/MEDICARE-AI.git
cd MEDICARE-AI

# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env.local

# Fill in your .env.local with API keys
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

## 🔀 Workflow

1. **Fork** the repository.
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes** — keep commits atomic and focused.
4. **Test locally** — ensure linting and TypeScript compile clean:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
5. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add whatsapp sos channel"
   ```
6. **Push** and open a Pull Request against `main`.

---

## 📝 Commit Convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Usage |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code restructuring (no behavior change) |
| `style:` | Formatting, whitespace (no logic change) |
| `test:` | Adding or updating tests |
| `chore:` | Build, tooling, or dependency changes |

**Examples:**
```bash
git commit -m "feat: add multilingual support for Hindi"
git commit -m "fix: correct geo-proximity sort order"
git commit -m "docs: update API reference for SOS endpoint"
```

---

## 🏗️ Pull Request Guidelines

- **Title**: Use conventional commit format (e.g., `feat: add WhatsApp SOS alerts`).
- **Description**: Clearly explain what the PR does and why. Reference any related issues.
- **Scope**: One feature/fix per PR. Keep it focused.
- **Lint & Type Check**: Must pass `npm run lint` and `npx tsc --noEmit`.
- **No `package-lock.json` changes** unless intentionally updating a dependency.
- **No secrets or `.env` files** — never commit credentials.

### PR Template

```markdown
## What does this PR do?
<!-- Brief description -->

## Type of Change
- [ ] feat (new feature)
- [ ] fix (bug fix)
- [ ] docs (documentation)
- [ ] refactor (code restructuring)
- [ ] test (tests)
- [ ] chore (tooling/build)

## How to Test
<!-- Steps to verify the change -->

## Checklist
- [ ] Lint passes (`npm run lint`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] No secrets or .env files committed
- [ ] Conventional commit message used
```

---

## 📁 Project Structure Reference

```
medicare-ai/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/             # Login, Register pages
│   ├── (dashboard)/        # Protected user routes
│   ├── admin/              # Admin console (isolated auth)
│   └── api/                # API route handlers
├── components/             # React components
│   ├── ui/                 # Reusable primitives
│   ├── predict/            # ECG, confidence gauge, tabs
│   ├── hospital/           # Map, filter, cards
│   └── sos/                # SOS button, countdown
├── lib/                    # Core logic
│   ├── ai/                 # 3-layer AI engine
│   ├── db/                 # MongoDB connection + queries
│   ├── auth/               # JWT helpers, middleware
│   └── pdf/                # Health Passport generator
├── middleware.ts           # Edge JWT verification
├── seed-database.js        # DB seeder (900+ hospitals)
└── .env.example            # Environment template
```

---

## 🛡️ Security

**Do not** report security vulnerabilities in public issues.

If you discover a vulnerability, please open a [security advisory](https://github.com/Viraj-mvp/MEDICARE-AI/security/advisories/new) instead.

---

## 💡 Areas to Contribute

- **Features** from the [Roadmap](https://github.com/Viraj-mvp/MEDICARE-AI#-roadmap)
- **Bug fixes** — check [open issues](https://github.com/Viraj-mvp/MEDICARE-AI/issues)
- **Documentation** — improve README, API docs, or code comments
- **Accessibility** — enhance UI for screen readers, keyboard navigation
- **Performance** — optimize bundle size, API response times
- **Tests** — add unit/integration test coverage

---

## ❓ Questions?

Open a [discussion](https://github.com/Viraj-mvp/MEDICARE-AI/discussions) or an issue with the `question` label.

---

<div align="center">

**Thank you for helping make Medicare AI better! 🙏**

</div>
