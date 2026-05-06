# MasteryTalk PRO — Roadmap

> **Last updated:** 2026-05-06 (Beta v14.7)
> **Spec reference:** [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md)
> **Rule:** New items go here FIRST → spec update if needed → then code.

---

## Current State (Beta v14.6 — 2026-05-04)

### ✅ What's Live

- **6 active scenarios:** interview, meeting, presentation, sales, culture, self-intro (free warm-up)
- **Stripe subscriptions live** — ⚠️ Old prices still active in Stripe ($12.99/$29.99 EB → $19.99/$47.99 regular). New prices confirmed ($59/3mo FM · $129/3mo Program · $49/mo Monthly) but Stripe products not yet created (see Phase 0.2)
- **Webhook fully operational** — checkout.session.completed as primary activation
- **Payment success flow** — celebration modal with confetti, redirect to dashboard
- **Subscription unlock** — all paths/levels unlock on any active subscription ⚠️ temporary; progressive model pending Phase 0.3
- **Manage Subscription** — Stripe Customer Portal from Account page
- Full practice flow: setup → briefing → conversation → feedback → skill drill
- Azure Speech pronunciation + ElevenLabs TTS
- Shadowing practice with phrase-by-phrase coaching
- 3-language landing page (ES/PT/EN)
- Admin Dashboard with API cost tracking (auth-protected via ADMIN_EMAILS)
- Spaced Repetition system + WhatsApp SR Coach (sandbox)
- Google Auth via Supabase
- **Transactional emails** — Resend: welcome, subscription confirmation, session summary, renewal, inactivity nudge
- **Error monitoring** — Sentry (`@sentry/react`, production only, ErrorBoundary integrated)
- **Security hardened** — admin auth, PUT /profile whitelist, CRON_SECRET
- **Font system** — Poppins global via `body` in `theme.css`; `.font-montserrat` utility; zero inline `fontFamily` in codebase
- **Dashboard 3-row layout** — WA banner → HeroCard → 4 widgets → (1/4 SideNav + 3/4 ProgressionTree); full `DashboardSkeleton` while loading
- **ProgressionTree redesign** — path title + description per path; level taglines; Lock icon + hint for locked levels
- **Self-intro first path** — `activeGoal: "self-intro"` default; all 3 si-\* levels unlocked from start; visible regardless of env flag
- **CrossPathCard** — real completion % from `progressionState` (not sessions proxy)
- **AccountPage** — full English, all profile fields editable (role, industry, seniority, key achievements, CV); saves to KV backend, not localStorage
- **Auth flow hardening** — `masterytalk_auth_loading` flag prevents OAuth flash to landing; `AuthLoadingScreen` branded component; `ProfileDropdown` extracted as proper React component (hooks fix)
- **AppHeader** — logo no longer navigates to landing from app interior
- **ElevenLabs turbo** — `eleven_turbo_v2_5` model (lower latency)
- **GPT-4o streaming** — `POST /process-turn-stream` SSE endpoint
- **Lessons Library** — 50 micro-lessons (expanded from 24); dual-axis recommendation (weakness + path/level context); `MicroLesson` interface with `pathIds`, `levelIds`, `audioUrl`; nav renamed "Lessons Library"
- **DeepDiveCard** — post-session card in FeedbackScreen bottomSlot showing top 3 recommended lessons matched to weak pillars + session context
- **RecommendedLessonsCard** — Dashboard catch-up card between sessions
- **LessonModal audio player** — play/pause support when lesson has `audioUrl`
- **TTS cost optimization** — OpenAI `gpt-4o-mini-tts` as primary for dynamic TTS (~20× cheaper: $0.09 vs $1.80/session); ElevenLabs as fallback for dynamic + pre-generated coach narration (R2, $0 per-user)
- **War Room monthly limit** — 5 sessions/month; counter displayed on Dashboard button; disabled at limit with "Limit reached — resets on the 1st"; backend tracks `war_room_monthly_count` + `war_room_month` in KV profile
- **Launch pricing modal** — 2-card `PathPurchaseModal` (Monthly + Quarterly); auto EB pricing from `/pricing` endpoint; strikethrough regular price + slots counter; all copy via i18n (ES/PT/EN)
- **TTS voices** — OpenAI `cedar` (interlocutor/coach) + `marin` (user lines) — recommended voices for quality
- **Security audit** — XSS, prompt injection, dead code removal + design system compliance (commit 722a58a)

- **Hints tap-to-reveal** — Try Saying hints collapsed by default; reveal on tap; suppressed in Challenge arena phase and Challenge Mode (`challengeMode` prop wired from PracticeSessionPage)
- **Scenario-aware turn limits** — `presentation` + `sales` max 10 turns; all others max 8 (min 4); enforced in `conversation.ts` + `templates.ts` via `getOutputFormatBlock(scenarioType)`
- **Prompt caching** — OpenAI automatic caching on system prompt from turn 2 onward (~30% GPT-4o cost reduction + lower latency)
- **Retention sprint (Beta v14.5):**
  - `SinceYouStartedCard` — Dashboard sidebar card showing pillar delta from first session to latest (requires ≥ 2 sessions with pillarScores)
  - `ScenarioDeltaCard` — FeedbackScreen bottomSlot card comparing current session vs. previous session of same scenarioType, per pillar; ghost bar shows previous score
  - `LevelMilestoneModal` — Confetti celebration modal on level completion (score ≥ 75); triggered automatically after `completeProgressionLevel`
  - `ChooseNextPathModal` — Updated: path completion celebration (confetti + Trophy) + LinkedIn share on full path completion; `PATH_LABELS` centralized in `progression-paths.ts`
  - `fetchSessions` TTL cache — 30-second module-level cache in `dashboard.supabase.ts`; eliminates redundant network call when `ScenarioDeltaCard` mounts on FeedbackScreen
  - `PILLAR_COLORS` consolidated — all new components import from `dashboard.constants.ts`
  - `COMMERCIAL_PITCH.md` — Full commercial document with EF EPI 2026 data, updated market numbers, arbitraje salarial table, source index

### ⚠️ Known Gaps

- ~~Stripe products not updated to new prices~~ — resolved: FM $59/3mo · Program $129/3mo · Monthly $49/mo live
- All paths unlock on subscribe — progressive model not yet implemented (Phase 0.3)
- Self-intro data not yet stored as intake assessment or wired to primary_path (Phase 0.7)
- WhatsApp in sandbox mode (requires Meta Business approval for production)
- Google OAuth consent screen still shows dev app name
- Stripe Customer Portal requires manual activation in Stripe Dashboard settings
- Email templates do not HTML-escape user-provided fields (`userName`, `strongerPhrase`) — pre-existing pattern; risk is low (data from OAuth/GPT-4o), fix should be applied consistently across all templates in a dedicated security sprint

---

## Phase 0 — Pre-launch Repositioning (Priority: BEFORE LAUNCH)

> **Goal:** Reframe MasteryTalk from a subscription service to a structured 3-month program before the first paying user arrives.
> Pre-launch = no price anchoring, no legacy users to protect — full margin of maneuver.
> Decision adopted 2026-05-03. See PRODUCT_SPEC §3.3 for full program model spec.

