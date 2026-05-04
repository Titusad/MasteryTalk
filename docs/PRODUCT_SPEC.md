# MasteryTalk PRO — Product Specification v2.0

> **Source of Truth.** This document is the formal spec for the entire product.
> Any code change MUST be consistent with this spec.
> If the spec needs to change, update THIS FILE FIRST → get approval → then code.
>
> Last updated: 2026-05-03 (v2.9 — Program model adopted: 3-month program framing, progressive path unlocking, War Room as urgency valve, new pricing structure)

---

## §1 — Product Identity

| Key            | Value                                                          |
| -------------- | -------------------------------------------------------------- |
| Name           | MasteryTalk PRO                                                |
| Domain         | masterytalk.pro                                                |
| Tagline        | Professional English Communication Coaching                    |
| Target         | Nearshoring professionals worldwide; commercial focus on Colombia, Mexico, Brazil and LATAM |
| Core Loop      | Learn → Practice → Feedback → Improve → Repeat                                       |
| Business Model | 3-month program subscription (Founding Member / Program / Monthly access)             |

---

## §2 — Active Scenarios

> **RULE:** Only these scenarios are visible and active. No others.

| ID             | Label (EN)                  | Label (ES)                 | Status           |
| -------------- | --------------------------- | -------------------------- | ---------------- |
| `interview`    | Job Interview               | Entrevista de trabajo      | ✅ Active        |
| `meeting`      | Remote Meetings             | Reuniones remotas          | ✅ Active        |
| `presentation` | Presentations               | Presentaciones             | ✅ Active        |
| `sales`        | Sales Champion              | Ventas B2B                 | ✅ Active        |
| `culture`      | U.S. Business Culture       | Cultura empresarial EE.UU. | ✅ Active        |
| `self-intro`   | Self-Introduction (Warm-Up) | Auto-presentación          | ✅ Active (Free) |

```typescript
// Canonical type — src/entities/session/index.ts
type ScenarioType =
    | "interview"
    | "meeting"
    | "presentation"
    | "sales"
    | "culture"
    | "self-intro";
```

> `self-intro` is NOT a purchasable Learning Path — it is a free warm-up accessible to all users.
> `culture` is the **default recommended path** after self-intro warm-up for all users.

### Retired Scenarios

- `client`, `csuite` — future expansion

---

## §3 — Pricing Model

### §3.1 Tier Structure

> ⚠️ Pending Stripe update — price IDs below are previous values. New products must be created before launch.

| Tier                    | Price       | Billing   | Notes                                         | Stripe Price ID (pending)        |
| ----------------------- | ----------- | --------- | --------------------------------------------- | -------------------------------- |
| **Founding Member**     | $49/3mo     | Quarterly | Max 25 slots shared, auto-applied, ≈$16.33/mo | TBD                              |
| **Program** (regular)   | $129/3mo    | Quarterly | Hero offer — one full program cycle           | TBD                              |
| **Monthly access**      | $29/mo      | Monthly   | Entry offer — for users who can't commit 3mo  | TBD                              |

> Founding Member slots (25 total) tracked in KV: `global:early_bird_count`. When exhausted, checkout automatically switches to Program price — no user action required.
> Previous Early Bird prices ($12.99/$29.99) are retired.

### §3.2 What a subscription unlocks

- **Immediately on subscribe:** Business Culture path (Foundation Program, all 6 levels) + War Room (5 sessions/month)
- **Progressively as you advance:** remaining paths unlock based on progression in Business Culture (see §8)
- AI coaching and detailed feedback on every session
- WhatsApp Spaced Repetition Coach (daily audio challenges)
- Spaced repetition system
- Lessons Library (50 micro-lessons, dual-axis recommendations)

### §3.3 Program Model

MasteryTalk is sold as a structured **3-month program**, not an open-ended subscription. The subscription is the billing mechanism; the program is the experience.

**The arc:**

| Block | Duration | Content | Trigger |
|-------|----------|---------|---------|
| Foundation Program | Months 1–3 | Business Culture (6 levels) | Starts on subscribe |
| Advanced Program | Months 4–6 | Primary scenario path (chosen by user) | Unlocked after completing Business Culture L2 |
| Mastery Program | Months 7–9 | Remaining paths + cross-path practice | Unlocked progressively (see §8) |

**War Room as urgency valve:**
War Room (5 sessions/month) unlocks **any scenario immediately** on subscribe — regardless of program phase. This is the release valve for urgent needs (interview in 3 days, presentation tomorrow). It does not replace the program; it complements it.

**After 90 days:**
The subscription renews into the next program block automatically. Dashboard shows "Día X de 90" and surfaces the next path unlock as a milestone. There is no "program finished" exit — there is always a next level or path to unlock.

