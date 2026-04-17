---

## 🏗️ PROJECT CONTEXT: MasteryTalk PRO

> This section overrides generic defaults for this specific project.
> Rules here are P0-level — they take precedence over skill defaults.
> Append this to the end of `.agent/rules/GEMINI.md`.

---

### Product

**MasteryTalk PRO** — AI-powered executive English communication simulator
for nearshoring professionals in Latin America (Mexico and Colombia).

**Two modes (canonical naming — always use these exact terms):**
- **Quick Prep** — User has an imminent meeting or interview. Direct flow,
  Arena without full scaffolding. Access via individual credits.
- **Conversational Path** — User wants long-term professional English improvement.
  Level progression (Interview Mastery / Sales Champion), AI coaching via
  Lesson Modals. Access via subscription.

> ⚠️ PROHIBITED: Never use "Maratón", "Gimnasio", "Marathon" or "Gym" in
> any UI copy. These are internal design metaphors only.

**North Star metric:** 3+ sessions completed in the first 7 days.

---

### Stack (Project-Specific Overrides)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 + Vite 6 | Hash-based routing — NO React Router |
| Animations | `motion/react` | Import as `motion`. NEVER `framer-motion` |
| Icons | `lucide-react` | Only this library |
| Backend | Supabase Edge Functions (Deno + Hono) | |
| AI Chat | GPT-4o | ALL sessions including free — no degradation |
| Feedback | Gemini 1.5 Flash | |
| TTS | ElevenLabs (practice) + Azure Neural (system) | |
| STT + Pronunciation | Azure Speech REST API | |
| Payments | Mercado Pago (LATAM) | |
| Package manager | pnpm | NEVER modify `pnpm-lock.yaml` |

**Agent routing for this project:**
- UI components, pages, React → `frontend-specialist`
- Edge Functions, Supabase, API → `backend-specialist`
- Schema, SQL, RLS → `database-architect`
- Multi-file refactors → `orchestrator` (always plan first)

---

### 🛑 MANDATORY: Confirm Before ANY Code Change

> This rule ADDS TO the existing Socratic Gate — it applies even for
> "simple" or "single-file" requests.

**Before writing, modifying, or deleting any code, present this plan:**

```
📋 PLAN DE CAMBIOS

Archivos a modificar:
  - src/path/archivo.tsx — [descripción del cambio]

Archivos a crear:
  - src/path/nuevo.tsx — [descripción]

Archivos a eliminar:
  - (ninguno) o [lista]

Impacto en otros componentes:
  - [qué otros archivos podrían verse afectados]

¿Procedo con estos cambios?
```

**Wait for explicit confirmation before proceeding.**
Valid confirmations: "sí", "procede", "adelante", "yes", "proceed".

If unexpected files need to be modified during implementation → PAUSE and notify before continuing.

> ⚠️ This rule exists because unconfirmed modifications have damaged
> working components in this project. No exceptions for "small changes".

---

### Component Registry — Search Before Creating

**Before creating ANY UI element, check if a canonical version exists.**

#### Headers — canonical: `AppHeader`
**Location:** `src/shared/ui/AppHeader.tsx`

One component for all internal app headers. Props:
`variant` ('app' | 'session' | 'minimal'), `showBackButton`, `backLabel`,
`onBack`, `showProgressBar`, `currentStep`, `userName`, `onLogout`,
`onNavigateToAccount`, `rightSlot`

Landing page header is a special marketing case — lives in `LandingPage.tsx`.

#### Modals — canonical: `AppModal`
**Location:** `src/shared/ui/AppModal.tsx`

One wrapper for all modals. Props: `open`, `onClose`,
`size` ('sm' | 'md' | 'lg' | 'full'), `showCloseButton`, `accentBar`

Fixed specs (never override):
- Backdrop: `bg-[#0f172b]/60 backdrop-blur-sm`
- Card: `bg-white rounded-3xl shadow-2xl overflow-hidden`
- Animation: `scale 0.92→1, y 24→0, opacity 0→1, 0.5s`

#### Buttons — canonical variants

```tsx
// App internal (primary) — #0f172b + rounded-lg
className="bg-[#0f172b] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1d293d] transition-colors"

// Landing/marketing (primary) — #2d2d2d + rounded-full
className="bg-[#2d2d2d] text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-[#1a1a1a] transition-colors shadow-lg"

// Secondary app
className="border border-[#e2e8f0] text-[#0f172b] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#f8fafc] transition-colors"

// Ghost
className="text-[#45556c] hover:text-[#0f172b] text-sm transition-colors"
```

**RULE: App buttons = `rounded-lg`. Landing buttons = `rounded-full`. NEVER mix.**

#### Cards — canonical variants

```tsx
// App card (most common)
className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6"

// Landing/marketing card
className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6"

// Compact card (list items, levels)
className="bg-white rounded-xl border border-[#e2e8f0] p-4"

// Dark card (offer blocks, report hero)
className="bg-[#0f172b] rounded-2xl p-6"
```

**RULE: App = `rounded-2xl` + `border-[#e2e8f0]`. Landing = `rounded-3xl` + `border-gray-200`. NEVER mix.**

#### Existing shared components (never reimplement)

