# MasteryTalk PRO — Product Specification v1.0

> **Source of Truth.** This document is the formal spec for the entire product.
> Any code change MUST be consistent with this spec.
> If the spec needs to change, update THIS FILE FIRST → get approval → then code.
>
> Last updated: 2026-04-21 (Beta v11.2 — Self-Intro Warm-Up + Path Recommendation Engine)

---

## §1 — Product Identity

| Key | Value |
|-----|-------|
| Name | MasteryTalk PRO |
| Domain | masterytalk.pro |
| Tagline | Professional English Communication Coaching |
| Target | LATAM professionals (Mexico, Colombia, Brasil) in nearshoring roles |
| Core Loop | Learn → Practice → Feedback → Improve → Repeat |
| Business Model | Monthly subscription ($14.99/month) |

---

## §2 — Active Scenarios

> **RULE:** Only these 3 scenarios exist in the product. No others are visible, selectable, or purchasable.

| ID | Label (EN) | Label (ES) | Status |
|----|-----------|-----------|--------|
| `interview` | Job Interview | Entrevista de trabajo | ✅ Active |
| `meeting` | Remote Meetings | Reuniones remotas | ✅ Active |
| `presentation` | Presentations | Presentaciones | ✅ Active |
| `self-intro` | Self-Introduction (Warm-Up) | Auto-presentación | ✅ Active (Free) |

```typescript
// Canonical type — src/entities/session/index.ts
type ScenarioType = "interview" | "meeting" | "presentation" | "self-intro";
```

> **Note:** `self-intro` is NOT a purchasable Learning Path — it is a free warm-up session that all users can access. It does not appear in `PROGRESSION_PATHS` or `PathId`.

### Retired Scenarios (not visible, not purchasable)
- `sales` — planned for Phase 2 as separate flow
- `client`, `csuite` — future expansion

---

## §3 — Pricing Model (Beta)

### §3.1 Tier Structure

| Tier | Price | Type | Access | Stripe Price ID |
|------|-------|------|--------|-----------------|
| **Demo** | $0 | — | 1 free session per scenario (Web), no card required | — |
| **Pro Plan** | $14.99 | Monthly | Full access to ALL paths, WhatsApp SR Coach, max 15 Web sessions/mo | `price_TBD_PRO_MONTHLY` |

### §3.2 Purchase Types

```typescript
// Canonical type — src/services/types.ts
type PurchaseType = "subscription";

const PATH_PRODUCTS = {
  subscription: { type: "subscription", price: 14.99, label: "MasteryTalk PRO Subscription" },
} as const;
```

### §3.3 Pricing Logic

- The $14.99/mo subscription provides access to all available scenarios.
- The subscription includes the **WhatsApp Spaced Repetition (SR) Coach**, sending daily audio challenges to the user's phone.
- A **Fair Use Limit** of 15 full Web App practice sessions per month prevents abuse of backend LLM costs, but unlimited asynchronous WhatsApp phrase coaching is included (up to 3 phrases/day).

### §3.4 What does NOT exist (Beta)
- ❌ One-time purchases
- ❌ Pay-per-session credits
- ❌ Trial periods (time-limited full access without payment)

---

## §4 — User State Model

### §4.1 User Entity

```typescript
// Canonical type — src/entities/user/index.ts
type UserPlan = "free" | "pro";

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  plan: UserPlan;                // "free" until purchase, then "pro"
  freeSessionsUsed: string[];   // ScenarioType[] — demo sessions consumed
  monthlySessionsUsed: number;  // Resets monthly, max 15
  whatsappNumber?: string;      // E164 format
  whatsappVerified?: boolean;
  createdAt: string;
  marketFocus?: string;         // "mexico" | "colombia"
}
```

### §4.2 Access Rules

