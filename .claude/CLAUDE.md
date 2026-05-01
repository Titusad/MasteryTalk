# MasteryTalk PRO — CLAUDE.md

> Briefing permanente para Claude Code. Define contexto, arquitectura, reglas de trabajo y referencias a documentación viva.
> Leer completamente antes de cualquier tarea.

---

## ⚠️ LECTURA OBLIGATORIA AL INICIO DE CADA SESIÓN

Antes de cualquier tarea, leer en este orden según el tipo de trabajo:

### Siempre (toda sesión)
1. **`docs/PRODUCT_SPEC.md`** — Source of truth: precios, KV model, API surface, escenarios activos, flujo de sesión
2. **`docs/ROADMAP.md`** — Estado actual (Beta v14.2), qué está live, qué es prioridad
3. **`CONTRIBUTING.md`** — Flujo de sesión, protocolo de commits, cómo trabajamos

### Según el tipo de tarea
| Tarea | Leer también |
|-------|-------------|
| UI / componentes / diseño | `docs/DESIGN_SYSTEM.md` · `.agent/skills/frontend-design/SKILL.md` |
| Copy / voz de marca | `docs/BRAND_VOICE.md` |
| Sistema de prompts de IA | `docs/SYSTEM_PROMPTS.md` · `docs/LEARNING_METHODOLOGY.md` |
| Feedback / CEFR | `docs/CEFR_CALIBRATION.md` |
| UX / flujos | `docs/UX_POLISH.md` · `docs/JOURNEY.md` |
| Edge Functions / API | `.agent/skills/api-patterns/SKILL.md` |
| Debugging | `.agent/skills/systematic-debugging/SKILL.md` |
| Deploy | `.agent/skills/deployment-procedures/SKILL.md` · `memory/project_deploy_commands.md` |
| Refactors | `.agent/skills/architecture/SKILL.md` |
| Tests | `.agent/skills/testing-patterns/SKILL.md` |

> Sin leer PRODUCT_SPEC + ROADMAP primero, se repiten errores ya resueltos y se trabaja fuera de prioridad.

---

## 1. Producto

**MasteryTalk PRO** — simulador de comunicación profesional en inglés para profesionales de nearshoring en LATAM (México, Colombia, Brasil).

**Propuesta de valor:** No vendemos clases. Vendemos acceso a riqueza y poder. El usuario practica conversaciones reales con IA y recibe feedback accionable sobre vocabulario, gramática, fluidez, pronunciación, tono profesional y persuasión.

**North Star metric:** 3+ sesiones completadas en los primeros 7 días.

> ⚠️ PROHIBIDO usar "Maratón" o "Gimnasio" en copy de UI. Son metáforas internas de diseño.
> ⚠️ NO existe "Quick Prep" ni "Conversational Path" como modos de producto — son conceptos legacy. El modelo actual es suscripción única (Monthly / Quarterly).

**Escenarios activos:** `interview`, `meeting`, `presentation`, `sales`, `culture`, `self-intro` (free warm-up).
Ver lista canónica en `docs/PRODUCT_SPEC.md §2`.

---

## 2. Stack tecnológico

> Fuente canónica: `docs/PRODUCT_SPEC.md §11`. Lo siguiente es resumen rápido.

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 + Vite 6 |
| Animaciones | `motion/react` — importar SIEMPRE como `motion`, NO `framer-motion` |
| Iconos | `lucide-react` |
| Backend | Supabase Edge Functions (Deno + Hono) |
| Chat IA | GPT-4o — todas las sesiones, misma calidad free y pagadas |
| Feedback IA | Gemini 1.5 Flash |
| TTS dinámico | **OpenAI `gpt-4o-mini-tts` (PRIMARY)** — voces `cedar` (interlocutor) + `marin` (user lines) |
| TTS dinámico fallback | ElevenLabs `eleven_turbo_v2_5` |
| TTS narración coach | ElevenLabs (pre-generado en R2 — costo $0 por usuario) |
| STT + pronunciación | Azure Speech REST API |
| Pagos | **Stripe** (suscripciones, live mode) |
| Audio cache | Cloudflare R2 (via Supabase Storage) |
| Hosting | Vercel (auto-deploy on push to main) |