`BrandLogo` · `PastelBlobs` · `MiniFooter` · `AnalyzingScreen` ·
`RecordButton` · `RecordingWaveformBars` · `RecordingTimer` ·
`SessionProgressBar` · `ServiceErrorBanner` · `SmoothHeight` · `DotPattern`

---

### 🚫 STRICT UI BANS (Emojis & Icons)

> **MANDATORY**: The AI tends to hallucinate emojis and arbitrary icons when creating buttons and headers. **DO NOT DO THIS.**

1. **NO EMOJIS (`🚀`, `✨`, `🔥`, `💡`, etc.)**
   - Emojis are strictly forbidden in UI text, buttons, alerts, and system prompts.
2. **NO ARBITRARY ICONS**
   - Only use `lucide-react`. Do not import random SVGs or font-awesome.
   - Do not add an icon to a button unless explicitly requested by the user.

---

### Design System Scales

#### Typography — allowed values only

| Tailwind class | Size / Weight | Use |
|---------------|--------------|-----|
| `text-2xl font-semibold` | 24px / 600 | Page titles |
| `text-xl font-semibold` | 20px / 600 | Section titles, card headings |
| `text-base font-semibold` | 16px / 600 | Subtitles, section labels |
| `text-sm` | 14px / 400 | **Standard app body ← most used** |
| `text-sm font-medium` | 14px / 500 | Labels, level names, badges |
| `text-xs font-medium` | 12px / 500 | Uppercase tags, pills |
| `text-xs` | 12px / 400 | Metadata, timestamps |
| `text-5xl font-bold` | 48px / 700 | Score displays (74%, B2) |

**PROHIBITED: `text-[13px]`, `text-[15px]`, `style={{ fontWeight: 600 }}` inline,
`style={{ fontSize: '...' }}` inline. Use Tailwind scale only.**

**Allowed weights in app: 400, 500, 700. PROHIBITED: 300, 600.**

#### Spacing — allowed values only

`gap-1/p-1` (4px) · `gap-2/p-2` (8px) · `gap-3/p-3` (12px) ·
`gap-4/p-4` (16px) · **`gap-6/p-6` (24px ← most used)** · `p-8` (32px) ·
`p-10/p-12` (40-48px, landing only)

**PROHIBITED: `p-5`, `p-7`, `p-9`, `gap-5`, `gap-7`**

#### Border radius — allowed values only

`rounded/rounded-sm` (badges) · **`rounded-lg` (app buttons ← standard)** ·
`rounded-xl` (compact cards) · **`rounded-2xl` (app cards ← standard)** ·
`rounded-3xl` (landing cards, modals) · `rounded-full` (landing buttons, avatars)

**PROHIBITED in buttons: `rounded-xl`, `rounded-2xl`, `rounded-3xl`**

#### Shadows — allowed values only

None (flat) · **`shadow-sm` (app cards ← most used)** · `shadow` (hover) ·
`shadow-lg` (landing CTAs) · `shadow-2xl` (modals ONLY)

**PROHIBITED in cards: `shadow-md`, `shadow-xl`, `shadow-2xl`**

#### Colors

| Context | Primary color | Use |
|---------|-------------|-----|
| App internal | `#0f172b` | Buttons, navbar, active tabs |
| Landing/marketing | `#2d2d2d` | CTAs, public header |

Background: `#f0f4f8` (internal pages) · Border app: `#e2e8f0` · Border landing: `gray-200`

Text: `#0f172b` (primary) · `#45556c` (secondary) · `#62748e` (tertiary) · `#94a3b8` (muted)

Pastel (decorative only, never for text/state):
`#FFE9C7` peach · `#D9ECF0` blue · `#DBEDDF` green · `#E1D4FF` lavender

---

### Business Model

| Plan | Price | Access |
|------|-------|--------|
| Free session | $0 | 1 full session + 2 repetitions of same scenario |
| Quick Prep credit | $4.99/session | All scenarios (interview, sales, negotiation, csuite) |
| Conversational Path monthly | $19.99/month | Full Progression Tree + Lesson Modals |
| Conversational Path quarterly | $49.99/quarter | Same as monthly (~17% savings) |

**Paywall triggers:**
1. 3rd repetition attempt in free session
2. New session without credits/subscription

**GPT-4o for ALL sessions including free — never degrade to GPT-4o-mini.**

---

### Protected Files — NEVER Modify

```
src/app/components/figma/ImageWithFallback.tsx
supabase/functions/server/kv_store.tsx
utils/supabase/info.tsx
pnpm-lock.yaml
```

---

### FSD Architecture (Migration in Progress)

Target layer order: `app → pages → widgets → features → entities → shared`

Upper layers import from lower layers ONLY. Features never import from other features.

Current migration sprints:
1. `shared/ui/` — split `shared/index.tsx` + create `AppHeader` + `AppModal`
2. `entities/` — extract types from `services/types.ts`
3. `features/` — reorganize `practice-session/`, `arena/`, `progression/`
4. `widgets/` — `SessionReport`, `CreditUpsellModal`, `InterviewBriefingScreen`
5. `pages/` — move pages, update `App.tsx`

**Golden rule:** Never move a file AND change its content in the same step.
Move first → verify it compiles → then refactor.

---

*MasteryTalk PRO project context — v1.0 — March 2026*