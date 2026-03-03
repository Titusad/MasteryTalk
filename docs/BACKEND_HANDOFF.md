# inFluentia PRO — Backend Developer Handoff

> **Fecha:** 26 febrero 2026
> **Estado del frontend:** Prototipo escrito con mock adapters (pendiente primera compilacion y debug)
> **Tu mision:** Configurar Supabase, ejecutar la migracion, y progresivamente reemplazar mock adapters con adapters reales.

---

## 1. Orientacion rapida (lee esto primero)

### Estructura del proyecto

```
/
├── .env.example              ← EMPIEZA AQUI: copia a .env y llena credenciales
├── docs/
│   ├── MASTER_BLUEPRINT.md   ← Arquitectura completa (la biblia)
│   ├── PDR_SCREEN_BY_SCREEN.md ← Spec de cada pantalla (15 screens / 11 internal steps)
│   ├── QA_ACCEPTANCE_CRITERIA.md ← 124 tests por 5 fases
│   ├── SYSTEM_PROMPTS.md     ← Prompt engineering: 7 bloques, personas, voice map
│   ├── FASE1_MIGRATION.sql   ← *** EJECUTAR EN SUPABASE SQL EDITOR ***
│   ├── FASE1_ONBOARDING_SUPPLEMENT.md ← Instrucciones detalladas Fase 1
│   ├── WORKPLAN_v3.md        ← Plan de trabajo por fases
│   ├── DEVELOPER_HANDOFF_CHECKLIST.md ← Checklist de accesos y credenciales
│   └── BACKEND_HANDOFF.md    ← Este documento
├── src/
│   ├── app/                  ← Frontend React (no necesitas tocar esto)
│   │   ├── App.tsx           ← Entry point, hash routing, auth listener
│   │   ├── components/       ← ~15 componentes de pantalla
│   │   │   ├── arena/        ← ArenaSystem.tsx, BriefingRoom.tsx
│   │   │   ├── shared/       ← Design system (index.tsx, ServiceErrorBanner, ProfileCompletionBanner)
│   │   │   └── ui/           ← ~48 archivos shadcn/ui (NO IMPORTADOS — ignorar)
│   │   └── hooks/            ← useServiceCall (retry + error handling)
│   ├── services/             ← *** TU ZONA PRINCIPAL DE TRABAJO ***
│   │   ├── index.ts          ← Service Registry + adapter switch (USE_MOCK + ADAPTER_MODE)
│   │   ├── types.ts          ← Tipos compartidos (~300 lineas: User, Session, SR, Arena, etc.)
│   │   ├── errors.ts         ← Error protocol (5 dominios, ~30 codes, recovery strategies)
│   │   ├── supabase.ts       ← Client singleton + Row types (match con SQL)
│   │   ├── prompts/          ← Prompt engineering (reutilizable en Edge Functions)
│   │   │   ├── assembler.ts  ← 7-block prompt assembler
│   │   │   ├── templates.ts  ← Master prompt, output format, first message
│   │   │   ├── personas.ts   ← 3 base personas + 2 sub-profiles
│   │   │   ├── regions.ts    ← Mexico / Colombia regional blocks
│   │   │   ├── voice-map.ts  ← ElevenLabs voice ID mapping
│   │   │   └── analyst.ts    ← Gemini prompts (feedback + pronunciation + script)
│   │   ├── interfaces/       ← 7 contratos que tus adapters deben implementar
│   │   │   ├── auth.ts       ← IAuthService (4 metodos)
│   │   │   ├── conversation.ts ← IConversationService (4 metodos)
│   │   │   ├── feedback.ts   ← IFeedbackService (4 metodos)
│   │   │   ├── speech.ts     ← ISpeechService (4 metodos)
│   │   │   ├── user.ts       ← IUserService (7+ metodos)
│   │   │   ├── payment.ts    ← IPaymentService (3 metodos)
│   │   │   └── spaced-repetition.ts ← ISpacedRepetitionService (6 metodos)
│   │   └── adapters/
│   │       ├── mock/         ← 7 mock adapters (tu referencia de comportamiento)
│   │       │   ├── auth.mock.ts
│   │       │   ├── conversation.mock.ts
│   │       │   ├── feedback.mock.ts
│   │       │   ├── speech.mock.ts
│   │       │   ├── user.mock.ts
│   │       │   ├── payment.mock.ts
│   │       │   ├── spaced-repetition.mock.ts
│   │       │   ├── utils.ts  ← delay, mockId, shouldSimulateError
│   │       │   └── data/     ← 11 archivos de datos mock
│   │       └── supabase/     ← Adapters reales (solo auth.supabase.ts existe)
│   │           └── auth.supabase.ts
│   └── styles/               ← CSS/Tailwind (no tocar)
```

### Los 5 archivos que debes leer antes de escribir codigo

1. **`/src/services/index.ts`** — Entiende el sistema de switching mock/supabase
2. **`/src/services/interfaces/*.ts`** — Los 7 contratos que debes implementar
3. **`/src/services/types.ts`** — Todos los tipos de datos compartidos
4. **`/src/services/errors.ts`** — El protocolo de errores (el frontend ya lo maneja)
5. **`/docs/FASE1_MIGRATION.sql`** — El schema SQL que debes ejecutar

---

## 2. Como funciona el Service Registry

### El switch `USE_MOCK`

En `/src/services/index.ts`:

