# inFluentia PRO — Plan de Trabajo v3.0

> **Fecha:** 26 febrero 2026
> **Reemplaza:** WORKPLAN_v2.3
> **Contexto:** El prototipo React esta escrito y la auditoria manual de imports/exports confirmo 0 errores estaticos, pero **aun no se ha compilado ni ejecutado** en el entorno de Figma Make. El siguiente paso inmediato es la primera compilacion, debug, y prueba end-to-end del prototipo mock.

---

## Estado actual — Que ya esta hecho

### Fase 0: Prototipo Mock — ESCRITO (pendiente compilacion)

| Entregable | Estado | Notas |
|------------|--------|-------|
| ~40 archivos fuente (React + Tailwind v4) | ESCRITO | Landing, Auth, Strategy Builder, Extra Context, Generating Script (loader), Pre-Briefing, Voice Practice (Arena 3 fases), Analyzing (loader), Conversation Feedback, Shadowing, Analyzing Results (loader), Session Recap, Mindset, Dashboard, Practice History, Design System |
| Arena System (3 fases) | ESCRITO | `arena/ArenaSystem.tsx` (Support/Guidance/Challenge), `arena/BriefingRoom.tsx` (BeforeAfterSection + MindsetPulse) |
| Flujo completo (11 steps internos) | ESCRITO | Strategy > Extra Context > Generating Script > Pre-Briefing > Practice (Arena) > Analyzing > Conversation Feedback > Shadowing > Analyzing Results > Session Recap > Mindset > Dashboard |
| Design System v3.0 | ESCRITO | `DesignSystemPage.tsx` (1703 lineas) — Colors, Typography, Components, Session, Arena, Patterns, Layouts |
| 7 service interfaces | ESCRITO | `/src/services/interfaces/*.ts` — Auth, Conversation, Feedback, Speech, User, Payment, SpacedRepetition |
| 7 mock adapters + 11 data files | ESCRITO | `/src/services/adapters/mock/*.ts` + `/data/*.ts` — scenario-specific para 5 tipos |
| Service Registry con per-service toggle | ESCRITO | `USE_MOCK = true` (forzado) + `ADAPTER_MODE` en `/src/services/index.ts` |
| Error protocol (5 dominios, ~30 codes) | ESCRITO | `/src/services/errors.ts` — Auth, Conversation, Feedback, Speech, Payment |
| useServiceCall hook | ESCRITO | `/src/app/hooks/useServiceCall.ts` — retry + backoff + recovery |
| ServiceErrorBanner | ESCRITO | `/src/app/components/shared/ServiceErrorBanner.tsx` |
| ProfileCompletionBanner | ESCRITO | `/src/app/components/shared/ProfileCompletionBanner.tsx` |
| Prompt engineering module (7-block) | ESCRITO | `/src/services/prompts/` — templates, personas, regions, voice-map, analyst, assembler |
| Error simulation (`?simulate_errors=true`) | ESCRITO | `/src/services/adapters/mock/utils.ts` |
| Supabase client singleton + Row types | ESCRITO | `/src/services/supabase.ts` |
| SupabaseAuthService adapter | ESCRITO | `/src/services/adapters/supabase/auth.supabase.ts` |
| SQL migration script | ESCRITO | `/docs/FASE1_MIGRATION.sql` — 5 tablas, 1 trigger, 5 RLS sets, 3 indexes |
| Shared design system | ESCRITO | `/src/app/components/shared/index.tsx` (1211 lineas) — COLORS, BrandLogo, AnalyzingScreen, RecordButton, etc. |
| MindsetCoachCard | ESCRITO | `/src/app/components/MindsetCoachCard.tsx` |
| StrategyBuilder con framework tooltips | ESCRITO | STAR, BATNA, SPIN, MEDDIC por scenario type |

### Auditoria estatica — COMPLETADA (26 feb 2026)

| Verificacion | Resultado |
|---|---|
| Imports/exports en ~40 archivos | 0 imports rotos, 0 exports faltantes |
| Service Layer (7 interfaces, 7 mock adapters, 11 data files) | Consistente |
| Component props y data flow | Consistente |
| Supabase adapter + client singleton | Resuelve correctamente |
| Deuda tecnica: `ui/` directory (~48 archivos shadcn/ui) | 0 imports — inerte (tree-shaking los elimina) |
| `RESET_PROTOTYPE = true` con `useRef` guard | Correctamente implementado |