### 0.1 Program Model Definition ✅ (Documented — updated 2026-05-04)

- [x] Adopt "3-month program" framing (subscription as billing container, program as experience)
- [x] ~~Business Culture as Foundation Program — entry point for all subscribers~~ → **Revised:** Primary Path chosen by user from self-intro recommendation. BC is a peer path, not a mandatory gate. BC content woven into all paths via pre-session lessons (§7.9).
- [x] Progressive path unlocking — trigger is **full path completion** (all 6 levels), not level milestones. User chooses next path from remaining options (see PRODUCT_SPEC §4.4)
- [x] War Room repositioned as urgency valve — any scenario, immediately, 5/month
- [x] Post-90-days arc defined: Foundation (Primary Path) → Advanced (user's choice) → Mastery (remaining paths)
- [x] Document in PRODUCT_SPEC v3.3

### 0.2 Pricing Reframe

> **Goal:** Launch at program prices. New Stripe products required.

- [x] Validate final price points: **Founding Member $59/3mo (locked forever)** · **Program $129/3mo** · **Monthly $49/mo** — confirmed 2026-05-05 (raised from $49 to $59 to eliminate same-number confusion with monthly; $19.67/mo effective; saves $88 vs 3× monthly)
- [x] Update PRODUCT_SPEC §3.1 + §3.5 with confirmed prices (v3.0)
- [x] Create new Stripe products and price IDs (price_1TTODGQhSs1CWakE8LSJs9g6 · price_1TTODoQhSs1CWakEb8Cv7sHF · price_1TTOJSQhSs1CWakEQfC3ZDMw)
- [x] Update `STRIPE_PRICE_*` secrets in Supabase + `supabase/.env.local`
- [x] Update `/pricing` endpoint response shape if needed

### 0.3 Progressive Path Unlocking (Backend)

> **Goal:** Implement progressive path unlocking — one path at a time, user chooses next path after fully completing the current one.
> **Logic:** See PRODUCT_SPEC §4.4 — trigger is full path completion (all 6 levels), not level milestones. User picks next path from remaining locked options.

- [x] Add `primary_path` to KV profile — persisted from Stripe metadata on `checkout.session.completed`
- [x] Add `self_intro_pillar_scores`, `self_intro_context`, `self_intro_completed` to KV profile — stored in `/analyze-feedback` when `scenarioType === "self-intro"`
- [x] `GET /progression` — progressive unlock: only `primary_path` + `self-intro` + `unlocked_paths[]` unlocked. Legacy subscribers (no `primary_path`) get full access (grandfathered).
- [x] `POST /progression/unlock-path` — new endpoint: user picks next path after completing current one; adds to `unlocked_paths[]`, unlocks level 1, sets `activeGoal`
- [x] `progression:{userId}` KV schema: `unlocked_paths: string[]` added
- [x] `POST /create-checkout` + Stripe metadata — `primary_path` passed through checkout → webhook → KV profile
- [x] `self_intro_context` + `last_pre_session_lesson_id` added to `PUT /profile` whitelist
- [x] Dashboard: "Choose your next path" modal when current path fully completed (Phase 0.6 — frontend) ✅
- [x] Regression test: existing beta users → confirmed grandfathered (full access if no `primary_path`) — logic in `progression.ts` lines 39–41

### 0.4 Landing Page Reframe

> **Goal:** Lead with transformation outcome, not feature list.

- [x] New hero headline — "90 días para comunicarte con autoridad en inglés profesional" (ES/PT/EN)
- [x] New "El Programa" section — Foundation → Advanced → Mastery arc + War Room callout (ES/PT/EN)
- [x] Pricing section — program framing: "El Programa" hero card ($129/3mo · $59 FM), "Acceso mensual" secondary ($49/mo), correct features list
- [x] FAQ — fixed "¿Hay suscripción?" (was wrong: "no, compras una vez"), added "¿Qué pasa después de 90 días?", added War Room urgency question
- [x] `finalCta.badges` — fixed "Sin suscripción" badge (was incorrect)
- [x] `routes.subtitle` — fixed "compras una vez" (subscription model)
- [x] `landing-i18n.ts` — ES + PT + EN updated across all sections, `programa` key added to interface

### 0.5 Pricing Modal + Checkout Reframe

> **Goal:** "Únete al programa" not "elige un plan".

- [x] `PathPurchaseModal` — "El Programa" as hero card (quarterly, dark, selected by default), "Acceso mensual" as secondary
- [x] FALLBACK prices updated to $49/mo + $59/$129 quarterly (FM / regular)
- [x] Founding Member badge (⭐) on quarterly card when FM slots available; "Ahorra $18 vs mensual" when exhausted
- [x] Monthly card: no badge, `highlight: false`, never shows FM styling
- [x] Slots counter: Star icon (FM feel) replacing Flame (EB feel)
- [x] Modal copy from i18n: headline "Únete al Programa", CTA "Comenzar programa" (ES/PT/EN)

### 0.6 Dashboard — Program Arc UI

> **Goal:** User feels they're in a program, not using an app.

- [x] Day counter in HeroCard — "Day X of 90" pill; "Program starts today" on day 1; reads `subscription_start_date`
- [x] Locked path tabs — Lock icon + tooltip "Complete your current path to unlock"
- [x] Path complete banner — Trophy + "Choose next →" button when all 6 levels done
- [x] `ChooseNextPathModal` — lists remaining paths; calls `POST /progression/unlock-path`; refreshes state
- [x] `primaryPath` threaded: DashboardPage → PracticePathsModule → ProgressionTree

### 0.7 Self-Intro as Program Intake Assessment

> **Goal:** Connect self-intro data to the subscribe flow so Primary Path and personalization are active from day 1.
> **Spec:** PRODUCT_SPEC §7.10

- [x] After self-intro feedback: store `self_intro_pillar_scores`, `self_intro_context`, `self_intro_completed = true` to KV — `feedback.ts` lines 185–188
- [x] `PathRecommendationCard` CTA passes `recommended_path` as `primary_path` into checkout flow — `PracticeSessionPage.tsx` `selfIntroPrimaryPath` → `PathPurchaseModal`
- [x] `POST /create-checkout` body: accept `primary_path?: PathId` — `checkout.ts` line 31
- [x] `checkout.session.completed` webhook: read `primary_path` from metadata → persist to KV profile — `webhook.ts` lines 136–153
- [x] `GET /progression`: read `primary_path` from profile → unlock that path's 6 levels — `progression.ts` lines 36–58
- [x] **Acceptance:** User completes self-intro → recommended path shown → subscribes → dashboard shows only Primary Path unlocked + War Room

---

## Phase 1 — Beta Launch Checklist (Priority: NOW)

> **Goal:** Everything needed before inviting first paying users.

### 1.0 FSD Architecture Alignment (Full Migration) 🏗️

- [x] **Sprint 1 (`shared`):** Move `SessionProgressBar.tsx` to `widgets`, remove domain exports from `shared/ui/index.ts`, and ensure `shared` has zero dependencies on upper layers.
- [x] **Sprint 2 (`entities`):** Extract types and models from `app/services/types.ts` to `entities/`.
- [x] **Sprint 3 (`features`):** Move `app/features/*` to root `features/` directory (arena, practice-session, progression, etc).
- [x] **Sprint 4 (`widgets`):** Refactor `SessionReport`, `CreditUpsellModal`, and `InterviewBriefingScreen` to use new feature paths and ensure they compose correctly.
- [x] **Sprint 5 (`pages` & `app` completion):** Moved hooks (`useMediaRecorder`, `useUsageGating`, `useServiceCall`) to `shared/hooks/`, utils (`sessionCache`, `spacedRepetition`, `cheatSheetPdf`) to `shared/lib/`, updated 25+ import paths across features/widgets/pages, deleted backward-compat shim `app/components/shared/`. Zero cross-layer `@/app/` violations remain.

### 1.0.1 Recovery & UI Consolidation 🚨

> **Goal:** Fix critical regressions post-FSD and unify fragmented UI components before progressing.

- [x] **Hotfix:** Restore Practice Session Flow (Stepper missing, progression broken).
- [x] **Hotfix:** update PracticeSessionPage.tsx layout — unified navigation buttons (large CTA), standardized wrappers (`bg-[#f0f4f8]`, `max-w-[768px]`), aligned PreSessionBrief to design system.
- [x] **Cleanup:** Remove 5 legacy Step values (`conversation-feedback`, `skill-drill`, `cp-unlock`, `remedial`, `session-recap`) — replaced by unified `session-analysis`.
- [x] **Cleanup:** Rename `interview-analysis` → `session-analysis` (scenario-agnostic naming).
- [x] **Cleanup:** Delete `DevPreviewMenu.tsx` and all dev preview plumbing (props, state, handlers) from App.tsx and PracticeSessionPage.tsx.
- [x] **Component Inventory:** Audit and consolidate scattered Layouts — mapped full component tree (10 active steps documented).
- [x] **Component Inventory:** Consolidate 4+ Headers into a single polymorphic `AppHeader` (3 variants: `public`, `dashboard`, `session`). Persistent dashboard layout in App.tsx. Exit confirmation on Practice Session.
- [x] **Deep QA:** Automated verification — 12/12 tests pass (header variants, deleted files, no stale code, persistent layout, exit confirm).

### 1.1 UX Audit Fixes & Accessibility ♿

- [x] Fix color contrast issues
- [x] Add missing aria-labels to interactive elements
- [x] Resolve any TailwindCSS class conflicts
- [x] Clean up dead code and unused components across features

### 1.1.1 Design System Standardization (Emoji → Icon) ✅

> **Goal:** Remove all emoji usage from UI, replace with Lucide icons to ensure professional, consistent, language-agnostic interface.

- [x] Dashboard components: replaced emoji in stat pills, greeting, radar chart labels
- [x] Practice session: replaced emoji in feedback screens, skill drill, shadowing
- [x] Updated `DESIGN_SYSTEM.md` to ban emoji usage globally

### 1.2 Landing Page Overhaul ✅

- [x] Update copy to reflect current product positioning (MasteryTalk PRO, not inFluentia)
- [x] Restructure sections for clearer value proposition flow (v4: 11 sections, 3 new, 1 removed)
- [x] Ensure hero CTA → demo flow is frictionless (single "Probar gratis" CTA)
- [x] Verify pricing section consistency with PRODUCT_SPEC §6 (2 cards: Monthly / Quarterly, launch pricing auto-applied)
- [x] Fix SEO: Add OpenGraph metadata, Twitter Cards, and canonical links
- [x] Internal branding cleanup: `influentia_*` → `masterytalk_*` storage keys (8 keys + migration utility)
- [x] Bulk rename `inFluentia PRO` → `MasteryTalk PRO` in 25+ file headers and console logs
- [x] PRODUCT_SPEC v1.1 sync (§6, §7.1, §5.6)

### 1.2.1 Self-Introduction Warm-Up Session ✅

> **Goal:** Give new users a free, friction-free first practice experience before they hit the progression paywall.

- [x] Added `"self-intro"` to `ScenarioType` union (non-progression scenario)
- [x] Created `SelfIntroContextScreen.tsx` — 3 context chips: Networking, Team Intro, Client Meeting
- [x] Created `SELF_INTRO_CONTEXTS` data in `progression-paths.ts`
- [x] Integrated into `PracticeSessionPage.tsx` flow: intro → context selection → profile → conversation → feedback
- [x] Dashboard empty-state banner: "START HERE — Professional Self-Introduction" for users with 0 sessions
- [x] `PracticeDropdown` permanent "Self-Introduction" option (always visible, free)
- [x] Exported `PathId` type and fixed `ScenarioType` vs `PathId` type mismatch across 7 files
- [x] Fixed `totalSessions` bug — was counting fallback display items, now only counts real persisted sessions
- [x] Fixed viewport height — `min-h-screen` on PracticeSessionPage + DashboardPage so footer doesn't float

### 1.2.2 Path Recommendation Engine (Post Warm-Up) 🔄

> **Goal:** After warm-up completion, recommend a specific learning path based on the user's performance — a high-conversion moment.

- [x] Create `path-recommendation.ts` — pure function mapping `pillarScores` + `selfIntroContext` + `profile` → recommended `PathId` + personalized reason
- [x] Create `PathRecommendationCard.tsx` — renders inside Session Analysis step (educational tone, not sales modal)
- [x] Wire into `PracticeSessionPage.tsx` — only renders when `scenarioType === "self-intro"` and feedback is available
- [x] Persist recommendation in backend KV (`recommended_path`) for dashboard reminder banner
- [x] CTA opens existing `PathPurchaseModal` pre-seeded with recommended path (via `recommendedPathOverride` state)

### 1.3 User Dashboard Redesign ✅

- [x] Reorganize dashboard layout and information hierarchy
- [x] Clarify path progression vs session history
- [x] Improve scenario selection UX (paths with full levels)
- [x] Ensure purchased vs locked states are visually clear

### 1.4 Stripe Subscriptions & Webhook Pivot ✅ (Completed 2026-04-28)

- [x] Remove `first_path` and `path` checkout modes.
- [x] Subscription pricing live: Monthly EB $12.99 / Quarterly EB $29.99 (auto launch, 25 slots) → $19.99 / $47.99 regular
- [x] Refactor Edge Function `create-checkout` to process `mode: subscription`.
- [x] Webhook rewrite: `checkout.session.completed` as primary activation event
- [x] `resolveUserIdFromInvoice()` — resilient userId lookup via Stripe API fallback
- [x] `constructEventAsync` — fix Deno SubtleCrypto async requirement
- [x] Deploy with `--no-verify-jwt` so Stripe can reach the endpoint
- [x] Payment success UX: celebration modal with confetti + redirect to dashboard
- [x] Locked path levels → open pricing modal
- [x] Subscription unlocks ALL progression levels (progression GET endpoint)
- [x] Account page: real tier display + Manage Subscription → Stripe Customer Portal
- [x] `POST /create-portal-session` endpoint
- [x] Configure live webhook endpoint in Stripe Dashboard ✅

### 1.5 WhatsApp SR Coach Integration (The Retention Hook) ✅ (Sandbox)

- [x] Create Twilio Account & WhatsApp Sandbox.
- [x] Database Schema: Add `whatsapp_number`, `whatsapp_verified` to `profiles`, and create `wa_pending_reviews` table.
- [x] `cron-daily-sr`: Daily dispatcher with TTS audio generation (ElevenLabs/OpenAI) + Supabase Storage upload.
- [x] `webhook-twilio`: Incoming audio → Azure Speech STT → Pronunciation Score → WhatsApp reply.
- [x] `whatsapp-verify`: OTP phone linking via Twilio Verify.
- [x] Web UX: `WhatsAppActivationCard.tsx` in Dashboard (phone input, OTP, verified state).
- [x] i18n: All WA messages in 3 languages (es/pt/en) based on `market_focus`.
- [x] Personalized greeting with user's first name.
- [x] "Repetir" / "Repeat" command to resend phrase with TTS audio.
- [x] E2E tested: Sandbox → cron dispatch → audio shadowing → pronunciation score → SR progression.

### 1.6 Scenario Quality Audit ✅ (Completed 2026-04-27)

- [x] Audit `meeting` and `presentation` system prompts vs `interview` — bugs found and fixed
- [x] Fix: `meeting`/`presentation` were getting sales scorecard from Gemini (wrong `!isInterview` branch)
- [x] Add `SCENARIO_ADAPTATION` blocks for meeting + presentation (vocabulary, arc, guardrails)
- [x] Add dual-axis evaluation per scenario in analyst prompt (meetingContentScores, presentationContentScores)
- [x] Separate scenario files: `src/services/prompts/scenarios/` + `supabase/functions/.../scenarios/`
- [x] 90 tests passing (42 new: scenario-presets + assembler-scenarios)

### 1.6.2 UX & Narration System ✅ (Completed 2026-04-27)

> **Goal:** Make the practice flow feel like a guided, conversational experience.

**Situation Presets (ContextScreen):**

- [x] 12 situation presets (3 per scenario) — describe the company/stakes, never the user's role
- [x] Form-first layout: Job Description at top (open by default), presets collapsible below
- [x] Dynamic presets: inject user's `position` into preset context when profile available
- [x] Persist last Job Description to profile — pre-filled on next session

**A/B Landing Pages:**

- [x] Landing2: dark hero + mascota SVG + animated Arena demo + full original content
- [x] Landing3: 5-section redesign (hero with real app mockup, dark why section, pricing, FAQ+CTA)
- [x] Landing3 route: `/#landing3`
- [x] HowItWorksTabs: coaching hint and radar chart now match real app UI

**Narration System:**

- [x] 45 static audio files generated with ElevenLabs (Sarah voice), hosted on Supabase Storage
- [x] `useNarration` hook — plays audio on mount, fails silently if muted or blocked
- [x] `useNarrationPreference` — global mute state + isPlaying, persisted in localStorage
- [x] `NarrationToggle` — floating pill button (bottom-right): waveform animated when playing
- [x] Auto-mute after first completed session (`narrationCompleted` in profile)
- [x] Narration connected to all screens: IntroductionScreen, ContextScreen, AnalyzingScreen (×2), StrategyScreen, PracticePrepScreen, InterlocutorIntroScreen, ReadinessScore, FeedbackScreen

**Practice Prep UX:**

- [x] `exampleAnswer` field in InterviewQuestionCard — GPT-4o generates full 2-3 sentence answer using user's profile data
- [x] StrategyScreen: "A Strong Answer Looks Like" section with personalized example
- [x] StrategyScreen: spacing between bold framework items (Who you are / What you do / Why this role)
- [x] SCENARIO_PREP_CONFIG: correct title/label/subtitle for meeting ("Key moment") and presentation ("Key challenge")
- [x] Remove duplicate Back button from AnswerCard
- [x] Remove Step X of 4 / Question X of Y header from all briefing cards
- [x] Remove trophy icon, badge, mic icon, and disclaimer from ReadinessScore

**InterlocutorIntroScreen:**

- [x] New step `interlocutor-intro` between practice-prep and practice (interview flow)
- [x] Dark immersive screen with avatar, waveform animation, "I'm ready" CTA

**Auth fix:**

- [x] `getAuthToken` timeout 8s → 15s, removed session clearing on network failure

### 1.6.1 Twilio WhatsApp Production Configuration ⚡ (Priority: START NOW)

> **Goal:** Migrate from Sandbox to a dedicated WhatsApp Business number. This takes ~1 week for Meta approval — start NOW so it's ready by beta launch.
>
> **Why urgent:** Sandbox requires each user to manually send `join <keyword>` to a shared number. Unacceptable UX for paying subscribers.

**Step 1 — Meta Business Verification (~48h — SUBMITTED 2026-04-21):**

- [x] Create Meta Business account at business.facebook.com (Spiral Tech Brands LLC).
- [x] Upload LLC documentation (Articles of Organization or bank statement).
- [x] Verify domain `masterytalk.pro` (DNS TXT record or HTML meta tag).
- [x] Business Verification submitted — **In review** (submitted 2026-04-29, ~2 business days).

**Step 2 — Twilio WhatsApp Sender (~1-2 business days):**

- [ ] In Twilio Console → Messaging → Senders → WhatsApp Senders, start application.
- [ ] Link your verified Meta Business account.
- [ ] Purchase a dedicated Twilio phone number (Colombian +57 or US +1).

**Step 3 — Message Templates (~24-48h):**

- [x] Create `sr_daily_challenge_en` template in Twilio Content Template Builder (SID: `HX32bf527caf21336f5eb698574d7e7e1f`). EN-only, single template for all users.
- [ ] Submit template for WhatsApp approval (blocked until WhatsApp Sender is active).
- [ ] Wait for Meta template approval.

**Step 4 — Production Cutover:**

- [ ] Update `TWILIO_PHONE_NUMBER` secret in Supabase with new number.
- [x] Update webhook URL in Twilio console (`+1 934 221 2868` → `/webhook/twilio`).
- [x] Set `TWILIO_SKIP_SIG_VALIDATION=true` secret in Supabase.
- [x] Set `TWILIO_TEMPLATE_SR_EN` secret once template is approved.
- [ ] Configure `pg_cron` schedule in Supabase (daily at 9 AM).
- [ ] Test full E2E with production number.

### 1.7 Corporate Infrastructure Migration 🏢

> **Goal:** Transition from personal to corporate accounts before processing real user data and payments.

- [ ] **Supabase Pro** ($25/mo) — MUST activate before public launch. Free tier pauses after 7 days of API inactivity, which kills production for paying users. Also provides daily backups.
- [ ] Incorporate company/entity (if not fully completed).
- [ ] Migrate/Create Stripe Account under Corporate EIN (critical for payouts and KYC).
- [ ] Migrate/Create Supabase Project to a corporate email/billing account.
- [ ] Migrate Vercel, Twilio, OpenAI, Azure, and ElevenLabs to company billing.
- [ ] Secure corporate domains and email addresses (e.g. `dave@masterytalk.pro`).
- [ ] Custom domain for Supabase Auth (`auth.masterytalk.pro`) — available on Pro plan.

### 1.9 Production Hardening ✅ (Partially complete — 2026-04-28)

- [x] Error monitoring: Sentry (`@sentry/react`, VITE_SENTRY_DSN on Vercel, ErrorBoundary integrated)
- [x] Rate limiting: implemented in Edge Function middleware ✅
- [x] Security audit: admin auth, PUT /profile field whitelist, CRON_SECRET
- [x] Review Google OAuth consent screen — updated to "MasteryTalk PRO" in Google Cloud Console
- [x] Google branding published — "MasteryTalk PRO" visible in Google login popup
- [x] Upload logo to OAuth consent screen
- [ ] Custom domain for Supabase Auth (removes `zkury...supabase.co` from OAuth)

### 2.0 Legal Compliance

- [x] Privacy Policy page (GDPR/CCPA compliant) — `PrivacyPage.tsx`
- [x] Terms of Service page — `TermsPage.tsx`
- [x] Cookie notice — `CookiesPage.tsx` (#cookies route) + `CookieBanner.tsx` (first-visit toast)

---

## Phase 2 — Growth & Retention (Priority: After Phase 1)

> **Goal:** Get users to come back and buy additional paths.

### 2.1 Email Service ✅ (Completed — 2026-04-28)

- [x] Provider: Resend — domain `masterytalk.pro` verified
- [x] Welcome email on registration (`ensure-profile`)
- [x] Post-session summary email (scores, key improvements)
- [x] Subscription confirmation email (`checkout.session.completed`)
- [x] Inactive user nudge (7 days without practice, 14-day cooldown, runs in daily cron)
- [x] Payment renewal confirmation (`invoice.payment_succeeded`, billing_reason=subscription_cycle)

### 2.2 Dashboard Improvements

- [x] Cross-path progress overview (when user owns 2+ paths) — `CrossPathCard.tsx`, derived from persistedSessions, hidden when < 2 paths
- [x] Session streak visualization — `StreakCard.tsx` (7-day grid), WA sessions count via `GET /wa/practice-dates` + merged `allPracticeDates`
- [x] "Recommended next session" based on weakest pillar — `RecommendedNextCard.tsx`, left column, hidden when 0 sessions

### 2.3 Conversion Optimization

- [ ] A/B test pricing page copy
- [ ] Add testimonial/social proof section to landing
- [ ] Implement referral system (share link → both get discount)

---

## Phase 2.5 — Pedagogical Depth (Priority: Parallel with Phase 2)

> **Goal:** Deepen the learning effectiveness of the core practice loop based on learning science research.
> Methodology reference: [`LEARNING_METHODOLOGY.md`](./LEARNING_METHODOLOGY.md)
>
> Each item maps to a gap identified in `LEARNING_METHODOLOGY.md §5`.
> Sprints ordered by impact/complexity ratio.

### Sprint A — Quick Wins

> High pedagogical impact, low implementation complexity. Target: 1–2 week sprint.

#### A.1 — Pre-session focus selector (Deliberate Practice — Gap 6) ✅

**Goal:** User sets an intentional focus before each session → AI prioritizes coaching on that dimension.

- [x] Add focus selector to `ContextScreen.tsx` — 6 pillar chips, toggle selection
- [x] Pass selected focus as `sessionFocus` via `ContextScreenMeta` → `assembler.ts` Block 4.6
- [x] Coaching priority instruction injected into system prompt per session
- [x] **Acceptance:** User selects focus → Block 4.6 biases interlocutor coaching toward that pillar

#### A.2 — Pre-session confidence check-in (WTC — Gap 1) ✅

**Goal:** Measure perceived confidence before session → personalize interlocutor tone.

- [x] Add 1–5 confidence slider to `ContextScreen.tsx` after focus selector
- [x] Pass score via `ContextScreenMeta` → `assembler.ts` Block 4.6: ≤2 → warmer tone, ≥4 → standard/elevated
- [x] **Acceptance:** Low confidence → warmer interlocutor; High confidence → standard challenge mode

#### A.3 — Active recall in LessonModal (Retrieval Practice — Gap 2) ✅

**Goal:** Replace passive reading with active recall at the end of every lesson.

- [x] Add `recallQuestions?: Array<{ question: string; answer: string }>` to `MicroLesson` interface
- [x] Added 2 recall questions to all 50 micro-lessons in `microLessonsData.ts`
- [x] Added Quick Recall section to `LessonModal.tsx` — reveal mechanism with answer gate
- [x] **Acceptance:** Every lesson ends with recall section; reveal mechanism prevents passive scrolling

#### A.4 — Challenge Mode (Productive Failure — Gap 9) ✅

**Goal:** Users can practice without pre-briefing to develop spontaneous response capability.

- [x] Add "Challenge Mode" toggle to `ContextScreen.tsx` coaching params section
- [x] When active: skip `strategy` and `practice-prep` steps → go directly to `interlocutor-intro`/`practice`
- [x] `challengeModeRef` in `PracticeSessionPage` bypasses briefingForSession guard for interview sessions
- [x] Copy: _"No hints, no prep. Exactly like the real thing."_
- [x] **Acceptance:** Toggle in ContextScreen; flow skips all briefing steps when activated

---

### Sprint B — Medium Effort

> High impact on retention and motivation. Target: 2–3 week sprint.

#### B.1 — Ideal Self capture + Dashboard anchor (L2MSS — Gap 3) ✅

**Goal:** Capture the user's specific English goal and surface it consistently to sustain intrinsic motivation.

- [x] Added `englishGoal?: string` to `OnboardingProfile` + `english_goal` to backend ALLOWED_FIELDS
- [x] "Your English Goal" field (max 120 chars) in `AccountPage.tsx` Professional Profile section
- [x] `GoalAnchorCard.tsx` in Dashboard left column — filled state shows goal + days active; empty state shows CTA
- [x] **Acceptance:** Goal set in Account → visible in Dashboard; empty state shows CTA to set it

#### B.2 — Score trajectory chart in Dashboard (WTC + L2MSS — Gap 4) ✅

**Goal:** Show users their score evolution over time — seeing improvement is the strongest WTC motivator.

- [x] `ProgressChartCard.tsx` — recharts LineChart of avg pillar scores across last 10 scored sessions
- [x] Sources data from existing `fetchSessions()` — aggregated client-side, no new endpoint
- [x] CEFR milestone markers at B1→B2 (60) and B2→C1 (78) thresholds as reference lines
- [x] Hidden when user has < 3 sessions with scores
- [x] **Acceptance:** Chart renders with real session data; level transitions visible as milestones

#### B.3 — Pushed output in conversation (Output Hypothesis — Gap 5) ✅

**Goal:** AI interlocutor prompts user to reformulate or be more precise at key moments.

- [x] Added PUSHED OUTPUT DIRECTIVE to all 5 `SCENARIO_ADAPTATION_*` blocks (interview, sales, meeting, presentation, culture)
- [x] Each scenario has a tailored instruction for vague language patterns and reformulation triggers
- [x] **Acceptance:** ≥2 pushed output moments targeted per session in Guidance phase; flagged in internalAnalysis

---

### Sprint B.4 — Pre-Session Lesson (Program Primer — Pedagogical Depth)

> **Goal:** Add a curriculum-driven micro-lesson between `context` and `strategy`. User reads one level-specific lesson, taps to reveal the recall answer, then proceeds. Reinforces program identity and primes vocabulary before practice.
> **Spec:** `PRODUCT_SPEC.md §7.9`

- [x] Add `"lesson"` to `Step` type in `src/shared/types/session.ts` + `SessionProgressBar` phases
- [x] Create `src/features/practice-session/ui/PreSessionLessonScreen.tsx`
  - Path + level badge, lesson title, keyConcept, power phrase, recall question (reveal gate)
  - "Start session →" CTA locked until user taps "Reveal answer"
- [x] Add `getPreSessionLesson(pathId, levelId, lastLessonId?, pillarScores?)` to `src/services/microLessonsData.ts`
  - Priority 1: filter by `levelIds` + `pathIds` match, skip `lastLessonId`, cycle sequentially
  - Priority 2: weakest pillar from `pillarScores` fallback
  - Returns `null` when no lesson found (step skipped)
- [x] Wire into `PracticeSessionPage.tsx` via `gateWithLesson()` helper — replaces all context→strategy/generating/practice-prep transitions; script generation fires before lesson so it runs in background
  - Skip when: `challengeModeRef.current` OR `startAtContext` (War Room) OR `isSelfIntro` OR no `progressionPathId`/`progressionLevelId`
- [x] Add `last_pre_session_lesson_id: string | null` to `OnboardingProfile` in `src/entities/user/`
- [x] Add `last_pre_session_lesson_id` to `PUT /profile` whitelist in `routes/auth.ts`
- [x] Save `last_pre_session_lesson_id` on lesson advance via `PUT /profile`; update local `userProfile` optimistically
- [x] **Acceptance:** Lesson appears between context and strategy in standard flow; skipped in Challenge Mode, War Room, and self-intro; CTA locked until recall revealed. Commit e777d2c.

---

### Sprint C — Foundational

> Architectural impact. Requires design decisions before implementation. Evaluate after Sprint B.

#### C.1 — Progressive difficulty curve per level (Deliberate Practice — Gap 7)

**Goal:** Each level within a path should be measurably harder than the previous — interlocutor style, topic complexity, and stakes all scale.

- [ ] Define difficulty parameters per level (1–6): interlocutor assertiveness, topic specificity, stakes framing, formality required
- [ ] Update `progression-paths.ts` level definitions to include difficulty metadata
- [ ] Map each difficulty tier to a specific interlocutor profile in `personas.ts`
- [ ] Update SCENARIO_ADAPTATION blocks with level-aware instructions
- [ ] **Acceptance:** Level 1 = patient interlocutor + predictable topics; Level 6 = high-pressure + C-suite register + no tolerance for hedging

#### C.2 — Interaction Management dimension in feedback (Interactional Competence — Gap 8)

**Goal:** Evaluate how users manage the conversation itself — turn-taking, repair, backchanneling — not just what they say.

- [ ] Add Interaction Management evaluation block to Gemini analyst prompt in `supabase/functions/.../analyst-prompt.ts`
- [ ] Dimensions: turn initiation, turn yielding, self-repair, backchanneling signals, topic management
- [ ] Add `interactionManagementScore` and `interactionObservations` to feedback output schema
- [ ] Add Interaction Management section to `ConversationFeedback.tsx`
- [ ] Document IC as implicit 7th dimension in `CEFR_CALIBRATION.md`
- [ ] **Acceptance:** Feedback includes IC score + 2–3 specific observations per session

---

## Phase 3 — Content Expansion (Priority: After retention data)

> **Goal:** More paths to buy, more reasons to stay.

### 3.1 Sales Scenario (New Path) ✅ (Completed)

> **Why now:** B2B sales is the highest-demand skill for LATAM nearshoring professionals.

- [x] Sales system prompt (`src/services/prompts/scenarios/sales.ts`)
- [x] Backend dual-axis evaluation (sales-specific Gemini scoring)
- [x] "Sales Champion" in `VISIBLE_PATHS` in `progression-paths.ts`
- [x] Sales scenario in `ScenarioType` active list and UI
- [x] 3 situation presets for sales
- [x] End-to-end flow verified: context → strategy → practice → feedback
- [x] Update PRODUCT_SPEC §2

### 3.1.1 Cultural Intelligence in AI Feedback 🧠 ✅ (Completed 2026-04-28)

- [x] PILLAR 3 expanded: 5 LATAM assertiveness patterns (over-qualifying, conflict avoidance, indirect structure, missing ownership, deference signals)
- [x] Professional Tone scoring includes cultural directness as criterion
- [x] languageInsights: named detection for 4 LATAM interference categories (false cognates, calques, fillers, pronoun drops)
- [x] SYSTEM_PROMPTS.md v1.3 updated

### 3.1.2 U.S. Business Culture Mastery Path 🇺🇸 ✅ (Completed)

> **Why:** Transforms MasteryTalk from a language tool to a nearshoring performance platform.
> Cultural fit is the #1 unspoken reason nearshoring professionals don't advance in U.S. companies.
>
> **Role in program model (updated 2026-05-04):** BC is a choosable Primary Path — recommended when self-intro reveals cultural communication gaps (direct communication score < 60). BC content is also woven into all paths via pre-session lessons (§7.9). It is no longer the forced default for all users.

**6 Levels (revised):**

1. Direct Communication & Feedback — claim-first vs. context-first, avoiding hedging
2. Meeting Control — open with agenda, redirect tangents, close with concrete next steps
3. Individual Accountability & Ownership — ownership language, managing up, decision-making
4. Building Credibility Fast — first 90 seconds: rapport + competence simultaneously
5. Navigating Disagreement — disagree without it feeling personal, maintain relationships
6. Executive Presence & Storytelling — Problem/Solution/Contrast framework for C-level influence

**Technical work:**

- [x] `src/services/prompts/scenarios/culture.ts` — SCENARIO_ADAPTATION_CULTURE
- [x] `supabase/functions/.../scenarios/culture.ts` — dual-axis eval + gap analysis
- [x] `supabase/functions/.../scenarios/index.ts` — register new scenario
- [x] `src/features/dashboard/model/progression-paths.ts` — CULTURE_LEVELS (6 levels)
- [x] `src/services/prompts/personas.ts` — add "egalitarian_leader" interlocutor
- [x] `src/features/practice-session/model/scenario-presets.ts` — 3 presets
- [x] `src/features/dashboard/model/path-recommendation.ts` — set "culture" as default first path
- [x] `VITE_ENABLED_SCENARIOS` in Vercel — culture visible in production (confirmed)
- [x] Update PRODUCT_SPEC §2

### 1.8 UX Polish & Habit Loop ✅ (Completed 2026-04-30)

> Full implementation of docs/UX_POLISH.md sprints 1–5 and UI system hardening.

**Dashboard & Navigation:**

- [x] 3-row dashboard layout: WA banner → HeroCard → 4-widget row → SideNav (1/4) + ProgressionTree (3/4)
- [x] Full `DashboardSkeleton` — shimmer placeholders for all rows while `data.loading || progressionLoading`
- [x] `CrossPathCard` uses real `progressionState` completion (completed levels / 6) — not session count proxy
- [x] `PracticeSideNav` — `PATH_ICONS` map renders actual Lucide icons (was rendering icon key as string)
- [x] `AppHeader` logo no longer navigates to landing from internal pages

**ProgressionTree:**

- [x] Path title (`h3`) + description displayed above level list
- [x] Level taglines from `introValue` or `methodology.tagline` — shown in every LevelNode
- [x] LevelNode restructured: Row 1 (title + badge + chevron always visible), Row 2 (tagline), Row 3 (locked hint + Lock icon)

**Self-Introduction Path:**

- [x] Self-intro added as first visible path (`VISIBLE_PATHS` first entry, regardless of env flag)
- [x] `activeGoal: "self-intro"` as default progression state
- [x] All 3 si-\* levels set to `"unlocked"` in `getDefaultProgressionState()`
- [x] Guard in ProgressionTree: invalid `activeGoal` (hidden path) falls back to "self-intro"

**Account Page:**

- [x] Full English translation (no Spanish copy remaining)
- [x] All profile fields editable: role, industry, seniority, key achievements, CV upload/delete
- [x] All saves go to KV backend via `PUT /profile` (removed localStorage-only pattern)
- [x] Section order: Personal Info → WhatsApp → Professional Profile → Plan & Usage

**Auth Hardening:**

- [x] `masterytalk_auth_loading` flag set in `authService.signIn()` → survives Supabase double null event → prevents flash to landing during OAuth return
- [x] `AuthLoadingScreen.tsx` — branded dark screen with BrandLogo + dual-ring spinner; used for `isInitializing` and `Suspense` fallback
- [x] `ProfileDropdown` extracted as proper React component (fixes Rules of Hooks violation in conditional IIFE)
- [x] `onLogoClick` prop removed from internal `AppHeader` instances

**Font System:**

- [x] Poppins imported in `fonts.css`, set globally on `body` in `theme.css`
- [x] `.font-montserrat` utility class added to `theme.css` for logo accent
- [x] All 30 files with inline `fontFamily: 'Inter'/'Poppins'` references cleaned — zero inline fontFamily in codebase
- [x] `SectionHeading`: `font-light leading-[1.2]` Tailwind classes replace style prop
- [x] `DesignSystemPage`: `font-montserrat` class replaces Montserrat inline style in weight showcase

**Backend:**

- [x] ElevenLabs model → `eleven_turbo_v2_5` (lower TTS latency)
- [x] `POST /process-turn-stream` — SSE endpoint for GPT-4o streaming responses
- [x] **Prompt caching** — OpenAI automatic caching active on system prompt (turn 2+): ~30% GPT-4o cost reduction + faster time-to-first-token per turn
- [x] **Scenario-aware turn limits** — `presentation` + `sales` max 10 turns; all others max 8 (min 4 across all scenarios)
- [x] **Hints tap-to-reveal** — Try Saying hints collapsed by default; suppressed in Challenge arena phase and Challenge Mode

---

### 3.1.3 Email Marketing Automation — Loops.so Integration

> **Goal:** Activar secuencias de lifecycle marketing post-registro para convertir usuarios free a suscriptores.
> Loops maneja el nurturing; Resend sigue con los transaccionales. Sin cambios en frontend.

**Setup externo (acciones manuales):**

- [x] Crear cuenta en Loops.so + verificar dominio `mail.go.masterytalk.pro` (DNS DKIM/SPF)
- [x] Activar integración OAuth Supabase ↔ Loops (sync automático de auth.users → contactos)
- [x] Añadir `LOOPS_API_KEY` a Supabase secrets + `supabase/.env.local`
- [x] Construir 5 secuencias en Loops dashboard (ver PRODUCT_SPEC §9.1)

**Código backend:**

- [x] Crear `supabase/functions/make-server-08b8658d/routes/marketing.ts`
    - `POST /marketing/track` — proxy de eventos de negocio a Loops API
    - `POST /marketing/contact/update` — enriquecer propiedades del contacto
- [x] Registrar ruta en `index.ts`
- [x] `routes/sessions.ts` — disparar `first_session_completed` (1ª sesión) + milestones (3, 10 sesiones)
- [x] `routes/webhook.ts` — disparar `subscription_purchased` en `checkout.session.completed`
- [x] `routes/auth.ts` — enriquecer contacto con `language`, `market_focus`, `plan` en `PUT /profile`

### 3.2 Learning Path Depth

- [ ] Verify 6-level progression is coherent across all 3 active scenarios
- [ ] Create level-specific interlocutor profiles (e.g., Level 1 = friendly HR, Level 4 = tough VP)
- [ ] Add level completion certificates (shareable on LinkedIn?)

### 3.3 Content Quality

- [ ] Professional recording of key shadowing phrases (replace TTS)
- [ ] Curated power phrase library per scenario
- [ ] Industry-specific vocabulary modules (tech, finance, etc.)

---

## Phase 4 — Scale & Monetize (Priority: When retention proves model)

> **Goal:** Maximize revenue per user.

### 4.1 All-Access Bundle

- [ ] Re-introduce All-Access pricing ($X for all paths)
- [ ] Update PRODUCT_SPEC §3 with new tier
- [ ] Create Stripe product + price
- [ ] Update PathPurchaseModal with bundle option

### 4.2 B2B / Enterprise

- [ ] Team accounts (admin can buy subscriptions for team members)
- [ ] Analytics dashboard for managers
- [ ] Volume pricing

---

## Parking Lot (Ideas — Not Prioritized)

- Mobile app (React Native) — only if web proves PMF
- Video-based practice (camera on during session)
- AI-generated progress reports for managers
- Integration with LinkedIn Learning
- Gamification: badges, leaderboards, challenges
- Community forum for practitioners
- Booster Packs ($4.99 for extra session attempts)
- Negotiation scenario
- C-Suite presentation scenario

---

## Spec Changelog

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-17 | Initial roadmap — retroactive from beta v11.0 state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-04-20 | Added 1.1.1 Emoji→Icon standardization (completed)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-04-21 | Added 1.2.1 Self-Intro Warm-Up (completed), 1.2.2 Path Recommendation Engine (planned). Re-numbered 1.3–1.8. Updated legal compliance status.                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-04-21 | Completed 1.4 Stripe Subscriptions, 1.5 WhatsApp SR Coach (Sandbox). Added 1.8 Twilio Production Config. Re-numbered Legal to 2.0.                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-04-27 | Completed 1.6 Scenario Quality Audit. Added 1.6.2 UX & Narration System (45 audio files, A/B landings, situation presets, briefing UX improvements, auth fix).                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-04-28 | Completed 1.4 Stripe payments E2E in live mode. Webhook rewrite. Payment success modal with confetti. Manage Subscription portal. Transactional emails (5 templates).                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-04-28 | Completed 1.9 (Sentry + security audit). Completed 2.1 (inactivity nudge + renewal email). FSD violations resolved. p-5 eliminated. PRODUCT_SPEC v2.0. Dead code removed (generate-scenario-data).                                                                                                                                                                                                                                                                                                                                           |
| 2026-04-28 | Strategic analysis: approved Sales scenario activation (3.1, promoted from Phase 3), Cultural Intelligence feedback (3.1.1), LATAM interference patterns (3.1.1). Plan added to ROADMAP.                                                                                                                                                                                                                                                                                                                                                     |
| 2026-04-28 | 3.1.2 retroactive completion: culture.ts (frontend + backend), CULTURE_LEVELS (6 levels), egalitarian_leader persona, 3 presets, path-recommendation default — all verified in codebase. Pending: Vercel env var + PRODUCT_SPEC §2.                                                                                                                                                                                                                                                                                                          |
| 2026-04-28 | 1.6.1 partial: webhook URL configured, sr_daily_challenge_en template created, TWILIO_SKIP_SIG_VALIDATION set, backend EN-only template, WhatsAppActivationCard free-form country code + EN UI.                                                                                                                                                                                                                                                                                                                                              |
| 2026-04-30 | 1.8 UX Polish & Habit Loop completed: dashboard 3-row layout + skeleton, ProgressionTree redesign (path descriptions + level taglines), self-intro first path, CrossPathCard real data, AccountPage English + full KV saves, auth OAuth flash fix (AuthLoadingScreen + masterytalk_auth_loading flag), ProfileDropdown hooks fix, AppHeader no-landing-logo, font system (Poppins global via CSS, .font-montserrat utility, zero inline fontFamily). Backend: eleven_turbo_v2_5 + GPT-4o SSE streaming endpoint. Current state → Beta v14.0. |
| 2026-04-30 | Beta v14.1: Lessons Library expanded 24→50 lessons (dual-axis engine, MicroLesson pathIds/levelIds/audioUrl). DeepDiveCard post-session. RecommendedLessonsCard dashboard. LessonModal audio player. TTS cost optimization (OpenAI gpt-4o-mini-tts primary, ElevenLabs fallback, ~20× cheaper). War Room 5/month limit (KV: war_room_monthly_count + war_room_month). Commit e62dad8 deployed → Vercel + Supabase Edge Functions.                                                                                                            |
| 2026-05-01 | Beta v14.2: Launch pricing model — Monthly EB $12.99 / Quarterly EB $29.99 (auto-applied, 25 shared slots) → regular $19.99/$47.99. PathPurchaseModal redesigned to 2 cards with dynamic pricing from /pricing endpoint. TTS voices updated to cedar + marin (OpenAI recommended). Full i18n pricing section (ES/PT/EN). Stripe secrets updated (4 new price IDs). PRODUCT_SPEC v2.8. Commits: dd51943, 00e6513, 722a58a, 77202c1.                                                                                                           |
| 2026-05-01 | Added Phase 2.5 — Pedagogical Depth: 9 gaps from LEARNING_METHODOLOGY.md organized into Sprint A (Quick Wins), Sprint B (Medium Effort), Sprint C (Foundational). New docs: LEARNING_METHODOLOGY.md, CEFR_CALIBRATION.md.                                                                                                                                                                                                                                                                                                                    |
| 2026-05-01 | Phase 2.5 Sprint A complete (A.1–A.4) + Sprint B complete (B.1–B.3). A.4 Challenge Mode (skip briefing toggle). B.3 Pushed output in all 5 SCENARIO_ADAPTATION blocks. B.1 Ideal Self field (AccountPage + GoalAnchorCard). B.2 ProgressChartCard (recharts LineChart, last 10 sessions, CEFR milestones). Current state → Beta v14.3.                                                                                                                                                                                                       |
| 2026-05-04 | **Product strategy session — major decisions:** (1) Pricing finalized: FM $49/3mo locked forever · Program $129/3mo · Monthly $49/mo. *(Note: FM revised to $59/3mo on 2026-05-05 — see below.)* (2) Primary Path model: user chooses path from self-intro recommendation — BC not mandatory, content woven via §7.9 pre-session lessons. (3) Progression unlock trigger: full path completion (all 6 levels), user chooses next path. (4) Self-intro elevated to intake assessment → primary_path on subscribe. (5) Pre-session lesson step §7.9 specced (Sprint B.4). **Coded:** hints tap-to-reveal + challenge suppression; scenario-aware turn limits (8/10). **Spec:** PRODUCT_SPEC v3.3. **ROADMAP:** Phase 0.1 revised, 0.6 updated, 0.7 added, 3.1.2 updated, Known Gaps documented. Current state → Beta v14.4. |
| 2026-05-04 | **Retention sprint (Beta v14.5):** SinceYouStartedCard (pillar delta first→latest), ScenarioDeltaCard (per-scenario comparison in FeedbackScreen), LevelMilestoneModal (confetti + score on level completion ≥75), ChooseNextPathModal path completion celebration + LinkedIn share. fetchSessions TTL cache (30s). PILLAR_COLORS consolidated. PATH_LABELS centralized. Security review: 0 vulnerabilities. 119/119 tests passing. COMMERCIAL_PITCH.md: full commercial document + EF EPI 2026 data + updated market numbers + arbitraje salarial. Commit 9cff182. |
| 2026-05-04 | **Pre-session lesson step (Beta v14.6 — §7.9):** `"lesson"` step live between context and strategy. `getPreSessionLesson()` (level-specific → pillar fallback). `PreSessionLessonScreen` (badge, keyConcept, power phrase, recall gate, locked CTA). `gateWithLesson()` helper in PracticeSessionPage. `last_pre_session_lesson_id` persisted. Skip: Challenge Mode, War Room, self-intro. Script generation fires before lesson for zero added latency. Backend whitelist updated. Commit e777d2c. Current state → Beta v14.6. |
| 2026-05-05 | **Billing transparency + competitive positioning sprint (Beta v14.7):** (1) Pricing: FM raised $49→$59/3mo ($19.67/mo) — eliminates same-number confusion with Monthly. Backend `/pricing` endpoint updated. All docs + PRODUCT_SPEC synced. (2) Landing pricing section rewritten: connected to `GET /pricing` API (no hardcoded prices), quarterly as hero card, price anchors (coach/tutor), `roiLine` ("Se paga solo con tu primer aumento"), `cancelLine` + scarcity co-located in Founding Member card. (3) AuthModal register subtitle → "Solo Google. Sin tarjeta de crédito." PracticeWidget `microcopy` now rendered with Check icon. (4) Transactional emails: subscription confirmation subject + secondary "Manage subscription" CTA + cancel footer; renewal Branch B cancel link on its own line; PaymentSuccessHandler footer → "Cancel anytime in one click. No penalties." (5) **pronunciationNotes live in FeedbackScreen:** Gemini Flash tips were generated but never rendered. `PronunciationCategory`/`PronunciationNote`/`ImprovementArea` moved to `entities/feedback`. `generateSummary()` now maps `pronunciationNotes`. New "Pronunciation Coach" section in FeedbackScreen: word + phonetic + category badge + tip. (6) SR Coach second message: after production Twilio template, sends free-form `weakPoint` context if `problem_word` exists. (7) Session summary email: `strongerPhrase` card ("Your phrase to own") with `beforeAfter[0].professionalVersion`, formatted for LinkedIn. (8) `WhatsAppActivationCard` feedback variant: shows `strongerPhrase` excerpt from session in card title area. (9) `CLAUDE.md` v2.3: new "Análisis profundo antes de proponer soluciones" protocol. Security: 0 new vulnerabilities (pre-existing HTML non-escaping in emails documented as known gap). Tests: 119/119 passing. |