**Routing:** Hash-based (`#dashboard`, `#practice-session`). NO migrar a React Router sin autorización.
**Package manager:** pnpm. No modificar `pnpm-lock.yaml`.

---

## 3. Modelo de negocio

> Fuente canónica: `docs/PRODUCT_SPEC.md §3`. Lo siguiente es resumen rápido.

**⚠️ PRECIOS CANÓNICOS — usar SIEMPRE estos valores:**

| Plan | Launch (25 slots auto) | Regular |
|------|:----------------------:|:-------:|
| Monthly | **$12.99/mo** | $19.99/mo |
| Quarterly | **$29.99/3mo** ($9.99/mo) | $47.99/3mo ($15.99/mo) |

- Self-intro: **3 sesiones gratuitas**, sin tarjeta
- El precio de lanzamiento se aplica automáticamente — el usuario elige Monthly o Quarterly, el backend elige el precio según slots disponibles
- War Room: máximo **5 sesiones/mes** por usuario (incluidas en suscripción)
- **NO existe:** pay-per-session, créditos individuales, Early Bird como tier separado, $4.99, $9.99 standalone, $16.99, $39.99

---

## 4. Design System

> **Fuente canónica: `docs/DESIGN_SYSTEM.md`** — leer SIEMPRE antes de crear UI.
> Lo siguiente es un recordatorio rápido de las reglas más críticas.

**Regla de contexto:**
- App interna (`PastelBlobs` + `MiniFooter`) → primario `#0f172b`, cards `rounded-2xl border-[#e2e8f0]`, botones `rounded-lg`
- Landing/marketing (`DotPattern` + footer) → primario `#2d2d2d`, cards `rounded-3xl border-gray-200`, botones `rounded-full`

**Prohibido en botones:** `rounded-xl`, `rounded-2xl`, `rounded-3xl`.
**Prohibido en cards:** `shadow-md`, `shadow-xl`, `shadow-2xl`.
**Prohibido siempre:** `text-[13px]`, `p-5`, `p-7`, `gap-5`, `gap-7`, `style={{ fontWeight }}` inline.
**Pesos en app interna:** 400, 500, 700. PROHIBIDO: 300, 600.

---

## 5. Component Registry

> **Fuente canónica: `docs/DESIGN_SYSTEM.md §Component Registry`** — verificar antes de crear cualquier componente.

**Regla crítica:** Buscar antes de crear. Si existe un canónico → reutilizar o extender con props. Si no existe → crear en `src/shared/ui/`. NUNCA crear header, modal, botón o card inline desde cero.

**Canónicos clave:**

| Componente | Archivo | Variantes |
|-----------|---------|-----------|
| `AppHeader` | `src/shared/ui/AppHeader.tsx` | `'public' \| 'dashboard' \| 'session'` |
| `AppModal` | `src/shared/ui/AppModal.tsx` | `'sm' \| 'md' \| 'lg' \| 'full'` |
| `BrandLogo` | `src/shared/ui/BrandLogo.tsx` | — |
| `PastelBlobs` | `src/shared/ui/PastelBlobs.tsx` | Todas las páginas app |
| `MiniFooter` | `src/shared/ui/MiniFooter.tsx` | Todas las páginas app |
| `AnalyzingScreen` | `src/shared/ui/AnalyzingScreen.tsx` | Loaders de generación/análisis |
| `RecordButton` | `src/shared/ui/RecordButton.tsx` | VoicePractice, ejercicios de voz |
| `ServiceErrorBanner` | `src/shared/ui/ServiceErrorBanner.tsx` | Errores de API en flujo activo |
| `DotPattern` | `src/shared/ui/DotPattern.tsx` | Fondos blancos en landing |

**Nuevo componente permitido** solo si: no existe en registry, es feature-específico, y generalizarlo añadiría complejidad innecesaria → crear en `src/features/{feature}/ui/`.

---

## 6. Arquitectura FSD