### §3.4 Early Bird / Founding Member rules

- Maximum **25 slots** globally (tracked in KV: `global:early_bird_count`)
- Counter increments when checkout uses Founding Member price ID
- Counter decrements on `customer.subscription.deleted` for Founding Member subscribers
- `/pricing` endpoint returns live `slotsLeft`, `currentPrice`, `regularPrice`
- Founding Member pricing is **automatic** — user selects the program, backend picks FM price if slots remain

### §3.5 Pricing rationale

| Metric                | Monthly    | Founding Member | Program (regular) |
| --------------------- | :--------: | :-------------: | :---------------: |
| Price                 | $29/mo     | $49/3mo ($16.3/mo) | $129/3mo ($43/mo) |
| Cost/user (15 ses/mo) | $4.03      | $4.03           | $4.03             |
| Gross margin          | 86%        | 75%             | 91%               |
| Positioning           | Entry      | Founding access | Hero offer        |

Benchmark: Talaera charges $20/mo for live sessions with human coaches. MasteryTalk at $43/mo (program) offers AI practice 24/7 with structured progression — 2× the price, 10× the accessibility, measurable outcomes.

### §3.6 What does NOT exist

- ❌ One-time purchases
- ❌ Pay-per-session credits
- ❌ Trial periods with card
- ❌ Annual plan (pending retention data)
- ❌ All-paths-at-once unlock on subscribe (replaced by progressive model)
- ❌ Previous prices: $12.99, $19.99, $29.99 EB, $47.99

### §3.3 Early Bird rules

- Maximum **25 slots** globally (tracked in KV: `global:early_bird_count`)
- Counter increments when checkout uses an early bird price ID (monthly or quarterly EB)
- Counter decrements on `customer.subscription.deleted` for early bird subscribers
- `/pricing` endpoint returns live `slotsLeft`, `currentPrice`, `regularPrice` per tier
- Early bird pricing is **automatic** — user selects "Monthly" or "Quarterly", backend picks the EB price if slots remain
- No separate "Early Bird" tier selection in the UI

### §3.4 Pricing rationale

| Metric                | Monthly EB |  Monthly  |     Quarterly EB      |       Quarterly        |
| --------------------- | :--------: | :-------: | :-------------------: | :--------------------: |
| Price                 | $12.99/mo  | $19.99/mo | $29.99/3mo ($9.99/mo) | $47.99/3mo ($15.99/mo) |
| Cost/user (15 ses/mo) |   $4.03    |   $4.03   |         $4.03         |         $4.03          |
| Gross margin          |    69%     |    80%    |          60%          |          75%           |
| LTV (5 mo avg)        |    ~$65    |   ~$100   |         ~$90          |         ~$120          |
| Target CAC (3:1)      |    <$22    |   <$33    |         <$30          |          <$40          |

Benchmark: Talaera charges $20/mo for live sessions with human coaches. MasteryTalk at $19.99 offers AI practice 24/7 with no scheduling — same price, more accessibility.

Annual tier: deferred until 6-month retention data is available.

### §3.5 What does NOT exist

