# MasteryTalk PRO — Product Specification v1.0

> **Source of Truth.** This document is the formal spec for the entire product.
> Any code change MUST be consistent with this spec.
> If the spec needs to change, update THIS FILE FIRST → get approval → then code.
>
> Last updated: 2026-04-20 (Beta v11.1 — Landing Page Overhaul)

---

## §1 — Product Identity

| Key | Value |
|-----|-------|
| Name | MasteryTalk PRO |
| Domain | masterytalk.pro |
| Tagline | Professional English Communication Coaching |
| Target | LATAM professionals (Mexico, Colombia, Brasil) in nearshoring roles |
| Core Loop | Learn → Practice → Feedback → Improve → Repeat |
| Business Model | One-time path purchases (no subscriptions in beta) |

---

## §2 — Active Scenarios

> **RULE:** Only these 3 scenarios exist in the product. No others are visible, selectable, or purchasable.

| ID | Label (EN) | Label (ES) | Status |
|----|-----------|-----------|--------|
| `interview` | Job Interview | Entrevista de trabajo | ✅ Active |
| `meeting` | Remote Meetings | Reuniones remotas | ✅ Active |
| `presentation` | Presentations | Presentaciones | ✅ Active |

```typescript
// Canonical type — src/entities/session/index.ts
type ScenarioType = "interview" | "meeting" | "presentation";
```

### Retired Scenarios (not visible, not purchasable)
- `sales` — planned for Phase 2 as separate flow
- `client`, `csuite` — future expansion

---

## §3 — Pricing Model (Beta)

### §3.1 Tier Structure

| Tier | Price | Type | Access | Stripe Price ID |
|------|-------|------|--------|-----------------|
| **Demo** | $0 | — | 1 free session per scenario, no card required | — |
| **First Path** | $4.99 | One-time | Full permanent access to 1 Learning Path | `price_1TMhEZHp3CeGzGza3sWfNTkC` |
| **Additional Path** | $16.99 | One-time | Full permanent access to 1 additional Learning Path | `price_1TMZYnHp3CeGzGzaGDABt6wV` |

### §3.2 Purchase Types

```typescript
// Canonical type — src/services/types.ts
type PurchaseType = "first_path" | "path";

const PATH_PRODUCTS = {
  first_path: { type: "first_path", price: 4.99, label: "First Path (Beta)" },
  path:       { type: "path",       price: 16.99, label: "Learning Path" },
} as const;
```

### §3.3 Pricing Logic

```
IF ownedPaths.length === 0 → charge $4.99 (first_path)
IF ownedPaths.length >= 1  → charge $16.99 (path)
```

### §3.4 What does NOT exist (Beta)
- ❌ Subscriptions (monthly recurring)
- ❌ Trial periods (time-limited access)
- ❌ All-Access Bundle
- ❌ Booster Packs
- ❌ Credits / pay-per-session

---

## §4 — User State Model

### §4.1 User Entity

```typescript
// Canonical type — src/entities/user/index.ts
type UserPlan = "free" | "path";

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  plan: UserPlan;                // "free" until first purchase, then "path"
  freeSessionsUsed: string[];   // ScenarioType[] — demo sessions consumed
  pathsPurchased: string[];     // ScenarioType[] — paths with permanent access
  createdAt: string;
  marketFocus?: string;         // "mexico" | "colombia"
}
```

### §4.2 Access Rules

| Condition | UI Behavior |
|-----------|-------------|
| `freeSessionsUsed` does NOT include scenario | Show free demo CTA in hero |
| `freeSessionsUsed` includes scenario AND `pathsPurchased` is empty | Show $4.99 upsell in feedback screen |
| `pathsPurchased` includes scenario | Full access, no paywall |
| `pathsPurchased.length >= 1` AND wants different path | Show path selector + $16.99 |
| `pathsPurchased` includes ALL 3 scenarios | Full access to everything |

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
Journey A: Landing Hero → Auth → Demo Session → Feedback → $4.99 CTA → Stripe → Dashboard
Journey B: Landing Pricing → Auth → Dashboard → Modal (first purchase) → Stripe → Dashboard
Journey C: Dashboard → New Path → Modal (additional, with selector) → Stripe → Dashboard
Journey D: Demo Session → Paywall → Modal (first purchase) → Stripe → Dashboard
```

### §5.2 PathPurchaseModal Modes

| Mode | Condition | Path Selection | Price |
|------|-----------|---------------|-------|
| **A — First Purchase** | `ownedPaths.length === 0` | Inherited from currentPath (no selector) | $4.99 |
| **B — Additional Path** | `ownedPaths.length >= 1` | Selector shown (3 cards, owned paths excluded) | $16.99 |

### §5.3 Post-Purchase Flow

1. Stripe redirects to `{origin}/#/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&type={type}&scenario={scenario}`
2. `PaymentSuccessHandler` (`src/shared/ui/PaymentSuccessHandler.tsx`) waits for `authReady === true` before processing
3. Shows success toast notification (auto-dismiss 6s)
4. Calls `onPaymentConfirmed()` → refreshes user profile from Supabase → updates `authUser.pathsPurchased`
5. Syncs `usageGating.addPurchasedPath()` for each path in the refreshed profile
6. Cleans URL to `/#/dashboard`