Regla fundamental: **capas superiores importan de inferiores, nunca al revés.**

```
app → pages → widgets → features → entities → shared
```

**Raíz del código:** `/Users/dave/masterytalk/src/`

Capas principales:
- `src/app/` — App.tsx, providers, routing
- `src/pages/` — LandingPage, LandingPage2/3, LibraryPage, LessonModal, DesignSystemPage
- `src/widgets/` — PathPurchaseModal, PracticeSideNav, SessionProgressBar, PracticePrepScreen
- `src/features/` — practice-session/, arena/, dashboard/, skill-drill/
- `src/entities/` — session/, user/, payment/, feedback/, progression/
- `src/shared/` — ui/ (Component Registry), i18n/, lib/, hooks/
- `src/services/` — adapters (supabase/mock), prompts/, types

**Regla de oro:** Nunca mover un archivo Y cambiar su contenido en el mismo paso.

FSD Migration: **90%+ completado**. `app/components/` legacy es el único residuo.

---

## 7. Flujo de usuario

```
Landing (#)
  └── PracticeWidget → Auth (Google)
        └── LanguageTransitionModal (ES/PT solamente)
              └── PracticeSessionPage (#practice-session)
                    experience → context → strategy → [interlocutor-intro]
                    → generating → practice-prep → practice
                    → analyzing → feedback → upsell → Dashboard

Dashboard (#dashboard)
  ├── HeroCard + 4 widgets (ProgressSummary, SRDashboard, War Room, PlatformNews)
  ├── PracticePathsModule → ProgressionTree → LevelDrawer → LessonStepper
  ├── RecommendedLessonsCard (catch-up entre sesiones)
  └── PathPurchaseModal (paywall / upsell)
```

**Bifurcación por scenarioType en generating:**
- `interview` → `generateInterviewBriefing` → `InterviewBriefingScreen`
- `sales` → `generateScript` + `generatePreparationToolkit` (paralelo) → briefing
- Otros → `generateScript` → `PreBriefingScreen`

**War Room:** `startAtContext=true` salta experience → va directo a context. Límite: 5/mes.

---

## 8. Reglas operacionales

### 🛑 REGLA ABSOLUTA — CONFIRMAR ANTES DE ESCRIBIR CÓDIGO

**NUNCA escribir, modificar ni eliminar código sin haber recibido confirmación explícita.**

**Paso 1 — Plan (solo texto, cero código):**
```
📋 PLAN DE CAMBIOS
Archivos a modificar: [lista con descripción]
Archivos a crear: [lista con descripción]
Archivos a eliminar: [lista o "ninguno"]
Impacto en otros componentes: [lista]
¿Procedo?
```

**Paso 2 — Esperar confirmación.** "sí", "procede", "adelante" son válidos. Corrección → ajustar plan.

**Paso 3 — Ejecutar scope mínimo.** Si aparece algo inesperado fuera del plan → PAUSAR y notificar.

**Paso 4 — Resumen** de archivos modificados/creados/eliminados.

---

### Regla #0 — Diagnóstico antes de instruir al usuario

Antes de pedirle al usuario que haga cualquier cosa:

1. **Credenciales:** buscar en `supabase/.env.local`, `.env.local`, `.env` antes de pedir que vaya a un dashboard.
2. **Logs:** leer logs de Supabase antes de dar instrucciones de re-deploy.
3. **Instrucción completa:** qué hacer + dónde exactamente + qué resultado exacto esperar.

### Regla #1 — Buscar antes de crear

1. Verificar Component Registry (`docs/DESIGN_SYSTEM.md`).
2. Verificar escalas de Design System (`docs/DESIGN_SYSTEM.md`).
3. Si existe canónico → usar o extender.
4. Si no existe → crear en `src/shared/ui/` con props genéricas.

### Regla #2 — Scope mínimo

Editar SOLO los archivos del plan confirmado. No refactorizar adyacente, no renombrar sin pedido explícito.

### Regla #3 — Integridad del código