- ❌ One-time purchases
- ❌ Pay-per-session credits
- ❌ Trial periods
- ❌ Free tier with path access (only self-intro warm-up is free)
- ❌ Annual plan (pending retention data)

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
    paths_purchased: string[]; // ["interview","meeting","presentation","self-intro"]
    subscription_start_date: string | null;
    next_billing_date: string | null;
    grace_period_until: string | null; // 2-day grace on payment failure
    lastNudgeSentAt: string | null; // inactivity nudge throttle
    free_sessions_used: string[];
    monthly_sessions_used: number;
    stats: {
        sessions_count?: number;
        lastFeedbackAt?: string;
        pillarScores?: Record<string, number>;
        professionalProficiency?: number;
    };
    // WhatsApp SR Coach
    wa_preferred_hour: number | null; // 7 | 12 | 18 — user's preferred send hour (local TZ)
    wa_timezone: string | null; // IANA timezone, auto-detected from browser
    wa_phrases_mastered: number; // increments when WA score ≥ 80
    wa_dismissed_at_session_count: number | null; // sessions_count at time of first dismiss
    wa_card_permanently_dismissed: boolean; // true after second dismiss
    // Mastery Audit
    profession: string | null; // "product_designer" | "software_engineer" | etc.
    audit_booked_at: string | null; // ISO timestamp of last audit booking (30-day cooldown)
    // War Room monthly limit
    war_room_monthly_count: number; // sessions used in current calendar month
    war_room_month: string | null; // "YYYY-MM" — auto-reset when month changes
}
```

### §4.2 Subscription lifecycle

| Event                                                           | Action                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------------- |
| `checkout.session.completed` (payment_status=paid)              | Activate subscription, set tier, unlock paths, send welcome email |
| `customer.subscription.updated` (status=active)                 | Sync status, reset monthly sessions on new cycle                  |
| `customer.subscription.deleted`                                 | Revoke access (respect 2-day grace period)                        |
| `invoice.payment_succeeded` (billing_reason=subscription_cycle) | Renew access, send renewal email                                  |
| `invoice.payment_failed`                                        | Set 2-day grace period, keep access temporarily                   |

### §4.3 Access rules

| Condition                                                   | Access                         |
| ----------------------------------------------------------- | ------------------------------ |
| `subscription_active === true`                              | All paths and levels unlocked  |
| `subscription_active === false`, `grace_period_until > now` | Access maintained during grace |
| `subscription_active === false`                             | Free tier only (self-intro)    |

### §4.4 Progression unlock

Progressive unlocking — `GET /progression` applies the following rules:

| Condition | Access granted |
| --------- | -------------- |
| `subscription_active === true` (any tier) | Business Culture — all 6 levels |
| Business Culture Level 2 completed | Interview Mastery unlocked |
| Business Culture Level 3 completed | Remote Meeting Presence unlocked |
| Business Culture Level 4 completed | Presentations unlocked |
| Business Culture Level 5 completed | Sales Champion unlocked |

War Room is available immediately on subscribe regardless of path progression.

> ⚠️ Pending backend implementation — current code auto-unlocks all paths on subscribe. Must be updated before launch (see ROADMAP §0.3).

---

## §5 — Conversion Funnel

### §5.1 Customer Journeys

```
Journey A: Landing → Auth → Self-Intro Demo → Feedback → Subscription CTA → Stripe → Dashboard
Journey B: Dashboard (locked path click) → Pricing Modal → Stripe → Dashboard + Confetti Modal
Journey C: Account page → Manage Subscription → Stripe Customer Portal
```

### §5.2 Pricing Modal entry points

| Entry Point                                  | Trigger                                 |
| -------------------------------------------- | --------------------------------------- |
| Locked path/level clicked in ProgressionTree | `onLockedClick` → `setUpsellOpen(true)` |
| Dashboard upsell button                      | `setUpsellOpen(true)`                   |
| Post-session paywall                         | `handlePaywallTriggered`                |
| Landing pricing CTA                          | `onPricingPurchase()`                   |

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
// Body: { tier: "monthly" | "quarterly" }
// Returns: { checkoutUrl, checkoutId, tier, isEarlyBird, slotsLeft }
// Note: "early_bird" is no longer a user-selectable tier.
// Backend auto-applies EB price if global:early_bird_count < 25.
```

| Setting                      | Value                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `mode`                       | `"subscription"`                                                                   |
| `success_url`                | `{origin}/#dashboard?payment=success&tier={tier}&session_id={CHECKOUT_SESSION_ID}` |
| `cancel_url`                 | `{origin}/#dashboard?payment=cancelled`                                            |
| `subscription_data.metadata` | `{ userId, tier }`                                                                 |

### §5.5 Webhook Contract

**Endpoint:** `POST /make-server-08b8658d/webhook/stripe`
**Auth:** None — validated via Stripe HMAC (`constructEventAsync` for Deno)
**Deploy flag:** `--no-verify-jwt`

| Event                           | Action                                                               |
| ------------------------------- | -------------------------------------------------------------------- |
| `checkout.session.completed`    | **Primary activation** — activates subscription, sends welcome email |
| `customer.subscription.created` | Save stripe IDs only (status may be `incomplete`)                    |
| `customer.subscription.updated` | Sync tier/status                                                     |
| `customer.subscription.deleted` | Revoke access (check grace period first)                             |
| `invoice.payment_succeeded`     | Renew access for recurring billing, send renewal email               |
| `invoice.payment_failed`        | Set 2-day grace period                                               |

### §5.6 Manage Subscription

- `POST /create-portal-session` → creates Stripe Billing Portal session
- Returns `{ url }` → frontend redirects to Stripe portal
- From portal: cancel, update payment method, view invoices
- Return URL: `{origin}/#account`

---

## §6 — Landing Page

### §6.1 Section Structure (v4)

| #   | Section           | Key Elements                                          |
| --- | ----------------- | ----------------------------------------------------- |
| 1   | Hero              | Badge, headline, subheadline                          |
| 2   | Practice Widget   | 3 scenario cards + microcopy                          |
| 3   | How It Works      | 3-step tabs with mockups                              |
| 4   | Diferenciadores   | 4 numbered cards                                      |
| 5   | ¿Es para ti?      | Yes/No column lists                                   |
| 6   | Before & After    | 2-column comparison                                   |
| 7   | Session Takeaways | 3 metric cards                                        |
| 8   | Rutas disponibles | 3 path cards                                          |
| 9   | Pricing           | 2 tier cards (Monthly, Quarterly) with launch pricing |
| 10  | FAQ               | 5 accordion items                                     |
| 11  | Final CTA         | Headline + single button                              |