| Condition | UI Behavior |
|-----------|-------------|
| `plan === "free"` AND `freeSessionsUsed` excludes scenario | Show free demo CTA in hero |
| `plan === "free"` AND `freeSessionsUsed` includes scenario | Show $14.99 paywall |
| `plan === "pro"` AND `monthlySessionsUsed < 15` | Full access to Web sessions |
| `plan === "pro"` AND `monthlySessionsUsed >= 15` | Soft block: "You've reached your monthly web practice limit" |

### §4.3 Gating Hook

```typescript
// src/app/hooks/useUsageGating.ts
interface GateResult {
  allowed: boolean;
  mode?: "demo" | "path";
  reason?: "path-required" | "attempts-exhausted";
}
```

---

## §5 — Conversion Funnel

### §5.1 Customer Journeys

```
Journey A: Landing Hero → Auth → Demo Session → Feedback → Subscription CTA → Stripe → Dashboard
Journey B: Landing Pricing → Auth → Dashboard → Subscription Modal → Stripe → Dashboard
Journey C: Demo Session → Paywall → Subscription Modal → Stripe → Dashboard
```

### §5.2 Subscription Paywall Modes

The modal acts as a unified subscription sell screen: Price: $14.99/mo, features: Full Access to all paths + WhatsApp Coach.

### §5.3 Post-Purchase Flow

1. Stripe redirects to `/#/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`
2. `PaymentSuccessHandler` waits for `authReady === true` before processing
3. Shows success toast notification (auto-dismiss 6s)
4. Refreshes user profile from Supabase → updates `authUser.plan` to `"pro"`
5. Syncs usage gating.
6. Cleans URL to `/#/dashboard`

> **Source of truth for `plan`:** Always `authUser.plan` (from Supabase profile), managed by Stripe webhook.

### §5.4 Stripe Checkout Configuration

**Frontend → Edge Function call:**

```typescript
// POST /create-checkout
// No body required as subscription covers everything
// Returns: { checkoutUrl: string, checkoutId: string }
```

**Checkout Session settings (Edge Function):**

| Setting | Value |
|---------|-------|
| `mode` | `"subscription"` |
| `payment_method_types` | `["card"]` |
| `expires_at` | 30 minutes from creation |
| `customer_email` | Pre-filled from `user.email` |
| `success_url` | `{origin}/#/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}` |
| `cancel_url` | `{origin}/#/dashboard?payment=cancelled` |

**Metadata attached to the subscription (required by webhook):**

```typescript
metadata: {
  userId: string,       // Supabase user UID
}
```

### §5.5 Webhook Contract

**Endpoint:** `POST /make-server-TBD/webhook/stripe`
**Auth:** None — validated via Stripe HMAC signature

**Events handled:**

| Event | Action |
|-------|--------|
| `customer.subscription.created` | sets `plan = "pro"`, `plan_status = "active"` |
| `customer.subscription.deleted` | sets `plan = "free"`, `plan_status = "canceled"` |
| `customer.subscription.updated` | Handles past_due/active transitions |

**Profile update on subscription change:**

1. Reads user identity.
2. Updates Supabase `profiles` table to reflect new subscription status.
3. Updates KV store fallback to `plan: "pro"`.

> **Resilience note:** Deno KV is updated first. Supabase DB update is non-blocking.
> If Supabase fails, KV is the fallback source. `GET /profile` reads from KV first.

### §5.6 Entry Points to PathPurchaseModal

All four entry points must pass `ownedPaths={authUser?.pathsPurchased ?? []}`:

| Entry Point | File | Trigger |
|-------------|------|---------|
| Landing Pricing CTA (auth) | `App.tsx` → `showNewSessionPaywall` | `onPricingPurchase()` → `setShowNewSessionPaywall(true)` |
| Landing Pricing CTA (no auth) | `LandingPage.tsx` → sessionStorage intent | `handlePricingClick()` → saves `masterytalk_purchase_intent` → post-OAuth → `setShowNewSessionPaywall(true)` |
| Dashboard header badge | `DashboardPage.tsx` → `upsellOpen` | `onOpenUpsell()` |
| In-session paywall | `PracticeSessionPage.tsx` → `paywallOpen` | `handlePaywallTriggered("path-required" \| "attempts-exhausted")` |