- No crear mocks para evitar bugs reales.
- No desconectar integraciones (Supabase, OpenAI, Azure) sin autorización.
- Nunca `catch () {}` vacíos — siempre `console.error('[Componente] Failed to X:', err)`.
- No usar `style={{ }}` inline para tipografía o colores.

### Regla #4 — Ambigüedad

Si el request puede interpretarse de más de una forma → PREGUNTAR antes de asumir.

---

## 9. Archivos protegidos — NUNCA modificar

```
src/app/components/figma/ImageWithFallback.tsx
supabase/functions/make-server-08b8658d/kv_store.ts
utils/supabase/info.tsx
pnpm-lock.yaml
```

---

## 10. Naming conventions

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes | PascalCase | `AppHeader.tsx` |
| Hooks | camelCase con `use` | `useMediaRecorder.ts` |
| Utilidades | camelCase | `sessionCache.ts` |
| Feature slices | kebab-case | `practice-session/` |
| Tipos | PascalCase descriptivo | `RealFeedbackData` |

---

## 11. Service Layer

Auto-detect: `VITE_SUPABASE_URL` configurado → adapters reales; si no → mock.

Servicios: `authService` · `conversationService` · `feedbackService` · `speechService` · `userService` · `paymentService` · `spacedRepetitionService`

---

## 12. Backend — Hono Edge Functions

- **Base URL:** `https://zkuryztcwmazspscomiu.supabase.co/functions/v1/make-server-08b8658d`
- **Auth:** `Authorization: Bearer <token>` en todos los endpoints salvo `/pricing` y `/health`
- **KV store:** `get`, `set`, `getByPrefix` — NO existe función `list`
- **File writes:** solo en `/tmp`
- **Project ref:** `zkuryztcwmazspscomiu`

**Endpoints clave** (ver lista completa en `PRODUCT_SPEC.md §10.1`):
```
GET  /pricing              ← live slots + current prices (public, no auth)
POST /create-checkout      ← { tier: "monthly" | "quarterly" } → Stripe session
POST /sessions             ← guardar sesión post-práctica (incluye is_war_room)
GET  /sessions             ← historial de sesiones
PUT  /profile              ← actualizar perfil (campos whitelisted)
POST /tts                  ← TTS dinámico (OpenAI primary, ElevenLabs fallback)
GET  /progression          ← progression state (auto-unlock si subscription_active)
```

---

## 13. i18n

- Landing: ES (default) · PT · EN
- App y feedback: siempre EN (inmersión)
- `LanguageTransitionModal` se salta para usuarios EN
- Hook: `useLandingCopy()` desde `src/shared/i18n/LandingLangContext.tsx`
- Persistencia: `localStorage('masterytalk_lang')`
- Estructura de pricing en i18n: `copy.pricing.modal.*`, `copy.pricing.monthly.*`, `copy.pricing.quarterly.*`

---

## 14. Estado actual del proyecto (2026-05-01 — Beta v14.2)

### ✅ Completado y estable

| Área | Notas |
|------|-------|
| FSD Architecture 90%+ | `app/components/` legacy es el único residuo |
| Subscription payments | Stripe live: Monthly EB $12.99 / Quarterly EB $29.99 → $19.99/$47.99 regular |
| Launch pricing | Auto-aplicado por backend; 25 slots shared; `/pricing` endpoint con currentPrice |
| Pricing modal | 2 cards (Monthly/Quarterly), dynamic from /pricing, i18n ES/PT/EN |
| AppHeader + AppModal | Canónicos en `src/shared/ui/` — variants: public/dashboard/session |
| Font system | Poppins global (`body` en `theme.css`); `.font-montserrat` utility; cero `fontFamily` inline |
| Auth security | `getAuthToken()` en todos los Edge Function calls; OAuth flash resuelto |
| Test coverage | **119 tests** — Vitest: SR (22), Auth (7), Feedback (7), Presets (20), Assembler (22), Payment (10+) |
| TTS optimization | OpenAI `gpt-4o-mini-tts` PRIMARY (cedar/marin) → ElevenLabs FALLBACK; narración coach en R2 |
| War Room limit | 5 sesiones/mes; KV: `war_room_monthly_count` + `war_room_month` |
| Lessons Library | 50 micro-lecciones; dual-axis (debilidad + path/level); nav: "Lessons Library" |
| DeepDiveCard | Post-sesión en FeedbackScreen bottomSlot |
| RecommendedLessonsCard | Dashboard catch-up; link funcional a Lessons Library |
| LessonModal audio | Play/pause opcional cuando `audioUrl` presente |
| Dashboard v4 | HeroCard + 4 widgets + ProgressionTree; DashboardSkeleton completo |
| Scenario system | 6 activos: interview/sales/meeting/presentation/culture/self-intro |
| Situation Presets | 12 presets (3 × 4 escenarios), sin asunción de rol |
| Emails transaccionales | Resend: welcome, subscription confirmation, session summary, renewal, inactivity nudge |
| Error monitoring | Sentry (`@sentry/react`, producción, ErrorBoundary) |
| Security | Admin auth, PUT /profile whitelist, CRON_SECRET, XSS/prompt injection audit |

