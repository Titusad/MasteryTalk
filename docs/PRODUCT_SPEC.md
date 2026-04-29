# MasteryTalk PRO — Product Specification v2.0

> **Source of Truth.** This document is the formal spec for the entire product.
> Any code change MUST be consistent with this spec.
> If the spec needs to change, update THIS FILE FIRST → get approval → then code.
>
> Last updated: 2026-04-28 (v2.0 — Subscription tiers, live payments, full email system, Sentry)

---

## §1 — Product Identity

| Key | Value |
|-----|-------|
| Name | MasteryTalk PRO |
| Domain | masterytalk.pro |
| Tagline | Professional English Communication Coaching |
| Target | LATAM professionals (Mexico, Colombia, Brasil) in nearshoring roles |
| Core Loop | Learn → Practice → Feedback → Improve → Repeat |
| Business Model | Monthly/Quarterly subscription (3 tiers) |

---

## §2 — Active Scenarios

> **RULE:** Only these scenarios are visible and active. No others.

| ID | Label (EN) | Label (ES) | Status |
|----|-----------|-----------|--------|
| `interview` | Job Interview | Entrevista de trabajo | ✅ Active |
| `meeting` | Remote Meetings | Reuniones remotas | ✅ Active |
| `presentation` | Presentations | Presentaciones | ✅ Active |
| `sales` | Sales Champion | Ventas B2B | ✅ Active |
| `culture` | U.S. Business Culture | Cultura empresarial EE.UU. | ✅ Active |
| `self-intro` | Self-Introduction (Warm-Up) | Auto-presentación | ✅ Active (Free) |

```typescript
// Canonical type — src/entities/session/index.ts
type ScenarioType = "interview" | "meeting" | "presentation" | "sales" | "culture" | "self-intro";
```

> `self-intro` is NOT a purchasable Learning Path — it is a free warm-up accessible to all users.
> `culture` is the **default recommended path** after self-intro warm-up for all users.

### Retired Scenarios
- `client`, `csuite` — future expansion

---

## §3 — Pricing Model (Live)

### §3.1 Tier Structure

| Tier | Price | Billing | Notes | Stripe Price ID |
|------|-------|---------|-------|-----------------|
| **Early Bird** | $9.99/mo | Monthly | Max 20 slots, lifetime price | `price_1TR1YXQhSs1CWakEaoaqW0y7` |
| **Monthly Pro** | $16.99/mo | Monthly | Standard monthly | `price_1TR1abQhSs1CWakEClg1lG0D` |
| **Quarterly Pro** | $39.99/3mo | Quarterly | ~$13.33/mo | `price_1TR1b9QhSs1CWakEd0CGOhM4` |

All tiers unlock the same features — the difference is price only.

### §3.2 What a subscription unlocks

- All practice paths and levels (Interview Mastery, Remote Meeting Presence, Presentations, Sales Champion, U.S. Business Culture)
- Unlimited sessions
- AI coaching and detailed feedback on every session
- WhatsApp Spaced Repetition Coach (daily audio challenges)
- Spaced repetition system

### §3.3 Early Bird rules

- Maximum 20 slots globally (tracked in KV: `global:early_bird_count`)
- Counter increments on `checkout.session.completed` for `tier=early_bird`
- Counter decrements on `customer.subscription.deleted` for `tier=early_bird`
- `/pricing` endpoint returns live slot count

### §3.4 What does NOT exist

- ❌ One-time purchases
- ❌ Pay-per-session credits
- ❌ Trial periods
- ❌ Free tier with path access (only self-intro warm-up is free)

---

## §4 — User State Model

### §4.1 User Profile (KV store: `profile:{userId}`)

```typescript
interface KVProfile {
  id: string;
  plan: "free" | "path";
  plan_status: "active" | "past_due" | "canceled" | "incomplete";
  tier: "early_bird" | "monthly" | "quarterly" | null;
  subscription_active: boolean;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  paths_purchased: string[];         // ["interview","meeting","presentation","self-intro"]
  subscription_start_date: string | null;
  next_billing_date: string | null;
  grace_period_until: string | null; // 2-day grace on payment failure
  lastNudgeSentAt: string | null;    // inactivity nudge throttle
  free_sessions_used: string[];
  monthly_sessions_used: number;
  stats: {
    sessions_count?: number;
    lastFeedbackAt?: string;
    pillarScores?: Record<string, number>;
    professionalProficiency?: number;
  };
}
```

### §4.2 Subscription lifecycle