```typescript
// Estado actual: FORZADO a mock para prototipo
const USE_MOCK = true;

// Cuando conectes Supabase, cambia a auto-detect:
// const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true"
//   ? true
//   : import.meta.env.VITE_USE_MOCK === "false"
//     ? false
//     : !isSupabaseConfigured();
```

### El mapa `ADAPTER_MODE`

```typescript
const ADAPTER_MODE: Record<string, AdapterMode> = {
  auth: "supabase",           // ← Fase 1
  conversation: "mock",       // ← Fase 2
  feedback: "mock",           // ← Fase 3
  speech: "mock",             // ← Fase 3
  user: "mock",               // ← Fase 4
  payment: "mock",            // ← Fase 4
  spacedRepetition: "mock",   // ← Fase 4
};
```

### Para activar tu adapter

1. Crea `/src/services/adapters/supabase/{service}.supabase.ts`
2. Implementa la interfaz correspondiente
3. Importalo en `index.ts`
4. Agrega el case en la factory function
5. Cambia `ADAPTER_MODE.{service}` a `"supabase"`

Ejemplo (ya hecho para auth):

```typescript
function createAuthService(): IAuthService {
  if (shouldUseMock("auth")) return new MockAuthService();
  return new SupabaseAuthService();
}
```

---

## 3. Protocolo de errores

Tu adapter DEBE lanzar los errores tipados correspondientes. El frontend ya los maneja.

### Ejemplo: Conversation adapter

```typescript
import { ConversationError } from "../../errors";

// Si GPT-4o timeout:
throw new ConversationError("AI_TIMEOUT");

// Si session no existe:
throw new ConversationError("SESSION_NOT_FOUND");
```

### Errores por dominio

| Dominio | Clase | Archivo de referencia |
|---------|-------|----------------------|
| Auth | `AuthError` | `errors.ts` — 4 codes |
| Conversation | `ConversationError` | `errors.ts` — 7 codes |
| Feedback | `FeedbackError` | `errors.ts` — 5 codes |
| Speech | `SpeechError` | `errors.ts` — 10 codes |
| Payment | `PaymentError` | `errors.ts` — 7 codes (incluye `estimatedWait` para PAYMENT_PENDING) |

Cada error tiene:
- `code`: Machine-readable (para switch/match)
- `userMessage`: Espanol (para UI)
- `retryable`: boolean
- `recovery`: "retry" | "retry-manual" | "user-action" | "degrade" | "navigate" | "none"

---

## 4. Prompt engineering (reutilizable)

El modulo `/src/services/prompts/` contiene toda la logica de prompt assembly.
**Puedes importar esto directamente en tus Edge Functions.**

```typescript
import { assembleSystemPrompt } from "../prompts";

const { systemPrompt, voiceId, subProfile, estimatedTokens } =
  assembleSystemPrompt({
    interlocutor: "client",
    scenario: "Sales pitch for SaaS platform",
    marketFocus: "mexico",
    extractedContext: "PDF content here...",
    includeFirstMessage: true,
    scenarioType: "sales",
    strategyPillars: [{ summary: "...", why: "...", how: "...", result: "..." }],
  });
```

El assembler ya maneja:
- 7 bloques (master prompt, persona, region, scenario, context, format, first message)
- Sub-profile detection (NEGOTIATOR, LEADERSHIP)
- GPT-4o vs 4o-mini template selection
- Token estimation
- Voice ID mapping

---

## 5. Mock adapters como referencia

Cada mock adapter es tu **especificacion de comportamiento**. Estudia:

| Mock adapter | Comportamiento clave |
|---|---|
| `conversation.mock.ts` | `prepareSession` usa el prompt assembler REAL, `processTurn` cicla por mensajes hardcoded |
| `speech.mock.ts` | `setMockSpeechScenario()` para alinear transcripciones por scenario, scoring con progresion |
| `feedback.mock.ts` | 4 metodos retornan datos por scenario type |
| `spaced-repetition.mock.ts` | Three-band scoring (< 80 fail, 80-84 pass + SR card, >= 85 mastery) |
| `user.mock.ts` | `canStartSession` con logica free/paid, `markFreeSessionUsed` |
| `payment.mock.ts` | PAYMENT_PENDING con `estimatedWait` para pagos en efectivo |

---

## 6. Quick start: Fase 1

1. `cp .env.example .env` → Llena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
2. Configura Google OAuth en Supabase Dashboard
3. Ejecuta `FASE1_MIGRATION.sql` en SQL Editor
4. En `services/index.ts`: Cambia `const USE_MOCK = true` → descomenta la logica auto-detect
5. Verifica: Google sign-in → profile creado → flujo completo con mock services

Ver `FASE1_ONBOARDING_SUPPLEMENT.md` para instrucciones paso a paso.

---

## 7. Notas importantes

### `RESET_PROTOTYPE = true`
En `App.tsx` linea 31, hay un flag que limpia localStorage en cada reload.
**Desactivalo** (`= false`) cuando empieces a testear con auth real, o perderas la sesion.

### `ui/` directory
Los ~48 archivos en `/src/app/components/ui/` son scaffolding de shadcn/ui que NO se importan.
Puedes ignorarlos o eliminarlos — no afectan el build (tree-shaking).

### Scenario types
El sistema soporta 5 tipos con datos completos:
`"sales"`, `"interview"`, `"csuite"`, `"negotiation"`, `"networking"`

Cada tipo tiene datos mock especificos para: chat messages, shadowing phrases, script sections, feedback, cultural tips.
