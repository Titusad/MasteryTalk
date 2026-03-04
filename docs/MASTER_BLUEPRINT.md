# inFluentia PRO - Master Blueprint v6.0

> **The Scalable Blueprint** - De concepto educativo a herramienta de rendimiento ejecutivo.
> Documento maestro que consolida arquitectura, decisiones, y hoja de ruta.
> Ultima actualizacion: 4 marzo 2026 (v6.0 — prototipo funcional con mock data, paywall system implementado, i18n ES/PT/EN, 3 paywall triggers conectados, CreditUpsellModal restaurado post-truncacion)

---

## Tabla de Contenidos

1. [Vision del Producto](#1-vision-del-producto)
2. [Stack Tecnologico](#2-stack-tecnologico)
3. [Arquitectura de Datos (PostgreSQL/Supabase)](#3-arquitectura-de-datos)
4. [Service Layer - Adapter Pattern](#4-service-layer)
5. [Interfaces y Contratos](#5-interfaces-y-contratos)
6. [Protocolo de Errores](#6-protocolo-de-errores)
7. [Mock Adapters y Simulacion](#7-mock-adapters)
8. [Flujo de Pantallas (Frontend)](#8-flujo-de-pantallas)
9. [Edge Functions (Backend)](#9-edge-functions)
10. [Spike: Azure Speech REST API](#10-spike-azure-speech)
11. [Modelo de Negocio](#11-modelo-de-negocio)
12. [Estrategia de Mercado](#12-estrategia-de-mercado)
13. [Logica de Aprendizaje (SR)](#13-logica-de-aprendizaje)
14. [Roadmap de Implementacion](#14-roadmap)
15. [Referencia de Archivos](#15-referencia-de-archivos)

---

## 1. Vision del Producto

**inFluentia PRO** es un simulador de alto rendimiento para comunicacion ejecutiva
en ingles, disenado para el mercado de nearshoring en Latinoamerica.

**No vendemos clases. Vendemos acceso a riqueza y poder.**

- **Target**: Profesionales tech/ejecutivos en Mexico y Colombia que necesitan
  comunicarse con clientes y equipos en EE.UU.
- **Diferenciador**: Confrontacion realista con IA + feedback accionable + practica
  de pronunciacion — todo en un flujo de 8 pasos internos.
- **Metrica North Star**: Usuarios que completan 3+ sesiones en los primeros 7 dias.

---

## 2. Stack Tecnologico

### El "Cerebro Hibrido" - Cada servicio optimizado por costo y calidad

| Componente                 | Tecnologia                             | Razon Estrategica                                           |
| -------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| **Backend & DB**           | Supabase (PostgreSQL)                  | Queries relacionales para analytics, Edge Functions rapidas |
| **Logic Layer**            | Supabase Edge Functions (Deno/TS)      | Menor latencia, integracion nativa con Supabase             |
| **Chat en Vivo**           | GPT-4o                                 | Maximo realismo en confrontacion ejecutiva                  |
| **Feedback/Procesamiento** | Gemini 1.5 Flash                       | Ahorro ~98% vs GPT-4o en tareas analiticas                  |
| **TTS Sistema**            | Azure Neural                           | Costo $0 para guiar al usuario                              |
| **TTS Practica**           | ElevenLabs                             | Inmersion de lujo para interlocutor IA                      |
| **STT + Scoring**          | Azure Speech REST API                  | Compatibilidad total con Deno (sin SDK pesado)              |
| **Audio Cache**            | Cloudflare R2                          | $0 egress, SHA-256 dedup de audios generados                |
| **User Assets**            | Supabase Storage                       | Archivos subidos por usuario                                |
| **Pagos**                  | Mercado Pago (LATAM) / Stripe (global) | Cobertura regional + internacional                          |
| **Frontend**               | React 18 + Tailwind CSS v4 + Vite 6   | App web completa, Figma Make como entorno de desarrollo     |

### Dependencias clave del frontend

| Paquete | Uso |
|---------|-----|
| `motion` (Motion) | Animaciones y transiciones entre pantallas |
| `lucide-react` | Iconografia consistente |
| `@supabase/supabase-js` v2.98 | Cliente Supabase (auth real cuando `USE_MOCK = false`) |
| `canvas-confetti` | Celebracion de confetti en CreditUpsellModal post-compra |

> **Limpieza realizada (26 feb 2026):** Se eliminaron ~43 paquetes innecesarios del `package.json` (MUI, Radix UI, shadcn dependencies, react-dnd, react-slick, recharts, etc.). Eran residuos del scaffolding inicial de shadcn/ui. Los archivos de `ui/` siguen existiendo (son protegidos del sistema) pero son inertes — nada los importa y Vite los ignora.

### Por que Supabase sobre Firebase

1. **Relational Power**: Queries complejas (ej: frases mas dificiles por pais) son triviales en SQL.
2. **Edge Functions**: Ejecutan mas cerca del usuario que Cloud Functions de Firebase.
3. **SQL nativo**: Exportacion facil para BI si el negocio escala.
4. **RLS (Row Level Security)**: Seguridad a nivel de fila sin logica custom.

---

## 3. Arquitectura de Datos

### 3.1 Tabla `profiles` (Auth & Metadata)

```sql
CREATE TABLE profiles (
  id             uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  market_focus   text CHECK (market_focus IN ('mexico', 'colombia')),
  plan           text DEFAULT 'free' CHECK (plan IN ('free', 'per-session')),
  plan_status    text DEFAULT 'active' CHECK (plan_status IN ('active', 'trial', 'expired')),
  free_session_used boolean DEFAULT false,
  stats          jsonb DEFAULT '{}',
  achievements   text[] DEFAULT '{}',
  created_at     timestamptz DEFAULT now()
);
```

### 3.2 Tabla `sessions`

```sql
CREATE TABLE sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scenario_config jsonb NOT NULL,
  system_prompt   text,
  voice_id        text,
  history         jsonb DEFAULT '[]',
  feedback        jsonb,
  status          text DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at      timestamptz DEFAULT now(),
  completed_at    timestamptz
);
```

### 3.3 Tabla `sr_cards`

```sql
CREATE TABLE sr_cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  phrase          text NOT NULL,
  word            text NOT NULL,
  phonetic        text DEFAULT '',
  last_score      integer DEFAULT 0,
  interval_step   integer DEFAULT 1,
  origin          text DEFAULT 'session',
  next_review_at  timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);
```

### 3.4 Tabla `power_phrases`

```sql
CREATE TABLE power_phrases (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  phrase     text NOT NULL,
  category   text NOT NULL,
  when_to_use text DEFAULT '',
  situation  text DEFAULT '',
  accent_color text DEFAULT '#DBEDDF',
  created_at timestamptz DEFAULT now()
);
```

### 3.5 Tabla `audit_logs`

```sql
CREATE TABLE audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id),
  session_id      uuid REFERENCES sessions(id),
  function_name   text NOT NULL,
  model           text,
  tokens_in       integer,
  tokens_out      integer,
  latency_ms      integer,
  cost_estimated  text DEFAULT '0.00',
  created_at      timestamptz DEFAULT now()
);
```

### 3.6 Tablas de creditos (pay-per-session)

```sql
CREATE TABLE credit_purchases (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pack            text NOT NULL CHECK (pack IN ('session_1', 'session_3', 'session_5')),
  credits_added   integer NOT NULL,
  amount_usd      numeric(10,2) NOT NULL,
  payment_provider text NOT NULL CHECK (payment_provider IN ('mercadopago', 'stripe')),
  payment_id      text,
  status          text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE credit_balances (
  user_id         uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  credits_remaining integer DEFAULT 0,
  credits_total_purchased integer DEFAULT 0,
  last_purchase_at timestamptz,
  updated_at      timestamptz DEFAULT now()
);
```

> Schema completo con RLS, indexes y trigger: ver `/docs/FASE1_MIGRATION.sql`

---

## 4. Service Layer

### Adapter Pattern con per-service toggle

```
+---------------------------------+
|     Component (React)           |
|   import { authService }        |
|   from "../../services"         |
+--------+------------------------+
         |
+--------v------------------------+
|     Service Registry            |
|     /src/services/index.ts      |
|                                 |
|  USE_MOCK = env-based auto-detect|
|  ADAPTER_MODE = { per service } |
|  Defensive try-catch wrappers   |
+--------+------------------------+
         |
    +----+----+
    |         |
+---v---+ +---v--------+
| Mock  | | Supabase   |
| (7)   | | (1: auth)  |
+-------+ +------------+
```

**Switching:**
- `VITE_USE_MOCK=true` → Fuerza TODOS los servicios a mock
- `VITE_USE_MOCK=false` → Cada servicio mira su `ADAPTER_MODE` entry
- Auto-detect (default): Si `VITE_SUPABASE_URL` no esta configurado → mock; si esta configurado → per-service switching

**Defensive initialization (v5.0):**
- `createAuthService()` tiene try-catch: si `SupabaseAuthService` constructor falla → fallback a `MockAuthService`
- Los 7 singletons se crean dentro de try-catch global: si CUALQUIER servicio falla → TODOS caen a mock
- Diagnostic `console.log` envuelto en try-catch

**Service instances (singletons exportados via `let` + `export {}`):**

```typescript
export {
  authService,         // IAuthService
  conversationService, // IConversationService
  feedbackService,     // IFeedbackService
  speechService,       // ISpeechService
  userService,         // IUserService
  paymentService,      // IPaymentService
  spacedRepetitionService, // ISpacedRepetitionService
};
```

---

## 5. Interfaces y Contratos

### 5.1 IAuthService (4 metodos)

```typescript
interface IAuthService {
  signIn(provider: AuthProvider): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
```

### 5.2 IConversationService (4 metodos)

```typescript
interface IConversationService {
  prepareSession(config: SessionConfig): Promise<PreparedSession>;
  processTurn(sessionId: string, userMessage: string): Promise<ConversationTurnResult>;
  getSessionMessages(sessionId: string): Promise<ChatMessage[]>;
  endConversation(sessionId: string): Promise<void>;
}
```

### 5.3 IFeedbackService (4 metodos)

```typescript
interface IFeedbackService {
  analyzeFeedback(sessionId: string): Promise<SessionFeedbackResult>;
  generateImprovedScript(sessionId: string): Promise<ImprovedScriptResult>;
  getCompletedSummary(sessionId: string): Promise<CompletedPhraseSummary[]>;
  generateResultsSummary(sessionId: string): Promise<ResultsSummary>;
}
```

### 5.4 ISpeechService (4 metodos)

```typescript
interface ISpeechService {
  transcribe(audioDurationMs: number): Promise<TranscriptionResult>;
  speak(text: string): Promise<{ stop: () => void; duration: number }>;
  scorePronunciation(phraseIndex: number, attemptIndex: number): Promise<PronunciationResult>;
  getShadowingPhrases(sessionId: string): Promise<ShadowingPhrase[]>;
}
```

### 5.5 IUserService (7 metodos)

```typescript
interface IUserService {
  getProfile(uid: string): Promise<User>;
  updateProfile(uid: string, data: Partial<User>): Promise<void>;
  getPlan(uid: string): Promise<UserPlan>;
  canStartSession(uid: string): Promise<{ allowed: boolean; reason?: string }>;
  markFreeSessionUsed(uid: string): Promise<void>;
  getPracticeHistory(uid: string): Promise<PracticeHistoryItem[]>;
  getPowerPhrases(uid: string): Promise<PowerPhrase[]>;
  savePowerPhrase(uid: string, phrase: PowerPhrase): Promise<void>;
}
```

### 5.6 IPaymentService (3 metodos)

```typescript
interface IPaymentService {
  createCheckout(uid: string, pack: CreditPack): Promise<CheckoutResult>;
  getCreditsBalance(uid: string): Promise<{ credits: number; freeSessionAvailable: boolean }>;
  cancelSubscription(uid: string): Promise<void>;
}
```

> **Cambio v5.0:** `createCheckout` ahora recibe `CreditPack` (no `PaymentPlan`). `getSubscription` renombrado a `getCreditsBalance`.

### 5.7 ISpacedRepetitionService (6 metodos)

```typescript
interface ISpacedRepetitionService {
  getAllCards(uid: string): Promise<SRCard[]>;
  getTodayCards(uid: string): Promise<SRCard[]>;
  submitAttempt(cardId: string, attemptNumber: number): Promise<SRSessionResult>;
  addCardsFromSession(uid: string, sessionId: string, phraseIndices: number[]): Promise<SRCard[]>;
  addCardsFromArena(uid: string, phrases: ArenaPowerPhrase[], phase: ArenaPhase): Promise<SRCard[]>;
  getIntervals(): SRInterval[];
}
```

---

## 6. Protocolo de Errores

### Clase base: `ServiceError`

```typescript
class ServiceError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly severity: "warning" | "error" | "fatal";
  readonly recovery: "retry" | "retry-manual" | "user-action" | "degrade" | "navigate" | "none";
  readonly userMessage: string;  // Espanol para UI
  readonly cause?: Error;
}
```

### 6 dominios de error (v5.0: +1 code)

| Dominio | Clase | Codes |
|---------|-------|-------|
| Auth | `AuthError` | POPUP_CLOSED, PROVIDER_ERROR, NETWORK_ERROR, AUTH_UNKNOWN |
| Conversation | `ConversationError` | SESSION_CREATION_FAILED, AI_TIMEOUT, AI_RATE_LIMIT, AI_CONTEXT_OVERFLOW, SESSION_NOT_FOUND, TURN_PROCESSING_FAILED, CONVERSATION_UNKNOWN |
| Feedback | `FeedbackError` | ANALYSIS_TIMEOUT, ANALYSIS_FAILED, SCRIPT_GENERATION_FAILED, SUMMARY_FAILED, FEEDBACK_UNKNOWN |
| Speech | `SpeechError` | MICROPHONE_DENIED, MICROPHONE_NOT_FOUND, STT_NETWORK_ERROR, STT_TIMEOUT, STT_QUOTA_EXCEEDED, TTS_NETWORK_ERROR, TTS_TIMEOUT, PRONUNCIATION_TIMEOUT, PRONUNCIATION_FAILED, SPEECH_UNKNOWN |
| Payment | `PaymentError` | CHECKOUT_CREATION_FAILED, PAYMENT_DECLINED, PAYMENT_PENDING, PAYMENT_EXPIRED, WEBHOOK_NOT_RECEIVED, **CREDITS_EXHAUSTED** *(nuevo v5.0)*, SUBSCRIPTION_CANCEL_FAILED, PAYMENT_UNKNOWN |

### Utilidades

- `toServiceError(err)` — Wraps unknown errors into `ServiceError`
- `isServiceError(err)`, `isSpeechError(err)`, etc. — Type guards
- `ServiceErrorBanner` — UI component que muestra errores con recovery actions
- `useServiceCall` hook — Auto-retry con exponential backoff para errores retryable

### Error simulation

Agregar `?simulate_errors=true` a la URL para activar errores aleatorios en todos los mock adapters.

### ErrorBoundary (nuevo v5.0)

`ErrorBoundary.tsx` envuelve todo el `App` component. Atrapa errores de render no capturados y muestra un fallback con:
- Error message y stack trace
- Component stack (React)
- Boton "Recargar App"
- Branding inFluentia PRO

Esto evita la pantalla blanca cuando un componente crashea durante render.

---

## 7. Mock Adapters

### 7 adapters implementados

| Adapter | Archivo | Comportamiento |
|---------|---------|----------------|
| `MockAuthService` | `auth.mock.ts` | Google/LinkedIn sign-in simulado (~300ms delay), `onAuthStateChanged` callback |
| `MockConversationService` | `conversation.mock.ts` | `prepareSession` con prompt assembler real, `processTurn` con mensajes hardcoded por scenario |
| `MockFeedbackService` | `feedback.mock.ts` | Strengths, opportunities, script sections, completed phrases, results summary |
| `MockSpeechService` | `speech.mock.ts` | Transcripciones por scenario, TTS simulado (delay basado en text length), scoring con progresion |
| `MockUserService` | `user.mock.ts` | Profile, plan con creditos, practice history, power phrases, `canStartSession` con validacion de creditos |
| `MockPaymentService` | `payment.mock.ts` | Checkout URLs fake, balance de creditos mock, celebracion confetti |
| `MockSpacedRepetitionService` | `spaced-repetition.mock.ts` | Cards, today's review, attempt scoring, interval progression |

### 11 archivos de datos mock

| Archivo | Contenido |
|---------|-----------|
| `chat-messages.ts` | Mensajes de conversacion por scenario type (5 scenarios x ~6 mensajes) + power phrases + try-saying hints + before/after comparisons |
| `cultural-data.ts` | Power questions y cultural tips por scenario |
| `dashboard-data.ts` | Practice history items, power phrases, SR cards, SR intervals |
| `feedback-data.ts` | Strengths y opportunities por scenario |
| `script-sections.ts` | Script sections default (fallback) |
| `script-sections-by-scenario.ts` | Script sections por scenario type |
| `shadowing-data.ts` | Shadowing phrases default con stress markers y feedback |
| `shadowing-by-scenario.ts` | Shadowing phrases por scenario type |
| `completed-phrases.ts` | Completed phrase summaries por scenario |
| `results-summary-data.ts` | Overall sentiment, pronunciation notes, improvement areas por scenario |
| `mindset-coaching-data.ts` | Generador de coaching responses basado en MindsetPulse answers |

### Scenario types soportados

5 tipos con datos completos: `sales`, `interview`, `csuite`, `negotiation`, `networking`

---

## 8. Flujo de Pantallas

### 8.1 Mapa de navegacion

```
Landing Page (#) — i18n ES/PT
  |
  +-- PracticeWidget (escenario input)
  |     |
  |     +-- PracticeSetupModal (inline, Endowed Progress + Loss Aversion)
  |           |
  |           +-- AuthModal (Google/LinkedIn) — i18n via LandingLangContext
  |                 |
  |                 +-- LanguageTransitionModal (post-auth, ES/PT → EN)
  |                 |     |
  |                 |     +-- [registro] → PracticeSessionPage (#practice-session)
  |                 |     +-- [login]    → Dashboard (#dashboard)
  |                 |
  |                 +-- (sin modal) → directo si ya autenticado
  |
  +-- AuthModal (header CTAs)
        +-- [login] → LanguageTransitionModal → Dashboard

PracticeSessionPage (#practice-session) — 8 internal steps (simplified in v5.0):
  |
  1. strategy           → StrategyBuilder (3 value pillars, stepper horizontal)
  2. extra-context       → ExtraContextScreen (skippable: escribir, URL, archivo)
  3. generating-script   → AnalyzingScreen(variant="script") + prepareSession()
  4. pre-briefing        → PreBriefingScreen (cheat sheet + cultural coaching card)
  5. practice            → VoicePractice + ArenaSystem (Support → Guidance → Challenge)
  6. analyzing           → AnalyzingScreen(variant="feedback")
  7. conversation-feedback → ConversationFeedback (strengths + opportunities)
  8. session-recap       → SessionReport (comprehensive report with all results)
  |
  +→ Dashboard (#dashboard)

Dashboard (#dashboard):
  |
  +-- Credit balance display + CreditUpsellModal
  +-- handleStartSession() validates credits via userService.canStartSession()
  +-- Practice History (recent sessions with before/after highlights)
  +-- "Nueva practica" → Landing
  +-- "Ver historial" → Practice History (#practice-history)

Practice History (#practice-history):
  +-- Full history list with filtering
  +-- "Volver" → Dashboard
```

> **Cambio v5.0:** El flujo se simplifico de 11 a 8 steps. Se eliminaron: `shadowing`, `analyzing-results`, `mindset`. El `SessionReport` ahora consolida toda la informacion post-sesion en una sola pantalla.

### 8.2 Arena System (3 fases de andamiaje progresivo)

La Pantalla 5 (Voice Practice) incluye un sistema de andamiaje que ajusta la dificultad:

| Fase | Tono del IA | UI Support | Transicion |
|------|-------------|------------|------------|
| **Support** | Amigable, paciente | Power Phrases visibles, Try Saying hints, Before/After | 2+ good interactions |
| **Guidance** | Neutro, profesional | Power Phrases reducidas, hints sutiles | 2+ good interactions desde Guidance |
| **Challenge** | Confrontacional, exigente | Sin ayuda visible, IA desafia activamente | Fin de conversacion |

Componentes: `PhaseIndicator`, `PhaseTransitionToast`, `TrySayingHint`, `ArenaProgressBar`, `useArenaPhase` hook.

### 8.3 i18n System (nuevo v5.0)

La Landing Page soporta internacionalizacion completa ES/PT:

| Archivo | Descripcion |
|---------|-------------|
| `landing-i18n.ts` (~668 lineas) | Define `LandingCopy` interface + copias completas ES y PT |
| `LandingLangContext.tsx` | React Context + hook `useLandingCopy()` para acceder a copias |
| `LanguageTransitionModal.tsx` | Modal post-auth que comunica transicion de idioma (ES/PT → EN) |

Componentes que consumen i18n: `LandingPage`, `PracticeWidget`, `AuthModal`, `HowItWorksTabs`, `CreditUpsellModal`.

### 8.4 Credit Upsell Flow (nuevo v5.0)

Cuando un usuario sin creditos intenta iniciar una sesion:

1. `DashboardPage.handleStartSession()` llama `userService.canStartSession(uid)`
2. Si `allowed: false` → abre `CreditUpsellModal`
3. `CreditUpsellModal` muestra grid de 3 packs con badges de descuento
4. Click en pack → `paymentService.createCheckout(uid, pack)`
5. Post-compra exitosa → celebracion de confetti (`canvas-confetti`) + creditos actualizados

### 8.5 Design System

Color primario: `#0f172b` (navy)
Verde pastel: `#DBEDDF` (definido en `COLORS` de shared/index.tsx)
Background: `#f0f4f8`
Internal pages layout: BrandLogo header, PastelBlobs background, MiniFooter

---

## 9. Edge Functions (Backend — futuro)

### 9.1 `prepare-session`
- Auth check → lee profile → `assembleSystemPrompt()` → INSERT session → retorna `PreparedSession`
- El assembler de prompts ya esta implementado en `/src/services/prompts/assembler.ts`

### 9.2 `process-turn`
- Lee history de session → GPT-4o API call → parse JSON response → guarda en history → retorna `ConversationTurnResult`
- Rules: `isComplete` forzado `false` si turn < 4, `true` si turn >= 8

### 9.3 `analyze-feedback`
- Consume history (incluyendo `internalAnalysis`) → Gemini 1.5 Flash → genera strengths + opportunities

### 9.4 `generate-script`
- Gemini 1.5 Flash → genera script mejorado con secciones y highlights de color

### 9.5 `score-pronunciation`
- Azure Speech REST API → WAV PCM 16kHz → pronunciation assessment

### 9.6 `generate-results-summary`
- Gemini 1.5 Flash → overallSentiment + pronunciationNotes + improvementAreas

### 9.7 `webhook-payment`
- Mercado Pago/Stripe webhook → confirma pago → actualiza creditos en `credit_balances`

---

## 10. Spike: Azure Speech REST API

Validado: Azure Speech REST API funciona desde Deno Edge Functions sin SDK pesado.
- Endpoint: `https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`
- Audio format: WAV PCM 16kHz mono
- Pronunciation assessment via `Pronunciation-Assessment` header (Base64 JSON config)

---

## 11. Modelo de Negocio

### Pay-per-Session Credit Packs (v5.0 — sin suscripciones)

| Pack | Precio | Per Session | Descuento |
|------|--------|-------------|-----------|
| **1 sesion** | $4.99 | $4.99 | — |
| **3 sesiones** | $12.99 | $4.33 | 13% |
| **5 sesiones** | $19.99 | $4.00 | 20% |

### Primera sesion gratuita

- Sesion completa (8 pasos) sin feature gating
- GPT-4o-mini para sesion free, GPT-4o para sesiones pagadas
- Despues de la sesion free: `CreditUpsellModal` con los 3 packs

### Tipos en codigo

```typescript
type CreditPack = "session_1" | "session_3" | "session_5";

const CREDIT_PACK_DETAILS: Record<CreditPack, {
  sessions: number; price: number; perSession: number; discount: number;
}> = {
  session_1: { sessions: 1, price: 4.99, perSession: 4.99, discount: 0 },
  session_3: { sessions: 3, price: 12.99, perSession: 4.33, discount: 13 },
  session_5: { sessions: 5, price: 19.99, perSession: 4.00, discount: 20 },
};
```

> **Cambio v5.0:** Se eliminaron los planes Monthly ($19.99/mes) y Quarterly ($44.99). El modelo se simplifico a credit packs puros. Todo el copy de "suscripcion" fue reemplazado en `landing-i18n.ts`, `DashboardPage`, `CreditUpsellModal`, y mock adapters.

---

## 12. Estrategia de Mercado

- **Mercado primario**: Mexico (nearshoring hub #1) y Colombia (nearshoring hub #2)
- **Early adopters**: Product managers, engineers, sales leads en empresas tech que hacen nearshoring
- **Canal de adquisicion**: LinkedIn ads + content marketing en espanol
- **Regional context**: El prompt system tiene bloques especificos para Mexico y Colombia (vocabulario, cultura de negocios)
- **Idiomas de la landing**: Espanol y Portugues (i18n completo)

---

## 13. Logica de Aprendizaje (SR)

### Spaced Repetition

- Cards creadas automaticamente de frases con score < 85 en shadowing
- Cards tambien se crean de Arena Power Phrases usadas durante la conversacion
- Intervalos: 24h → 3 dias → 7 dias → 14 dias → 30 dias → dominada
- Threshold: < 80 = fail (retry), 80-84 = technical pass (advance + SR card), >= 85 = mastery

### Three-band scoring

```
Score < 80   → FAIL    → Retry (max 3 attempts) o mark for SR
Score 80-84  → PASS    → Advance + create SR card for reinforcement
Score >= 85  → MASTERY → Advance, no SR card needed
```

---

## 14. Roadmap de Implementacion

Ver `WORKPLAN_v3.md` para el plan detallado por fases.

Resumen:
- **Fase 0** (en progreso): Prototipo mock escrito, auditoria de production readiness completada, debugging de blank screen en curso
- **Fase 1**: Auth + Schema (Supabase)
- **Fase 2**: Conversation Engine (GPT-4o + ElevenLabs)
- **Fase 3**: Feedback + Pronunciation (Gemini + Azure)
- **Fase 4**: User data + Payments (Mercado Pago)

---

## 15. Referencia de Archivos

### Frontend — Componentes (`/src/app/components/`)

| Archivo | Lineas | Descripcion |
|---------|--------|-------------|
| `App.tsx` | ~329 | Entry point, hash routing, auth listener, flow state, ErrorBoundary wrapper |
| `LandingPage.tsx` | ~535 | Landing con hero, PracticeWidget embed, pricing, FAQ, i18n ES/PT |
| `AuthModal.tsx` | ~280 | Modal de auth Google/LinkedIn, modo login/registro, i18n |
| `PracticeWidget.tsx` | ~749 | Input de escenario + PracticeSetupModal inline |
| `StrategyBuilder.tsx` | ~524 | 3 value pillars, stepper horizontal, framework tooltips |
| `PracticeSessionPage.tsx` | ~1339 | Orchestrator de 8 steps: strategy→session-recap |
| `SessionReport.tsx` | ~664 | Reporte comprehensivo post-sesion (reemplaza Session Recap + Shadowing) |
| `DashboardPage.tsx` | ~431 | Dashboard con credit balance, start session con validacion de creditos |
| `PracticeHistoryPage.tsx` | ~371 | Lista de sesiones pasadas con before/after |
| `CreditUpsellModal.tsx` | ~507 | Modal de compra de credit packs, confetti, i18n ES/PT |
| `LanguageTransitionModal.tsx` | ~123 | Modal post-auth de transicion de idioma |
| `ErrorBoundary.tsx` | ~181 | Class component que atrapa errores de render, muestra fallback con diagnostico |
| `HowItWorksTabs.tsx` | ~512 | Tabs de "Como funciona" en Landing, i18n |
| `LoadingScreen.tsx` | ~101 | Pantalla de carga inicial |
| `SessionProgressBar.tsx` | ~142 | Progress bar de los 8 steps de la sesion |
| `DesignSystemPage.tsx` | ~1680 | Design system showcase (herramienta interna) |

### Frontend — i18n (`/src/app/components/`)

| Archivo | Lineas | Descripcion |
|---------|--------|-------------|
| `landing-i18n.ts` | ~668 | Interface `LandingCopy` + copias completas ES y PT |
| `LandingLangContext.tsx` | ~13 | React Context + `useLandingCopy()` hook |

### Frontend — Arena (`/src/app/components/arena/`)

| Archivo | Descripcion |
|---------|-------------|
| `ArenaSystem.tsx` | PhaseIndicator, PhaseTransitionToast, TrySayingHint, ArenaProgressBar, useArenaPhase hook |
| `BriefingRoom.tsx` | BeforeAfterSection, MindsetPulse component |

### Frontend — Shared (`/src/app/components/shared/`)

| Archivo | Descripcion |
|---------|-------------|
| `index.tsx` (~1254 lineas) | COLORS, BrandLogo, SectionHeading, CheckIcon, XIcon, DotPattern, PastelBlobs, MiniFooter, PricingCard, PageTitleBlock, AccuracyRing, HighlightWithTooltip, StageBadge, SubtleTextLink, RecordButton, RecordingWaveformBars, RecordingTimer, AnalyzingScreen, highlightEnglish, renderStressedPhrase, stripStressMarkers |
| `ServiceErrorBanner.tsx` | Banner adaptativo que muestra errores del service layer |
| `ProfileCompletionBanner.tsx` | Banner de completar perfil (industry, position, seniority) |
| `session-types.ts` | Step type compartido (8 valores) para PracticeSessionPage y SessionProgressBar |

### Frontend — Hooks (`/src/app/hooks/`)

| Archivo | Descripcion |
|---------|-------------|
| `useServiceCall.ts` | Generic hook con retry, backoff, abort, typed errors |

### Service Layer (`/src/services/`)

| Archivo | Lineas | Descripcion |
|---------|--------|-------------|
| `index.ts` | ~221 | Registry: USE_MOCK auto-detect + ADAPTER_MODE + factory functions + defensive try-catch + singleton exports |
| `types.ts` | ~306 | Todos los tipos: User, Session, SR, Arena, CreditPack, CREDIT_PACK_DETAILS, etc. |
| `errors.ts` | ~541 | ServiceError base + 5 dominios + CREDITS_EXHAUSTED + type guards + toServiceError |
| `supabase.ts` | ~186 | Supabase client singleton + Row types (ProfileRow, SessionRow, CreditPurchaseRow, CreditBalanceRow, etc.) |

### Interfaces (`/src/services/interfaces/`)

7 archivos: `auth.ts`, `conversation.ts`, `feedback.ts`, `speech.ts`, `user.ts`, `payment.ts`, `spaced-repetition.ts`, `index.ts` (re-exports)

### Mock Adapters (`/src/services/adapters/mock/`)

7 adapters + `utils.ts` (delay, mockId, shouldSimulateError) + 11 data files en `/data/`

### Prompts (`/src/services/prompts/`)

| Archivo | Descripcion |
|---------|-------------|
| `index.ts` | Public API re-exports |
| `assembler.ts` | 7-block prompt assembler (core logic) |
| `templates.ts` | MASTER_SYSTEM_PROMPT, OUTPUT_FORMAT_BLOCK, FIRST_MESSAGE_BLOCK, MINI_TEMPLATE |
| `personas.ts` | 3 base personas (client, manager, recruiter) + 2 sub-profiles (negotiator, leadership) |
| `regions.ts` | Regional blocks for Mexico and Colombia |
| `voice-map.ts` | ElevenLabs voice ID mapping per interlocutor |
| `analyst.ts` | Prompts for Gemini feedback analysis + pronunciation coach + script generation |

### Supabase Adapters (`/src/services/adapters/supabase/`)

| Archivo | Descripcion |
|---------|-------------|
| `auth.supabase.ts` | SupabaseAuthService — implementa IAuthService con Supabase Auth real, fetchOrCreateProfile con 4 fallback levels |

### Documentacion (`/docs/`)

| Archivo | Descripcion |
|---------|-------------|
| `MASTER_BLUEPRINT.md` | Este documento (v5.0) |
| `WORKPLAN_v3.md` | Plan de trabajo por fases |
| `PDR_SCREEN_BY_SCREEN.md` | Spec detallada de cada pantalla |
| `QA_ACCEPTANCE_CRITERIA.md` | Tests de aceptacion por fase |
| `SYSTEM_PROMPTS.md` | Arquitectura de prompts (7 bloques) |
| `BACKEND_HANDOFF.md` | Guia para el backend developer |
| `DEVELOPER_HANDOFF_CHECKLIST.md` | Checklist de entrega (accesos, credenciales, etc.) |
| `FASE1_MIGRATION.sql` | SQL completo para Fase 1 |
| `FASE1_ONBOARDING_SUPPLEMENT.md` | Suplemento tecnico para Fase 1 |

### Deuda tecnica

| Item | Ubicacion | Impacto |
|------|-----------|---------|
| ~48 archivos shadcn/ui sin importar | `/src/app/components/ui/` | 0 (tree-shaking) |
| Archivo monolitico | `PracticeSessionPage.tsx` (1339 lineas) | Legibilidad (reducido de 2891 con extraccion de SessionReport) |
| Archivo monolitico | `shared/index.tsx` (1254 lineas) | Legibilidad |
| Blank screen issue | Toda la app | Debugging en progreso — ErrorBoundary + defensive init agregados |
| Hash-based routing (no react-router) | `App.tsx` | Funcional pero basico. No soporta deep linking complejo |