| Event | Action |
|-------|--------|
| `checkout.session.completed` (payment_status=paid) | Activate subscription, set tier, unlock paths, send welcome email |
| `customer.subscription.updated` (status=active) | Sync status, reset monthly sessions on new cycle |
| `customer.subscription.deleted` | Revoke access (respect 2-day grace period) |
| `invoice.payment_succeeded` (billing_reason=subscription_cycle) | Renew access, send renewal email |
| `invoice.payment_failed` | Set 2-day grace period, keep access temporarily |

### §4.3 Access rules

| Condition | Access |
|-----------|--------|
| `subscription_active === true` | All paths and levels unlocked |
| `subscription_active === false`, `grace_period_until > now` | Access maintained during grace |
| `subscription_active === false` | Free tier only (self-intro) |

### §4.4 Progression unlock

The `GET /progression` endpoint automatically unlocks all locked levels when `subscription_active === true`, so subscribing gives immediate access to all levels without waiting for sequential completion.

---

## §5 — Conversion Funnel

### §5.1 Customer Journeys

```
Journey A: Landing → Auth → Self-Intro Demo → Feedback → Subscription CTA → Stripe → Dashboard
Journey B: Dashboard (locked path click) → Pricing Modal → Stripe → Dashboard + Confetti Modal
Journey C: Account page → Manage Subscription → Stripe Customer Portal
```

### §5.2 Pricing Modal entry points

| Entry Point | Trigger |
|-------------|---------|
| Locked path/level clicked in ProgressionTree | `onLockedClick` → `setUpsellOpen(true)` |
| Dashboard upsell button | `setUpsellOpen(true)` |
| Post-session paywall | `handlePaywallTriggered` |
| Landing pricing CTA | `onPricingPurchase()` |

### §5.3 Post-Purchase Flow

1. Stripe redirects to `{origin}/#dashboard?payment=success&tier={tier}&session_id={id}`
2. `App.tsx` resolves `#dashboard` from hash (strips query params before matching)
3. `PaymentSuccessHandler` detects `payment=success`, extracts `tier`
4. Shows **celebration modal** with confetti animation (60 motion particles)
5. Modal shows tier name, what's unlocked, CTA "Explore your paths"
6. On close → navigate to dashboard, refresh user profile
7. Dashboard reloads progression → all paths appear unlocked

### §5.4 Stripe Checkout Configuration

```typescript
// POST /create-checkout
// Body: { tier: "early_bird" | "monthly" | "quarterly" }
// Returns: { checkoutUrl, checkoutId, tier }
```

| Setting | Value |
|---------|-------|
| `mode` | `"subscription"` |
| `success_url` | `{origin}/#dashboard?payment=success&tier={tier}&session_id={CHECKOUT_SESSION_ID}` |
| `cancel_url` | `{origin}/#dashboard?payment=cancelled` |
| `subscription_data.metadata` | `{ userId, tier }` |

### §5.5 Webhook Contract

**Endpoint:** `POST /make-server-08b8658d/webhook/stripe`
**Auth:** None — validated via Stripe HMAC (`constructEventAsync` for Deno)
**Deploy flag:** `--no-verify-jwt`

| Event | Action |
|-------|--------|
| `checkout.session.completed` | **Primary activation** — activates subscription, sends welcome email |
| `customer.subscription.created` | Save stripe IDs only (status may be `incomplete`) |
| `customer.subscription.updated` | Sync tier/status |
| `customer.subscription.deleted` | Revoke access (check grace period first) |
| `invoice.payment_succeeded` | Renew access for recurring billing, send renewal email |
| `invoice.payment_failed` | Set 2-day grace period |

### §5.6 Manage Subscription

- `POST /create-portal-session` → creates Stripe Billing Portal session
- Returns `{ url }` → frontend redirects to Stripe portal
- From portal: cancel, update payment method, view invoices
- Return URL: `{origin}/#account`

---

## §6 — Landing Page

### §6.1 Section Structure (v4)

| # | Section | Key Elements |
|---|---------|--------------|
| 1 | Hero | Badge, headline, subheadline |
| 2 | Practice Widget | 3 scenario cards + microcopy |
| 3 | How It Works | 3-step tabs with mockups |
| 4 | Diferenciadores | 4 numbered cards |
| 5 | ¿Es para ti? | Yes/No column lists |
| 6 | Before & After | 2-column comparison |
| 7 | Session Takeaways | 3 metric cards |
| 8 | Rutas disponibles | 3 path cards |
| 9 | Pricing | 3 tier cards (Early Bird, Monthly, Quarterly) |
| 10 | FAQ | 5 accordion items |
| 11 | Final CTA | Headline + single button |