---

## §6 — Landing Page

### §6.1 Section Structure (v4)

| # | Section | Anchor | Key Elements |
|---|---------|--------|--------------|
| 1 | Hero | `#hero` | Badge pill, headline, subheadline |
| 2 | Practice Widget | — | 3 scenario cards (interview, meeting, presentation) + microcopy |
| 3 | How It Works | `#how` | 3-step tabs with interactive mockups |
| 4 | Diferenciadores | — | 4 numbered cards in 2×2 grid |
| 5 | ¿Es para ti? | `#benefits` | Yes/No column lists |
| 6 | Before & After | — | Passive practice vs MasteryTalk columns |
| 7 | Session Takeaways | — | 3 metric cards (Fluency, Pronunciation, PDF) |
| 8 | Rutas disponibles | — | 3 route cards with hooks |
| 9 | Pricing | `#pricing` | 2 pricing cards (see §6.2) |
| 10 | FAQ | — | 5 accordion items |
| 11 | Final CTA | — | Headline + single CTA button |

### §6.2 Pricing Section

- **1 Subscription Card** centered (max-w-md)
- Price: **$14.99/mes** — Acceso total
- Bullets: 
  - Práctica ilimitada vía WhatsApp (SR Coach) diaria.
  - Simulador de conversaciones web (15 sesiones completas/mes).
  - Feedback detallado y reportes ejecutivos.
- Demo reinforcement: "Primera sesión gratis" in hero copy.

### §6.3 Nav

- 3 anchor links: How It Works, Benefits, Pricing
- "Iniciar sesión" as ghost text link
- **Single CTA button:** "Probar gratis" (scrolls to hero widget)

### §6.4 Supported Languages

| Code | Landing | Dashboard |
|------|---------|-----------|
| `es` | ✅ Full | ✅ Full |
| `pt` | ✅ Full | ✅ Full |
| `en` | ✅ Full | ✅ Full |

---

## §7 — Session Flow

### §7.1 Steps (ordered)

```typescript
type Step =
  | "experience"      // Professional background (CV upload or manual)
  | "context"         // Situation-specific context (JD, agenda, etc.)
  | "strategy"        // Methodology & framework preview
  | "generating"      // Dynamic loader (script generation)
  | "practice-prep"   // Interactive briefing before practice
  | "practice"        // Voice practice with AI
  | "analyzing"       // Dynamic loader (post-practice analysis)
  | "feedback"        // Results & performance analysis
  | "upsell";         // Path purchase / conversion
```

> **Retired steps** (removed from codebase):
> `key-experience`, `cv-upload`, `extra-context`, `pre-brief`, `generating-script`, `pre-briefing`, `session-analysis`, `path-conversion`, `conversation-feedback`, `skill-drill`, `cp-unlock`, `remedial`, `session-recap`, `interview-analysis`

### §7.2 Arena System (Progressive Scaffolding)

| Phase | AI Tone | UI Support | Transition |
|-------|---------|------------|------------|
| Support | Friendly, patient | Power Phrases visible, Try Saying hints | 2+ good interactions |
| Guidance | Neutral, professional | Reduced hints | 2+ good interactions |
| Challenge | Confrontational, demanding | No visible help | End of conversation |

### §7.3 Skill Drill

- Appears after `conversation-feedback`, before `session-recap`
- Evaluates weakest pillar (score < 78)
- 2 attempts max per drill
- Score < 45 → SR card auto-created
- Pillar modality: Vocabulary/Grammar/Prof.Tone/Persuasion = text, Fluency/Pronunciation = voice

### §7.4 Self-Introduction Warm-Up

> **Purpose:** Free, friction-free first practice for new users. Builds engagement before the progression paywall.

**Flow:**
```
Intro Screen → Context Selection → Strategy → Conversation → Feedback → Path Recommendation
```

**Context Selection (SelfIntroContextScreen):**

