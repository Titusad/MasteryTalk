---

## PROJECT CONTEXT: MasteryTalk PRO

> This section overrides generic defaults for this specific project.
> Rules here are P0-level — they take precedence over skill defaults.
>
> **Key documents (always check before coding):**
> - `.claude/CLAUDE.md` — Working rules, architecture, design system, reglas operacionales
> - `docs/ROADMAP.md` — What to build and in what order

---

### Product

**MasteryTalk PRO** — AI-powered executive English communication simulator
for nearshoring professionals in Latin America (Mexico and Colombia).

**Business model: Subscriptions via Stripe (live mode)**

| Tier | Price | Notes |
|------|-------|-------|
| Early Bird | $9.99/mo | Max 20 slots, lifetime price |
| Monthly Pro | $16.99/mo | Standard monthly |
| Quarterly Pro | $39.99/3mo | ~$13.33/mo |

- Subscription → unlocks ALL practice paths and sessions
- Early Bird slots tracked via KV store (`global:early_bird_count`)
- Webhook: `checkout.session.completed` is primary activation event
- Grace period: 2 days on failed payment before access revoked

**PROHIBITED terms in UI copy:** "Maratón", "Gimnasio", "credits", "one-time purchase"

**North Star metric:** 3+ sessions completed in the first 7 days.

---

### Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 + Vite 6 | Hash-based routing — NO React Router |
| Animations | `motion/react` | Import as `motion`. NEVER `framer-motion` |
| Icons | `lucide-react` | Only this library |
| Backend | Supabase Edge Functions (Deno + Hono) | Project ref: `zkuryztcwmazspscomiu` |
| Function name | `make-server-08b8658d` | Deploy with `--no-verify-jwt` |
| AI Chat | GPT-4o | ALL sessions including free — no degradation |
| Feedback | Gemini 1.5 Flash | |
| TTS | ElevenLabs (practice) + Azure Neural (system) | |
| STT + Pronunciation | Azure Speech REST API | |
| Payments | Stripe (live mode) | Subscriptions via Checkout |
| Email | Resend | Key in `supabase/.env.local` |
| Frontend deploy | Vercel | Auto-deploy on push to main |
| Package manager | pnpm | NEVER modify `pnpm-lock.yaml` |

---

### Skill routing — consult before acting

| Task | Skill to use |
|------|-------------|
| UI components, pages, React | `frontend-design` |
| Edge Functions, Supabase, API | `api-patterns` |
| Debugging errors | `systematic-debugging` |
| Deployments | `deployment-procedures` |
| Multi-file refactors | `architecture` |
| Tests | `testing-patterns` |
| Performance | `performance-profiling` |

---

### Regla #0 — Diagnóstico antes de instruir al usuario

1. **Credenciales** — Buscar siempre en `supabase/.env.local` antes de pedir al usuario que vaya a un dashboard externo.
2. **Logs** — Leer Supabase logs antes de mandar a re-enviar o re-deployar.
3. **Instrucción completa** — Qué hacer + dónde exactamente + qué resultado exacto se debe ver.

---

### MANDATORY: Confirm Before ANY Code Change

```
PLAN DE CAMBIOS

Archivos a modificar:
  - src/path/archivo.tsx — [descripción del cambio]

Archivos a crear: (ninguno) o [lista]
Archivos a eliminar: (ninguno) o [lista]
Impacto: [qué otros archivos podrían verse afectados]

¿Procedo con estos cambios?
```

Esperar confirmación explícita antes de escribir código.

---

### Component Registry (resumen)

- `AppHeader` → `src/shared/ui/AppHeader.tsx`
- `AppModal` → `src/shared/ui/AppModal.tsx`
- App buttons: `rounded-lg` | Landing buttons: `rounded-full`
- App cards: `rounded-2xl border-[#e2e8f0]` | Landing: `rounded-3xl border-gray-200`
- Solo `lucide-react` para íconos

### Protected Files — NEVER Modify

```
src/app/components/figma/ImageWithFallback.tsx
supabase/functions/server/kv_store.tsx
utils/supabase/info.tsx
pnpm-lock.yaml
```

---

*MasteryTalk PRO project context — v3.0 — 2026-04-28*
