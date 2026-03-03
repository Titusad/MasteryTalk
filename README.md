# inFluentia PRO

AI-powered executive English communication coaching for LATAM nearshoring professionals.

**Status:** Fase 0 complete — fully functional React prototype with mock data.  
**Stack:** React 18 + Tailwind CSS v4 + Vite 6  
**Architecture:** Service Layer (Adapter Pattern) — 7 interfaces, 7 mock adapters, progressive Supabase rollout.

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Run development server
pnpm dev

# 3. Open in browser
# http://localhost:5173
```

The app runs immediately with `USE_MOCK = true` — no backend, no API keys, no `.env` needed.

---

## User Journey

The user **never** sees an empty dashboard:

```
Landing (define scenario) → Auth Modal → Onboarding (Industry/Role/Seniority)
  → Practice Setup → Loading Screen → Practice Session (9 sub-steps)
  → Dashboard (populated with real data) → History / New Practice
```

### Key Navigation (hash-based routing)

| Route | Page |
|-------|------|
| `/` | Landing page |
| `/#onboarding` | Onboarding (3-step card) |
| `/#practice-setup` | Configure practice scenario |
| `/#practice-session` | Arena session (Support → Guidance → Challenge) |
| `/#dashboard` | Post-practice dashboard |
| `/#practice-history` | Session history list |
| `/#design-system` | Design system reference |

---

## Project Structure

```
/
├── docs/                          # Product & technical documentation
│   ├── MASTER_BLUEPRINT.md        # Full architecture spec (the bible)
│   ├── WORKPLAN_v2.md             # Implementation roadmap (Fases 0-4)
│   ├── PDR_SCREEN_BY_SCREEN.md    # Screen-by-screen spec (15 screens)
│   ├── QA_ACCEPTANCE_CRITERIA.md  # 193 QA tests
│   ├── SYSTEM_PROMPTS.md          # AI prompt engineering templates
│   ├── FASE1_MIGRATION.sql        # Database schema (run in Supabase SQL Editor)
│   ├── FASE1_ONBOARDING_SUPPLEMENT.md
│   ├── BACKEND_HANDOFF.md         # Backend developer orientation
│   └── DEVELOPER_HANDOFF_CHECKLIST.md  # Credentials & access checklist
│
├── src/
│   ├── app/
│   │   ├── App.tsx                # Entry point — hash routing + auth listener
│   │   ├── components/            # 15 screens + shared components
│   │   │   ├── arena/             # Arena system (3-phase scaffolding)
│   │   │   ├── shared/            # ServiceErrorBanner, etc.
│   │   │   └── ui/               # shadcn-style primitives (not used in main pages)
│   │   └── hooks/
│   │       └── useServiceCall.ts  # Retry + exponential backoff + error recovery
│   │
│   ├── services/                  # *** SERVICE LAYER ***
│   │   ├── index.ts               # Registry — USE_MOCK switch + factory functions
│   │   ├── types.ts               # Shared types (User, Session, SR, etc.)
│   │   ├── errors.ts              # Error protocol (5 domains, 33 codes)
│   │   ├── supabase.ts            # Supabase client singleton + Row types
│   │   ├── interfaces/            # 7 service contracts
│   │   │   ├── auth.ts
│   │   │   ├── conversation.ts
│   │   │   ├── feedback.ts
│   │   │   ├── speech.ts
│   │   │   ├── user.ts
│   │   │   ├── payment.ts
│   │   │   └── spaced-repetition.ts
│   │   ├── adapters/
│   │   │   ├── mock/              # 7 mock adapters + test data
│   │   │   └── supabase/          # Real adapters (only auth exists today)
│   │   └── prompts/               # AI prompt templates, personas, voice map
│   │
│   ├── imports/                   # Figma-imported frames (visual reference)
│   └── styles/                    # Tailwind v4, theme tokens, fonts
│
├── supabase/functions/server/     # Edge Function scaffold (Hono server)
│   ├── index.tsx                  # Health, auth status, signup endpoints
│   └── kv_store.tsx               # KV table utility (auto-generated)
│
├── package.json
└── vite.config.ts
```

---