### §6.2 Pricing Section

2 tier cards (Monthly / Quarterly) shown via `PathPurchaseModal`.
Launch prices ($12.99 / $29.99) applied automatically when slots remain — fetched live from `/pricing` endpoint.
When 25 slots exhausted, regular prices ($19.99 / $47.99) shown seamlessly.
All copy via `landing-i18n.ts` (ES / PT / EN).

### §6.3 Supported Languages

| Code | Landing | Dashboard |
| ---- | ------- | --------- |
| `es` | ✅ Full | ✅ Full   |
| `pt` | ✅ Full | ✅ Full   |
| `en` | ✅ Full | ✅ Full   |

---

## §7 — Session Flow

### §7.1 Steps (ordered)

```typescript
type Step =
    | "experience" // Professional background
    | "context" // Situation-specific context (JD, presets, agenda)
    | "strategy" // Methodology & framework preview
    | "interlocutor-intro" // Immersive interlocutor intro (interview only)
    | "generating" // Dynamic loader (script generation)
    | "practice-prep" // Interactive briefing before practice
    | "practice" // Voice practice with AI
    | "analyzing" // Dynamic loader (post-practice analysis)
    | "feedback" // Results & performance analysis
    | "upsell"; // Subscription CTA
```

### §7.1.1 FeedbackScreen — post-session cards (bottom slot)

The FeedbackScreen renders additional cards below the progression gate, in this order:

1. **WhatsApp SR Coach card** — visible when `!whatsapp_verified && !wa_card_permanently_dismissed`
   and (`wa_dismissed_at_session_count === null` OR `sessions_since_dismiss >= 3`).
    - First dismiss → cooldown of 3 sessions (`wa_dismissed_at_session_count`)
    - Second dismiss → `wa_card_permanently_dismissed = true` (never shows again)
    - After OTP verification: time preference step (Morning 7AM / Midday 12PM / Evening 6PM)
    - Saves `wa_preferred_hour` + `wa_timezone` (auto-detected) to KV

2. **Path Recommendation card** — visible only for `scenarioType === "self-intro"` with feedback data

3. **Mastery Audit card** — visible when ALL of:
    - `profession === "product_designer"` (Fase 1 only)
    - ≥ 3 Interview sessions in the last 14 days
    - No audit booked in the last 30 days (`audit_booked_at`)

4. **DeepDiveCard** — visible when feedback has `pillarScores` with ≥ 1 weak pillar (score < 70).
    - Shows top 3 recommended micro-lessons matched to the session's weak pillars and path/level context (dual-axis).
    - Each lesson links to the `LessonModal` (supports optional `audioUrl` player with play/pause).
    - Data source: `getRecommendedLessons(pillarScores, pathId, levelId)` from `src/services/microLessonsData.ts`.

### §7.2 Situation Presets (ContextScreen)

Each scenario has 3 presets describing the situation (company, stakes, context) without assuming the user's role. Presets inject `{ situationContext }` into the session prompt via `processGuidedFields()`.

### §7.3 Arena System (Progressive Scaffolding)

| Phase     | AI Tone                    | UI Support                              | Transition           |
| --------- | -------------------------- | --------------------------------------- | -------------------- |
| Support   | Friendly, patient          | Power Phrases visible, Try Saying hints | 2+ good interactions |
| Guidance  | Neutral, professional      | Reduced hints                           | 2+ good interactions |
| Challenge | Confrontational, demanding | No visible help                         | End of conversation  |

### §7.4 Self-Introduction Warm-Up

**Flow:**

```
Intro Screen → Context Selection → Strategy → Conversation → Feedback → Path Recommendation
```

| Context      | Label             | Data location                       |
| ------------ | ----------------- | ----------------------------------- |
| `networking` | Networking Event  | `shared/lib/self-intro-contexts.ts` |
| `team`       | Team Introduction | `shared/lib/self-intro-contexts.ts` |
| `client`     | Client Meeting    | `shared/lib/self-intro-contexts.ts` |

- Always free, no paywall
- `scenarioType = "self-intro"` — excluded from `PathId`

### §7.5 Path Recommendation Engine (Post Warm-Up)

Pure function in `features/dashboard/model/path-recommendation.ts`.
Maps `pillarScores + selfIntroContext + profile` → `PathRecommendation`.
Type `PathRecommendation` lives in `entities/progression`.

### §7.6 Lessons Library (Micro-Lessons)