### §6.2 Pricing Section

3 tier cards shown via `PathPurchaseModal` — Early Bird, Monthly Pro, Quarterly Pro.
Early Bird shows live slot count from `/pricing` endpoint.

### §6.3 Supported Languages

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
  | "experience"        // Professional background
  | "context"           // Situation-specific context (JD, presets, agenda)
  | "strategy"          // Methodology & framework preview
  | "interlocutor-intro" // Immersive interlocutor intro (interview only)
  | "generating"        // Dynamic loader (script generation)
  | "practice-prep"     // Interactive briefing before practice
  | "practice"          // Voice practice with AI
  | "analyzing"         // Dynamic loader (post-practice analysis)
  | "feedback"          // Results & performance analysis
  | "upsell";           // Subscription CTA
```

### §7.2 Situation Presets (ContextScreen)

Each scenario has 3 presets describing the situation (company, stakes, context) without assuming the user's role. Presets inject `{ situationContext }` into the session prompt via `processGuidedFields()`.

### §7.3 Arena System (Progressive Scaffolding)

| Phase | AI Tone | UI Support | Transition |
|-------|---------|------------|------------|
| Support | Friendly, patient | Power Phrases visible, Try Saying hints | 2+ good interactions |
| Guidance | Neutral, professional | Reduced hints | 2+ good interactions |
| Challenge | Confrontational, demanding | No visible help | End of conversation |

### §7.4 Self-Introduction Warm-Up

**Flow:**
```
Intro Screen → Context Selection → Strategy → Conversation → Feedback → Path Recommendation
```

| Context | Label | Data location |
|---------|-------|---------------|
| `networking` | Networking Event | `shared/lib/self-intro-contexts.ts` |
| `team` | Team Introduction | `shared/lib/self-intro-contexts.ts` |
| `client` | Client Meeting | `shared/lib/self-intro-contexts.ts` |

- Always free, no paywall
- `scenarioType = "self-intro"` — excluded from `PathId`

### §7.5 Path Recommendation Engine (Post Warm-Up)

Pure function in `features/dashboard/model/path-recommendation.ts`.
Maps `pillarScores + selfIntroContext + profile` → `PathRecommendation`.
Type `PathRecommendation` lives in `entities/progression`.

---

## §8 — Learning Path Structure

6 paths defined, 5 visible in UI (Interview Mastery, Remote Meeting Presence, Presentations, Sales Champion, U.S. Business Culture).

Each path has **6 levels**. Default state: Level 1 unlocked, 2–6 locked.
When `subscription_active === true`: ALL levels unlocked across ALL paths.

Sequential progression (for subscribed users):
- Complete Skill Drill → next level unlocks
- `GET /progression` persists state per user in KV: `progression:{userId}`

---

## §9 — Email System

Provider: **Resend** (`hello@masterytalk.pro`, domain verified)
Secret: `RESEND_API_KEY` in Supabase secrets + `supabase/.env.local`

| Email | Trigger | Template |
|-------|---------|----------|
| Welcome | New user profile created | `welcomeEmailHtml()` |
| Subscription confirmed | `checkout.session.completed` | `subscriptionConfirmationEmailHtml()` |
| Session summary | Post-session feedback | `sessionSummaryEmailHtml()` |
| Renewal confirmed | `invoice.payment_succeeded` (billing_reason=subscription_cycle) | `renewalConfirmationEmailHtml()` |
| Inactivity nudge | Cron: 7+ days without session, max 1 per 14 days | `inactivityNudgeEmailHtml()` |

---

## §10 — Service Contracts

### §10.1 Backend API Surface

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/create-checkout` | ✅ JWT | Create Stripe checkout for subscription |
| POST | `/create-portal-session` | ✅ JWT | Create Stripe Customer Portal session |
| GET | `/pricing` | ❌ Public | Live Early Bird slot count |
| POST | `/webhook/stripe` | ❌ Stripe HMAC | Handle subscription state webhooks |
| POST | `/webhook/twilio` | ❌ Twilio | Handle WhatsApp incoming audio |
| POST | `/cron/daily-sr` | `x-cron-secret` | SR dispatch + inactivity nudges |
| GET | `/profile` | ✅ JWT | Get user profile (KV) |
| PUT | `/profile` | ✅ JWT | Update profile (whitelisted fields only) |
| POST | `/prepare-session` | ✅ JWT | Create practice session |
| POST | `/process-turn` | ✅ JWT | Conversation turn (GPT-4o) |
| POST | `/analyze-feedback` | ✅ JWT | Post-session analysis (Gemini) |
| POST | `/tts` | ✅ JWT | Text-to-speech |
| POST | `/transcribe` | ✅ JWT | Speech-to-text (Azure) |
| POST | `/pronunciation-assess` | ✅ JWT | Pronunciation scoring |
| GET | `/progression` | ✅ JWT | User progression state (auto-unlocks if subscribed) |
| GET | `/admin/users` | ✅ Admin | List all users |
| GET | `/admin/kpis` | ✅ Admin | Platform KPIs |
| GET | `/admin/api-usage` | ✅ Admin | API cost tracking |