| Context | Label | Interlocutor |
|---------|-------|--------------|
| `networking` | Networking Event | recruiter |
| `team` | Team Introduction | team_lead |
| `client` | Client Meeting | client_director |

**Rules:**
- Always free — no paywall, no path purchase required
- Available from Dashboard banner (for users with 0 sessions) and PracticeDropdown (always visible)
- Uses same AI pipeline (`/process-turn`, `/analyze-feedback`) as regular sessions
- NOT a Learning Path — no levels, no progression tracking
- `scenarioType = "self-intro"` — excluded from `PathId` type

### §7.5 Path Recommendation Engine (Post Warm-Up)

> **Purpose:** After the warm-up session, recommend a specific Learning Path based on performance data — a high-conversion moment.

**Data signals:**
1. `pillarScores` from `/analyze-feedback` (6 dimensions: Vocabulary, Grammar, Fluency, Pronunciation, Professional Tone, Persuasion)
2. Self-intro context chosen by user (networking / team / client)
3. Onboarding profile (position, industry, seniority)

**Mapping logic:**

| Weakest Pillar(s) | Recommended Path |
|--------------------|------------------|
| Persuasion + Professional Tone | C-Suite Communication |
| Persuasion (solo) | Sales Champion |
| Professional Tone (solo) | Client-Facing Communication |
| Fluency + Grammar | Remote Meeting Presence |
| Vocabulary | Interview Mastery |
| Fluency (solo) | Presentations |

Context tiebreaker (when pillar scores are within 5 points): `networking` → Interview Mastery, `team` → Remote Meeting Presence, `client` → Client-Facing Communication.

**UI placement:** Renders inside the feedback step (below progression gate, above actions) as `PathRecommendationCard`. Educational tone — not a sales modal.

**CTA:** "Start This Path →" opens `PathPurchaseModal` pre-seeded with the recommended path.

**Source:** `src/features/dashboard/model/path-recommendation.ts` (pure function, no side effects)

---

## §8 — Learning Path Structure

```
Learning Path: [Scenario] (Included in Pro Subscription)
├── Level 1: "Foundation" — Arena Support mode
│   ├── 3 fresh sessions (deducted from 15/mo quota)

│   ├── Review Mode (unlimited, $0 cost)
│   ├── Remedial: shadowing + micro-lessons
│   └── Skill Drill → unlocks Level 2
├── Level 2: "Building Confidence" — Arena Guidance mode
├── Level 3: "Under Pressure" — Arena Challenge mode
├── Level 4: "Executive Ready" — Arena Challenge+
│   └── Skill Drill → path completed 🎉
```

### §8.1 Per-Level Access

- 3 fresh attempts per level (full AI session)
- Unlimited review mode ($0 — cached data)
- Sequential unlock: complete Skill Drill → next level opens

---

## §9 — Service Contracts

### §9.1 Service Registry

| Service | Interface | Mock | Production |
|---------|-----------|------|------------|
| Auth | `IAuthService` | `MockAuthService` | `SupabaseAuthService` |
| Conversation | `IConversationService` | `MockConversationService` | Edge Function |
| Feedback | `IFeedbackService` | `MockFeedbackService` | Edge Function |
| Speech | `ISpeechService` | `MockSpeechService` | Azure + ElevenLabs |
| User | `IUserService` | `MockUserService` | Edge Function |
| Payment | `IPaymentService` | `MockPaymentService` | Stripe + Edge Function |
| Spaced Repetition | `ISpacedRepetitionService` | `MockSpacedRepetitionService` | Edge Function |

