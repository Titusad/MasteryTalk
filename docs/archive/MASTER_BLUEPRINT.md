# ⚠️ [LEGACY] inFluentia PRO - Master Blueprint v9.0

> **⚠️ THIS DOCUMENT IS LEGACY.** It is kept for historical reference only.
> The **source of truth** is now [`docs/PRODUCT_SPEC.md`](./PRODUCT_SPEC.md).
> Pricing, scenarios, and business model in this file are **outdated**.
> Do NOT use this document to make implementation decisions.

> **The Scalable Blueprint** - De concepto educativo a herramienta de rendimiento ejecutivo.
> Documento maestro que consolida arquitectura, decisiones, y hoja de ruta.
> Ultima actualizacion: 5 abril 2026 (v9.0)

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
13. [Logica de Aprendizaje y Skill Drill](#13-logica-de-aprendizaje)
14. [Conversational Path](#14-conversational-path)
15. [Roadmap de Implementacion](#15-roadmap)
16. [Referencia de Archivos](#16-referencia-de-archivos)

---

## 1. Vision del Producto

**inFluentia PRO** es un simulador de alto rendimiento para comunicacion ejecutiva
en ingles, disenado para el mercado de nearshoring en Latinoamerica.

**No vendemos clases. Vendemos acceso a riqueza y poder.**

- **Target**: Profesionales tech/ejecutivos en Mexico y Colombia que necesitan
  comunicarse con clientes y equipos en EE.UU.
- **Diferenciador**: Confrontacion realista con IA + feedback accionable + practica
  de pronunciacion + Skill Drill evaluado con IA — todo en un flujo de 9 pasos internos.
- **Metrica North Star**: Usuarios que convierten a suscripcion despues de la primera sesion gratuita.

---

## 2. Stack Tecnologico

### El "Cerebro Hibrido" - Cada servicio optimizado por costo y calidad

| Componente | Tecnologia | Razon Estrategica |
|---|---|---|
| **Backend & DB** | Supabase (PostgreSQL) | Queries relacionales para analytics, Edge Functions rapidas |
| **Logic Layer** | Supabase Edge Functions (Deno/TS) | Menor latencia, integracion nativa con Supabase |
| **Chat en Vivo** | GPT-4o | Maximo realismo en confrontacion ejecutiva |
| **Feedback/Procesamiento** | Gemini 1.5 Flash | Ahorro ~98% vs GPT-4o en tareas analiticas |
| **Evaluador de Drill** | GPT-4o (claude-sonnet-4-6 fallback) | Evaluacion precisa con criterios por pillar |
| **TTS Sistema** | Azure Neural | Costo $0 para guiar al usuario |
| **TTS Practica** | ElevenLabs | Inmersion de lujo para interlocutor IA |
| **STT + Scoring** | Azure Speech REST API | Compatibilidad total con Deno (sin SDK pesado) |
| **Audio Cache** | Cloudflare R2 | $0 egress, SHA-256 dedup de audios generados |
| **User Assets** | Supabase Storage | Archivos subidos por usuario |
| **Pagos** | Mercado Pago (LATAM) / Stripe (global) | Cobertura regional + internacional |
| **Frontend** | React 18 + Tailwind CSS v4 + Vite 6 | App web completa (Feature-Sliced Design) |
| **Testing** | Vitest + happy-dom | Pruebas unitarias/integración |

### Dependencias clave del frontend

| Paquete | Uso |
|---------|-----|
| `motion` (Motion) | Animaciones y transiciones entre pantallas |
| `lucide-react` | Iconografia consistente |
| `@supabase/supabase-js` v2.98 | Cliente Supabase |
| `canvas-confetti` | Celebracion de confetti en momentos de desbloqueo y compra |

> **Limpieza realizada (26 feb 2026):** Se eliminaron ~43 paquetes innecesarios del `package.json`.

### Por que Supabase sobre Firebase

1. **Relational Power**: Queries complejas son triviales en SQL.
2. **Edge Functions**: Ejecutan mas cerca del usuario que Cloud Functions de Firebase.
3. **SQL nativo**: Exportacion facil para BI si el negocio escala.
4. **RLS (Row Level Security)**: Seguridad a nivel de fila sin logica custom.

---

## 3. Arquitectura de Datos

### 3.1 Tabla `profiles` (Auth & Metadata)

```sql
CREATE TABLE profiles (
  id                    uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  market_focus          text CHECK (market_focus IN ('mexico', 'colombia')),
  plan                  text DEFAULT 'free' CHECK (plan IN ('free', 'path')),
  -- Escenarios donde ya se uso la sesion gratuita (demo session)
  free_sessions_used    text[] DEFAULT '{}',
  -- Paths comprados (ScenarioType[]) — acceso permanente
  paths_purchased       text[] DEFAULT '{}',
  stats                 jsonb DEFAULT '{}',
  achievements          text[] DEFAULT '{}',
  created_at            timestamptz DEFAULT now()
);
```

> **Cambio v9.0:** Se simplifica `plan` a `'free' | 'path'`. Se elimina `subscription_active`, `plan_status`, `conversational_unlocked`. Se reemplaza por `paths_purchased text[]` que trackea los paths comprados por ScenarioType. El acceso es permanente una vez comprado.

### 3.2 Tabla `sessions`

```sql
CREATE TABLE sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scenario_type   text NOT NULL,
  scenario_config jsonb NOT NULL,
  system_prompt   text,
  voice_id        text,
  history         jsonb DEFAULT '[]',
  feedback        jsonb,
  drill_result    jsonb,
  -- 'demo' = sesion gratuita, 'path' = sesion dentro de un path comprado, 'booster' = sesion extra pagada
  session_type    text DEFAULT 'demo' CHECK (session_type IN ('demo', 'path', 'booster')),
  -- Nivel del path al que pertenece esta sesion (ej: 'int-1', 'sal-3')
  path_level_id   text,
  -- Numero de intento dentro del nivel (1-3 para fresh, null para demo)
  attempt_number  integer,
  status          text DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at      timestamptz DEFAULT now(),
  completed_at    timestamptz
);
```

> **Cambio v9.0:** Se reemplaza `session_type` values por `'demo' | 'path' | 'booster'`. Se agregan `path_level_id` y `attempt_number` para trackear sesiones dentro de Learning Paths.

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
  -- 'session' | 'arena' | 'drill'
  origin          text DEFAULT 'session',
  next_review_at  timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);
```

> **Cambio v7.0:** Se agrega valor `'drill'` al campo `origin` para cards creadas automaticamente cuando el score del Skill Drill < 45.

### 3.4 Tabla `power_phrases`

```sql
CREATE TABLE power_phrases (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  phrase        text NOT NULL,
  category      text NOT NULL,
  when_to_use   text DEFAULT '',
  situation     text DEFAULT '',
  accent_color  text DEFAULT '#DBEDDF',
  created_at    timestamptz DEFAULT now()
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

### 3.6 Tablas de pagos (v9.0 — per-Learning-Path + Booster Pack)

```sql
CREATE TABLE path_purchases (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  -- Tipo de compra: 'single_path' | 'all_access' | 'booster'
  purchase_type     text NOT NULL CHECK (purchase_type IN ('single_path', 'all_access', 'booster')),
  -- ScenarioType del path comprado (null para all_access)
  scenario_type     text,
  amount_usd        numeric(10,2) NOT NULL,
  payment_provider  text NOT NULL CHECK (payment_provider IN ('mercadopago', 'stripe')),
  payment_id        text,
  status            text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at        timestamptz DEFAULT now()
);

-- Track de intentos frescos consumidos por nivel
CREATE TABLE path_level_progress (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scenario_type   text NOT NULL,
  level_id        text NOT NULL,          -- ej: 'int-1', 'sal-3'
  fresh_attempts  integer DEFAULT 0,      -- intentos fresh usados (max 3)
  best_session_id uuid REFERENCES sessions(id),  -- mejor sesion para review mode
  status          text DEFAULT 'unlocked' CHECK (status IN ('locked', 'unlocked', 'completed')),
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (user_id, scenario_type, level_id)
);
```

> **Cambio v9.0:** Se eliminan `subscriptions` y `session_purchases`. Se crean `path_purchases` (compra one-time de paths/bundles/boosters) y `path_level_progress` (tracking de intentos y progreso por nivel dentro del path).

> Schema completo con RLS, indexes y triggers: ver `/docs/FASE1_MIGRATION.sql`

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

**Service instances:**

```typescript
export {
  authService,              // IAuthService
  conversationService,      // IConversationService
  feedbackService,          // IFeedbackService
  speechService,            // ISpeechService
  userService,              // IUserService
  paymentService,           // IPaymentService
  spacedRepetitionService,  // ISpacedRepetitionService
};
```

---

## 5. Interfaces y Contratos

Ver `/src/services/interfaces/` para los 7 contratos completos.

Tipos clave actualizados en v9.0:

```typescript
type UserPlan = "free" | "path";

type ScenarioType = "interview" | "sales" | "networking" | "negotiation" | "csuite";

type PathStatus =
  | "not-started"       // Usuario nunca entro a este escenario
  | "demo-completed"    // Completo la sesion demo gratuita
  | "purchased"         // Compro el path, aun no empieza
  | "in-progress"       // Dentro del Learning Path, avanzando niveles
  | "completed";        // Completo todos los niveles del path

type PurchaseType = "single_path" | "all_access" | "booster";

interface UserAccess {
  plan: UserPlan;
  freeSessionsUsed: ScenarioType[];   // Escenarios con demo session consumida
  pathsPurchased: ScenarioType[];     // Paths comprados (acceso permanente)
}

interface PathLevelAccess {
  scenarioType: ScenarioType;
  levelId: string;                     // ej: 'int-1'
  freshAttempts: number;               // intentos fresh usados (max 3)
  freshAttemptsRemaining: number;      // 3 - freshAttempts
  bestSessionId: string | null;        // para review mode
  status: "locked" | "unlocked" | "completed";
}

interface DrillEvaluation {
  score: number;
  passed: boolean;
  badge: "strong" | "close" | "needs-work";
  oneLiner: string;
  modelPhrase: string;
  narrative: string;
  scoreBreakdown: Record<string, number>;
  attemptNumber: 1 | 2;
  pillar: PillarName;
}

interface DrillResult {
  pillar: PillarName;
  finalScore: number;
  passed: boolean;
  attempts: 1 | 2;
  srCardCreated: boolean;
}
```

---

## 6. Protocolo de Errores

Sin cambios respecto a v6.0. Ver `/src/services/errors.ts` para los 5 dominios y ~31 error codes.

Nuevos error codes en v9.0:
- `PATH_PURCHASE_REQUIRED` — usuario intenta acceder a un Learning Path sin haberlo comprado
- `FRESH_ATTEMPTS_EXHAUSTED` — usuario agoto sus 3 intentos fresh en un nivel (ofrecer Booster Pack o Review Mode)

---

## 7. Mock Adapters

### 7 adapters implementados

| Adapter | Archivo | Comportamiento |
|---------|---------|----------------|
| `MockAuthService` | `auth.mock.ts` | Google/LinkedIn sign-in simulado (~300ms delay) |
| `MockConversationService` | `conversation.mock.ts` | `prepareSession` con prompt assembler real, `processTurn` con mensajes hardcoded por scenario |
| `MockFeedbackService` | `feedback.mock.ts` | Strengths, opportunities, script sections, completed phrases, results summary |
| `MockSpeechService` | `speech.mock.ts` | Transcripciones por scenario, TTS simulado, scoring con progresion |
| `MockUserService` | `user.mock.ts` | Profile, plan, practice history, power phrases, `canStartSession` con validacion de acceso por escenario |
| `MockPaymentService` | `payment.mock.ts` | Checkout URLs fake, suscripcion simulada, celebracion confetti |
| `MockSpacedRepetitionService` | `spaced-repetition.mock.ts` | Cards, today's review, attempt scoring, interval progression |

> **Cambio v7.0:** `MockUserService.canStartSession()` ahora valida acceso por escenario (free_sessions_used) en lugar de credit balance.

---

## 8. Flujo de Pantallas (Frontend)

### 8.1 Mapa de navegacion

```
Landing Page (#) — i18n ES/PT
  |
  +-- PracticeWidget (escenario input)
  +-- AuthModal (Google/LinkedIn)
  | 
  +-- [registro] → PracticeSessionPage (#practice-session)
  +-- [login]    → Dashboard (#dashboard)

Dashboard (#dashboard):
  |
  +-- AdminDashboard (#admin) — Estadísticas globales, KV updates
  +-- Progression Tree (Nodos secuenciales)
  +-- LessonModal (Stepper: Concept → Scenario → Comparison → Toolkit → Voice)
  +-- Library (#library)
  +-- Account (#account)

Practice History (#practice-history):
  +-- Full history list con filtering
  +-- "Volver" → Dashboard
```

> **Cambio v7.0:** Se agrega el step `skill-drill` (step 8) entre `conversation-feedback` y `session-recap`. El Step type ahora tiene 9 valores. Se actualiza `shared/session-types.ts`.

### 8.2 Step type actualizado

```typescript
// shared/session-types.ts
export type Step =
  | "key-experience"
  | "extra-context"
  | "generating-script"
  | "pre-briefing"
  | "practice"
  | "analyzing"
  | "conversation-feedback"
  | "skill-drill"        // NUEVO v7.0
  | "session-recap";
```

### 8.3 Arena System (3 fases de andamiaje progresivo)

Sin cambios respecto a v6.0.

| Fase | Tono del IA | UI Support | Transicion |
|------|-------------|------------|------------|
| **Support** | Amigable, paciente | Power Phrases visibles, Try Saying hints, Before/After | 2+ good interactions |
| **Guidance** | Neutro, profesional | Power Phrases reducidas, hints sutiles | 2+ good interactions desde Guidance |
| **Challenge** | Confrontacional, exigente | Sin ayuda visible, IA desafia activamente | Fin de conversacion |

### 8.4 Logica de acceso por escenario

```typescript
function canStartSession(
  scenarioType: ScenarioType,
  userAccess: UserAccess,
  levelId?: string
): { allowed: boolean; mode: "demo" | "path" | "purchase_required"; reason?: string } {
  // Demo session: primera sesion de este escenario siempre permitida
  if (!userAccess.freeSessionsUsed.includes(scenarioType)) {
    return { allowed: true, mode: "demo" };
  }

  // Path comprado: verificar intentos del nivel
  if (userAccess.pathsPurchased.includes(scenarioType)) {
    return { allowed: true, mode: "path" };
  }

  // Sin path comprado: requiere compra
  return {
    allowed: false,
    mode: "purchase_required",
    reason: "PATH_PURCHASE_REQUIRED",
  };
}

function canStartFreshAttempt(
  levelAccess: PathLevelAccess
): { allowed: boolean; reason?: string } {
  if (levelAccess.status === "locked") {
    return { allowed: false, reason: "LEVEL_LOCKED" };
  }
  if (levelAccess.freshAttempts >= 3) {
    return { allowed: false, reason: "FRESH_ATTEMPTS_EXHAUSTED" };
  }
  return { allowed: true };
}
```

---

## 9. Edge Functions (Backend)

### Endpoints existentes (sin cambios)

| Method | Route | Auth | Descripcion |
|--------|-------|------|-------------|
| GET | /health | No | Health check |
| POST | /prepare-session | Si | Ensambla system prompt + GPT-4o first message |
| POST | /process-turn | Si | Procesa turno de conversacion con GPT-4o |
| POST | /analyze-feedback | Si | Analisis post-sesion con Gemini |
| POST | /generate-summary | Si | Resumen ejecutivo de la sesion |
| POST | /pronunciation-assess | Si | Evaluacion de pronunciacion con Azure |
| POST | /save-pronunciation | Si | Persiste datos de pronunciacion por sesion |
| POST | /tts-generate | Si | Genera audio con ElevenLabs o Azure |

### Nuevo endpoint (v7.0)

| Method | Route | Auth | Descripcion |
|--------|-------|------|-------------|
| POST | /evaluate-drill | Si | Evalua respuesta del Skill Drill con GPT-4o. Criterios condicionales por pillar. Retorna `DrillEvaluation` JSON. |

### Contrato `/evaluate-drill`

**Request:**
```typescript
{
  pillar: PillarName;
  scenarioType: string;
  interlocutorRole: string;
  situationContext: string;
  userOriginal: string;       // Lo que dijo en la sesion
  userDrillResponse: string;  // Lo que escribio/dijo en el drill
  analystModelPhrase: string; // Del beforeAfter[] del analyst (calibracion interna)
  attemptNumber: 1 | 2;
  lang: "es" | "pt" | "en";
}
```

**Response:** `DrillEvaluation` (ver seccion 5)

---

## 10. Spike: Azure Speech REST API

Validado: Azure Speech REST API funciona desde Deno Edge Functions sin SDK pesado.
- Endpoint: `https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`
- Audio format: WAV PCM 16kHz mono
- Pronunciation assessment via `Pronunciation-Assessment` header (Base64 JSON config)

---

## 11. Modelo de Negocio

> **Actualizado: 5 abril 2026 (v9.0)** — Modelo rediseñado a **per-Learning-Path**. Se eliminan suscripcion mensual y pay-per-session. One-time purchase por path con acceso permanente.

### Filosofia del modelo

**No vendemos acceso. Vendemos resultado.** El profesional LATAM piensa en terminos de metas concretas: "necesito dominar entrevistas en ingles". Un Learning Path es una inversion con meta clara, no un gasto recurrente. Maximizamos conversion inicial con pricing transparente y sesion demo gratuita.

### Tiers de acceso

| | Demo (Free) | Learning Path ($24.99) | All-Access ($59.99) |
|---|---|---|---|
| Sesion completa por escenario | ✅ 1 demo session, todos los poderes | ✅ 3 fresh sessions × 4 niveles | ✅ Todo en 5 paths |
| Skill Drill post-sesion | ✅ Incluido en demo | ✅ Incluido | ✅ Incluido |
| Learning Path progresivo | 🔒 Visible pero bloqueado | ✅ 4 niveles con dificultad progresiva | ✅ 5 paths completos |
| Review Mode (sesiones pasadas) | ✅ De la demo session | ✅ Ilimitado, permanente | ✅ Ilimitado |
| Shadowing + Remedial | ❌ | ✅ Contenido por nivel | ✅ Contenido por nivel |
| Dashboard educativo | 📚 Contenido estatico (microLessons) | ✅ Contenido custom del transcript real | ✅ Contenido custom |
| Resultados y estadisticas | ✅ De la demo session | ✅ Longitudinal por path | ✅ Cross-path analytics |

### Flujo de conversion — usuario nuevo

1. **Usuario nuevo** — siempre sin pago inicial.
2. **Demo Session completa** — todos los poderes activos (GPT-4o-mini en Arena, pronunciacion Azure, feedback completo, Skill Drill). Sin feature gating. Una demo session por escenario.
3. **Skill Drill completado** — el usuario experimenta el ciclo completo de evaluacion y ve su score.
4. **Momento de conversion** — pantalla dedicada que:
   - Celebra el logro (confetti, tono positivo)
   - Muestra el preview del Learning Path completo (4 niveles, contenido progresivo)
   - Presenta el precio: **$24.99 por el path** (ancla: "$2.08 por sesion")
   - Ofrece All-Access Bundle como alternativa: **$59.99 por los 5 paths** (ancla: "$12 por path")
5. **Decision:**
   - **No compra** → Dashboard con path visible pero bloqueado. Review Mode de la demo disponible. Puede hacer la demo de otros escenarios gratis. CTA persistente.
   - **Compra path ($24.99)** → 4 niveles desbloqueados secuencialmente. 3 fresh sessions por nivel. Review ilimitado. Acceso permanente.
   - **Compra All-Access ($59.99)** → 5 paths completos. Mismo modelo por path.

### Acceso por escenario

| Escenario | Demo Session | Learning Path |
|---|---|---|
| Interview | ✅ Gratis (1 vez) | 🎯 $24.99 (o incluido en All-Access) |
| Sales | ✅ Gratis (1 vez) | 🎯 $24.99 (o incluido en All-Access) |
| Networking | ✅ Gratis (1 vez) | 🎯 $24.99 (o incluido en All-Access) |
| Negotiation | ✅ Gratis (1 vez) | 🎯 $24.99 (o incluido en All-Access) |
| C-Suite | ✅ Gratis (1 vez) | 🎯 $24.99 (o incluido en All-Access) |

Cada demo session es un gancho de conversion independiente. El usuario vive la experiencia completa antes de que se le pida pagar.

### Precios y productos

| Producto | Precio | Contenido | Costo real | Margen |
|---|---|---|---|---|
| Demo Session | $0 | 1 sesion completa por escenario | ~$0.49 | CAC |
| **Learning Path** | **$24.99** | 4 niveles × 3 fresh + review ilimitado | ~$7.32 max | **70.7%** |
| **All-Access Bundle** | **$59.99** | 5 paths completos | ~$36.60 max | **39.0%** |
| Booster Pack (futuro) | $4.99 | +3 fresh sessions en cualquier nivel | ~$1.83 | **63.3%** |

### Modelo de sesiones por nivel

```
POR NIVEL (×4 niveles en un path):
├── 3 intentos FRESH (sesion completa con IA: GPT-4o, Azure, ElevenLabs)
├── Review Mode ilimitado (replay de transcript, feedback, scores — costo $0)
├── Remedial content (shadowing + micro-lessons)
└── Si agota 3 intentos → Booster Pack ($4.99 × 3 sesiones extra) [futuro]
```

**¿Que es Review Mode?**
- Ver transcript completo de cada sesion pasada
- Revisar feedback (strengths, opportunities, before/after)
- Revisar pillar scores y su progresion
- Reescuchar audio TTS generado (cacheado)
- **Costo para la plataforma: $0** (datos almacenados en KV)

### Contenido educativo — dos niveles

| | Usuario free (demo) | Path Owner |
|---|---|---|
| Fuente | `microLessons.ts` — contenido estatico por pillar | Material generado del drill: `modelPhrase`, `narrative`, `scoreBreakdown` del transcript real |
| Personalizacion | Generico por pillar | Especifico a la sesion y nivel |
| CTA | "Desbloquea tu Learning Path" | — |

> **Nota:** `microLessons.ts` no se depreca. Se reposiciona como el tier gratuito del dashboard educativo.

> **⚠️ Deuda UX activa:** `CreditUpsellModal` y `SubscriptionModal` (modelos legacy) deben reemplazarse por `PathPurchaseModal` que presente Learning Path ($24.99) y All-Access Bundle ($59.99).

### Tipos en codigo

```typescript
type UserPlan = "free" | "path";

type ScenarioType = "interview" | "sales" | "networking" | "negotiation" | "csuite";

type PurchaseType = "single_path" | "all_access" | "booster";

// Deprecados en v9.0:
// type UserPlan = "per-session" | "subscription"
// CreditPack, CREDIT_PACK_DETAILS, SubscriptionModal, CreditUpsellModal
```

---

## 12. Estrategia de Mercado

- **Mercado primario**: Mexico (nearshoring hub #1) y Colombia (nearshoring hub #2)
- **Early adopters**: Product managers, engineers, sales leads en empresas tech que hacen nearshoring
- **Canal de adquisicion**: LinkedIn ads + content marketing en espanol
- **Regional context**: El prompt system tiene bloques especificos para Mexico y Colombia
- **Idiomas de la landing**: Espanol y Portugues (i18n completo)
- **Hook de conversion**: Primera sesion gratuita por escenario — multiples puntos de entrada organicos

---

## 13. Logica de Aprendizaje y Skill Drill

### Skill Drill — sistema de evaluacion post-sesion

El Skill Drill es el componente remedial que aparece inmediatamente despues de `conversation-feedback`, antes de `session-recap`. Es el mecanismo central de aprendizaje y el trigger de desbloqueo del Conversational Path.

**Posicion en el flujo:**
```
conversation-feedback → skill-drill → session-recap
```

**Seleccion del pillar a drilllar:**

```typescript
function selectDrillPillar(
  pillarScores: Record<string, number>,
  pronunciationScore: number
): PillarName | null {
  const scores = { ...pillarScores, Pronunciation: pronunciationScore };

  // Excluir pillars con score >= 78 (zona fuerte, no drilleable)
  const drillable = Object.entries(scores)
    .filter(([, score]) => score < 78)
    .sort(([nameA, scoreA], [nameB, scoreB]) => {
      // Desempate: Professional Tone y Persuasion tienen prioridad 1.3x
      const weightA = ["Professional Tone", "Persuasion"].includes(nameA) ? 1.3 : 1;
      const weightB = ["Professional Tone", "Persuasion"].includes(nameB) ? 1.3 : 1;
      return (scoreA * weightA) - (scoreB * weightB); // menor score ponderado = mayor prioridad
    });

  // Si todos los pillars estan en zona fuerte → no hay drill, badge de celebracion directo
  if (drillable.length === 0) return null;

  return drillable[0][0] as PillarName;
}
```

**Modalidad de respuesta por pillar:**

| Pillar | Modalidad | Razon |
|---|---|---|
| Vocabulary | Texto | Error lexico — necesita elegir la palabra conscientemente |
| Grammar | Texto | Error estructural — necesita construir la oracion |
| Fluency | Voz | Error en produccion oral — solo se corrige hablando |
| Pronunciation | Voz | Requiere Azure Speech Assessment para evaluar |
| Professional Tone | Texto | Error de registro — necesita reformular deliberadamente |
| Persuasion | Texto | Error de argumento — necesita construir posicion con datos |

**Umbrales de activacion:**

| Score del pillar | Accion |
|---|---|
| 78–100 | Sin drill. Badge de celebracion directo → session-recap |
| 63–77 | Drill ligero — 1 actividad, ~2 min |
| 46–62 | Drill completo — Diagnose → Model → Apply |
| 30–45 | Drill de emergencia + SR card creada automaticamente |

**Intentos:** 2 por drill. La `modelPhrase` solo se revela al final (intento 2 o si paso en intento 1) para preservar la carga cognitiva del segundo intento.

**Desbloqueo del Conversational Path:** Ocurre **siempre** al completar el drill, independientemente del score. El score informa al usuario en que pillar trabajar, pero no bloquea el desbloqueo. El drill no es un filtro de calidad, es un mecanismo de activacion experiencial.

**Creacion automatica de SR card:**
```typescript
// Al finalizar el drill con score final < 45:
if (finalEvaluation.score < 45) {
  await spacedRepetitionService.addCardsFromDrill({
    front: userOriginal,
    back: finalEvaluation.modelPhrase,
    pillar,
    scenarioType,
    nextReviewAt: addDays(new Date(), 1),
  });
  drillResult.srCardCreated = true;
  // Usuario ve: "Hemos guardado esta frase para tu practica de manana."
}
```

**Evaluacion con IA — Edge Function `/evaluate-drill`:**

Un solo evaluador con criterios condicionales por pillar. Criterios por pillar:

- **Vocabulary:** Precision (40%) + Registro (35%) + Ajuste natural (25%)
- **Grammar:** Correccion (50%) + Naturalidad (30%) + Conciencia del patron (20%)
- **Professional Tone:** Registro (35%) + Presencia ejecutiva (40%) + Alineacion cultural US (25%)
- **Persuasion:** Claridad de posicion (35%) + Ancla de evidencia (40%) + Cierre (25%)
- **Fluency:** Azure evalua; LLM narra el resultado
- **Pronunciation:** Azure evalua; LLM genera tip fonetico especifico

**Modificador de modo:**

| Modo | Configuracion del drill |
|---|---|
| Primera sesion (free) | Drill completo con evaluacion IA — todos los poderes |
| Quick Prep (per-session sin suscripcion) | 1 actividad del formato, ~2 min, sin score breakdown |
| Conversational Path (suscripcion) | Secuencia Diagnose → Model → Apply, score breakdown visible, timer desactivado |

### Spaced Repetition

- Cards creadas automaticamente de Skill Drills con score < 45 (origin: `'drill'`)
- Cards tambien se crean de Arena Power Phrases usadas durante la conversacion (origin: `'arena'`)
- Intervalos: 24h → 3 dias → 7 dias → 14 dias → 30 dias → dominada
- Threshold de revision: < 80 = fail (retry), 80–84 = pass + nueva card, >= 85 = mastery

---

## 14. Learning Path

> **Renombrado en v9.0:** "Conversational Path" → "Learning Path" para reflejar el nuevo modelo de negocio.

### Que es

El Learning Path es el journey de aprendizaje estructurado de un escenario especifico. Consiste en 4 niveles progresivos de dificultad, cada uno con hasta 3 fresh sessions, remedial content (shadowing + micro-lessons), y Skill Drill. El acceso es permanente una vez comprado.

### Estructura de un Learning Path

```
Learning Path: Interview ($24.99)
├── Nivel 1 (int-1): "Foundation" — Arena en Support mode
│   ├── 3 fresh sessions (GPT-4o, Azure, ElevenLabs)
│   ├── Review Mode ilimitado
│   ├── Remedial: shadowing + micro-lessons
│   └── Skill Drill → completa para desbloquear Nivel 2
├── Nivel 2 (int-2): "Building Confidence" — Arena en Guidance mode
│   ├── 3 fresh sessions
│   ├── Review Mode ilimitado
│   ├── Remedial: shadowing + micro-lessons
│   └── Skill Drill → completa para desbloquear Nivel 3
├── Nivel 3 (int-3): "Under Pressure" — Arena en Challenge mode
│   ├── 3 fresh sessions
│   ├── Review Mode ilimitado
│   ├── Remedial: shadowing + micro-lessons
│   └── Skill Drill → completa para desbloquear Nivel 4
└── Nivel 4 (int-4): "Executive Ready" — Arena en Challenge+
    ├── 3 fresh sessions
    ├── Review Mode ilimitado
    ├── Remedial: shadowing + micro-lessons
    └── Skill Drill → certificacion de path completado
```

### Como se desbloquea

1. Usuario completa la Demo Session gratuita de un escenario (todos los poderes).
2. Usuario completa el Skill Drill post-sesion.
3. Pantalla de conversion: muestra el Learning Path completo + precio.
4. **Compra del path ($24.99)** → Nivel 1 desbloqueado inmediatamente.
5. Progresion secuencial: completar Skill Drill de un nivel desbloquea el siguiente.

### Momento de conversion — diseno del CTA

Este es el momento de mayor intencion de compra. La pantalla debe:

- Celebrar el logro de la demo (confetti, tono positivo)
- Mostrar el roadmap visual del Learning Path completo (4 niveles, que aprende en cada uno)
- Comunicar valor concreto: "12 sesiones con IA por $24.99 — eso es $2.08 por sesion"
- Ancla de precio: mostrar All-Access Bundle ($59.99 / 5 paths = $12/path) como alternativa
- Un solo CTA principal: "Desbloquea tu Learning Path" (boton prominente)
- CTA secundario: "o desbloquea los 5 paths" (link sutil)

### Diferencia vs Demo Session

| | Demo Session (free) | Learning Path ($24.99) |
|---|---|---|
| Sesiones | 1 sesion unica | 3 fresh × 4 niveles (12 total) |
| Dificultad | Adaptiva (Support → Challenge) | Progresiva entre niveles (controlada) |
| Arena mode | GPT-4o-mini | GPT-4o |
| Skill Drill | Completo con evaluacion IA | Completo + desbloquea nivel siguiente |
| Review Mode | ✅ De la demo session | ✅ Ilimitado de todas las sesiones |
| Dashboard | Contenido estatico | Contenido custom del transcript real |
| Continuidad | Sesion aislada | Secuencia con memoria y progresion |
| Acceso | Una vez | Permanente |

### Estados en el dashboard por escenario

```typescript
type PathStatus =
  | "not-started"       // Usuario nunca entro a este escenario
  | "demo-completed"    // Completo la demo session, path visible pero no comprado
  | "purchased"         // Compro el path, Nivel 1 desbloqueado
  | "in-progress"       // Avanzando en el path, N niveles completados
  | "completed";        // Completo los 4 niveles del path
```

La tension visual entre `demo-completed` (path visible pero bloqueado) y `purchased`/`in-progress` en el dashboard es el motor de conversion pasivo. El usuario ve cuantos paths tiene pendientes y siente el costo de oportunidad de no comprar.

---

## 15. Roadmap de Implementacion

Ver `WORKPLAN_v4.md` para el plan detallado por fases.

Resumen:
- **Fase 0** (completada): Prototipo mock funcional, paywall system, i18n ES/PT/EN
- **Fase 1**: Auth + Schema (Supabase) — incluye migracion de schema v9.0
- **Fase 2**: Conversation Engine (GPT-4o + ElevenLabs)
- **Fase 3**: Feedback + Pronunciation (Gemini + Azure) + Skill Drill (`/evaluate-drill`)
- **Fase 4**: User data + Payments — Learning Path per-purchase (Mercado Pago / Stripe)

**Items nuevos/actualizados en v9.0:**

| Item | Fase | Prioridad |
|---|---|---|
| Migracion schema v9.0 (profiles, sessions, `path_purchases`, `path_level_progress`) | Fase 1 | P0 |
| `SkillDrillScreen.tsx` componente | Fase 3 | P0 |
| Edge Function `/evaluate-drill` | Fase 3 | P0 |
| Prompt `buildDrillEvaluatorPrompt()` en `drill-evaluator-prompt.ts` | Fase 3 | P0 |
| `PathPurchaseModal.tsx` — reemplaza SubscriptionModal + CreditUpsellModal | Fase 4 | P0 |
| Pantalla de conversion post-demo (preview del Learning Path + CTA) | Fase 4 | P0 |
| Dashboard: estado por escenario (`PathStatus`) | Fase 4 | P1 |
| Dashboard: contenido educativo custom (path owners) | Fase 4 | P1 |
| `canStartSession()` + `canStartFreshAttempt()` por escenario/nivel | Fase 4 | P0 |
| Review Mode: pantalla de replay de sesiones pasadas (sin costo API) | Fase 4 | P1 |
| `microLessons.ts`: refactor a datos planos sin logica de API | Fase 4 | P2 |
| Booster Pack: +3 fresh sessions por nivel (upsell futuro) | Post-MVP | P2 |

---

## 16. Referencia de Archivos

### Frontend — Componentes (`/src/app/components/`)

| Archivo | Lineas | Descripcion |
|---------|--------|-------------|
| `App.tsx` | ~329 | Entry point, hash routing, auth listener, flow state, ErrorBoundary wrapper |
| `LandingPage.tsx` | ~535 | Landing con hero, PracticeWidget embed, pricing, FAQ, i18n ES/PT |
| `AuthModal.tsx` | ~280 | Modal de auth Google/LinkedIn, modo login/registro, i18n |
| `PracticeWidget.tsx` | ~749 | Input de escenario + PracticeSetupModal inline |
| `StrategyBuilder.tsx` | ~524 | 3 value pillars, stepper horizontal, framework tooltips |
| `PracticeSessionPage.tsx` | ~1339 | Orchestrator de 9 steps: extra-context → session-recap |
| `SessionReport.tsx` | ~664 | Reporte comprehensivo post-sesion con DrillResult incluido |
| `DashboardPage.tsx` | ~431 | Dashboard con estado por escenario, contenido educativo por tier |
| `PracticeHistoryPage.tsx` | ~371 | Lista de sesiones pasadas con before/after |
| `CreditUpsellModal.tsx` | ~507 | [DEPRECADO en v9.0] Reemplazar por `PathPurchaseModal` |
| `SubscriptionModal.tsx` | — | [DEPRECADO en v9.0] Reemplazar por `PathPurchaseModal` |
| `LanguageTransitionModal.tsx` | ~123 | Modal post-auth de transicion de idioma |
| `ErrorBoundary.tsx` | ~181 | Class component que atrapa errores de render |
| `HowItWorksTabs.tsx` | ~512 | Tabs de "Como funciona" en Landing, i18n |
| `SessionProgressBar.tsx` | ~142 | Progress bar de los 9 steps de la sesion |
| `DesignSystemPage.tsx` | ~1680 | Design system showcase (herramienta interna) |

### Nuevos componentes (v7.0 — por implementar)

| Archivo | Descripcion |
|---------|-------------|
| `session/SkillDrillScreen.tsx` | Drill de evaluacion con IA. Modalidad texto o voz por pillar. 2 intentos. |
| `PathPurchaseModal.tsx` | [NUEVO v9.0] Modal de compra de Learning Path ($24.99) y All-Access Bundle ($59.99). Preview visual del path, ancla de precio, CTA prominente. |
| `PathConversionScreen.tsx` | [NUEVO v9.0] Pantalla post-demo que muestra preview del Learning Path + celebracion + CTA de compra. Reemplaza `ConversationalPathUnlockScreen`. |
| `ReviewModeScreen.tsx` | [NUEVO v9.0] Replay de sesiones pasadas sin costo API (transcript, feedback, scores, audio cacheado). |

### Frontend — Shared (`/src/app/components/shared/`)

| Archivo | Descripcion |
|---------|-------------|
| `session-types.ts` | Step type con 9 valores (agrega `"skill-drill"` en v7.0) |
| `index.tsx` (~1254 lineas) | COLORS, BrandLogo, SectionHeading, componentes compartidos |
| `ServiceErrorBanner.tsx` | Banner de errores del service layer |

### Service Layer (`/src/services/`)

| Archivo | Lineas | Descripcion |
|---------|--------|-------------|
| `index.ts` | ~221 | Registry: USE_MOCK auto-detect + ADAPTER_MODE + defensive try-catch |
| `types.ts` | ~306 | Tipos compartidos — actualizar con UserPlan v7.0, ScenarioStatus, DrillResult |
| `errors.ts` | ~541 | ServiceError + dominios + SUBSCRIPTION_REQUIRED (nuevo v7.0) |

### Prompts (`/src/services/prompts/`)

| Archivo | Descripcion |
|---------|-------------|
| `assembler.ts` | 7-block prompt assembler |
| `templates.ts` | MASTER_SYSTEM_PROMPT, OUTPUT_FORMAT_BLOCK, FIRST_MESSAGE_BLOCK |
| `personas.ts` | 3 base personas + 2 sub-profiles |
| `regions.ts` | Regional blocks para Mexico y Colombia |
| `analyst.ts` | Prompts para Gemini feedback analysis |
| `drill-evaluator-prompt.ts` | [NUEVO v7.0] buildDrillEvaluatorPrompt() — evaluador con criterios por pillar |

### Backend (`/supabase/functions/server/`)

| Archivo | Descripcion |
|---------|-------------|
| `index.tsx` | Hono router — todos los endpoints |
| `analyst-prompt.ts` | Prompt del analyst de feedback |
| `summary-prompt.ts` | Prompt del summary post-sesion |
| `drill-evaluator-prompt.ts` | [NUEVO v7.0] Prompt del evaluador del Skill Drill |

### Documentacion (`/docs/`)

| Archivo | Descripcion |
|---------|-------------|
| `MASTER_BLUEPRINT.md` | Este documento (v7.0) |
| `WORKPLAN_v4.md` | Plan de trabajo por fases |
| `PDR_SCREEN_BY_SCREEN.md` | Spec de cada pantalla — actualizar con SkillDrillScreen y ConversationalPathUnlockScreen |
| `QA_ACCEPTANCE_CRITERIA.md` | Tests de aceptacion por fase — agregar tests del Skill Drill y CP |
| `SYSTEM_PROMPTS.md` | Arquitectura de prompts (7 bloques) |
| `BACKEND_HANDOFF.md` | Guia para el backend developer |
| `FASE1_MIGRATION.sql` | SQL — actualizar con schema v7.0 |

### Deuda tecnica

| Item | Ubicacion | Impacto | Cuando resolver |
|---|---|---|---|
| ~48 archivos shadcn/ui sin importar | `/src/app/components/ui/` | 0 (tree-shaking) | No urgente |
| Archivo monolitico | `PracticeSessionPage.tsx` (1339 lineas) | Legibilidad | Refactor opcional al agregar SkillDrillScreen |
| Archivo monolitico | `shared/index.tsx` (1254 lineas) | Legibilidad | Refactor opcional |
| `CreditUpsellModal.tsx` | Logica de credit packs deprecada | Alta — reemplazar con PathPurchaseModal | Fase 4 |
| `SubscriptionModal.tsx` | Logica de suscripcion deprecada en v9.0 | Alta — reemplazar con PathPurchaseModal | Fase 4 |
| `microLessons.ts` | 831 lineas mezclando datos con logica de API | Media — refactorizar a datos planos | Fase 4 |
| Hash-based routing | `App.tsx` | Funcional pero basico | Evaluar si se necesita deep linking |