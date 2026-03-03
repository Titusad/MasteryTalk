# inFluentia PRO - PDR Pantalla por Pantalla (v4.1)

> Especificacion de cada pantalla: UI, servicios, navegacion y logica.
> Referencia cruzada con MASTER_BLUEPRINT.md v4.1.
> Actualizado: 26 febrero 2026 — Refleja el codigo escrito (pendiente primera compilacion).

---

## Indice de Pantallas

| # | Pantalla | Ruta Hash | Componente | Service Calls |
|---|---|---|---|---|
| 1 | [Landing Page](#pantalla-1-landing-page) | `#` (default) | `LandingPage` + `PracticeWidget` | Ninguno |
| 2 | [Auth Modal](#pantalla-2-auth-modal) | (overlay in PracticeWidget) | `AuthModal` (inline) | `authService.signIn()` |
| **Sub-steps del PracticeSessionPage (`#practice-session`):** |
| 4a | [Strategy Builder](#pantalla-4a-strategy-builder) | `#practice-session` | `StrategyBuilder` | Ninguno (local) |
| 4b | [Extra Context](#pantalla-4b-extra-context) | `#practice-session` | `ExtraContextScreen` (inline, skippable) | Ninguno (local) |
| 4c | [Generating Script](#pantalla-4c-generating-script-loader) | `#practice-session` | `AnalyzingScreen(variant="script")` | `conversationService.prepareSession()` |
| 4d | [Pre-Briefing](#pantalla-4d-pre-briefing) | `#practice-session` | `PreBriefingScreen` (inline) | Ninguno (mock data) |
| 5 | [Voice Practice (Arena)](#pantalla-5-voice-practice-arena) | `#practice-session` | `VoicePractice` + `ArenaSystem` | `conversationService.*`, `speechService.*` |
| 6 | [Analyzing Feedback](#pantalla-6-analyzing-feedback-loader) | `#practice-session` | `AnalyzingScreen(variant="feedback")` | (loader + mindset) |
| 7 | [Conversation Feedback](#pantalla-7-conversation-feedback) | `#practice-session` | `ConversationFeedback` (inline) | Datos cargados en step anterior |
| 8 | [Shadowing Practice](#pantalla-8-shadowing-practice) | `#practice-session` | `ShadowingPractice` (inline) | `speechService.*` |
| 9a | [Analyzing Results](#pantalla-9a-analyzing-results-loader) | `#practice-session` | `AnalyzingScreen(variant="results")` | (loader + mindset) |
| 9b | [Session Recap](#pantalla-9b-session-recap) | `#practice-session` | `SessionRecap` (inline) | `feedbackService.getCompletedSummary()`, `.generateResultsSummary()` |
| 9c | [Mindset](#pantalla-9c-mindset) | `#practice-session` | `MindsetPulseScreen` (inline, skippable) | Ninguno (localStorage) |
| 10 | [Dashboard](#pantalla-10-dashboard) | `#dashboard` | `DashboardPage` | `userService.*`, `spacedRepetitionService.*` |
| 10.5 | [Practice History](#pantalla-105-practice-history) | `#practice-history` | `PracticeHistoryPage` | `userService.getPracticeHistory()` |
| DS | [Design System](#design-system) | `#design-system` | `DesignSystemPage` | Ninguno |

> **Nota**: Los sub-steps 4a-9c comparten la ruta `#practice-session` porque son pasos internos
> del `PracticeSessionPage` orchestrator. El estado `Step` (11 valores) controla cual se renderiza.

> **Layout Pattern**: Todas las pantallas internas usan el Internal Pages Layout:
> BrandLogo header + accion contextual, `bg-[#f0f4f8]`, PastelBlobs decorativos, MiniFooter.

---

## Pantalla 1: Landing Page

### Componente
`LandingPage.tsx` — importa `PracticeWidget`, `AuthModal`, `HowItWorksTabs`

### Objetivo
Capturar el escenario del usuario ANTES del registro (Input-First pattern) para
generar compromiso via sunk cost psicologico.

### Secciones
1. **Header** — BrandLogo, nav links (scroll), CTAs "Iniciar sesion" / "Registrarme"
2. **Hero** — Badge + titulo + subtitulo + PracticeWidget embebido
3. **PracticeWidget** — textarea con placeholder rotativo (typewriter), scenario pills, preview de IA contextual
4. **How It Works** — Tabs interactivas (HowItWorksTabs component)
5. **Benefits** — Grid de beneficios con iconos
6. **Pricing** — 4 PricingCards (Free, Per-session, Monthly, Quarterly)
7. **FAQ** — Accordion
8. **Footer**

### PracticeSetupModal (inline en PracticeWidget)
- Se abre al hacer click "Comenzar practica"
- **Endowed Progress Effect**: progress bar que inicia en 33% (escenario ya capturado)
- **Loss Aversion**: "Tu escenario personalizado esta listo. No lo pierdas."
- Steps: Scenario type selection → Interlocutor selection → Guided fields (varian por scenario) → Auth
- Resultado: `SetupModalResult { scenario, scenarioType, interlocutor, guidedFields }`

### Navegacion
- Registro (nuevo usuario) → `PracticeSessionPage` (step: strategy)
- Login (usuario existente) → `Dashboard`
- Header "Iniciar sesion" → AuthModal (login mode) → Dashboard
- Header "Registrarme" → AuthModal (registro mode)

---

## Pantalla 2: Auth Modal

### Componente
`AuthModal.tsx` — modal overlay, 2 modos: login / registro

### UI
- **Modo registro**: "Crea tu cuenta" + Google button + LinkedIn button + toggle a login
- **Modo login**: "Bienvenido de vuelta" + Google button + LinkedIn button + toggle a registro
- **Variant CTA** (desde PracticeWidget): titulo motivacional "Empieza tu primera practica gratis"

### Service Calls
- `authService.signIn("google" | "linkedin")`

### Error Handling
- `POPUP_CLOSED` → Mensaje informativo, permite reintentar
- `PROVIDER_ERROR` → "Intenta con otro metodo"
- `NETWORK_ERROR` → "Verifica tu internet"

---

## Pantalla 4a: Strategy Builder

### Componente
`StrategyBuilder.tsx` (~583 lineas)

### Objetivo
Guiar al usuario a construir 3 "value pillars" para su conversacion usando preguntas de coach IA.

### UI
- Stepper horizontal (3 pasos)
- Framework tooltips contextuales: STAR (interview), BATNA (negotiation), SPIN (sales), MEDDIC (sales/csuite)
- Cada pillar tiene: summary, why, how, result
- Skip button disponible
- Animaciones con Motion

### Coach Questions
- 3 preguntas por scenario type, cada una con follow-up
- 5 scenario types completos: interview, sales, csuite, negotiation, networking

### Salida
- `onComplete({ pillars: ValuePillar[] })` → Se pasan como `strategyPillars` al `SessionConfig`
- `onSkip()` → Avanza sin pillars

---

## Pantalla 4b: Extra Context

### Componente
`ExtraContextScreen` (inline en PracticeSessionPage)

### Objetivo
Permitir al usuario agregar contexto adicional (texto libre, URL, archivo) que se inyecta en el Block 5 del system prompt.

### UI
- 3 tabs: Escribir, Pegar URL, Subir archivo
- Textarea para texto libre
- **Skippable** — boton "Saltar este paso"

---

## Pantalla 4c: Generating Script (Loader)

### Componente
`AnalyzingScreen` (variant: "script")

### Service Calls
- `conversationService.prepareSession(config)` — ejecutado en paralelo con la animacion

### Mindset Coaching
Incluye contenido de coaching durante la espera (~2.5s).

### Salida
- `PreparedSession { sessionId, systemPrompt, firstMessage, voiceId }`

---

## Pantalla 4d: Pre-Briefing

### Componente
`PreBriefingScreen` (inline en PracticeSessionPage)

### Objetivo
Preparar mentalmente al usuario antes de la conversacion. Muestra:
- **Cheat sheet narrativo** — resumen de estrategia del usuario
- **Cultural coaching card** — tips culturales relevantes al scenario
- **Before/After examples** — transformacion de frases comunes a lenguaje ejecutivo
- **Power Questions** — preguntas poderosas para usar durante la conversacion

### Datos
- `getCulturalTips(scenarioType)` — tips culturales mock
- `getPowerQuestions(scenarioType)` — preguntas por scenario
- `getBeforeAfterForScenario(scenarioType)` — comparaciones antes/despues

---

## Pantalla 5: Voice Practice (Arena)

### Componente
`VoicePractice` (inline en PracticeSessionPage) + `ArenaSystem.tsx`

### Objetivo
Practica de conversacion en tiempo real con IA, con 3 fases de dificultad progresiva.

### Arena System — 3 Fases

| Fase | Descripcion | UI Helpers |
|------|-------------|------------|
| **Support** | IA amigable, paciente | Power Phrases visibles, TrySayingHint, BeforeAfter |
| **Guidance** | IA neutral, profesional | Power Phrases reducidas |
| **Challenge** | IA confrontacional | Sin ayuda visible |

### Ciclo de interaccion
1. IA habla (TTS simulado) → burbuja de chat aparece
2. Usuario graba respuesta (RecordButton + WaveformBars + Timer)
3. `speechService.transcribe()` → texto del usuario
4. `conversationService.processTurn()` → respuesta IA
5. Arena evalua interaccion → posible phase transition (toast)
6. Repeat hasta `isComplete = true` o turn >= 8

### Service Calls
- `speechService.transcribe(duration)` → `TranscriptionResult`
- `speechService.speak(text)` → `{ stop, duration }`
- `conversationService.processTurn(sessionId, userMessage)` → `ConversationTurnResult`

### Componentes Arena
- `useArenaPhase(interactions)` — hook que gestiona fase actual
- `PhaseIndicator` — badge visual de fase actual
- `PhaseTransitionToast` — notificacion animada de cambio de fase
- `TrySayingHint` — sugerencias de que decir
- `ArenaProgressBar` — progreso visual de la conversacion

---

## Pantalla 6: Analyzing Feedback (Loader)

### Componente
`AnalyzingScreen` (variant: "feedback")

### Comportamiento
- Animacion de analisis (~3s)
- Mindset coaching durante la espera
- En paralelo se cargan datos de feedback:
  - `feedbackService.analyzeFeedback(sessionId)`
  - `feedbackService.generateImprovedScript(sessionId)`

---

## Pantalla 7: Conversation Feedback

### Componente
`ConversationFeedback` (inline en PracticeSessionPage)

### UI
- **Strengths** — cards con titulo y descripcion
- **Opportunities** — cards con tag de categoria y descripcion
- Script mejorado con highlights de color y tooltips
- Boton "Continuar a pronunciacion"

### Datos
- `getStrengthsForScenario(scenarioType)` → `Strength[]`
- `getOpportunitiesForScenario(scenarioType)` → `Opportunity[]`
- `getScriptSectionsForScenario(scenarioType)` → `ScriptSection[]`

---

## Pantalla 8: Shadowing Practice

### Componente
`ShadowingPractice` (inline en PracticeSessionPage)

### Objetivo
Practicar pronunciacion de frases clave del script mejorado.

### UI por frase
1. Mostrar frase con **stress markers** (negritas en silabas enfatizadas)
2. Play model audio → `speechService.speak(phrase)`
3. Record user attempt → `speechService.scorePronunciation(phraseIndex, attemptIndex)`
4. Show score + `AccuracyRing` + word-level feedback
5. Si score >= 80 → siguiente frase; si < 80 → retry (max 3 attempts)

### Three-band scoring
- `< 80`: FAIL — retry o mark for SR
- `80-84`: Technical PASS — advance + create SR card
- `>= 85`: MASTERY — advance, no SR card

### Datos
- `getShadowingForScenario(scenarioType)` → `ShadowingPhrase[]`
- Cada phrase tiene: `text` (con markers), `feedback` (word, phonetic, tip), `scores` (mock progression)

---

## Pantalla 9a: Analyzing Results (Loader)

### Componente
`AnalyzingScreen` (variant: "results")

### Comportamiento
- Animacion de analisis
- Mindset coaching durante la espera
- En paralelo se cargan datos:
  - `feedbackService.getCompletedSummary(sessionId)`
  - `feedbackService.generateResultsSummary(sessionId)`

---

## Pantalla 9b: Session Recap

### Componente
`SessionRecap` (inline en PracticeSessionPage)

### UI
- **ResultsSummary**: totalPhrases, totalTime, overallSentiment
- **Pronunciation Notes**: tips categorizados (Claridad, Ritmo, Entonacion)
- **Improvement Areas**: 3 areas personalizadas (una por categoria)
- **Completed Phrases**: cards con phrase text + highlight word + phonetic
- **Cheat Sheet** (seccion colapsable): resumen del script generado
- **Download button**: `downloadCheatSheet()` — genera texto descargable
- **SR Cards**: notificacion de cuantas cards se crearon (shadowing + arena)

### Datos
- `ResultsSummary` del step anterior
- `CompletedPhraseSummary[]` del step anterior
- `ShadowingPhrase[]` para cheat sheet
- `SRCard[]` de arena y shadowing

---

## Pantalla 9c: Mindset

### Componente
`MindsetPulseScreen` (inline en PracticeSessionPage)

### Objetivo
Cuestionario de 3 fases post-practica que genera coaching personalizado.

### Fases de MindsetPulse
1. **Confidence Level** — "How confident do you feel?" (1-5 scale)
2. **Biggest Fear** — "What's your biggest fear about this conversation?" (text input)
3. **Self-Assessment** — "How well did you do?" (1-5 scale)

### Coaching Response
- `generateMindsetCoaching(result)` — genera coaching basado en las respuestas
- `MindsetCoachCard` — muestra el coaching personalizado
- Resultado guardado en `MindsetPulseResult`

### Navegacion
- "Continuar" → Dashboard
- "Saltar" → Dashboard

---

## Pantalla 10: Dashboard

### Componente
`DashboardPage.tsx`

### UI
- **Header**: BrandLogo + avatar + nombre + logout
- **ProfileCompletionBanner**: si perfil incompleto, pide industry/position/seniority
- **3 Dimensiones con SVG Gauges**:
  - Comunicacion (basada en strengths/opportunities)
  - Pronunciacion (basada en shadowing scores)
  - Mentalidad (basada en MindsetPulse results)
- **Practice History** (ultimas sesiones):
  - Cada card muestra: titulo, fecha, duracion, tag, arena phase reached
  - Before/After highlight de la sesion
  - Power phrases used, SR cards pending/mastered
- **Spaced Repetition Widget**:
  - Today's cards (sorted by lowest score)
  - Inline practice con scoring
- **Power Phrases Collection**: frases guardadas durante Arena
- **CTAs**: "Nueva practica", "Ver historial completo"

### Service Calls (mock)
- `userService.getProfile(uid)`
- `userService.getPracticeHistory(uid)`
- `userService.getPowerPhrases(uid)`
- `spacedRepetitionService.getTodayCards(uid)`
- `spacedRepetitionService.submitAttempt(cardId, attemptNumber)`

---

## Pantalla 10.5: Practice History

### Componente
`PracticeHistoryPage.tsx`

### UI
- Lista completa de sesiones pasadas
- Cada card: titulo, fecha, duracion, tag, arena phase, power phrases, SR status
- Before/After highlight
- "Volver" → Dashboard

---

## Design System

### Componente
`DesignSystemPage.tsx` (~1703 lineas) — herramienta interna accesible via `#design-system`

### Secciones
1. **Colors** — Palette completa con contextos de uso del color primario
2. **Typography** — Escalas y pesos
3. **Components** — Botones, cards, badges, inputs
4. **Session** — Componentes de la sesion de practica
5. **Arena** — PhaseIndicator, ArenaProgressBar
6. **Patterns** — Loading states, error states, empty states
7. **Layouts** — Internal Pages Layout, responsive patterns