**Data:** `src/services/microLessonsData.ts`
**Interface:**

```typescript
interface MicroLesson {
    id: string;
    title: string;
    pillar: string; // maps to feedback pillar key
    pathIds?: PathId[]; // if set, lesson is axis-2 relevant for these paths
    levelIds?: string[]; // if set, lesson is axis-2 relevant for these levels
    audioUrl?: string; // optional R2/Supabase URL — enables play/pause in LessonModal
    // ... existing fields (content, vocabulary, phrases, etc.)
}
```

**Size:** 50 lessons (expanded from 24).

**Recommendation engine — `getRecommendedLessons(pillarScores, pathId?, levelId?)`:**

- Axis 1 (weakness): filter lessons whose `pillar` maps to a score < 70, sort ascending by score
- Axis 2 (context): boost lessons that match `pathIds` / `levelIds` of the current session
- Returns top N lessons combining both axes (context-matched weak lessons first)

**UI surfaces:**

- `DeepDiveCard` — shown in FeedbackScreen bottomSlot (post-session, §7.1.1 item 4)
- `RecommendedLessonsCard` — shown in Dashboard for catch-up between sessions
- `LessonModal` — existing modal; updated to render audio player (play/pause) when `audioUrl` is present

**Nav label:** "Lessons Library" (renamed from "Library") — applies to nav item and page title.

### §7.7 War Room — Urgency Valve

War Room is the **urgency release valve** of the program model. It allows any subscribed user to practice any scenario immediately — regardless of which paths are currently unlocked in their program progression.

**Strategic role:** A user in month 1 of their Foundation Program (Business Culture) may have an urgent job interview. War Room lets them practice Interview Mastery scenarios right now, without waiting to unlock that path through program progression. This resolves the tension between structured learning and immediate needs.

The "War Room" practice mode is rate-limited to **5 sessions per calendar month** per user.

**Frontend:** Dashboard "War Room" button displays "X/5 this month" counter. Disabled when limit reached with tooltip "Limit reached — resets on the 1st".

**Backend tracking (KV profile fields):**

```typescript
war_room_monthly_count: number; // sessions used this calendar month
war_room_month: string; // "YYYY-MM" — resets counter on month change
```

**`POST /sessions` payload:** `PracticeSessionPage` sends `is_war_room: true` when `startAtContext === true`.
**`routes/sessions.ts`:** On save, if `is_war_room === true`, increment `war_room_monthly_count` (auto-reset if `war_room_month` !== current month).

---

## §8 — Learning Path Structure

6 paths defined, 5 visible in UI (Interview Mastery, Remote Meeting Presence, Presentations, Sales Champion, U.S. Business Culture).

Each path has **6 levels**.

### §8.1 Default state

| User state | Path access |
| ---------- | ----------- |
| Free (no subscription) | Self-intro only (3 sessions) |
| Subscribed | Business Culture (all 6 levels) + War Room |
| BC Level 2 complete | + Interview Mastery |
| BC Level 3 complete | + Remote Meeting Presence |
| BC Level 4 complete | + Presentations |
| BC Level 5 complete | + Sales Champion |

Within each unlocked path: Level 1 open, Levels 2–6 unlock sequentially on level completion.

### §8.2 Sequential level progression

- Complete current level → next level unlocks
- `GET /progression` persists state per user in KV: `progression:{userId}`
- Skill Drill completion is the trigger for level unlock within a path

### §8.3 Locked path UI

Locked paths show in the ProgressionTree with:
- Lock icon + unlock condition ("Complete Business Culture Level 3 to unlock")
- Preview of path name and description (not blurred — visible to motivate)
- No CTA to purchase — unlocking is earned through progression, not paid

---

## §9 — Email System

### §9.0 Transaccionales — Resend

Provider: **Resend** (`hello@masterytalk.pro`, domain verified)
Secret: `RESEND_API_KEY` in Supabase secrets + `supabase/.env.local`

| Email                  | Trigger                                                         | Template                                                                                                |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Welcome                | New user profile created                                        | `welcomeEmailHtml()`                                                                                    |
| Subscription confirmed | `checkout.session.completed`                                    | `subscriptionConfirmationEmailHtml()`                                                                   |
| Session summary        | Post-session feedback                                           | `sessionSummaryEmailHtml()`                                                                             |
| Renewal confirmed      | `invoice.payment_succeeded` (billing_reason=subscription_cycle) | `renewalConfirmationEmailHtml()` — two branches: ROI format (sessions > 0) or Reactivation (0 sessions) |
| Inactivity nudge       | Cron: 7+ days without session, max 1 per 14 days                | `inactivityNudgeEmailHtml()`                                                                            |

### §9.1 Marketing Automation — Loops.so (Planned — ROADMAP 3.1.3)

