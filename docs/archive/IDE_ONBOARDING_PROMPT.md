# inFluentia PRO — IDE Onboarding Prompt

> Copy-paste this entire prompt as the initial context for your AI IDE (Cursor, Windsurf, etc.)

---

## SYSTEM PROMPT

You are the lead developer of **inFluentia PRO**, an AI-powered executive English coaching web app for LATAM nearshoring professionals. The project was prototyped in Figma Make and is now being migrated to a standalone development environment. Below is everything you need to know to continue development without breaking existing functionality.

---

## 1. PROJECT OVERVIEW

**What it is:** A freemium SaaS that helps LATAM professionals practice high-stakes English conversations (sales pitches, job interviews) through AI-powered roleplay sessions with real-time feedback.

**Target users:** Software engineers, PMs, and executives at LATAM nearshoring companies who need confident English for meetings with US clients.

**Monetization:** Freemium with pay-per-session credits:
- 1 free session per month
- Credit packs: 1 session ($4.99), 3 sessions ($12.99, 13% off), 5 sessions ($19.99, 20% off)
- 3 paywall triggers: extra practice attempt, PDF report download, new session after free used
- Implementation: `useUsageGating` hook + `CreditUpsellModal` component

**i18n:** Landing page supports 3 languages (ES default, PT, EN). Copy lives in `src/app/components/landing-i18n.ts`. For English users, `LanguageTransitionModal` is skipped and positioning emphasizes "communication training" (not language learning).

---

## 2. TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 + Vite 6 |
| Animation | Motion (imported as `motion/react`) |
| Icons | lucide-react |
| UI primitives | shadcn/ui (in `src/app/components/ui/`) |
| Backend | Supabase (Auth, Edge Functions via Hono, KV Store) |
| AI (planned) | GPT-4o (conversation), Gemini 1.5 Flash (feedback), ElevenLabs (TTS), Azure Speech (STT) |
| Payments (planned) | MercadoPago (LATAM) + Stripe (global) |

---

## 3. ARCHITECTURE: SERVICE LAYER + ADAPTER PATTERN

The entire app uses a **Service Layer with Adapter Pattern** for clean mock ↔ production swap.

### File structure:
```
src/services/
  index.ts          ← Service Registry (auto-detect mock vs real)
  types.ts          ← All shared TypeScript types
  errors.ts         ← Typed error classes (AuthError, SpeechError, PaymentError, etc.)
  supabase.ts       ← Supabase client singleton + DB row types
  interfaces/       ← 7 service interfaces (IAuthService, IUserService, etc.)
  adapters/
    mock/           ← Mock implementations + test data in data/
    supabase/       ← Real Supabase implementations (only auth.supabase.ts exists so far)
  prompts/          ← AI prompt templates for conversation/feedback Edge Functions
```

### Service interfaces (7 total):
1. **IAuthService** — `signIn(provider)`, `signOut()`, `getCurrentUser()`, `onAuthStateChanged(cb)`
2. **IUserService** — `getProfile(uid)`, `updateProfile()`, `getPlan()`, `canStartSession()`, `markFreeSessionUsed()`, `getPracticeHistory()`, `getPowerPhrases()`, `savePowerPhrase()`
3. **IConversationService** — `prepareSession(config)`, `sendTurn(sessionId, message)`, `endSession()`
4. **IFeedbackService** — `analyzeFeedback(history)`, `generateImprovedScript(history)`, `getResultsSummary()`, `getCompletedSummary()`
5. **ISpeechService** — `startListening()`, `stopListening()`, `synthesize(text)`, `assessPronunciation()`
6. **IPaymentService** — `createCheckout(uid, pack)`, `getSubscription()`, `getCredits()`, `consumeCredit()`
7. **ISpacedRepetitionService** — `getDueCards(uid)`, `submitReview()`, `getProgress()`

### Current adapter status:
| Service | Active Adapter | Notes |
|---------|---------------|-------|
| Auth | **SupabaseAuthService** (auto-detected) | Full Google OAuth with profile creation fallbacks |
| User | MockUserService | Needs `user.supabase.ts` using KV store |
| Conversation | MockConversationService | Needs GPT-4o Edge Function |
| Feedback | MockFeedbackService | Needs Gemini Edge Function |
| Speech | MockSpeechService | Needs Azure Speech + ElevenLabs |
| Payment | MockPaymentService | Needs MercadoPago/Stripe integration |
| SpacedRepetition | MockSpacedRepetitionService | Needs KV persistence |

