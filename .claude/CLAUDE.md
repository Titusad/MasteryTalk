# MasteryTalk PRO — CLAUDE.md

> Guía operacional para Claude Code — navegación, principios y reglas de trabajo.
> NO duplica documentación de producto, diseño o estado: apunta a las fuentes canónicas.

---

## ⚠️ LECTURA OBLIGATORIA AL INICIO DE CADA SESIÓN

### Siempre (toda sesión)
1. **`docs/product/PRODUCT_SPEC.md`** — Source of truth: precios, KV model, API surface, escenarios, flujo de sesión
2. **`docs/product/ROADMAP.md`** — Estado actual (Beta v14.6), prioridades, pendientes
3. **`CONTRIBUTING.md`** — Flujo de sesión, protocolo de commits

### Según el tipo de tarea
| Tarea | Leer también |
|-------|-------------|
| UI / componentes / diseño | `docs/product/DESIGN_SYSTEM.md` · `.agent/skills/frontend-design/SKILL.md` |
| Copy / comunicación | `docs/business/BRAND_VOICE.md` · `docs/copy/` |
| Sistema de prompts de IA | `docs/engineering/SYSTEM_PROMPTS.md` · `docs/engineering/LEARNING_METHODOLOGY.md` |
| Feedback / niveles CEFR | `docs/engineering/CEFR_CALIBRATION.md` |
| UX / flujos de usuario | `docs/product/UX_POLISH.md` · `docs/product/JOURNEY.md` |
| Edge Functions / API | `.agent/skills/api-patterns/SKILL.md` |
| Debugging | `.agent/skills/systematic-debugging/SKILL.md` |
| Deploy | `.agent/skills/deployment-procedures/SKILL.md` · `memory/project_deploy_commands.md` |
| Refactors / arquitectura | `.agent/skills/architecture/SKILL.md` |
| Tests | `.agent/skills/testing-patterns/SKILL.md` |

### Principios de desarrollo

**SDD — Spec-Driven Development:**
Toda feature, cambio de precio o decisión de producto → actualizar `docs/product/PRODUCT_SPEC.md` PRIMERO → aprobación explícita → luego código. El spec es la fuente de verdad; el código es la consecuencia.

**FSD — Feature-Sliced Design:**
Toda la arquitectura frontend sigue FSD. Ver §6 y referencia canónica: https://feature-sliced.design/

---

## 1. Producto

**MasteryTalk PRO** — simulador de comunicación profesional en inglés para profesionales en nearshoring de cualquier país del mundo. Foco comercial principal: Colombia, México, Brasil y LATAM en general.

**Propuesta de valor:** No vendemos clases. Vendemos acceso a riqueza y poder.

**North Star:** 3+ sesiones completadas en los primeros 7 días.

> ⚠️ PROHIBIDO en copy de UI: "Maratón", "Gimnasio", "Quick Prep", "Conversational Path" — son conceptos legacy o metáforas internas.
> El acceso rápido sin onboarding se llama **War Room** (máx. 5 sesiones/mes, botón en Dashboard).
> El modelo de suscripción es únicamente Monthly / Quarterly — no existen créditos individuales.

**Escenarios activos:** `interview` · `meeting` · `presentation` · `sales` · `culture` · `self-intro` (free warm-up, 3 sesiones).
Ver definición canónica en `docs/product/PRODUCT_SPEC.md §2`.

---

## 2. Stack tecnológico

> Fuente canónica: `docs/product/PRODUCT_SPEC.md §11`. Lo siguiente es referencia rápida.

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 + Vite 6 |
| Animaciones | `motion/react` — importar SIEMPRE como `motion`, NUNCA `framer-motion` |
| Iconos | `lucide-react` — sin emojis en UI |
| Backend | Supabase Edge Functions (Deno + Hono) |
| Chat IA | GPT-4o — todas las sesiones, sin degradación |
| Feedback IA | Gemini 1.5 Flash |
| TTS dinámico PRIMARY | OpenAI `gpt-4o-mini-tts` — voces `cedar` (interlocutor) · `marin` (user lines) |
| TTS dinámico FALLBACK | ElevenLabs `eleven_turbo_v2_5` |
| TTS narración coach | ElevenLabs pre-generado (archivos en R2 — costo $0 por usuario) |
| STT + pronunciación | Azure Speech REST API |
| WhatsApp SR Coach | Twilio (mensajes + OTP) · Meta Business API |
| Pagos | Stripe (suscripciones, live mode) |
| Audio cache | Cloudflare R2 (via Supabase Storage) |
| Hosting | Vercel (auto-deploy on push to main) |