Provider: **Loops.so** (`mail.go.masterytalk.pro`, subdominio separado)
Secret: `LOOPS_API_KEY` in Supabase secrets

**Arquitectura de separación:**

| Canal         | Dominio                   | Proveedor | Tipo                  |
| ------------- | ------------------------- | --------- | --------------------- |
| Transaccional | `hello@masterytalk.pro`   | Resend    | Auth, pagos, sesiones |
| Marketing     | `mail.go.masterytalk.pro` | Loops     | Nurturing, lifecycle  |

Los subdominios separados protegen la reputación de entrega — un problema de spam en marketing no afecta los transaccionales.

**Integración técnica:**

- Loops se conecta a Supabase vía OAuth nativo → `auth.users` INSERT crea contacto automáticamente (sin código)
- Eventos de negocio disparados server-side desde Edge Functions vía `POST /marketing/track`
- El frontend nunca llama a Loops directamente (API key solo en Supabase secrets)

**Eventos de negocio rastreados:**

| Evento                    | Disparado desde      | Trigger                                                 |
| ------------------------- | -------------------- | ------------------------------------------------------- |
| `first_session_completed` | `routes/sessions.ts` | Primera sesión guardada (session_index tiene 1 entrada) |
| `session_milestone_3`     | `routes/sessions.ts` | 3 sesiones completadas                                  |
| `session_milestone_10`    | `routes/sessions.ts` | 10 sesiones completadas                                 |
| `subscription_purchased`  | `routes/webhook.ts`  | `checkout.session.completed` webhook                    |

**Secuencias de nurturing (construidas en Loops dashboard):**

| #   | Trigger                                         | Delay     | Objetivo                                       |
| --- | ----------------------------------------------- | --------- | ---------------------------------------------- |
| 1   | contact_created                                 | D+2       | Activación — "¿Completaste tu primera sesión?" |
| 2   | contact_created                                 | D+5       | Conversión — social proof + CTA suscripción    |
| 3   | contact_created (sin `first_session_completed`) | D+7       | Re-activación — objeción "no tengo tiempo"     |
| 4   | `first_session_completed`                       | inmediato | Up-sell post-sesión — "¿Qué sigue?"            |
| 5   | contact_created (sin `subscription_purchased`)  | D+21      | Urgencia — Early Bird últimos cupos            |

Todas las secuencias tienen branch por `language` (es / pt / en) para las 3 versiones de copy.
El welcome D+0 lo sigue haciendo Resend. Loops arranca desde D+2.
Base legal: `terms_accepted_at` (aceptación de ToS en signup). Loops añade unsubscribe link automáticamente.

---

## §10 — Service Contracts

### §10.1 Backend API Surface

| Method | Route                       | Auth            | Description                                           |
| ------ | --------------------------- | --------------- | ----------------------------------------------------- |
| POST   | `/create-checkout`          | ✅ JWT          | Create Stripe checkout for subscription               |
| POST   | `/create-portal-session`    | ✅ JWT          | Create Stripe Customer Portal session                 |
| GET    | `/pricing`                  | ❌ Public       | Live Early Bird slot count                            |
| POST   | `/webhook/stripe`           | ❌ Stripe HMAC  | Handle subscription state webhooks                    |
| POST   | `/webhook/twilio`           | ❌ Twilio       | Handle WhatsApp incoming audio                        |
| POST   | `/cron/daily-sr`            | `x-cron-secret` | SR dispatch + inactivity nudges                       |
| GET    | `/profile`                  | ✅ JWT          | Get user profile (KV)                                 |
| PUT    | `/profile`                  | ✅ JWT          | Update profile (whitelisted fields only)              |
| POST   | `/prepare-session`          | ✅ JWT          | Create practice session                               |
| POST   | `/process-turn`             | ✅ JWT          | Conversation turn (GPT-4o)                            |
| POST   | `/analyze-feedback`         | ✅ JWT          | Post-session analysis (Gemini)                        |
| POST   | `/tts`                      | ✅ JWT          | Text-to-speech                                        |
| POST   | `/transcribe`               | ✅ JWT          | Speech-to-text (Azure)                                |
| POST   | `/pronunciation-assess`     | ✅ JWT          | Pronunciation scoring                                 |
| GET    | `/progression`              | ✅ JWT          | User progression state (auto-unlocks if subscribed)   |
| POST   | `/marketing/track`          | ✅ JWT          | Proxy evento de negocio a Loops (planned — 3.1.3)     |
| POST   | `/marketing/contact/update` | ✅ JWT          | Enriquecer propiedades de contacto en Loops (planned) |
| GET    | `/admin/users`              | ✅ Admin        | List all users                                        |
| GET    | `/admin/kpis`               | ✅ Admin        | Platform KPIs                                         |
| GET    | `/admin/api-usage`          | ✅ Admin        | API cost tracking                                     |