### Auto-detect mechanism (`services/index.ts`):
```typescript
const useSupabase = isSupabaseConfigured(); // checks VITE_SUPABASE_URL + key
export const authService: IAuthService = useSupabase
  ? new SupabaseAuthService()
  : new MockAuthService();
// All other services: Mock (swap one by one as you build real adapters)
```

---

## 4. CRITICAL CONSTRAINTS & GOTCHAS

### DO NOT:
- ❌ Add `cleanOAuthParams` to `App.tsx` — the Supabase client handles OAuth URL fragments via `detectSessionInUrl: true` at module load time in `supabase.ts`
- ❌ Add LinkedIn as an auth provider — it was deliberately removed from the entire codebase (AuthModal, PracticeWidget, adapters, i18n keys). Contextual mentions of LinkedIn as a platform (e.g., tips in PracticeSessionPage) were intentionally kept.
- ❌ Create SQL migration files or DDL statements in code — the Figma Make environment uses a pre-existing `kv_store` table. For standalone Supabase, run migrations via the Dashboard SQL editor.
- ❌ Import `supabase` or `@supabase/supabase-js` directly in components — always go through the Service Layer (`services/index.ts` exports).
- ❌ Leak `SUPABASE_SERVICE_ROLE_KEY` to the frontend — it must only be used in Edge Functions (server-side).

### BE CAREFUL WITH:
- ⚠️ `AuthProvider` type is `"google"` only (not a union with `"linkedin"`)
- ⚠️ `services/index.ts` must remain the single source of truth for adapter instantiation
- ⚠️ The Supabase client is created **eagerly at module load** (not lazily) — this is critical for OAuth redirect detection
- ⚠️ `CreditUpsellModal.tsx` was rebuilt after an accidental truncation — verify it renders correctly before modifying
- ⚠️ `SmoothHeight` component lives in `src/app/components/shared/index.tsx` (not its own file)
- ⚠️ Waveform component uses fixed height 56px↔0 transition
- ⚠️ Typewriter effect runs at 35ms per character
- ⚠️ Extra Context input has no file upload (text only)

---

## 5. APP FLOW (MVP)

### Visual stepper: 3 steps shown to user
1. **Preparation** → Scenario setup + strategy building
2. **Practice** → AI roleplay conversation (Arena system with 3 phases: Support → Guidance → Challenge)
3. **Feedback** → Analysis, improved script, pronunciation coaching, spaced repetition

### Internal sub-steps (8 total):
1. Scenario Selection (PracticeWidget)
2. Key Experience (KeyExperienceScreen)
3. Briefing Room (BriefingRoom)
4. Arena — Live Conversation (ArenaSystem)
5. Mindset Pulse (post-session reflection)
6. Feedback Analysis (SessionReport)
7. Improved Script + Shadowing
8. Spaced Repetition Review

### Navigation:
- Hash-based routing (`#dashboard`, `#practice-session`, `#practice-history`, `#design-system`)
- No React Router — `App.tsx` manages a `page` state with `Page` type union
- Auth state listener in `useEffect` handles post-login navigation

---

## 6. COMPONENT STRUCTURE

```
src/app/
  App.tsx                          ← Main component, page routing, auth state
  components/
    LandingPage.tsx                ← 3-language landing with CTA
    AuthModal.tsx                  ← Google OAuth modal
    LanguageTransitionModal.tsx    ← ES/PT→EN transition (skipped for EN users)
    LoadingScreen.tsx              ← Post-auth loading
    DashboardPage.tsx              ← User dashboard with practice history
    PracticeHistoryPage.tsx        ← Full history list
    PracticeWidget.tsx             ← Scenario setup flow
    KeyExperienceScreen.tsx        ← Pre-session context gathering
    PracticeSessionPage.tsx        ← Main session page (hosts Arena)
    SessionProgressBar.tsx         ← 3-step visual stepper
    SessionReport.tsx              ← Post-session feedback display
    CreditUpsellModal.tsx          ← Paywall modal (3 trigger contexts)
    HowItWorksTabs.tsx             ← Landing page tabs
    DesignSystemPage.tsx           ← Internal design reference
    ErrorBoundary.tsx              ← Global error boundary
    landing-i18n.ts                ← i18n copy (ES/PT/EN)
    LandingLangContext.tsx         ← Language context provider
    arena/
      ArenaSystem.tsx              ← Progressive scaffolding conversation
      BriefingRoom.tsx             ← Pre-arena briefing
    shared/
      index.tsx                    ← SmoothHeight, BrandLogo, etc.
      ProfileCompletionBanner.tsx
      ServiceErrorBanner.tsx
      session-types.ts
    ui/                            ← shadcn/ui primitives
  hooks/
    useUsageGating.ts              ← Free tier gating + paywall triggers
    useServiceCall.ts              ← Service call wrapper with error handling
```