### Compilacion y runtime — PENDIENTE

| Tarea | Estado |
|---|---|
| Primera compilacion (`npm run dev` / preview de Figma Make) | **NO HECHA** |
| Debug de errores de compilacion | **PENDIENTE** |
| Navegacion E2E manual (happy path) | **PENDIENTE** |
| Validacion visual de cada pantalla | **PENDIENTE** |
| Error simulation testing | **PENDIENTE** |

---

## Siguiente paso inmediato: Debug & First Run

### Paso 0: Primera compilacion y debug

> **Responsable:** Frontend developer (o IA en Figma Make)
> **Estimado:** 1-3 sesiones de trabajo
> **Objetivo:** El prototipo compila, renderiza, y el flujo completo funciona con mocks.

| Tarea | Detalle |
|-------|---------|
| **Compilar en Figma Make** | Verificar que Vite bundle sin errores fatales |
| **Debug iterativo** | Corregir errores de compilacion uno por uno |
| **Smoke test: Landing** | La pagina renderiza con PracticeWidget funcional |
| **Smoke test: Auth flow** | Mock auth → navega a PracticeSessionPage |
| **Smoke test: 11 steps** | Navegar Strategy → ... → Mindset → Dashboard sin crashes |
| **Smoke test: Dashboard** | Dashboard renderiza con datos mock, gauges SVG, historial |
| **Smoke test: Practice History** | Pagina de historial renderiza correctamente |
| **Visual QA basica** | Cada pantalla se ve razonablemente bien (no pixel-perfect aun) |

**Hito:** Un usuario puede recorrer TODO el flujo del prototipo sin errores, desde Landing hasta Dashboard.

---

## Arquitectura del equipo

El frontend React ya esta escrito con mock adapters. El backend developer implementa los adapters reales de Supabase progresivamente, conectandolos al frontend existente cambiando `ADAPTER_MODE` por servicio.

```
+----------------------------------------------+
|            SERVICE LAYER (contrato)          |
|       7 interfaces + tipos + errors          |
+------------------+---------------------------+
                   |
     +-------------v--------------+
     |    BACKEND (Supabase)      |
     |                            |
     |  Implementa adapters       |
     |  reales + Edge Functions   |
     |  contra las interfaces     |
     |  existentes                |
     |                            |
     |  Frontend React consume    |
     |  los mismos contratos      |
     |  via ADAPTER_MODE switch   |
     +----------------------------+
```

**Flujo de integracion:**
- El frontend React funciona con **mock adapters** (Fase 0)
- A medida que el backend entrega cada adapter Supabase, se cambia `ADAPTER_MODE.{servicio}` de `"mock"` a `"supabase"` en `/src/services/index.ts`
- El frontend no requiere cambios — solo cambia la fuente de datos

---

## Backend (Supabase) — 4 Fases

> **Prerequisito para todas las fases:** Fase 0 (prototipo) debe estar compilando y corriendo sin errores.

### Fase 1: Auth + Schema — Semana 1

> **Responsable:** Backend developer
> **Guia de referencia:** `BACKEND_HANDOFF.md`, `FASE1_ONBOARDING_SUPPLEMENT.md`

| Dia | Tarea | Detalle | Entregable |
|-----|-------|---------|------------|
| **Dia 1** | Setup Supabase | Crear proyecto, copiar URL + anon key a `.env`, configurar Google OAuth, configurar LinkedIn OIDC | `.env` configurado, providers activos |
| **Dia 1** | Redirect URLs | Agregar `http://localhost:5173` y dominio de produccion en Authentication > URL Configuration | Auth flow funcional en dev |
| **Dia 2** | Ejecutar SQL | Pegar `FASE1_MIGRATION.sql` en SQL Editor y ejecutar completo | 5 tablas + trigger + RLS + indexes |
| **Dia 2** | Verificar schema | Ejecutar queries de verificacion del final del SQL file | Tablas, RLS, trigger confirmados |
| **Dia 3** | Test OAuth real | `USE_MOCK = false` (en index.ts) → Google OAuth → verificar `auth.users` + `profiles` | Auth funcional |
| **Dia 3** | Test LinkedIn | OAuth con LinkedIn → verificar provider en `auth.users` | LinkedIn funcional |
| **Dia 4** | Test RLS | Queries cross-user con tokens de diferentes usuarios | RLS validado |
| **Dia 4** | Test coexistencia | Auth real + servicios mock → flujo completo sin crashes | Hibrido funcional |
| **Dia 5** | Regression QA | Flujo completo con auth real | 0 regressions |