### §10.1.1 PUT /profile — Whitelisted fields

Fields the user can update via `PUT /profile` (backend enforced whitelist):

```
industry, position, seniority, role, company, keyExperience, cvSummary,
cvFileName, cvConsentGiven, deckSummary, deckFileName, lastJobDescription,
narrationCompleted, sessionMode, activeGoal, market_focus,
whatsapp_number, whatsapp_verified,
wa_preferred_hour, wa_timezone,
wa_dismissed_at_session_count, wa_card_permanently_dismissed,
profession, audit_booked_at,
war_room_monthly_count, war_room_month
```

Non-whitelisted fields (plan, tier, subscription_active, etc.) can only be written by server-side Edge Functions.

### §10.2 Security

| Endpoint group           | Auth mechanism                                |
| ------------------------ | --------------------------------------------- |
| All authenticated routes | Supabase JWT via `Authorization: Bearer`      |
| Admin routes             | JWT + email in `ADMIN_EMAILS` env var         |
| `/webhook/stripe`        | Stripe HMAC signature (`constructEventAsync`) |
| `/cron/daily-sr`         | `x-cron-secret` header                        |
| `/pricing`, `/health`    | Public (no auth)                              |

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
| `STRIPE_PRICE_MONTHLY_EARLY` | `price_1TS7LTQhSs1CWakEw52C4aze` — $12.99/mo launch |
| `STRIPE_PRICE_QUARTERLY_EARLY` | `price_1TS7OKQhSs1CWakEX4XZ3aYD` — $29.99/3mo launch |
| `STRIPE_PRICE_MONTHLY` | `price_1TS7PuQhSs1CWakESriRaNKl` — $19.99/mo regular |
| `STRIPE_PRICE_QUARTERLY` | `price_1TS7S4QhSs1CWakE3gKaFvjk` — $47.99/3mo regular |
| `STRIPE_PRICE_EARLY_BIRD` | `price_1TR1YXQhSs1CWakEaoaqW0y7` — legacy, keep for backward compat |
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

## §10.4 — Mastery Audit Feature

> Decision: MasteryTalk is an app with a premium service. The Mastery Audit is a **feature**, not a product. Success is measured by its effect on retention, not by direct revenue.

### Eligibility (Fase 1 — product_designer vertical only)

A user sees the `MasteryAuditCard` in FeedbackScreen when ALL of:

1. `profile.profession === "product_designer"`
2. ≥ 3 sessions with `scenarioType === "interview"` in the last 14 days
3. `profile.audit_booked_at === null` OR `daysSince(audit_booked_at) > 30`

### Booking flow

1. User clicks "Book my session →" in `MasteryAuditCard` (Calendly link)
2. On click: `PUT /profile` sets `audit_booked_at = now()`
3. Card disappears for 30 days (cooldown)
4. Calendly handles scheduling (30 min / 90 min, Wednesdays 9AM–1PM only)
5. Payment via Stripe Payment Link (required before confirmation)

### Operational rules (non-negotiable)

- Product first: if tension between a session and Audit work, product wins
- Product design vertical only in Fase 1
- 4 hours/week max (Wednesday 9AM–1PM, 4 slots)
- Contextual placement only — not a generic upsell

### Phases

| Phase  | Sessions     | Objective                                             |
| ------ | ------------ | ----------------------------------------------------- |
| Fase 1 | 1–5 audits   | Validate format and price                             |
| Fase 2 | 10–15 audits | Measure retention effect; define coach rubric         |
| Fase 3 | 20–25 audits | Binary decision: Continue / Expand / Reformat / Close |

---

## §11 — Tech Stack

| Layer               | Technology                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend            | React 18 + TypeScript + Tailwind CSS v4 + Vite 6                                                                                                                               |
| Architecture        | Feature-Sliced Design (FSD): app→pages→widgets→features→entities→shared                                                                                                        |
| Animations          | `motion/react`                                                                                                                                                                 |
| Font                | Poppins (global via `body` in `theme.css`) + Montserrat (logo accent, `.font-montserrat` utility)                                                                              |
| Backend             | Supabase Edge Functions (Deno + Hono)                                                                                                                                          |
| Scheduler           | Supabase `pg_cron` (daily 9AM)                                                                                                                                                 |
| Database            | Supabase PostgreSQL + KV store (`kv_store_4e8a5b39`)                                                                                                                           |
| Chat AI             | GPT-4o (all sessions, no degradation)                                                                                                                                          |
| Feedback AI         | Gemini 1.5 Flash                                                                                                                                                               |
| TTS                 | OpenAI `gpt-4o-mini-tts` (dynamic: interlocutor, briefing, user lines — PRIMARY) + ElevenLabs (dynamic fallback + pre-generated coach narration on R2) + Azure Neural (system) |
| STT + Pronunciation | Azure Speech REST API                                                                                                                                                          |
| Payments            | Stripe (live mode, subscriptions)                                                                                                                                              |
| Email               | Resend                                                                                                                                                                         |
| Error Monitoring    | Sentry (`@sentry/react`, `VITE_SENTRY_DSN`)                                                                                                                                    |
| Hosting             | Vercel (frontend, auto-deploy on push to main)                                                                                                                                 |
| Routing             | Hash-based (`#dashboard`, `#practice-session`, etc.)                                                                                                                           |
| Package manager     | pnpm                                                                                                                                                                           |