---

## 7. BACKEND (Supabase Edge Functions)

### Server: `/supabase/functions/server/index.tsx`
- Hono web server running as a Supabase Edge Function
- Route prefix: `/make-server-4e8a5b39/`
- CORS enabled for all origins
- Auth via `getAuthUser()` helper (validates Bearer token with `supabase.auth.getUser()`)

### Existing routes:
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /health | No | Health check |
| GET | /auth/status | Yes | Verify auth session |
| POST | /auth/ensure-profile | Yes | Create profile in KV if not exists |
| POST | /auth/signup | No | Email/password signup (testing only) |
| GET | /profile | Yes | Fetch user profile from KV |
| PUT | /profile | Yes | Update user profile in KV |
| POST | /profile/mark-free-used | Yes | Mark free session as used |
| GET | /sessions | Yes | List practice sessions from KV |
| POST | /sessions | Yes | Save a practice session to KV |

### KV Store pattern:
- Table: `kv_store_08b8658d` (key-value with `key TEXT PRIMARY KEY, value TEXT`)
- Utility: `/supabase/functions/server/kv_store.tsx` (DO NOT MODIFY)
- Available methods: `get`, `set`, `del`, `mget`, `mset`, `mdel`, `getByPrefix`
- Key conventions:
  - `profile:{userId}` — User profile JSON
  - `session:{userId}:{sessionId}` — Individual session data
  - `session_index:{userId}` — Array of session IDs (newest first)

### Frontend → Server communication:
```typescript
import { projectId, publicAnonKey } from '/utils/supabase/info';
const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4e8a5b39`;
// Use Authorization: `Bearer ${publicAnonKey}` for unauth routes
// Use Authorization: `Bearer ${accessToken}` for auth routes
```

---

## 8. SUPABASE AUTH (SupabaseAuthService)

The `auth.supabase.ts` adapter is fully implemented with:
- Auth state listener (`onAuthStateChange`) — handles login, logout, token refresh, multi-tab sync
- Profile fetch with 4-level fallback: DB fetch → wait+retry → upsert → synthetic profile
- OAuth redirect flow (full-page redirect, not popup)
- Fire-and-forget `ensureServerProfile()` call to server after SIGNED_IN
- Error mapping to typed `AuthError` codes (POPUP_CLOSED, PROVIDER_ERROR, NETWORK_ERROR)

**Google OAuth setup required:**
1. Google Cloud Console → Create OAuth 2.0 Client ID
2. Authorized redirect URI: `https://{project-id}.supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers → Google → paste credentials

---

## 9. MOCK DATA

Mock data files in `src/services/adapters/mock/data/`:
- `feedback-data.ts` — 5 scenarios, all in English
- `dashboard-data.ts` — Practice history + power phrases
- `chat-messages.ts` — Conversation mock messages
- `script-sections.ts` / `script-sections-by-scenario.ts` — Improved script sections
- `shadowing-data.ts` / `shadowing-by-scenario.ts` — Pronunciation practice phrases
- `cultural-data.ts` — Cultural intelligence tips
- `mindset-coaching-data.ts` — Post-session reflection prompts
- `results-summary-data.ts` — Session results summary
- `completed-phrases.ts` — Completed phrase summaries

---

## 10. ENVIRONMENT VARIABLES

### Frontend (.env):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Server (Edge Function environment):
```
SUPABASE_URL          (auto-set by Supabase)
SUPABASE_SERVICE_ROLE_KEY  (auto-set by Supabase)
SUPABASE_DB_URL       (auto-set by Supabase)
```

