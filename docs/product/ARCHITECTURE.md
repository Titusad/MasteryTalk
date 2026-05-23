# MasteryTalk PRO — Architecture

> Mapa de la arquitectura del frontend y backend. Fuente de verdad para decisiones de ubicación de archivos y flujos de datos.
> Stack completo en `PRODUCT_SPEC.md §11`. Reglas de capas en `CLAUDE.md §6`.

---

## 1. Principio de diseño: Feature-Sliced Design (FSD)

La jerarquía de capas es estricta — las capas superiores importan de inferiores, nunca al revés, y nunca hay imports cross-feature al mismo nivel:

```
app → pages → widgets → features → entities → shared
```

| Capa | Qué contiene |
|------|-------------|
| `app/` | App.tsx, routing hash-based, providers, Sentry |
| `pages/` | Páginas completas renderizadas por App.tsx |
| `widgets/` | Componentes multi-feature sin estado propio de dominio |
| `features/` | Slices de funcionalidad con model + ui propios |
| `entities/` | Tipos y datos del dominio de negocio |
| `shared/` | Utilidades, primitivos de UI, hooks sin dominio |
| `services/` | Capa de acceso a datos — adapters, prompts, tipos legacy |

---

## 2. Frontend — Mapa de archivos

### `src/app/`
```
App.tsx                     ← routing hash-based (#dashboard, #practice-session, etc.)
hooks/useAuthFlow.ts        ← flujo de autenticación + onboarding gate
components/                 ← ImageWithFallback (protegido), utils
```

### `src/pages/`
```
landing/
  LandingPage.tsx           ← landing ES (default)
  Landing2Page.tsx          ← landing PT
  Landing3Page.tsx          ← landing EN
  PracticeWidget.tsx        ← CTA principal → Auth → practice session
  AuthModal.tsx             ← Google OAuth modal
  HowItWorksTabs.tsx        ← sección educativa del landing

DashboardPage.tsx           ← dashboard principal del usuario
PracticeSessionPage.tsx     ← sesión de práctica completa (flujo de steps)
                               Orquesta: useScriptGeneration · useFeedbackGeneration ·
                               useSessionSave · useStepGates · FeedbackStep · SessionModalLayer
PracticeHistoryPage.tsx     ← historial de sesiones
LibraryPage.tsx             ← biblioteca de lecciones
AccountPage.tsx             ← configuración de cuenta
AdminDashboardPage.tsx      ← panel de administración (interno)
DesignSystemPage.tsx        ← catálogo de componentes (dev only)
legal/                      ← páginas legales estáticas
```

### `src/widgets/`
```
PracticeSideNav.tsx         ← navegación lateral durante la sesión
PracticePrepScreen.tsx      ← pantalla de preparación pre-práctica (BriefingStepperCarousel)
PathPurchaseModal.tsx        ← modal de compra / paywall
LessonModal.tsx             ← modal de lección estructurada (5 pasos)
SessionReport.tsx           ← reporte post-sesión
```

### `src/features/`

#### `practice-session/`
El feature más complejo. Gestiona el flujo completo de una sesión.

```
model/
  session-api.ts            ← llamadas a Edge Functions (briefing, feedback, TTS, STT)
  narrator-audio.ts         ← gestión de audio narrativo (ElevenLabs pre-generado, R2)
  scenario-presets.ts       ← 3 presets por escenario (describe la situación)
  session.constants.ts      ← constantes de sesión

  useScriptGeneration.ts    ← hook: generación de briefing/script + eager fire + auto-transition
  useFeedbackGeneration.ts  ← hook: análisis de feedback, summary, improved script, SR seed
  useSessionSave.ts         ← hook: persistencia de sesión al backend + completeProgressionLevel
  useStepGates.ts           ← hook: routing condicional grammar → vocabulary → next step

ui/
  ExperienceScreen.tsx      ← step: selección de nivel de dificultad
  ContextScreen.tsx         ← step: selección de preset/situación
  IntroductionScreen.tsx    ← step: intro pedagógica del nivel
  PreSessionLessonScreen.tsx← step: lección estructurada (5 pasos, recall gate)
  StrategyScreen.tsx        ← step: tarjeta de estrategia + vocabulario
  InterlocutorIntroScreen.tsx← step: intro del interlocutor (solo interview)
  VoicePractice.tsx         ← step: práctica de voz (STT + conversación GPT-4o)
  ConversationFeedback.tsx  ← step: feedback en tiempo real durante práctica
  FeedbackScreen.tsx        ← step: feedback final post-sesión (Gemini)
  FeedbackStep.tsx          ← orquestador del step feedback: bottom slots + FeedbackScreen
  PronunciationTab.tsx      ← tab de pronunciación dentro de FeedbackScreen
  ShadowingModal.tsx        ← modal de shadowing integrado en feedback
  SessionModalLayer.tsx     ← capa de modales de la sesión: exit confirm, PathSetup,
                               LessonModal, LevelMilestone, PathPurchase, pending switch

  briefing/
    BriefingStepperCarousel.tsx  ← carousel de tarjetas del briefing
    AnswerCard.tsx               ← tarjeta de respuesta modelo
    FeedbackCard.tsx             ← tarjeta de feedback en briefing
    ReadinessScore.tsx           ← score de readiness
  
  DeepDiveCard.tsx          ← recomendación post-sesión por debilidades
  PathRecommendationCard.tsx← recomendación de path post self-intro
  ScenarioDeltaCard.tsx     ← card de progreso por escenario
  VocabularyScreen.tsx      ← pantalla de vocabulario
  VocabularyDrillSection.tsx← drill de vocabulario
  PathSetupModal.tsx        ← modal de configuración de path
  GrammarContextScreen.tsx  ← contexto gramatical
  LevelMilestoneModal.tsx   ← modal de milestone de nivel
```

