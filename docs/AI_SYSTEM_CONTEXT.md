# inFluentia PRO - AI System Context (Consolidated Source of Truth)

> **Mandatory Read:** Review this document to understand the real-time tech stack, architectural patterns, and user flows before proposing implementation plans or writing code. This file guarantees you stay aligned with recent refactors and bypasses outdated documentation.

## 1. Tech Stack (Current Reality)
- **Frontend Framework:** React 18, Vite (Single Page App utilizing conditional component mounting in `App.tsx`, *not* using Next.js App/Pages router).
- **Styling:** Tailwind CSS v4, Radix UI Primitives, `framer-motion` (now imported as `motion/react`).
- **Backend/BaaS:** Supabase (Auth, PostgreSQL DB, Edge Functions in Deno).
- **AI & LLM Engines:**
  - Logic, Feedback, Generation: Gemini 1.5 Flash (via Edge Functions).
  - Conversational Agent: GPT-4o.
- **Voice APIs:**
  - Standard TTS, STT & Pronunciation Assessment: Azure Speech REST API.
  - Premium Immersion TTS: ElevenLabs.
- **Other utilities:** `canvas-confetti` (for post-purchase), `jspdf` (for report generation).

## 2. Core Architecture & Patterns
- **Service Layer (Adapter Pattern):** All data fetching and business logic MUST go through abstract service singletons exported via `/src/services/` (e.g., `authService`, `conversationService`, `feedbackService`). This allows seamless switching between `Mock` data and `Supabase` real endpoints. Auto-detects via `.env`.
- **State & Routing:** 
  - Hash-based manual routing (`window.location.hash`) inside `App.tsx`. No `react-router-dom`. 
  - Heavy reliance on React Hooks (`useState`, `useRef`, `useCallback`) and `sessionCache.ts` (in-memory Map) to prevent API calls on component re-mounts.
- **Error Protocol:** Centralized via `ServiceError` class. The entire app is wrapped inside an `ErrorBoundary.tsx` to trap render failures gracefully instead of blank screens. Do not throw generic 'Error's; use mapped service errors.

## 3. The 8-Step Practice Session Flow (`PracticeSessionPage.tsx`)
The `PracticeSessionPage.tsx` acts as an orchestrator. It transitions through the following `step` states sequentially:
1. **`key-experience`** (`KeyExperienceScreen`): (Interviews only, if profile is missing it). Requests user background for AI context.
2. **`extra-context`** (`ExtraContextScreen`): Collects specific scenario roles/input.
3. **`generating-script`** (`AnalyzingScreen`): Loading state. Triggers Supabase Edge Functions in the background to generate scripts and briefings.
4. **`pre-briefing`** (`PreBriefingScreen` or `InterviewBriefingScreen`): Displays generated strategy, anticipated questions, and cultural tips using modular components inside `src/app/components/briefing/` (e.g., `BriefingCarousel`). 
5. **`practice`** (`VoicePractice`): The core voice interaction UI, connecting to STT/TTS and handling the "Arena" conversational scaffolding (Support -> Guidance -> Challenge).
6. **`analyzing`** (`AnalyzingScreen`): Loading state. Calls Edge Functions to analyze user recording and STT transcript.
7. **`conversation-feedback`** (`ConversationFeedback`): Renders actionable feedback (Strengths, Opportunities, and AI Improved Script).
8. **`session-recap`** (`SessionReport`): Consolidates the complete holistic report, pronunciation data, and offers PDF downloading functionality.

## 4. Key Sub-systems
- **i18n (Internationalization):** Implemented natively in `/components/landing-i18n.ts` and `LandingLangContext.tsx`. Supports ES, PT, and EN. Modals like `LanguageTransitionModal` bridge the localized landing pages with the English-only core product.
- **Paywall & Usage Gating:** Fully operational "pay-per-session" credit system (no subscriptions). Handled via `useUsageGating.ts` hook and `CreditUpsellModal.tsx`. Validates credits aggressively before allowing session initiation. Free users receive exactly one free session.

*Last Updated: Based on post-refactor codebase (KeyExperienceScreen split, Briefing Carousel implementations, and Azure Speech integration).*
