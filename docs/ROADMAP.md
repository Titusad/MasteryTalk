# MasteryTalk PRO — Roadmap

> **Last updated:** 2026-04-21
> **Spec reference:** [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md)
> **Rule:** New items go here FIRST → spec update if needed → then code.

---

## Current State (Beta v11.0)

### ✅ What's Live
- 3 active scenarios: interview, meeting, presentation
- Subscription Model (Planned): $14.99/mo with WhatsApp SR Coach
- Architecture pivot from one-time-purchases to recurring billing initiated
- Stripe Checkout integration (test mode ready, live mode ready)
- Full practice flow: setup → briefing → conversation → feedback → skill drill
- Azure Speech pronunciation + ElevenLabs TTS
- Shadowing practice with phrase-by-phrase coaching
- 3-language landing page (ES/PT/EN)
- Admin Dashboard with API cost tracking
- Spaced Repetition system
- Google Auth via Supabase

### ⚠️ Known Gaps
- Payment flow untested E2E with real card in production
- `meeting` and `presentation` scenarios have limited prompt tuning vs `interview`
- No email service (welcome, post-session summaries, nurturing)
- No error monitoring (Sentry or equivalent)

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
- [ ] Persist recommendation in backend KV (`recommended_path`) for dashboard reminder banner
- [x] CTA opens existing `PathPurchaseModal` pre-seeded with recommended path (via `recommendedPathOverride` state)

### 1.3 User Dashboard Redesign 🔄
- [ ] Reorganize dashboard layout and information hierarchy
- [ ] Clarify path progression vs session history
- [ ] Improve scenario selection UX (3 active paths)
- [ ] Ensure purchased vs locked states are visually clear

### 1.4 Stripe Subscriptions & Webhook Pivot ✅
- [x] Remove `first_path` and `path` checkout modes.
- [x] Create **Pro Plan** Subscription in Stripe ($14.99/month).
- [x] Refactor Edge Function `create-checkout` to process `mode: subscription`.
- [x] Refactor Edge Function `webhook-stripe` to listen to `customer.subscription.*` events.
- [ ] Configure live and test webhook endpoints in Stripe Dashboard.

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

### 1.6 Scenario Quality Audit
- [ ] Audit `meeting` system prompt quality vs `interview`
- [ ] Audit `presentation` system prompt quality
- [ ] Run at least 1 full demo session per scenario and verify output quality

### 1.6.1 Twilio WhatsApp Production Configuration ⚡ (Priority: START NOW)
> **Goal:** Migrate from Sandbox to a dedicated WhatsApp Business number. This takes ~1 week for Meta approval — start NOW so it's ready by beta launch.
>
> **Why urgent:** Sandbox requires each user to manually send `join <keyword>` to a shared number. Unacceptable UX for paying subscribers.

**Step 1 — Meta Business Verification (~48h — SUBMITTED 2026-04-21):**
- [x] Create Meta Business account at business.facebook.com (Spiral Tech Brands LLC).
- [x] Upload LLC documentation (Articles of Organization or bank statement).
- [ ] Verify domain `masterytalk.pro` (DNS TXT record or HTML meta tag).
- [ ] Wait for Meta approval (~48h).

**Step 2 — Twilio WhatsApp Sender (~1-2 business days):**
- [ ] In Twilio Console → Messaging → Senders → WhatsApp Senders, start application.
- [ ] Link your verified Meta Business account.
- [ ] Purchase a dedicated Twilio phone number (Colombian +57 or US +1).

**Step 3 — Message Templates (~24-48h):**
- [ ] Submit "daily_sr_challenge" template (daily practice message).
- [ ] Submit "otp_verification" template (phone verification code).
- [ ] Wait for Meta template approval.

**Step 4 — Production Cutover:**
- [ ] Update `TWILIO_PHONE_NUMBER` secret in Supabase with new number.
- [ ] Update webhook URL in Twilio console.
- [ ] Configure `pg_cron` schedule in Supabase (daily at 9 AM).
- [ ] Test full E2E with production number.

### 1.7 Corporate Infrastructure Migration 🏢
> **Goal:** Transition from personal to corporate accounts before processing real user data and payments.
- [ ] Incorporate company/entity (if not fully completed).
- [ ] Migrate/Create Stripe Account under Corporate EIN (critical for payouts and KYC).
- [ ] Migrate/Create Supabase Project to a corporate email/billing account.
- [ ] Migrate Vercel, Twilio, OpenAI, Azure, and ElevenLabs to company billing.
- [ ] Secure corporate domains and email addresses (e.g. `dave@masterytalk.pro`).

### 1.9 Production Hardening
- [ ] Error monitoring: integrate Sentry (or Supabase built-in logs)
- [ ] Rate limiting: already implemented ✅, verify limits are appropriate
- [ ] Review Google OAuth consent screen — update to "MasteryTalk PRO"
- [ ] Custom domain for Supabase Auth (removes `zkury...supabase.co` from OAuth)

### 2.0 Legal Compliance
- [x] Privacy Policy page (GDPR/CCPA compliant) — `PrivacyPage.tsx`
- [x] Terms of Service page — `TermsPage.tsx`
- [ ] Cookie notice (if applicable)

---

## Phase 2 — Growth & Retention (Priority: After Phase 1)

> **Goal:** Get users to come back and buy additional paths.

### 2.1 Email Service
- [ ] Choose provider (Resend recommended — $0 for 3k emails/mo)
- [ ] Welcome email on registration
- [ ] Post-session summary email (scores, key improvements)
- [ ] Inactive user nudge (7 days without practice)
- [ ] Purchase confirmation email (already partially in webhook)

### 2.2 Dashboard Improvements
- [ ] Cross-path progress overview (when user owns 2+ paths)
- [ ] Session streak visualization
- [ ] "Recommended next session" based on weakest pillar

### 2.3 Conversion Optimization
- [ ] A/B test pricing page copy
- [ ] Add testimonial/social proof section to landing
- [ ] Implement referral system (share link → both get discount)

---

## Phase 3 — Content Expansion (Priority: After retention data)

> **Goal:** More paths to buy, more reasons to stay.

### 3.1 Sales Scenario (New Path)
- [ ] Design sales-specific conversation flow (separate from interview)
- [ ] Create sales system prompt + evaluator criteria
- [ ] Add `sales` back to ACTIVE_SCENARIOS
- [ ] Update PRODUCT_SPEC §2

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