#### `dashboard/`
```
model/
  index.ts / useDashboardData.ts  ← hook principal del dashboard (carga paralela de datos)
  useProgressionState.ts          ← estado de progresión del usuario
  path-recommendation.ts          ← lógica de recomendación de paths
  progression.api.ts              ← llamadas al endpoint /progression
  dashboard.computations.ts       ← cómputos derivados (pillar scores, etc.)
  dashboard.constants.ts          ← constantes del dashboard

ui/
  HeroCard.tsx                    ← card principal con CTA
  PracticePathsModule.tsx         ← módulo de paths de práctica
  progression-tree/
    ProgressionTree.tsx           ← árbol visual de progresión
    ChooseNextPathModal.tsx        ← modal de selección de siguiente path
  SRDashboardCard.tsx             ← card de Spaced Repetition
  RecommendedLessonsCard.tsx      ← lecciones recomendadas por debilidades
  ProgressChartCard.tsx           ← gráfico de progreso
  HeroCard.tsx, PlatformNewsCard.tsx, SinceYouStartedCard.tsx, CrossPathCard.tsx
  DashboardSkeleton.tsx           ← skeleton de carga
  WhatsAppActivationCard.tsx      ← activación del SR Coach por WhatsApp
```

#### `shadowing/`
```
model/
  shadowing.computations.ts ← barrel → @/entities/session/shadowing
ui/
  PhraseCard.tsx, ScoreRing.tsx, WaveformBars.tsx  ← primitivos de UI de shadowing
  index.ts ← re-exporta desde @/shared/ui
```

#### `session-report/`
```
model/ ← lógica de reporte
ui/
  ProficiencyGauge.tsx      ← gauge de proficiencia
  index.ts
```

#### `skill-drill/`
```
ui/
  UpsellScreen.tsx          ← pantalla de upsell post-sesión
```

#### `arena/` · `onboarding/`
WIP / experimental — sin public API via index.ts.

---

### `src/entities/`

#### `session/`
```
index.ts          ← tipos centrales del dominio de sesión:
                    ScenarioType, Step, InterlocutorKey, ShadowingPhrase,
                    LevelMethodology, SelfIntroContext, BriefLocale, etc.
shadowing.ts      ← funciones puras de shadowing + re-exports de @/shared/lib/score-utils
```

#### `progression/`
```
index.ts          ← tipos de estado de progresión:
                    LevelStatus, LevelState, ProgressionState,
                    PathLevelAccess, StructuredLesson, PathRecommendation, etc.
                    + re-exports de todos los path files

path-types.ts     ← ProgressionLevel, ProgressionPath, VocabularyTerm, DifficultyTierDef
paths.ts          ← PROGRESSION_PATHS (assembly), VISIBLE_PATHS, PathId, helpers:
                    getDefaultProgressionState, isLevelUnlocked, getLevelState,
                    getNextLevelId, getPreviousLevelId, getLevelDefinition

interview.ts      ← INTERVIEW_LEVELS (7 niveles: int-1 → int-7 capstone)
sales.ts          ← SALES_LEVELS (6 niveles: sal-1 → sal-6)
meeting.ts        ← MEETING_LEVELS (6 niveles: meet-1 → meet-6)
presentation.ts   ← PRESENTATION_LEVELS (6 niveles: pres-1 → pres-6)
culture.ts        ← CULTURE_LEVELS (6 niveles: cul-1 → cul-6)
client.ts         ← CLIENT_LEVELS (6 niveles: cli-1 → cli-6) + CSUITE_LEVELS (definido, no ensamblado aún)
self-intro.ts     ← SELF_INTRO_LEVELS (si-0) + INTRODUCTIONS_LEVELS (intro-1 → intro-6)
```

