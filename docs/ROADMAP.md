# MasteryTalk PRO — Roadmap

> **Last updated:** 2026-04-30
> **Spec reference:** [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md)
> **Rule:** New items go here FIRST → spec update if needed → then code.

---

## Current State (Beta v14.0 — 2026-04-30)

### ✅ What's Live
- 5 active scenarios: interview, meeting, presentation, sales, culture
- **Stripe subscriptions live** — Early Bird $9.99, Monthly $16.99, Quarterly $39.99
- **Webhook fully operational** — checkout.session.completed as primary activation
- **Payment success flow** — celebration modal with confetti, redirect to dashboard
- **Subscription unlock** — all paths/levels unlock on any active subscription
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
- **Self-intro first path** — `activeGoal: "self-intro"` default; all 3 si-* levels unlocked from start; visible regardless of env flag
- **CrossPathCard** — real completion % from `progressionState` (not sessions proxy)
- **AccountPage** — full English, all profile fields editable (role, industry, seniority, key achievements, CV); saves to KV backend, not localStorage
- **Auth flow hardening** — `masterytalk_auth_loading` flag prevents OAuth flash to landing; `AuthLoadingScreen` branded component; `ProfileDropdown` extracted as proper React component (hooks fix)
- **AppHeader** — logo no longer navigates to landing from app interior
- **ElevenLabs turbo** — `eleven_turbo_v2_5` model (lower latency)
- **GPT-4o streaming** — `POST /process-turn-stream` SSE endpoint

### ⚠️ Known Gaps
- WhatsApp in sandbox mode (requires Meta Business approval for production)
- Google OAuth consent screen still shows dev app name
- Stripe Customer Portal requires manual activation in Stripe Dashboard settings

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
- [x] Verify pricing section consistency with PRODUCT_SPEC §6 (2 cards: $4.99 / $16.99)
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
- [x] 3-tier pricing: Early Bird $9.99, Monthly $16.99, Quarterly $39.99 (live mode)
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

### 3.1.2 U.S. Business Culture Mastery Path 🇺🇸 ⚡ HIGH PRIORITY
> **Why:** Transforms MasteryTalk from a language tool to a nearshoring performance platform.
> Cultural fit is the #1 unspoken reason LATAM professionals don't advance in U.S. companies.
>
> **Default first path:** After self-intro warm-up, this is the recommended path for ALL users
> unless they have a specific immediate need (interview, sales pitch, etc.).
> It fills the gap between "speaking English" and "operating effectively in U.S. corporate culture."

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
- [x] All 3 si-* levels set to `"unlocked"` in `getDefaultProgressionState()`
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

| Date | Change |
|------|--------|
| 2026-04-17 | Initial roadmap — retroactive from beta v11.0 state |
| 2026-04-20 | Added 1.1.1 Emoji→Icon standardization (completed) |
| 2026-04-21 | Added 1.2.1 Self-Intro Warm-Up (completed), 1.2.2 Path Recommendation Engine (planned). Re-numbered 1.3–1.8. Updated legal compliance status. |
| 2026-04-21 | Completed 1.4 Stripe Subscriptions, 1.5 WhatsApp SR Coach (Sandbox). Added 1.8 Twilio Production Config. Re-numbered Legal to 2.0. |
| 2026-04-27 | Completed 1.6 Scenario Quality Audit. Added 1.6.2 UX & Narration System (45 audio files, A/B landings, situation presets, briefing UX improvements, auth fix). |
| 2026-04-28 | Completed 1.4 Stripe payments E2E in live mode. Webhook rewrite. Payment success modal with confetti. Manage Subscription portal. Transactional emails (5 templates). |
| 2026-04-28 | Completed 1.9 (Sentry + security audit). Completed 2.1 (inactivity nudge + renewal email). FSD violations resolved. p-5 eliminated. PRODUCT_SPEC v2.0. Dead code removed (generate-scenario-data). |
| 2026-04-28 | Strategic analysis: approved Sales scenario activation (3.1, promoted from Phase 3), Cultural Intelligence feedback (3.1.1), LATAM interference patterns (3.1.1). Plan added to ROADMAP. |
| 2026-04-28 | 3.1.2 retroactive completion: culture.ts (frontend + backend), CULTURE_LEVELS (6 levels), egalitarian_leader persona, 3 presets, path-recommendation default — all verified in codebase. Pending: Vercel env var + PRODUCT_SPEC §2. |
| 2026-04-28 | 1.6.1 partial: webhook URL configured, sr_daily_challenge_en template created, TWILIO_SKIP_SIG_VALIDATION set, backend EN-only template, WhatsAppActivationCard free-form country code + EN UI. |
| 2026-04-30 | 1.8 UX Polish & Habit Loop completed: dashboard 3-row layout + skeleton, ProgressionTree redesign (path descriptions + level taglines), self-intro first path, CrossPathCard real data, AccountPage English + full KV saves, auth OAuth flash fix (AuthLoadingScreen + masterytalk_auth_loading flag), ProfileDropdown hooks fix, AppHeader no-landing-logo, font system (Poppins global via CSS, .font-montserrat utility, zero inline fontFamily). Backend: eleven_turbo_v2_5 + GPT-4o SSE streaming endpoint. Current state → Beta v14.0. |
