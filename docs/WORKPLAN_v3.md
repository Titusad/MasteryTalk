# inFluentia PRO — Plan de Trabajo v3.2

> **Fecha:** 4 marzo 2026
> **Reemplaza:** WORKPLAN_v3.1
> **Contexto:** El prototipo React funciona correctamente como MVP con mock data — listo para demos y validacion con usuarios. El blank screen fue resuelto. El sistema de paywall (3 triggers) esta implementado. i18n soporta ES/PT/EN. El siguiente paso natural es conectar Supabase para auth y persistencia.

---

## Estado actual — Que ya esta hecho

### Fase 0: Prototipo Mock — COMPLETADA

| Entregable | Estado | Notas |
|------------|--------|-------|
| ~45 archivos fuente (React + Tailwind v4) | COMPLETADO | Landing (i18n ES/PT/EN), Auth, Strategy Builder, Extra Context, Generating Script (loader), Pre-Briefing, Voice Practice (Arena 3 fases), Analyzing (loader), Conversation Feedback, SessionReport, Dashboard, Practice History, Design System |
| Arena System (3 fases) | COMPLETADO | `arena/ArenaSystem.tsx` (Support/Guidance/Challenge), `arena/BriefingRoom.tsx` (BeforeAfterSection + MindsetPulse) |
| Flujo simplificado (8 steps internos) | COMPLETADO | Strategy > Extra Context > Generating Script > Pre-Briefing > Practice (Arena) > Analyzing > Conversation Feedback > Session Report > Dashboard |
| Design System v3.0 | COMPLETADO | `DesignSystemPage.tsx` (1680 lineas) — Colors, Typography, Components, Session, Arena, Patterns, Layouts |
| 7 service interfaces | COMPLETADO | `/src/services/interfaces/*.ts` — Auth, Conversation, Feedback, Speech, User, Payment, SpacedRepetition |
| 7 mock adapters + 11 data files | COMPLETADO | `/src/services/adapters/mock/*.ts` + `/data/*.ts` — scenario-specific para 5 tipos |
| Service Registry (100% mock) | COMPLETADO | `services/index.ts` (~38 lineas) — solo mock adapters, sin imports de Supabase |
| Error protocol (5 dominios, ~31 codes) | COMPLETADO | `/src/services/errors.ts` — Auth, Conversation, Feedback, Speech, Payment (incluye CREDITS_EXHAUSTED) |
| useServiceCall hook | COMPLETADO | `/src/app/hooks/useServiceCall.ts` — retry + backoff + recovery |
| useUsageGating hook | COMPLETADO | `/src/app/hooks/useUsageGating.ts` — freemium gating, 3 paywall triggers |
| ServiceErrorBanner | COMPLETADO | `/src/app/components/shared/ServiceErrorBanner.tsx` |
| ProfileCompletionBanner | COMPLETADO | `/src/app/components/shared/ProfileCompletionBanner.tsx` |
| Prompt engineering module (7-block) | COMPLETADO | `/src/services/prompts/` — templates, personas, regions, voice-map, analyst, assembler |
| Error simulation (`?simulate_errors=true`) | COMPLETADO | `/src/services/adapters/mock/utils.ts` |
| Supabase client singleton + Row types | COMPLETADO | `/src/services/supabase.ts` (preparado para Fase 1) |
| SupabaseAuthService adapter | COMPLETADO | `/src/services/adapters/supabase/auth.supabase.ts` (preparado para Fase 1) |
| SQL migration script | COMPLETADO | `/docs/FASE1_MIGRATION.sql` — 5 tablas, 1 trigger, 5 RLS sets, 3 indexes |
| Shared design system | COMPLETADO | `/src/app/components/shared/index.tsx` (1254 lineas) — COLORS, BrandLogo, AnalyzingScreen, RecordButton, SmoothHeight, etc. |
| StrategyBuilder con framework tooltips | COMPLETADO | STAR, BATNA, SPIN, MEDDIC por scenario type |
| Paywall system (3 triggers) | COMPLETADO | `useUsageGating` hook + `CreditUpsellModal` con headers contextuales |
| i18n ES/PT/EN | COMPLETADO | `landing-i18n.ts`, `CreditUpsellModal.tsx`, language switcher con flag emojis |
| ErrorBoundary | COMPLETADO | `ErrorBoundary.tsx` wrapping todo `App.tsx` |

### Production Readiness Audit — COMPLETADA (26 feb - 3 mar 2026)

| Accion | Estado | Detalle |
|--------|--------|---------|
| Tipos actualizados para credit packs | HECHO | `CreditPack`, `CREDIT_PACK_DETAILS`, `UserPlan` en `types.ts` |
| Payment interface reescrita | HECHO | `createCheckout(uid, CreditPack)`, `getCreditsBalance()` |
| User mock reescrito para creditos | HECHO | `canStartSession()` con validacion de creditos |
| Payment mock reescrito para creditos | HECHO | `getCreditsBalance()`, checkout simulation |
| `services/index.ts` simplificado a 100% mock | HECHO | ~38 lineas, solo mock adapters, sin imports de supabase |
| Components limpiados de imports directos a mock | HECHO | Solo importan de `../../services` |
| `CREDITS_EXHAUSTED` error code | HECHO | En `errors.ts` |
| `session_10` eliminado del stack | HECHO | Plan simplificado |
| Copy de suscripcion reemplazado por creditos | HECHO | `landing-i18n.ts`, `DashboardPage`, `CreditUpsellModal` |
| `CreditUpsellModal` creado y restaurado | HECHO | Grid de 3 packs, radio buttons, confetti, i18n ES/PT/EN, trust line |
| i18n ES/PT/EN completo | HECHO | `landing-i18n.ts`, `CreditUpsellModal.tsx`, `LandingPage.tsx` language switcher |
| Race condition fix post-login | HECHO | `prevAuthUserRef` reemplaza `authInitialized` en `App.tsx` |
| ErrorBoundary agregado | HECHO | `ErrorBoundary.tsx` wrapping todo `App.tsx` |
| `RESET_PROTOTYPE` eliminado | HECHO | Ya no existe en `App.tsx` |
| Paywall system | HECHO | `useUsageGating` hook, 3 triggers: extra-practice, download-report, new-session |
| Flujo post-compra contextual | HECHO | extra-practice → reset intentos; download-report → auto-descarga PDF |
| `triggerMockDownload()` extraido | HECHO | Funcion reutilizable en `PracticeSessionPage.tsx` |
| EN como 3er idioma | HECHO | Copy completo, skip LanguageTransitionModal para EN, posicionamiento como communication training |
| `CreditUpsellModal` restaurado | HECHO | Reconstruido tras truncacion accidental durante i18n EN |