#### `feedback/`
```
index.ts          ← RealFeedbackData, ShadowingPhrase, DrillResult, etc.
```

#### `user/`
```
index.ts          ← User, OnboardingProfile, UserPlan
```

#### `payment/`
```
index.ts          ← PaymentStatus, CreditPack, PurchaseType
```

---

### `src/shared/`

#### `shared/ui/` — Componentes canónicos
```
AppHeader.tsx         ← header unificado (variants: public | dashboard | session)
AppModal.tsx          ← modal base (sizes: sm | md | lg | full)
BrandLogo.tsx
SessionProgressBar.tsx← barra de progreso de sesión (steps visuales)
RecordButton.tsx      ← botón de grabación + waveform + timer
AnalyzingScreen.tsx   ← pantalla de análisis post-grabación
ServiceErrorBanner.tsx← banner de error de servicio
ProficiencyGauge.tsx  ← gauge de proficiencia (feedback)
FeedbackAccordion.tsx ← acordeón de feedback
WaveformBars.tsx      ← barras de forma de onda (shadowing)
ScoreRing.tsx         ← anillo de score (shadowing/pronunciación)
PhraseCard.tsx        ← tarjeta de frase con stress highlighting
GoalPickerStep.tsx    ← selector de objetivo de práctica
NarrationToggle.tsx / NarrationCaption.tsx
PastelBlobs.tsx / DotPattern.tsx  ← decorativos
MiniFooter.tsx, SectionHeading.tsx, PageTitleBlock.tsx, PricingCard.tsx
```

#### `shared/lib/` — Utilidades de dominio
```
score-utils.ts          ← scoreColor(n), splitStress(word) — usadas por shared/ui
self-intro-contexts.ts  ← SELF_INTRO_CONTEXTS (data de los 3 contextos de self-intro)
paths.ts                ← PATH_LABELS (mapeo PathId → label)
pillars.ts              ← definición de pilares de comunicación (CEFR)
spacedRepetition.ts     ← algoritmo SR (SM-2 adaptado)
sessionCache.ts         ← cache de sesión en memoria
ProgressionContext.tsx  ← React context para estado de progresión
cheatSheetPdf.ts        ← generación de PDF cheat sheet
storageMigration.ts     ← migración de localStorage
useNarration.ts / useNarrationPreference.ts
```

#### `shared/hooks/`
```
useMediaRecorder.ts   ← hook de grabación de audio (Web API)
useUsageGating.ts     ← lógica de gates de uso (War Room, free sessions)
```

---

### `src/services/`
Capa legacy de acceso a datos — no sigue FSD estrictamente pero no debe moverse sin autorización.

```
adapters/
  supabase/         ← implementaciones reales (conversation, feedback, speech, etc.)
  mock/             ← implementaciones mock para dev sin VITE_SUPABASE_URL

prompts/
  assembler.ts      ← ensamblador del system prompt de GPT-4o
  templates.ts      ← templates de prompts (Block 1–5)
  personas.ts       ← definiciones de interlocutores
  voice-map.ts      ← mapeo interlocutor → voz TTS
  regions.ts        ← adaptaciones por región
  analyst.ts        ← prompt del evaluador Gemini (feedback)
  scenarios/        ← Block 4.5 por escenario (frontend)
    interview.ts · sales.ts · meeting.ts · presentation.ts · culture.ts · self-intro.ts

types.ts            ← tipos legacy (re-exporta desde entities/)
microLessons.ts / microLessonsData.ts  ← lecciones micro por nivel
scenario-data.ts    ← data estática de escenarios
```

---

## 3. Backend — Edge Functions (Hono + Deno)

**Base:** `supabase/functions/make-server-08b8658d/`
**URL:** `https://zkuryztcwmazspscomiu.supabase.co/functions/v1/make-server-08b8658d`