### §10.2 Security

| Endpoint group | Auth mechanism |
|----------------|---------------|
| All authenticated routes | Supabase JWT via `Authorization: Bearer` |
| Admin routes | JWT + email in `ADMIN_EMAILS` env var |
| `/webhook/stripe` | Stripe HMAC signature (`constructEventAsync`) |
| `/cron/daily-sr` | `x-cron-secret` header |
| `/pricing`, `/health` | Public (no auth) |

### §10.3 Environment Variables

**Frontend (Vercel):**
| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_SENTRY_DSN` | Sentry error monitoring DSN |

**Backend (Supabase Secrets):**
| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe live secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_PRICE_EARLY_BIRD` | `price_1TR1YXQhSs1CWakEaoaqW0y7` |
| `STRIPE_PRICE_MONTHLY` | `price_1TR1abQhSs1CWakEClg1lG0D` |
| `STRIPE_PRICE_QUARTERLY` | `price_1TR1b9QhSs1CWakEd0CGOhM4` |
| `OPENAI_API_KEY` | GPT-4o access |
| `GEMINI_API_KEY` | Gemini Flash (feedback) |
| `AZURE_SPEECH_KEY` | Azure Speech (STT + pronunciation) |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS |
| `RESEND_API_KEY` | Transactional email |
| `TWILIO_ACCOUNT_SID` | Twilio WhatsApp |
| `TWILIO_AUTH_TOKEN` | Twilio WhatsApp |
| `TWILIO_PHONE_NUMBER` | WhatsApp sender number |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `CRON_SECRET` | Shared secret for pg_cron endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (auto-injected by Supabase) |

---

## §11 — Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 + Vite 6 |
| Architecture | Feature-Sliced Design (FSD): app→pages→widgets→features→entities→shared |
| Animations | `motion/react` |
| Backend | Supabase Edge Functions (Deno + Hono) |
| Scheduler | Supabase `pg_cron` (daily 9AM) |
| Database | Supabase PostgreSQL + KV store (`kv_store_4e8a5b39`) |
| Chat AI | GPT-4o (all sessions, no degradation) |
| Feedback AI | Gemini 1.5 Flash |
| TTS | ElevenLabs (practice) + Azure Neural (system) |
| STT + Pronunciation | Azure Speech REST API |
| Payments | Stripe (live mode, subscriptions) |
| Email | Resend |
| Error Monitoring | Sentry (`@sentry/react`, `VITE_SENTRY_DSN`) |
| Hosting | Vercel (frontend, auto-deploy on push to main) |
| Routing | Hash-based (`#dashboard`, `#practice-session`, etc.) |
| Package manager | pnpm |

---

## §12 — Spec Governance

### How to use this spec

1. **Before ANY code change:** Check consistency with this spec
2. **If spec needs updating:** Propose change → get approval → THEN code
3. **New features:** Add section here FIRST → approve → implement
4. **Conflicts:** This spec is the source of truth

### Spec Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2026-04-17 | Initial spec |
| v1.1 | 2026-04-20 | Landing page v4, §6 restructured |
| v1.2 | 2026-04-21 | Self-intro warm-up §7.4, Path Recommendation §7.5 |
| v2.0 | 2026-04-28 | Full rewrite: 3-tier pricing (Early Bird/Monthly/Quarterly), live Stripe payments, webhook architecture (checkout.session.completed primary), celebration modal, Manage Subscription via Stripe Portal, full email system (5 templates), FSD violations fixed, Sentry monitoring, admin auth, security audit resolved |
| v2.1 | 2026-04-28 | §2: added `culture` as 4th active scenario (U.S. Business Culture Mastery Path, default recommended path post warm-up). §3.2, §8 updated accordingly. |
| v2.2 | 2026-04-28 | §2: added `sales` as 5th active scenario (Sales Champion path). Removed from Retired. §3.2, §8 updated. |
