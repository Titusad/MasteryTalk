# inFluentia PRO — Backend Developer Handoff

> **Fecha:** 4 marzo 2026
> **Estado del frontend:** Prototipo funcional como MVP con mock data — listo para demos y validacion con usuarios. Paywall system (3 triggers) implementado. i18n ES/PT/EN completo.
> **Tu mision:** Configurar Supabase, ejecutar la migracion, y progresivamente reemplazar mock adapters con adapters reales.

---

## 1. Orientacion rapida (lee esto primero)

### Estructura del proyecto

```
/
├── .env.example              ← EMPIEZA AQUI: copia a .env y llena credenciales
├── docs/
│   ├── MASTER_BLUEPRINT.md   ← Arquitectura completa (la biblia) v5.0
│   ├── PDR_SCREEN_BY_SCREEN.md ← Spec de cada pantalla (8 steps internos) v5.0
│   ├── QA_ACCEPTANCE_CRITERIA.md ← 116 tests por 5 fases v4.0
│   ├── SYSTEM_PROMPTS.md     ← Prompt engineering: 7 bloques, personas, voice map
│   ├── FASE1_MIGRATION.sql   ← *** EJECUTAR EN SUPABASE SQL EDITOR ***
│   ├── FASE1_ONBOARDING_SUPPLEMENT.md ← Instrucciones detalladas Fase 1
│   ├── WORKPLAN_v3.md        ← Plan de trabajo por fases v3.1
│   ├── DEVELOPER_HANDOFF_CHECKLIST.md ← Checklist de accesos y credenciales
│   └── BACKEND_HANDOFF.md    ← Este documento
├── src/
│   ├── app/                  ← Frontend React (no necesitas tocar esto)
│   │   ├── App.tsx           ← Entry point, hash routing, auth listener, ErrorBoundary
│   │   ├── components/       ← ~18 componentes de pantalla
│   │   │   ├── arena/        ← ArenaSystem.tsx, BriefingRoom.tsx
│   │   │   ├── shared/       ← Design system (index.tsx, ServiceErrorBanner, ProfileCompletionBanner, session-types.ts)
│   │   │   ├── CreditUpsellModal.tsx  ← Modal de compra de credit packs
│   │   │   ├── ErrorBoundary.tsx      ← Atrapa errores de render
│   │   │   ├── LanguageTransitionModal.tsx ← Transicion de idioma post-auth
│   │   │   ├── landing-i18n.ts        ← Copias ES/PT para Landing
│   │   │   ├── LandingLangContext.tsx  ← Context para i18n
│   │   │   ├── SessionReport.tsx      ← Reporte post-sesion
│   │   │   └── ui/           ← ~48 archivos shadcn/ui (NO IMPORTADOS — ignorar)
│   │   └── hooks/            ← useServiceCall (retry + error handling)
│   ├── services/             ← *** TU ZONA PRINCIPAL DE TRABAJO ***
│   │   ├── index.ts          ← Service Registry + adapter switch (USE_MOCK auto-detect + ADAPTER_MODE) + defensive try-catch
│   │   ├── types.ts          ← Tipos compartidos (~306 lineas: User, Session, SR, Arena, CreditPack, etc.)
│   │   ├── errors.ts         ← Error protocol (5 dominios, ~31 codes incl CREDITS_EXHAUSTED)
│   │   ├── supabase.ts       ← Client singleton + Row types (match con SQL + credit tables)
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
│   │   │   ├── payment.ts    ← IPaymentService (3 metodos — credit packs, no suscripciones)
│   │   │   └── spaced-repetition.ts ← ISpacedRepetitionService (6 metodos)
│   │   └── adapters/
│   │       ├── mock/         ← 7 mock adapters (tu referencia de comportamiento)
│   │       │   ├── auth.mock.ts
│   │       │   ├── conversation.mock.ts
│   │       │   ├── feedback.mock.ts
│   │       │   ├── speech.mock.ts
│   │       │   ├── user.mock.ts      ← canStartSession con validacion de creditos
│   │       │   ├── payment.mock.ts   ← createCheckout(uid, CreditPack), getCreditsBalance
│   │       │   ├── spaced-repetition.mock.ts
│   │       │   ├── utils.ts  ← delay, mockId, shouldSimulateError
│   │       │   └── data/     ← 11 archivos de datos mock
│   │       └── supabase/     ← Adapters reales (solo auth.supabase.ts existe)
│   │           └── auth.supabase.ts
│   └── styles/               ← CSS/Tailwind (no tocar)
```

### Los 5 archivos que debes leer antes de escribir codigo

1. **`/src/services/index.ts`** — Actualmente 100% mock (~38 lineas). Necesitaras restaurar el patron de auto-detect/ADAPTER_MODE para conectar Supabase
2. **`/src/services/interfaces/*.ts`** — Los 7 contratos que debes implementar
3. **`/src/services/types.ts`** — Todos los tipos de datos compartidos (incl `CreditPack`, `CREDIT_PACK_DETAILS`)
4. **`/src/services/errors.ts`** — El protocolo de errores (el frontend ya lo maneja, incl `CREDITS_EXHAUSTED`)
5. **`/docs/FASE1_MIGRATION.sql`** — El schema SQL que debes ejecutar

---

## 2. Como funciona el Service Registry

### El switch `USE_MOCK` (auto-detect)

En `/src/services/index.ts`:

```typescript
// Auto-detect: mock si Supabase no esta configurado
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true"
  ? true
  : import.meta.env.VITE_USE_MOCK === "false"
    ? false
    : !isSupabaseConfigured(); // ← auto-detect
```

> **Ya no esta hardcodeado.** Solo configura tus env vars y el sistema lo detecta automaticamente.

### Defensive initialization (nuevo v5.0)

```typescript
// createAuthService tiene try-catch individual
function createAuthService(): IAuthService {
  if (shouldUseMock("auth")) return new MockAuthService();
  try {
    return new SupabaseAuthService();
  } catch (err) {
    console.error("[inFluentia] SupabaseAuthService failed, falling back to mock:", err);
    return new MockAuthService();
  }
}

// Toda la creacion de servicios esta en try-catch global
try {
  authService = createAuthService();
  // ... otros servicios
} catch (err) {
  // Fallback a TODOS mocks si algo falla
}
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
  try {
    return new SupabaseAuthService();
  } catch (err) {
    console.error("[inFluentia] SupabaseAuthService failed:", err);
    return new MockAuthService();
  }
}
```

---

## 3. Modelo de monetizacion: Credit Packs (NO suscripciones)

**Importante cambio v5.0:** El modelo se simplifico a credit packs puros. NO hay suscripciones mensuales/trimestrales.

```typescript
type CreditPack = "session_1" | "session_3" | "session_5";

// Detalles de cada pack
session_1: { sessions: 1, price: 4.99, perSession: 4.99, discount: 0 }
session_3: { sessions: 3, price: 12.99, perSession: 4.33, discount: 13 }
session_5: { sessions: 5, price: 19.99, perSession: 4.00, discount: 20 }
```

### Tablas de creditos a crear

```sql
-- credit_purchases: registro de cada compra
-- credit_balances: balance actual del usuario (denormalized, updated by triggers)
```

Tipos de fila definidos en `/src/services/supabase.ts`: `CreditPurchaseRow`, `CreditBalanceRow`.

---

## 4. Protocolo de errores

Tu adapter DEBE lanzar los errores tipados correspondientes. El frontend ya los maneja.

### Ejemplo: Payment adapter

```typescript
import { PaymentError } from "../../errors";

// Si usuario no tiene creditos:
throw new PaymentError("CREDITS_EXHAUSTED");

// Si checkout falla:
throw new PaymentError("CHECKOUT_CREATION_FAILED");
```

### Errores por dominio

| Dominio | Clase | Archivo de referencia |
|---------|-------|----------------------|
| Auth | `AuthError` | `errors.ts` — 4 codes |
| Conversation | `ConversationError` | `errors.ts` — 7 codes |
| Feedback | `FeedbackError` | `errors.ts` — 5 codes |
| Speech | `SpeechError` | `errors.ts` — 10 codes |
| Payment | `PaymentError` | `errors.ts` — 8 codes (incluye `CREDITS_EXHAUSTED` + `estimatedWait` para PAYMENT_PENDING) |

---

## 5. Prompt engineering (reutilizable)

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

---

## 6. Mock adapters como referencia

Cada mock adapter es tu **especificacion de comportamiento**. Estudia:

| Mock adapter | Comportamiento clave |
|---|---|
| `conversation.mock.ts` | `prepareSession` usa el prompt assembler REAL, `processTurn` cicla por mensajes hardcoded |
| `speech.mock.ts` | `setMockSpeechScenario()` para alinear transcripciones por scenario, scoring con progresion |
| `feedback.mock.ts` | 4 metodos retornan datos por scenario type |
| `spaced-repetition.mock.ts` | Three-band scoring (< 80 fail, 80-84 pass + SR card, >= 85 mastery) |
| `user.mock.ts` | `canStartSession` con logica free/creditos, `markFreeSessionUsed` |
| `payment.mock.ts` | `createCheckout(uid, CreditPack)`, `getCreditsBalance`, PAYMENT_PENDING con `estimatedWait` |

---

## 7. Quick start: Fase 1

1. Configura env vars (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) — el auto-detect en `services/index.ts` los detecta
2. Configura Google OAuth en Supabase Dashboard
3. Ejecuta `FASE1_MIGRATION.sql` en SQL Editor
4. Verifica: Google sign-in → profile creado → flujo completo con mock services

Ver `FASE1_ONBOARDING_SUPPLEMENT.md` para instrucciones paso a paso.

---

## 8. Notas importantes

### ErrorBoundary
En `App.tsx`, todo el contenido esta envuelto en `<ErrorBoundary>`. Si un componente crashea, el usuario ve un mensaje de error con stack trace en vez de pantalla blanca. Esto te ayuda a diagnosticar problemas rapidamente.

### `ui/` directory
Los ~48 archivos en `/src/app/components/ui/` son scaffolding de shadcn/ui que NO se importan.
Puedes ignorarlos o eliminarlos — no afectan el build (tree-shaking).

### Scenario types
El sistema soporta 5 tipos con datos completos:
`"sales"`, `"interview"`, `"csuite"`, `"negotiation"`, `"networking"`

Cada tipo tiene datos mock especificos para: chat messages, shadowing phrases, script sections, feedback, cultural tips.

### Auth race condition (resuelto)
`App.tsx` usa `prevAuthUserRef` (no `authInitialized`) para trackear transiciones null→user post-login con Google OAuth. Esto resuelve el bug donde `authService.onAuthStateChanged` disparaba `callback(null)` primero y `callback(user)` despues en redirect flows.