**Hito:** Un usuario se registra con Google, su profile se crea automaticamente, y puede navegar todo el prototipo con auth real + servicios mock.

---

### Fase 2: The Brain (Conversation Engine) — Semanas 2-4

> **Dependencia:** Fase 1 completada
> **Secrets:** `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `CLOUDFLARE_R2_*`

#### Semana 2: Edge Functions core

| Tarea | Interfaz que implementa |
|-------|------------------------|
| Edge Function `prepare-session` — Auth check → `assembleSystemPrompt()` → INSERT sessions → retornar `PreparedSession` | `IConversationService.prepareSession()` |
| Edge Function `process-turn` — Leer history → GPT-4o → parse JSON → guardar → retornar `ConversationTurnResult` | `IConversationService.processTurn()` |
| Logica `isComplete` — Override: forzar `false` si turn < 4, forzar `true` si turn >= 8 | Blueprint rules |
| `internalAnalysis` filtering — Guardar en history JSONB pero NUNCA enviar al frontend | Security |
| JSON resilience — `try/catch` de parse + retry 1x + fallback message | Robustness |
| GPT-4o vs 4o-mini — Free users → `gpt-4o-mini`, Paid → `gpt-4o` | Plan differentiation |

#### Semana 3: TTS + Audio pipeline

| Tarea | Detalle |
|-------|---------|
| ElevenLabs TTS integration | `process-turn` genera audio de la respuesta IA |
| Cloudflare R2 audio cache | SHA-256 dedup, cache hit → skip ElevenLabs call |
| `SupabaseConversationService` adapter | Implementar `IConversationService` completa |
| `audit_logs` pipeline | Cada Edge Function loguea: function_name, model, tokens, latency, cost |

#### Semana 4: Testing + Hardening

| Tarea | Detalle |
|-------|---------|
| Script A: "The Hard Negotiator" | 5 turnos, cierre natural, validar sub-perfil NEGOTIATOR |
| Script B: "The Marathon" | 8 turnos, cierre forzado, validar override turn 8 |
| Script C: Edge cases | JSON malformado, `isComplete` prematuro, concurrent calls |
| Actualizar `ADAPTER_MODE.conversation` | `"mock"` → `"supabase"` en `services/index.ts` |

**Hito:** Un usuario tiene una conversacion real con GPT-4o. Las voces suenan naturales (ElevenLabs). El audit trail registra costos.

---

### Fase 3: The Analyst (Feedback + Pronunciation) — Semanas 5-7

> **Dependencia:** Fase 2 completada
> **Secrets:** `GEMINI_API_KEY`, `AZURE_REGION`, `AZURE_SPEECH_KEY`

#### Semana 5: Gemini feedback pipeline

| Tarea | Interfaz |
|-------|----------|
| `analyze-feedback` Edge Function — consume history, genera strengths + opportunities | `IFeedbackService.analyzeFeedback()` |
| `generate-script` Edge Function — genera script mejorado con highlights | `IFeedbackService.generateImprovedScript()` |
| `generate-results-summary` Edge Function — Pronunciation Coach tips | `IFeedbackService.generateResultsSummary()` |
| Completed summary logic | `IFeedbackService.getCompletedSummary()` |
| `SupabaseFeedbackService` adapter (4 metodos) | Full `IFeedbackService` |

#### Semana 6: Azure Speech pronunciation

| Tarea | Interfaz |
|-------|----------|
| `score-pronunciation` Edge Function — Azure Speech REST API, WAV PCM 16kHz | `ISpeechService.scorePronunciation()` |
| STT via Azure — Transcripcion real | `ISpeechService.transcribe()` |
| TTS wrapper — Azure Neural para UI + ElevenLabs para interlocutor | `ISpeechService.speak()` |
| Shadowing phrases derivacion — Extraer del script generado por Gemini | `ISpeechService.getShadowingPhrases()` |
| `SupabaseSpeechService` adapter (4 metodos) | Full `ISpeechService` |

#### Semana 7: Integration + QA

| Tarea | Detalle |
|-------|---------|
| E2E: Conversacion → Feedback → Script → Shadowing → Results | Flujo completo con servicios reales |
| SR cards auto-creadas post-shadowing | Frases con score < 85 → INSERT en `sr_cards` |
| Actualizar `ADAPTER_MODE` | `feedback: "supabase"`, `speech: "supabase"` |

**Hito:** El flujo completo funciona end-to-end con IA real.

---

### Fase 4: Retention & Payments — Semanas 8-10

> **Dependencia:** Fase 3 completada
> **Secrets:** `MERCADOPAGO_ACCESS_TOKEN`, `STRIPE_SECRET_KEY` (futuro)

#### Semana 8: User service + Dashboard real

| Tarea | Interfaz |
|-------|----------|
| `SupabaseUserService` — queries a profiles, sessions, power_phrases | `IUserService` (7 metodos) |
| Practice history query (JOIN sessions + scenario_config) | `.getPracticeHistory()` |
| Power phrases CRUD | `.getPowerPhrases()`, `.savePowerPhrase()` |
| `canStartSession` logic (free_session_used + plan check) | `.canStartSession()` |

#### Semana 9: Spaced Repetition

| Tarea | Interfaz |
|-------|----------|
| `SupabaseSpacedRepetitionService` | `ISpacedRepetitionService` (6 metodos) |
| Today's cards query (`next_review_at <= now()`) | `.getTodayCards()` |
| Interval progression (pass → step+1, fail → reset) | `.submitAttempt()` |
| Card creation from shadowing + arena | `.addCardsFromSession()`, `.addCardsFromArena()` |

#### Semana 10: Payments + Launch prep

| Tarea | Interfaz |
|-------|----------|
| `SupabasePaymentService` — Mercado Pago sandbox | `IPaymentService` (3 metodos) |
| Checkout session creation | `.createCheckout()` |
| Webhook endpoint | Edge Function `webhook-payment` |
| `PAYMENT_PENDING` flow (OXXO/Efecty, 24-72h) | PaymentError handling |
| Actualizar `ADAPTER_MODE` | TODOS a `"supabase"` |

**Hito:** Producto lanzable. Usuario paga, practica con IA real, recibe feedback, mejora con SR.

---

## Timeline — Vista de Gantt

```
           0    1    2    3    4    5    6    7    8    9    10
           +----+----+----+----+----+----+----+----+----+----+