### §9.2 Backend API Surface

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/create-checkout` | ✅ | Create Stripe checkout for subscription |
| POST | `/webhook/stripe` | ❌ | Handle subscription state webhooks |
| POST | `/webhook/twilio` | ❌ | Handle WhatsApp incoming audio |
| POST | `/cron/daily-sr` | DB | Cron job for Twilio WhatsApp SR dispatch |
| GET | `/profile` | ✅ | Get user profile |
| PUT | `/profile` | ✅ | Update user profile |
| POST | `/prepare-session` | ✅ | Create practice session |
| POST | `/process-turn` | ✅ | Process conversation turn (GPT-4o) |
| POST | `/analyze-feedback` | ✅ | Post-session analysis (Gemini) |
| POST | `/generate-summary` | ✅ | Executive session summary |
| POST | `/tts` | ✅ | Text-to-speech (ElevenLabs/Azure) |
| POST | `/transcribe` | ✅ | Speech-to-text (Azure) |
| POST | `/pronunciation-assess` | ✅ | Pronunciation scoring (Azure) |
| POST | `/evaluate-drill` | ✅ | Skill Drill evaluation (GPT-4o) |
| GET | `/admin/stats` | ✅ (admin) | Admin dashboard data |

### §9.3 Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | Frontend (.env) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend (.env) | Supabase anon key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend (.env) | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Supabase Secrets | Stripe secret key |
| `STRIPE_PRICE_FIRST_PATH` | Supabase Secrets | Price ID for $4.99 |
| `STRIPE_PRICE_PATH` | Supabase Secrets | Price ID for $16.99 |
| `STRIPE_WEBHOOK_SECRET` | Supabase Secrets | Webhook signing secret |
| `TWILIO_ACCOUNT_SID` | Supabase Secrets | Twilio Integration |
| `TWILIO_AUTH_TOKEN` | Supabase Secrets | Twilio Integration |
| `TWILIO_PHONE_NUMBER` | Supabase Secrets | Sender WhatsApp Node |
| `OPENAI_API_KEY` | Supabase Secrets | GPT-4o access |
| `GEMINI_API_KEY` | Supabase Secrets | Gemini Flash access |
| `AZURE_SPEECH_KEY` | Supabase Secrets | Azure Speech Services |
| `ELEVENLABS_API_KEY` | Supabase Secrets | ElevenLabs TTS |

---

## §10 — Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React 18 + Tailwind v4 + Vite 6 | SPA, FSD architecture |
| Backend | Supabase Edge Functions (Deno/TS) | Low latency, Hono router |
| Job Scheduler | Supabase `pg_cron` | CRON execution |
| Comms / Phone | Twilio API | WhatsApp Cloud interactions |
| Database | Supabase (PostgreSQL) + Deno KV | Relational + key-value hybrid |
| Chat AI | GPT-4o | Maximum realism for executive confrontation |
| Analysis AI | Gemini 1.5 Flash | 98% cost savings vs GPT-4o |
| TTS | ElevenLabs (practice) + Azure Neural (system) | Premium voice quality |
| STT | Azure Speech REST API | Pronunciation scoring included |
| Payments | Stripe (global) | Subscription billing |
| Hosting | Vercel (frontend) + Supabase (backend) | Edge deployment |
| Audio Cache | Cloudflare R2 | $0 egress, SHA-256 dedup |

---

## §11 — Spec Governance

### How to use this spec

1. **Before ANY code change**: Check if the change is consistent with this spec
2. **If spec needs updating**: Propose changes to THIS FILE → get user approval → THEN code
3. **New features**: Add a new section to this spec FIRST → approve → implement
4. **Conflicts**: This spec wins over MASTER_BLUEPRINT.md (which is now legacy)

### Spec versioning

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2026-04-17 | Initial spec — retroactive documentation of beta state |
| v1.1 | 2026-04-20 | Landing page overhaul (v4 copy), §6 restructured, §7.1 steps cleaned, storage keys rebranded |
| v1.2 | 2026-04-21 | Added `self-intro` to §2, new §7.4 Self-Intro Warm-Up flow, §7.5 Path Recommendation Engine. Updated ScenarioType. |

### What this spec does NOT cover (yet)
- Detailed prompt engineering (system prompts, evaluator prompts)
- CSS design tokens and component library
- CI/CD pipeline configuration
- Analytics and metrics instrumentation
- Error handling protocol (see `src/services/errors.ts`)