### ⚠️ Pendiente

| Prioridad | Tarea |
|-----------|-------|
| 🔴 Alta | **Supabase Pro** — free tier se pausa 7 días sin actividad (CRÍTICO antes de usuarios pagos) |
| 🔴 Alta | **Twilio WhatsApp producción** — Meta verification en revisión |
| 🟡 Media | E2E tests (Playwright) |
| 🟡 Media | Mobile responsiveness audit |
| 🟡 Media | Supabase CLI migrations (schema no versionado) |
| 🟢 Baja | WCAG accessibility audit |
| 🟢 Baja | Strip console.log en producción |

---

## 15. Scenario Registry

> Leer antes de tocar cualquier archivo de prompts.

Cada escenario activo tiene **dos registros independientes:**

**Frontend** — `src/services/prompts/scenarios/{scenario}.ts`
- `SCENARIO_ADAPTATION_{SCENARIO}` → inyectado como Block 4.5 en el system prompt (GPT-4o)

**Backend** — `supabase/functions/make-server-08b8658d/scenarios/{scenario}.ts`
- `{SCENARIO}_DUAL_AXIS_BLOCK` → evaluación dual-axis para Gemini
- `{SCENARIO}_OUTPUT_FIELDS` → campos JSON adicionales del analista
- `get{Scenario}GapAnalysis(filledKeys)` → detección de gaps en pre-briefing

**Presets** — `src/features/practice-session/model/scenario-presets.ts`
- 3 presets por escenario (12 total) — describen la SITUACIÓN, no el rol del usuario

### Para agregar un nuevo escenario

1. Agregar tipo a `ScenarioType` en `src/entities/session/index.ts`
2. Crear `src/services/prompts/scenarios/{nuevo}.ts` + re-exportar
3. Crear `supabase/functions/.../scenarios/{nuevo}.ts` + re-exportar + agregar al dispatcher
4. Agregar interlocutores en `personas.ts` + intel en `prebriefing-prompts.ts`
5. Agregar 2-3 presets en `scenario-presets.ts`
6. Escribir tests: preset integrity + assembler adaptation block

### Estado actual

| ScenarioType | Frontend | Backend | Presets | UI |
|-------------|:--------:|:-------:|:-------:|:--:|
| `interview` | ✅ | ✅ | ✅ 3 | ✅ |
| `sales` | ✅ | ✅ | ✅ 3 | ✅ |
| `meeting` | ✅ | ✅ | ✅ 3 | ✅ |
| `presentation` | ✅ | ✅ | ✅ 3 | ✅ |
| `culture` | ✅ | ✅ | ✅ 3 | ✅ |
| `self-intro` | ❌ | ❌ | ❌ | ✅ (free) |
| `client`, `csuite` | ❌ | ❌ | ❌ | ❌ (future) |

---

*v2.0 — 2026-05-01*
*Cambios: Reescrito completamente — eliminada duplicación con DESIGN_SYSTEM.md, referencias a todos los docs activos, stack corregido (OpenAI TTS + Stripe), precios canónicos, rutas actualizadas, estado v14.2.*