---

## §12 — Spec Governance

### How to use this spec

1. **Before ANY code change:** Check consistency with this spec
2. **If spec needs updating:** Propose change → get approval → THEN code
3. **New features:** Add section here FIRST → approve → implement
4. **Conflicts:** This spec is the source of truth

### Spec Changelog

| Version | Date       | Changes                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | 2026-04-17 | Initial spec                                                                                                                                                                                                                                                                                                                                                                                                                        |
| v1.1    | 2026-04-20 | Landing page v4, §6 restructured                                                                                                                                                                                                                                                                                                                                                                                                    |
| v1.2    | 2026-04-21 | Self-intro warm-up §7.4, Path Recommendation §7.5                                                                                                                                                                                                                                                                                                                                                                                   |
| v2.0    | 2026-04-28 | Full rewrite: 3-tier pricing (Early Bird/Monthly/Quarterly), live Stripe payments, webhook architecture (checkout.session.completed primary), celebration modal, Manage Subscription via Stripe Portal, full email system (5 templates), FSD violations fixed, Sentry monitoring, admin auth, security audit resolved                                                                                                               |
| v2.1    | 2026-04-28 | §2: added `culture` as 4th active scenario (U.S. Business Culture Mastery Path, default recommended path post warm-up). §3.2, §8 updated accordingly.                                                                                                                                                                                                                                                                               |
| v2.2    | 2026-04-28 | §2: added `sales` as 5th active scenario (Sales Champion path). Removed from Retired. §3.2, §8 updated.                                                                                                                                                                                                                                                                                                                             |
| v2.3    | 2026-04-28 | §9: split en §9.0 Resend (transaccional) + §9.1 Loops.so (marketing automation, planned). §10.1: nuevos endpoints /marketing/\*.                                                                                                                                                                                                                                                                                                    |
| v2.4    | 2026-04-29 | §4.1: new KV fields (WA onboarding: wa_preferred_hour, wa_timezone, wa_phrases_mastered, wa_dismissed_at_session_count, wa_card_permanently_dismissed; Mastery Audit: profession, audit_booked_at). §7.1.1: FeedbackScreen post-session cards spec. §9.0: renewal email two-branch behavior. §10.1.1: PUT /profile whitelist documented. §10.4: Mastery Audit feature spec.                                                         |
| v2.5    | 2026-04-30 | §11: Font row added (Poppins global + Montserrat accent). No other spec changes — all 2026-04-30 work is implementation/UX (dashboard layout, font system, auth hardening, ProgressionTree redesign).                                                                                                                                                                                                                               |
| v2.6    | 2026-04-30 | §7.1.1: DeepDiveCard added as 4th post-session card. §7.6: Lessons Library spec (50 lessons, dual-axis engine, MicroLesson interface with pathIds/levelIds/audioUrl, UI surfaces). §7.7: War Room monthly limit spec (5/month, KV fields war_room_monthly_count + war_room_month). §4.1: new KV fields war_room_monthly_count + war_room_month. §10.1.1: whitelist updated. §11: TTS updated (OpenAI primary, ElevenLabs fallback). |
| v2.7    | 2026-04-30 | §3 full revision: launch pricing model (Monthly EB $12.99, Quarterly EB $29.99, Monthly $19.99, Quarterly $47.99); §3.4 pricing rationale + CAC/LTV targets + Talaera benchmark; Annual tier deferred.                                                                                                                                                                                                                              |
| v2.8    | 2026-05-01 | §3.1: ⚠️ warning removed (Stripe prices live, secrets updated). §3.3: early_bird no longer user-selectable — auto-applied by backend. §3.4: pricing rationale table updated with final prices. §5.4: checkout body updated. §6.1–6.2: 2-card pricing modal documented. §10.3: Stripe Price IDs updated (4 new + 1 legacy). §11: TTS voices updated (cedar + marin). §1: business model updated. All copy via i18n (ES/PT/EN).       |
