---

## PROJECT CONTEXT: MasteryTalk PRO

> This section overrides generic defaults for this specific project.
> Rules here are P0-level — they take precedence over skill defaults.
>
> **Key documents (always check before coding):**
> - `CONTRIBUTING.md` — Working rules, Git conventions, session protocol
> - `docs/PRODUCT_SPEC.md` — Product spec (source of truth for business logic)
> - `docs/DESIGN_SYSTEM.md` — Visual design rules (source of truth for UI)
> - `docs/ROADMAP.md` — What to build and in what order
> - `docs/SYSTEM_PROMPTS.md` — AI prompt engineering

---

### Product

**MasteryTalk PRO** — AI-powered executive English communication simulator
for nearshoring professionals in Latin America (Mexico and Colombia).

**Business model: One-time path purchases (no subscriptions in beta)**
- **Demo** — 1 free session per scenario, no card required
- **First Path** — $4.99 one-time, full permanent access to 1 Learning Path
- **Additional Path** — $16.99 one-time per additional Learning Path

> See `docs/PRODUCT_SPEC.md` §3 for full pricing logic.

> PROHIBITED: Never use "Maratón", "Gimnasio", "Marathon", "Gym",
> "Quick Prep", "Conversational Path", "credits", or "subscription"
> in any UI copy. These are either internal metaphors or deprecated terms.

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
| Payments | Stripe (global) | One-time payments via Checkout |
| Package manager | pnpm | NEVER modify `pnpm-lock.yaml` |

**Agent routing for this project:**
- UI components, pages, React → `frontend-specialist`
- Edge Functions, Supabase, API → `backend-specialist`
- Schema, SQL, RLS → `database-architect`
- Multi-file refactors → `orchestrator` (always plan first)

---

### MANDATORY: Confirm Before ANY Code Change

> This rule ADDS TO the existing Socratic Gate — it applies even for
> "simple" or "single-file" requests.

**Before writing, modifying, or deleting any code, present this plan:**

```
PLAN DE CAMBIOS

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

> This rule exists because unconfirmed modifications have damaged
> working components in this project. No exceptions for "small changes".

---

### Component Registry & Design System

> **Full design rules are in `docs/DESIGN_SYSTEM.md`.**
> Read that document for colors, typography, spacing, shadows, component registry, and strict bans.
> Below is a minimal summary for quick reference.

**Canonical components (always use before creating new ones):**
- `AppHeader` → `src/shared/ui/AppHeader.tsx`
- `AppModal` → `src/shared/ui/AppModal.tsx`
- `BrandLogo` · `PastelBlobs` · `MiniFooter` · `AnalyzingScreen` · `RecordButton` · `RecordingWaveformBars` · `RecordingTimer` · `SessionProgressBar` · `ServiceErrorBanner` · `SmoothHeight` · `DotPattern`

**Quick rules:**
- App buttons = `rounded-lg`. Landing buttons = `rounded-full`. NEVER mix.
- App cards = `rounded-2xl` + `border-[#e2e8f0]`. Landing cards = `rounded-3xl` + `border-gray-200`.
- NO emojis in UI. NO arbitrary icons. NO inline CSS.
- Only `lucide-react` for icons.

---

### Protected Files — NEVER Modify

```
src/app/components/figma/ImageWithFallback.tsx
supabase/functions/server/kv_store.tsx
utils/supabase/info.tsx
pnpm-lock.yaml
```

---

### FSD Architecture

Target layer order: `app → pages → widgets → features → entities → shared`

Upper layers import from lower layers ONLY. Features never import from other features.

**Golden rule:** Never move a file AND change its content in the same step.
Move first → verify it compiles → then refactor.

---

*MasteryTalk PRO project context — v2.0 — April 2026*