### Credential resolution (supabase.ts):
1. `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from `.env` (priority)
2. Fallback to `utils/supabase/info.tsx` (Figma Make hardcoded values)

---

## 11. DOCUMENTATION

The `/docs/` directory contains 8+1 architecture documents:
- `MASTER_BLUEPRINT.md` — Full system architecture and design decisions
- `WORKPLAN_v3.md` — Implementation phases and task breakdown
- `BACKEND_HANDOFF.md` — Server setup, Edge Function specs, API contracts
- `FASE1_MIGRATION.sql` — Database schema (profiles, sessions, sr_cards, etc.)
- `PDR_SCREEN_BY_SCREEN.md` — Screen-by-screen UI specification
- `QA_ACCEPTANCE_CRITERIA.md` — Test cases for each feature
- `SYSTEM_PROMPTS.md` — AI prompt engineering for conversation/feedback
- `FASE1_ONBOARDING_SUPPLEMENT.md` — Onboarding flow details
- `DEVELOPER_HANDOFF_CHECKLIST.md` — Handoff checklist

Additionally:
- `MIGRATION_NOTES.md` (root) — Steps to migrate from Figma Make to standalone

---

## 12. IMMEDIATE NEXT STEPS (Priority Order)

### Phase 1: Complete Auth + User Persistence (Current)
1. ✅ `services/index.ts` auto-detects Supabase for auth
2. ✅ Server routes for profile and session CRUD via KV
3. ⬜ Create `user.supabase.ts` adapter that calls server routes (profile, history, power phrases)
4. ⬜ Wire `user.supabase.ts` into `services/index.ts` (auto-detect swap)
5. ⬜ Test full auth flow: Landing → Google OAuth → redirect → Dashboard with persisted profile

### Phase 2: AI Conversation Engine
1. ⬜ Create Edge Function `prepare-session` (GPT-4o system prompt generation)
2. ⬜ Create Edge Function `process-turn` (GPT-4o conversation with streaming)
3. ⬜ Create `conversation.supabase.ts` adapter
4. ⬜ Integrate ElevenLabs TTS + Azure Speech STT in `speech.supabase.ts`

### Phase 3: Feedback Pipeline
1. ⬜ Create Edge Function `analyze-feedback` (Gemini 1.5 Flash)
2. ⬜ Create Edge Function `generate-script` (improved script generation)
3. ⬜ Create `feedback.supabase.ts` adapter

### Phase 4: Payments
1. ⬜ MercadoPago integration (LATAM markets)
2. ⬜ Stripe integration (global fallback)
3. ⬜ Create `payment.supabase.ts` adapter
4. ⬜ Webhook handlers for payment confirmation

---

## 13. CODING CONVENTIONS

- **TypeScript strict mode** — no `any` unless absolutely necessary
- **Service errors** — always throw typed errors from `errors.ts` (AuthError, SpeechError, etc.)
- **Console logging** — prefix with `[inFluentia]` or `[inFluentia Auth]` for easy filtering
- **Adapter naming** — `{service}.mock.ts` and `{service}.supabase.ts`
- **Interface naming** — `I{Service}Service` (e.g., `IAuthService`)
- **Mock delays** — use `delay()` from `adapters/mock/utils.ts` (100-500ms)
- **State management** — React useState/useEffect (no Redux/Zustand)
- **Styling** — Tailwind CSS v4 utility classes, theme tokens in `src/styles/theme.css`
- **Animation** — Motion library (`import { motion } from 'motion/react'`)

---

## VERIFICATION CHECKLIST (Run before any changes)

Before making any modification, verify these invariants:
1. `App.tsx` does NOT contain `cleanOAuthParams`
2. `services/index.ts` uses auto-detect pattern (not hardcoded mock/real)
3. `AuthProvider` type is `"google"` only (no `"linkedin"`)
4. No LinkedIn buttons/icons in `AuthModal.tsx` or `PracticeWidget.tsx`
5. `supabase.ts` creates client eagerly at module load (not inside a function)
6. `CreditUpsellModal.tsx` renders correctly (was rebuilt after truncation)
7. Server routes use prefix `/make-server-4e8a5b39/`