## Service Layer Architecture

The frontend **never** talks directly to Supabase. Everything goes through 7 singleton services:

```
UI Component → authService.signIn("google") → Mock or Supabase?
                                                    ↓
                                          Interface: IAuthService
                                           /              \
                                  MockAuthService    SupabaseAuthService
                                  (fake data)        (real Supabase)
```

### Adapter switching

In `/src/services/index.ts`:

```typescript
const USE_MOCK = true;  // Master switch — forces all services to mock

// Per-service mode (only when USE_MOCK = false):
const ADAPTER_MODE = {
  auth:             "supabase",   // Fase 1
  conversation:     "mock",       // Fase 2
  feedback:         "mock",       // Fase 3
  speech:           "mock",       // Fase 3
  user:             "mock",       // Fase 4
  payment:          "mock",       // Fase 4
  spacedRepetition: "mock",       // Fase 4
};
```

To connect a real service:
1. Create `adapters/supabase/{service}.supabase.ts` implementing the interface
2. Import it in `index.ts` and add to the factory
3. Flip `ADAPTER_MODE.{service}` to `"supabase"`
4. Set `USE_MOCK = false`

---

## Design System

Two distinct color contexts:

| Context | Primary Color | Used In |
|---------|--------------|---------|
| Landing / Marketing | `#2d2d2d` | Landing page, auth modal |
| Internal / Session | `#0f172b` | Dashboard, practice, history |

View the full design system at `/#design-system`.

---

## Key Flags

| Flag | File | Purpose |
|------|------|---------|
| `USE_MOCK` | `/src/services/index.ts` | `true` = all mock data, `false` = per-service switching |
| `RESET_PROTOTYPE` | `/src/app/App.tsx` | `true` = clears localStorage + resets to landing |
| `?simulate_errors=true` | URL param | Enables random service errors for testing error handling |

---

## Environment Variables

**Not needed for the prototype** (`USE_MOCK = true`). Required when connecting real services:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Service Layer mode
VITE_USE_MOCK=false

# API keys (set in Supabase Edge Function secrets, NOT in frontend)
# OPENAI_API_KEY=sk-...
# ELEVENLABS_API_KEY=...
# AZURE_SPEECH_KEY=...
# AZURE_SPEECH_REGION=...
# MERCADOPAGO_ACCESS_TOKEN=...
```

See `docs/DEVELOPER_HANDOFF_CHECKLIST.md` for the full credentials list.

---

## Documentation

| Document | What It Covers |
|----------|---------------|
| [WORKPLAN_v2.md](docs/WORKPLAN_v2.md) | Roadmap: Fases 0-4 with deliverables and timelines |
| [MASTER_BLUEPRINT.md](docs/MASTER_BLUEPRINT.md) | Complete product architecture |
| [PDR_SCREEN_BY_SCREEN.md](docs/PDR_SCREEN_BY_SCREEN.md) | Detailed spec for all 15 screens |
| [QA_ACCEPTANCE_CRITERIA.md](docs/QA_ACCEPTANCE_CRITERIA.md) | 193 test cases |
| [SYSTEM_PROMPTS.md](docs/SYSTEM_PROMPTS.md) | AI prompt engineering (personas, templates) |
| [BACKEND_HANDOFF.md](docs/BACKEND_HANDOFF.md) | Backend developer getting-started guide |
| [DEVELOPER_HANDOFF_CHECKLIST.md](docs/DEVELOPER_HANDOFF_CHECKLIST.md) | Credentials, access, and setup checklist |
| [FASE1_MIGRATION.sql](docs/FASE1_MIGRATION.sql) | Database schema for Supabase |

---

## Backend Developer: Start Here

1. Read `docs/BACKEND_HANDOFF.md` first
2. Check `docs/DEVELOPER_HANDOFF_CHECKLIST.md` for required credentials
3. Run `docs/FASE1_MIGRATION.sql` in Supabase SQL Editor
4. Start with `src/services/adapters/supabase/auth.supabase.ts` (already exists)
5. Follow the Fase-by-Fase plan in `docs/WORKPLAN_v2.md`

---

## License

Proprietary. All rights reserved.