**Routing:** Hash-based (`#dashboard`, `#practice-session`). NO migrar a React Router sin autorización.
**Package manager:** pnpm. No modificar `pnpm-lock.yaml`.

---

## 3. Modelo de negocio

> Fuente canónica: `docs/product/PRODUCT_SPEC.md §3`.

**⚠️ PRECIOS CANÓNICOS — usar SIEMPRE estos valores:**

| Plan | Founding Member (25 slots, precio permanente) | Regular |
|------|:--------------------------------------------:|:-------:|
| Monthly | **$49/mo** | $49/mo |
| Quarterly (El Programa) | **$49/3mo** ($16.33/mo) | $129/3mo ($43/mo) |

- Self-intro: **3 sesiones gratuitas**, sin tarjeta
- Founding Member se aplica automáticamente al Quarterly mientras queden slots — precio bloqueado para siempre
- War Room: máx. **5 sesiones/mes** incluidas en la suscripción
- **NO existen:** $12.99, $19.99, $29.99, $47.99, créditos individuales, compras por sesión o por ruta

---

## 4. Design System

> **Fuente canónica: `docs/product/DESIGN_SYSTEM.md`** — leer antes de crear cualquier UI.

Reglas críticas (recordatorio rápido):

- App interna → primario `#0f172b`, cards `rounded-2xl border-[#e2e8f0]`, botones `rounded-lg`
- Landing/marketing → primario `#2d2d2d`, cards `rounded-3xl border-gray-200`, botones `rounded-full`
- **Prohibido en botones:** `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- **Prohibido en cards:** `shadow-md`, `shadow-xl`, `shadow-2xl`
- **Prohibido siempre:** `text-[13px]`, `p-5`, `p-7`, `gap-5`, `gap-7`, `style={{ fontWeight }}` inline
- **Pesos en app interna:** 400, 500, 700 únicamente

---

## 5. Component Registry

> **Fuente canónica: `docs/product/DESIGN_SYSTEM.md §6`** — verificar ANTES de crear cualquier componente.

**Regla:** Buscar antes de crear. Si existe canónico → reutilizar o extender. Si no existe → crear en `src/shared/ui/`. NUNCA crear header, modal, botón o card inline desde cero.

Canónicos principales: `AppHeader` (variants: `public | dashboard | session`) · `AppModal` (sizes: `sm | md | lg | full`) · `BrandLogo` · `PastelBlobs` · `MiniFooter` · `AnalyzingScreen` · `RecordButton` · `ServiceErrorBanner` · `DotPattern`

---

## 6. Arquitectura FSD (Feature-Sliced Design)

> Referencia canónica: **https://feature-sliced.design/**

Regla: **capas superiores importan de inferiores, nunca al revés.**

```
app → pages → widgets → features → entities → shared
```

**Raíz del código:** `src/`

| Capa | Contenido principal |
|------|-------------------|
| `src/app/` | App.tsx, providers, routing |
| `src/pages/` | LandingPage (×3), LibraryPage, LessonModal, DesignSystemPage |
| `src/widgets/` | PathPurchaseModal, PracticeSideNav, SessionProgressBar, PracticePrepScreen |
| `src/features/` | practice-session/, arena/, dashboard/, skill-drill/ |
| `src/entities/` | session/, user/, payment/, feedback/, progression/ |
| `src/shared/` | ui/ (canónicos), i18n/, lib/, hooks/ |
| `src/services/` | adapters supabase/mock, prompts/, types |

**Regla de oro:** Nunca mover un archivo Y cambiar su contenido en el mismo paso.

---

## 7. Flujo de usuario

```
Landing (#)
  └── PracticeWidget → Auth (Google)
        └── LanguageTransitionModal (ES/PT únicamente, no EN)
              └── PracticeSessionPage (#practice-session)
                    experience → context → [lesson] → strategy
                    → [interlocutor-intro, solo interview]
                    → generating → practice-prep → practice
                    → analyzing → feedback → [upsell]
                    → Dashboard (#dashboard)

Dashboard (#dashboard)
  ├── WA banner (si !whatsapp_verified)
  ├── HeroCard + 4 widgets (ProgressSummary · SRDashboard · War Room · PlatformNews)
  ├── PracticePathsModule → ProgressionTree → LevelDrawer → LessonStepper
  ├── RecommendedLessonsCard (catch-up entre sesiones, si pillarScores disponibles)
  └── PathPurchaseModal (paywall / upsell)
```

**War Room** (`startAtContext=true`): salta `experience` → va directo a `context`. Salta también `lesson`. Límite: 5/mes.

**`[lesson]`** se salta cuando: Challenge Mode activo · War Room · `scenarioType === "self-intro"`. CTA bloqueado hasta que el usuario tapee "Reveal answer" en la pregunta de recall.

**Bifurcación en `generating` por scenarioType:**
- `interview` → `generateInterviewBriefing` → `InterviewBriefingScreen`
- `sales` → `generateScript` + `generatePreparationToolkit` (paralelo) → briefing
- otros → `generateScript` → `PreBriefingScreen`

**FeedbackScreen — post-session cards (bottomSlot):**
1. WhatsApp SR Coach card (si !verified y cooldown OK)
2. Path Recommendation card (solo `self-intro`)
3. Mastery Audit card (solo `product_designer` + ≥3 interview en 14 días)
4. DeepDiveCard (lecciones por debilidad + contexto de sesión)

---

## 8. Reglas operacionales

### 🛑 CONFIRMAR ANTES DE ESCRIBIR CÓDIGO

**NUNCA modificar código sin confirmación explícita.**

```
📋 PLAN DE CAMBIOS
Archivos a modificar: [lista con descripción]
Archivos a crear:    [lista con descripción]
Archivos a eliminar: [lista o "ninguno"]
Impacto:             [otros archivos afectados]
¿Procedo?
```

Esperar confirmación ("sí", "procede", "adelante"). Si aparece algo fuera del plan → PAUSAR y notificar.

---

### Regla #0 — Diagnóstico antes de instruir

1. **Credenciales:** buscar en `supabase/.env.local`, `.env.local`, `.env` antes de pedir dashboard.
2. **Logs:** leer logs de Supabase antes de dar instrucciones de re-deploy.
3. **Instrucción completa:** qué hacer + dónde exactamente + qué resultado esperar.

### Regla #1 — Buscar antes de crear

Verificar `docs/product/DESIGN_SYSTEM.md §6`. Si existe canónico → usar. Si no → crear en `src/shared/ui/`.

### Regla #2 — Scope mínimo

Editar SOLO los archivos del plan confirmado. Sin refactorizar adyacente ni renombrar sin pedido.

### Regla #3 — Integridad

- No crear mocks para evitar bugs reales
- No desconectar integraciones sin autorización
- Nunca `catch () {}` vacíos — siempre `console.error('[Componente] Failed to X:', err)`
- Sin `style={{ }}` inline para tipografía o colores

### Regla #4 — Ambigüedad

Si hay más de una interpretación válida → PREGUNTAR antes de asumir.

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

Auto-detect: `VITE_SUPABASE_URL` → adapters reales; sin ella → mock 100%.

`authService` · `conversationService` · `feedbackService` · `speechService` · `userService` · `paymentService` · `spacedRepetitionService`

---

## 12. Backend — Hono Edge Functions

- **Base URL:** `https://zkuryztcwmazspscomiu.supabase.co/functions/v1/make-server-08b8658d`
- **Auth:** `Authorization: Bearer <token>` — excepto `/pricing` y `/health` (públicos)
- **KV store:** `get`, `set`, `getByPrefix` — NO existe función `list`
- **File writes:** solo en `/tmp`
- **Project ref:** `zkuryztcwmazspscomiu`

Endpoints clave (lista completa en `PRODUCT_SPEC.md §10.1`):
```
GET  /pricing          → live slots + currentPrice/regularPrice (public)
POST /create-checkout  → { tier: "monthly"|"quarterly" } → Stripe session
POST /sessions         → guardar sesión (incluye is_war_room: boolean)
PUT  /profile          → actualizar perfil (campos whitelisted)
POST /tts              → TTS dinámico (OpenAI primary, ElevenLabs fallback)
GET  /progression      → estado progression (auto-unlock si subscription_active)
```

---

## 13. i18n

- Landing: ES (default) · PT · EN
- App y feedback: siempre EN (inmersión total)
- `LanguageTransitionModal` se salta para usuarios EN
- Hook: `useLandingCopy()` desde `src/shared/i18n/LandingLangContext.tsx`
- Persistencia: `localStorage('masterytalk_lang')`
- Estructura pricing: `copy.pricing.modal.*` · `copy.pricing.monthly.*` · `copy.pricing.quarterly.*`

---

## 14. Estado y prioridades

> Ver `docs/product/ROADMAP.md` — contiene el estado completo (Beta v14.6), lo que está live, gaps conocidos y backlog priorizado.

---

## 15. Scenario Registry

> Leer antes de tocar cualquier archivo de prompts.

Cada escenario activo tiene dos registros independientes:

**Frontend** — `src/services/prompts/scenarios/{scenario}.ts`
`SCENARIO_ADAPTATION_{SCENARIO}` → Block 4.5 del system prompt (GPT-4o)

**Backend** — `supabase/functions/make-server-08b8658d/scenarios/{scenario}.ts`
`{SCENARIO}_DUAL_AXIS_BLOCK` · `{SCENARIO}_OUTPUT_FIELDS` · `get{Scenario}GapAnalysis()`

**Presets** — `src/features/practice-session/model/scenario-presets.ts`
3 presets por escenario — describen la SITUACIÓN, no el rol del usuario

### Para agregar un nuevo escenario

1. `ScenarioType` en `src/entities/session/index.ts`
2. `src/services/prompts/scenarios/{nuevo}.ts` + re-exportar en index
3. `supabase/functions/.../scenarios/{nuevo}.ts` + dispatcher `getScenarioGapAnalysis()`
4. Interlocutores en `personas.ts` + intel en `prebriefing-prompts.ts`
5. 2-3 presets en `scenario-presets.ts`
6. Tests: preset integrity + assembler adaptation block

### Estado actual

> Leyenda columnas: **Frontend** = tiene `src/services/prompts/scenarios/{scenario}.ts` · **Backend** = tiene `supabase/functions/.../scenarios/{scenario}.ts` con dual-axis eval · **Presets** = tiene entradas en `scenario-presets.ts` · **UI** = visible en la app

| ScenarioType | Frontend | Backend | Presets | UI |
|-------------|:--------:|:-------:|:-------:|:--:|
| `interview` | ✅ | ✅ | ✅ 3 | ✅ |
| `sales` | ✅ | ✅ | ✅ 3 | ✅ |
| `meeting` | ✅ | ✅ | ✅ 3 | ✅ |
| `presentation` | ✅ | ✅ | ✅ 3 | ✅ |
| `culture` | ✅ | ✅ | ✅ 3 | ✅ |
| `self-intro` | ❌¹ | ❌¹ | ❌ | ✅ (free) |
| `client`, `csuite` | ❌ | ❌ | ❌ | ❌ future |

> ¹ `self-intro` tiene flujo propio (`SelfIntroContextScreen`, `PathRecommendationCard`) pero no usa el sistema de prompts de escenario ni el evaluador dual-axis de Gemini — usa el prompt base sin adaptación de escenario.

---

*v2.2 — 2026-05-04*
*Cambios: Reorganización de docs/ en subcarpetas (business/ product/ engineering/ copy/). Todos los paths actualizados. Precios canónicos actualizados a modelo Founding Member ($49/3mo) / Program ($129/3mo) / Monthly ($49/mo). Beta v14.6. Fila Copy añadida a tabla de tareas.*