### Compilacion y runtime — COMPLETADA

| Tarea | Estado |
|---|---|
| Primera compilacion exitosa | **COMPLETADA** |
| ErrorBoundary funcional | **COMPLETADA** |
| Navegacion E2E manual (happy path) | **COMPLETADA** |
| Validacion visual de cada pantalla | **COMPLETADA** |
| Paywall triggers funcionales | **COMPLETADA** |
| i18n ES/PT/EN funcional | **COMPLETADA** |

---

## Siguiente paso inmediato: Conectar Supabase para Auth y Persistencia

> **Estado:** El prototipo funciona correctamente con mock data. La arquitectura de adapters permite hacer el swap de mock a real de forma limpia, servicio por servicio.

### Prerequisitos para Fase 1

| Tarea | Detalle | Estado |
|-------|---------|--------|
| Prototipo mock funcional | App renderiza, flujo E2E funciona | **COMPLETADO** |
| Paywall system validado | 3 triggers conectados y funcionales | **COMPLETADO** |
| i18n ES/PT/EN funcional | Landing page trilingual | **COMPLETADO** |
| `services/index.ts` limpio | 100% mock, ~38 lineas, sin imports de supabase | **COMPLETADO** |
| Documentacion actualizada | Docs reflejan estado actual del prototipo | **COMPLETADO** |

### Para activar Supabase

1. Restaurar `services/index.ts` al patron de auto-detect (referencia: `BACKEND_HANDOFF.md`)
2. Configurar env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. `ADAPTER_MODE.auth` = `"supabase"` (el adapter `auth.supabase.ts` ya existe)
4. Los demas servicios permanecen en mock hasta que se implementen

**Hito:** Un usuario puede registrarse con Google real, y el resto del flujo sigue funcionando con mocks.

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
| **Dia 3** | Test OAuth real | env vars configurados → auto-detect activa auth real → Google OAuth → verificar `auth.users` + `profiles` | Auth funcional |
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
| E2E: Conversacion → Feedback → Session Report | Flujo completo con servicios reales |
| SR cards auto-creadas post-session | Frases con score < 85 → INSERT en `sr_cards` |
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
| `canStartSession` logic (free_session_used + credit balance check) | `.canStartSession()` |

#### Semana 9: Spaced Repetition + Credits

| Tarea | Interfaz |
|-------|----------|
| `SupabaseSpacedRepetitionService` | `ISpacedRepetitionService` (6 metodos) |
| Today's cards query (`next_review_at <= now()`) | `.getTodayCards()` |
| Interval progression (pass → step+1, fail → reset) | `.submitAttempt()` |
| Card creation from session + arena | `.addCardsFromSession()`, `.addCardsFromArena()` |
| Credit balance tables (credit_purchases + credit_balances) | Schema + triggers |

#### Semana 10: Payments + Launch prep

| Tarea | Interfaz |
|-------|----------|
| `SupabasePaymentService` — Mercado Pago sandbox | `IPaymentService` (3 metodos) |
| Checkout session creation for credit packs | `.createCheckout(uid, CreditPack)` |
| Webhook endpoint | Edge Function `webhook-payment` |
| Credit balance update post-payment | trigger on credit_purchases |
| `PAYMENT_PENDING` flow (OXXO/Efecty, 24-72h) | PaymentError handling |
| Actualizar `ADAPTER_MODE` | TODOS a `"supabase"` |

**Hito:** Producto lanzable. Usuario compra credit pack, practica con IA real, recibe feedback.

---

## Timeline — Vista de Gantt

```
           0    1    2    3    4    5    6    7    8    9    10
           +----+----+----+----+----+----+----+----+----+----+
Fase 0:    #### (COMPLETADA — prototipo funcional con mock data)
 Fase 1         ####
 Fase 2              ############
 Fase 3                             ############
 Fase 4                                            ############

Fase 0 = Prototipo mock COMPLETADA (4 mar 2026)
Semanas 1-10 = Backend Supabase (progresivo)
```

---

## Deuda tecnica conocida

| Item | Impacto | Cuando resolver |
|------|---------|-----------------| 
| `ui/` directory (~48 archivos shadcn/ui) | 0 — archivos protegidos del sistema, Vite los ignora | No action needed |
| `PracticeSessionPage.tsx` (1339 lineas) | Legibilidad | Refactor opcional: extraer sub-componentes |
| `shared/index.tsx` (1254 lineas) | Legibilidad | Refactor opcional: split por dominio |
| `DesignSystemPage.tsx` (1680 lineas) | Solo debug tool | Baja prioridad |
| Hash-based routing (no react-router) | Funcional pero basico | Evaluar si se necesita deep linking |