### Routes
```
auth.ts         POST /login, /logout, /me
conversation.ts POST /conversation → GPT-4o (práctica de voz)
speech.ts       POST /speech → Azure STT + briefing self-intro (si-0)
pronunciation.ts POST /pronunciation → Azure Speech REST
tts.ts          POST /tts → OpenAI gpt-4o-mini-tts (cedar/marin) con fallback ElevenLabs
feedback.ts     POST /feedback → Gemini 1.5 Flash (evaluación dual-axis)
grammar.ts      POST /grammar → análisis gramatical
progression.ts  GET  /progression → estado de progresión (auto-unlock si subscription_active)
sessions.ts     POST /sessions → guardar sesión completada
checkout.ts     POST /create-checkout → Stripe session
admin.ts        GET  /admin/* → métricas internas
vocab.ts        POST /vocab → ejercicios de vocabulario
marketing.ts    GET  /pricing → slots Founding Member + precios (público)
wa-practice.ts  ← WhatsApp SR Coach (Twilio)
webhook.ts      ← webhooks de Stripe
webhook-twilio.ts ← webhooks de Twilio
cron-daily-sr.ts ← cron de Spaced Repetition diario
whatsapp-verify.ts ← verificación de número WhatsApp
```

### Scenarios (backend evaluator)
```
scenarios/
  interview.ts · sales.ts · meeting.ts · presentation.ts · culture.ts · self-intro.ts
```
Cada archivo exporta: `{SCENARIO}_DUAL_AXIS_BLOCK` · `{SCENARIO}_OUTPUT_FIELDS` · `get{Scenario}GapAnalysis()`

### Data
```
data/
  level-maps.ts   ← mapeo de niveles por path (usado en progression route)
```

---

## 4. Flujo de sesión de práctica

```
App.tsx (#practice-session)
  └── PracticeSessionPage.tsx
        │
        ├── experience     → ExperienceScreen        (dificultad)
        ├── context        → ContextScreen            (preset/situación)
        ├── lesson         → PreSessionLessonScreen   (lección 5-pasos, skip en War Room/self-intro)
        ├── strategy       → StrategyScreen           (metodología + vocabulario)
        ├── generating     → session-api.ts           (genera briefing por scenarioType)
        │     ├── interview → generateInterviewBriefing → InterviewBriefingScreen
        │     ├── sales    → generateScript + generatePreparationToolkit (paralelo)
        │     └── otros    → generateScript → PreBriefingScreen
        ├── practice-prep  → PracticePrepScreen       (BriefingStepperCarousel)
        ├── practice       → VoicePractice            (STT → GPT-4o → TTS)
        ├── analyzing      → session-api.getFeedback() → Gemini
        ├── feedback       → FeedbackScreen           (feedback + pronunciación + shadowing)
        │     └── bottomSlot: WhatsApp card | PathRecommendation (self-intro) | DeepDiveCard
        └── dashboard      → #dashboard
```

**War Room** (`startAtContext=true`): salta `experience` y `lesson` → va directo a `context`.

---

## 5. Sistema de Prompts de IA

```
services/prompts/assembler.ts
  └── construye system prompt de GPT-4o con 5 bloques:
        Block 1: Identidad del interlocutor (personas.ts)
        Block 2: Región/acento (regions.ts)
        Block 3: Template de sesión (templates.ts)
        Block 4: Comportamiento del interlocutor (scenario-presets.ts)
        Block 4.5: Adaptación por escenario (scenarios/{scenario}.ts)
        Block 5: Instrucciones de turno
```

El evaluador Gemini (post-sesión) usa `services/prompts/analyst.ts` + el dual-axis block del escenario desde `supabase/functions/.../scenarios/`.

---

## 6. Flujo de datos de progresión

```
/progression (GET)
  └── progression.api.ts → useProgressionState.ts
        └── ProgressionState (entities/progression)
              └── PROGRESSION_PATHS (entities/progression/paths.ts)
                    ├── getLevelState()
                    ├── isLevelUnlocked()
                    └── getLevelDefinition()
                          └── ProgressionLevel (entities/progression/{path}.ts)
```

`VITE_ENABLED_SCENARIOS` env var filtra los paths visibles en producción via `VISIBLE_PATHS`.

---

## 7. Reglas de ubicación (resumen)

| Pregunta | Respuesta |
|----------|-----------|
| ¿Tipos del dominio de negocio? | `entities/` |
| ¿Definición de niveles de un path? | `entities/progression/{path}.ts` |
| ¿Lógica de una feature específica? | `features/{feature}/model/` |
| ¿UI de una feature específica? | `features/{feature}/ui/` |
| ¿Componente usado por múltiples features? | `shared/ui/` |
| ¿Utilidad sin dependencia de dominio? | `shared/lib/` |
| ¿Componente que compone features/widgets? | `widgets/` |
| ¿Pantalla completa renderizada por App.tsx? | `pages/` |
| ¿Llamada a API / adapter? | `services/adapters/` |
| ¿Prompt de IA (frontend)? | `services/prompts/` |
| ¿Endpoint de backend? | `supabase/functions/make-server-08b8658d/routes/` |

---

*v1.1 — 2026-05-23*