Debug:     ####
 Fase 1         ####
 Fase 2              ############
 Fase 3                             ############
 Fase 4                                            ############

Semana 0 = Debug/first-run del prototipo mock
Semanas 1-10 = Backend Supabase (progresivo)
```

---

## Deuda tecnica conocida

| Item | Impacto | Cuando resolver |
|------|---------|-----------------| 
| `ui/` directory (~48 archivos shadcn/ui) | 0 — archivos protegidos del sistema, no se pueden eliminar pero no se importan en ningun lado. Dependencias removidas del package.json (26 feb 2026) | No action needed — Vite los ignora |
| `PracticeSessionPage.tsx` (2891 lineas) | Legibilidad. Funciona pero es un archivo muy grande | Refactor opcional: extraer sub-componentes |
| `shared/index.tsx` (1211 lineas) | Legibilidad. Muchos componentes en un solo archivo | Refactor opcional: split por dominio |
| `DesignSystemPage.tsx` (1703 lineas) | Solo afecta la pagina de design system (debug tool) | Baja prioridad |
| `RESET_PROTOTYPE = true` hardcodeado | Limpia localStorage en cada load. Desactivar para persistence real | Cambiar a `false` cuando auth real este activo |
| `USE_MOCK = true` hardcodeado | Fuerza todos los servicios a mock. Revertir a auto-detect para Supabase | Cambiar cuando se configure Supabase |
| Hash-based routing (no react-router) | Funcional pero basico. No soporta deep linking complejo | Evaluar migracion a react-router si se necesita |