> **Source of truth for `ownedPaths`:** Always `authUser.pathsPurchased` (from Supabase profile).
> Never rely on `usageGating.purchasedPaths` (localStorage) for Mode A/B detection — it can be stale.

### §5.4 Stripe Checkout Configuration

**Frontend → Edge Function call:**

```typescript
// POST /create-checkout
{
  purchaseType: "first_path" | "path",
  scenarioType: "interview" | "meeting" | "presentation"
}
// Returns: { checkoutUrl: string, checkoutId: string }
```

**Checkout Session settings (Edge Function):**

| Setting | Value |
|---------|-------|
| `mode` | `"payment"` (one-time, no subscription) |
| `payment_method_types` | `["card"]` |
| `expires_at` | 30 minutes from creation |
| `customer_email` | Pre-filled from `user.email` |
| `success_url` | `{origin}/#/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&type={purchaseType}&scenario={scenarioType}` |
| `cancel_url` | `{origin}/#/dashboard?payment=cancelled` |

**Metadata attached to the session (required by webhook):**

```typescript
metadata: {
  userId: string,       // Supabase user UID
  purchaseType: string, // "first_path" | "path"
  scenarioType: string, // "interview" | "meeting" | "presentation"
}
```

> ⚠️ If any metadata field is missing, the webhook logs a warning and returns 200
> without updating the profile. The user pays but gets no access — silent failure.

### §5.5 Webhook Contract

**Endpoint:** `POST /make-server-08b8658d/webhook/stripe`
**Auth:** None — validated via Stripe HMAC signature (`stripe-signature` header + `STRIPE_WEBHOOK_SECRET`)

**Events handled:**

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Updates profile: adds `scenarioType` to `paths_purchased`, sets `plan = "path"` |
| `checkout.session.expired` | Logged, no action |
| All others | Acknowledged (200), not processed |

**Profile update on `checkout.session.completed`:**

1. Reads profile from Deno KV (`profile:{userId}`)
2. Adds `scenarioType` to `paths_purchased` (idempotent — no duplicates)
3. Sets `plan = "path"`, `plan_status = "active"`
4. Writes back to Deno KV
5. Also updates Supabase `profiles` table (non-blocking — failure logged but not fatal)
6. Records purchase in KV (`purchase:{session.id}`)
7. Sends confirmation email (fire-and-forget)

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

- **2 cards** side-by-side (max-w-3xl)
- Card 1: **$4.99** — primera ruta, acceso permanente (dark featured card)
- Card 2: **$16.99** — rutas adicionales, acceso permanente (white card)
- Demo reinforcement line below cards: "Primera sesión completamente gratis"
- Demo session does NOT appear in pricing cards — lives in hero widget microcopy

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
  | "key-experience"
  | "cv-upload"
  | "extra-context"
  | "pre-brief"
  | "generating-script"
  | "pre-briefing"
  | "practice"
  | "analyzing"
  | "session-analysis"
  | "path-conversion";
```

> **Retired steps** (removed from codebase):
> `conversation-feedback`, `skill-drill`, `cp-unlock`, `remedial`, `session-recap`, `interview-analysis`
```

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

---

## §8 — Learning Path Structure

```
Learning Path: [Scenario] ($4.99 first / $16.99 additional)
├── Level 1: "Foundation" — Arena Support mode
│   ├── 3 fresh sessions
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
| POST | `/create-checkout` | ✅ | Create Stripe Checkout session |
| POST | `/webhook/stripe` | ❌ (Stripe sig) | Handle payment webhooks |
| GET | `/profile` | ✅ | Get user profile |
| PUT | `/profile` | ✅ | Update user profile |
| POST | `/prepare-session` | ✅ | Create practice session |
| POST | `/process-turn` | ✅ | Process conversation turn (GPT-4o) |
| POST | `/analyze-feedback` | ✅ | Post-session analysis (Gemini) |
| POST | `/generate-summary` | ✅ | Executive session summary |
| POST | `/generate-script` | ✅ | Improved script generation |
| POST | `/tts` | ✅ | Text-to-speech (ElevenLabs/Azure) |
| POST | `/transcribe` | ✅ | Speech-to-text (Azure) |
| POST | `/pronunciation-assess` | ✅ | Pronunciation scoring (Azure) |
| POST | `/evaluate-drill` | ✅ | Skill Drill evaluation (GPT-4o) |
| GET | `/progression/:scenario/levels` | ✅ | Get path level progress |
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
| Database | Supabase (PostgreSQL) + Deno KV | Relational + key-value hybrid |
| Chat AI | GPT-4o | Maximum realism for executive confrontation |
| Analysis AI | Gemini 1.5 Flash | 98% cost savings vs GPT-4o |
| TTS | ElevenLabs (practice) + Azure Neural (system) | Premium voice quality |
| STT | Azure Speech REST API | Pronunciation scoring included |
| Payments | Stripe (global) | One-time payments via Checkout |
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

### What this spec does NOT cover (yet)
- Detailed prompt engineering (system prompts, evaluator prompts)
- CSS design tokens and component library
- CI/CD pipeline configuration
- Analytics and metrics instrumentation
- Error handling protocol (see `src/services/errors.ts`)
