# inFluentia PRO - PDR Pantalla por Pantalla (v6.0)

> Especificacion de cada pantalla: UI, servicios, navegacion y logica.
> Referencia cruzada con MASTER_BLUEPRINT.md v6.0.
> Actualizado: 4 marzo 2026 — Prototipo funcional con mock data, i18n ES/PT/EN, paywall system (3 triggers), CreditUpsellModal restaurado.

---

## Indice de Pantallas

| # | Pantalla | Ruta Hash | Componente | Service Calls |
|---|---|---|---|---|
| 1 | [Landing Page](#pantalla-1-landing-page) | `#` (default) | `LandingPage` + `PracticeWidget` | Ninguno |
| 2 | [Auth Modal](#pantalla-2-auth-modal) | (overlay in PracticeWidget) | `AuthModal` (inline) | `authService.signIn()` |
| 2.5 | [Language Transition Modal](#pantalla-25-language-transition-modal) | (overlay post-auth) | `LanguageTransitionModal` | Ninguno |
| **Sub-steps del PracticeSessionPage (`#practice-session`):** |
| 4a | [Strategy Builder](#pantalla-4a-strategy-builder) | `#practice-session` | `StrategyBuilder` | Ninguno (local) |
| 4b | [Extra Context](#pantalla-4b-extra-context) | `#practice-session` | `ExtraContextScreen` (inline, skippable) | Ninguno (local) |
| 4c | [Generating Script](#pantalla-4c-generating-script-loader) | `#practice-session` | `AnalyzingScreen(variant="script")` | `conversationService.prepareSession()` |
| 4d | [Pre-Briefing](#pantalla-4d-pre-briefing) | `#practice-session` | `PreBriefingScreen` (inline) | Ninguno (mock data) |
| 5 | [Voice Practice (Arena)](#pantalla-5-voice-practice-arena) | `#practice-session` | `VoicePractice` + `ArenaSystem` | `conversationService.*`, `speechService.*` |
| 6 | [Analyzing Feedback](#pantalla-6-analyzing-feedback-loader) | `#practice-session` | `AnalyzingScreen(variant="feedback")` | (loader + mindset) |
| 7 | [Conversation Feedback](#pantalla-7-conversation-feedback) | `#practice-session` | `ConversationFeedback` (inline) | Datos cargados en step anterior |
| 8 | [Session Report](#pantalla-8-session-report) | `#practice-session` | `SessionReport` | `feedbackService.getCompletedSummary()`, `.generateResultsSummary()` |
| 10 | [Dashboard](#pantalla-10-dashboard) | `#dashboard` | `DashboardPage` | `userService.*`, `paymentService.*` |
| 10.5 | [Practice History](#pantalla-105-practice-history) | `#practice-history` | `PracticeHistoryPage` | `userService.getPracticeHistory()` |
| DS | [Design System](#design-system) | `#design-system` | `DesignSystemPage` | Ninguno |

> **Nota v5.0**: El flujo se simplifico de 11 a 8 steps. Se eliminaron: `shadowing`, `analyzing-results`, `mindset`.
> Los sub-steps comparten la ruta `#practice-session`. El estado `Step` (8 valores definidos en `shared/session-types.ts`) controla cual se renderiza.

> **Layout Pattern**: Todas las pantallas internas usan el Internal Pages Layout:
> BrandLogo header + SessionProgressBar, `bg-[#f0f4f8]`, PastelBlobs decorativos, MiniFooter.

---

## Pantalla 1: Landing Page

### Componente
`LandingPage.tsx` — importa `PracticeWidget`, `AuthModal`, `HowItWorksTabs`, `LandingLangProvider`

### i18n
Soporta ES, PT y EN via `landing-i18n.ts`. Language picker en header (flag emojis: 🇲🇽 ES / 🇧🇷 PT / 🇺🇸 EN). Todas las secciones son traducidas dinamicamente via `useLandingCopy()` hook. El copy EN enfatiza *communication training*, no language learning.

### Objetivo
Capturar el escenario del usuario ANTES del registro (Input-First pattern) para
generar compromiso via sunk cost psicologico.

### Secciones
1. **Header** — BrandLogo, nav links (scroll), language picker (ES/PT/EN), CTAs "Iniciar sesion" / "Registrarme"
2. **Hero** — Badge + titulo + subtitulo + PracticeWidget embebido
3. **PracticeWidget** — textarea con placeholder rotativo (typewriter), scenario pills, preview de IA contextual
4. **How It Works** — Tabs interactivas (HowItWorksTabs component)
5. **Benefits** — Grid de beneficios con iconos
6. **Pricing** — Free session card + 3 credit pack cards (1/$4.99, 3/$12.99, 5/$19.99)
7. **FAQ** — Accordion
8. **Footer**

### PracticeSetupModal (inline en PracticeWidget)
- Se abre al hacer click "Comenzar practica"
- **Endowed Progress Effect**: progress bar que inicia en 33% (escenario ya capturado)
- **Loss Aversion**: "Tu escenario personalizado esta listo. No lo pierdas."
- Steps: Scenario type selection → Interlocutor selection → Guided fields (varian por scenario) → Auth
- Resultado: `SetupModalResult { scenario, scenarioType, interlocutor, guidedFields }`

### Navegacion
- Registro (nuevo usuario) → LanguageTransitionModal → `PracticeSessionPage` (step: strategy)
- Login (usuario existente) → LanguageTransitionModal → `Dashboard`
- Header "Iniciar sesion" → AuthModal (login mode) → LanguageTransitionModal → Dashboard
- Header "Registrarme" → AuthModal (registro mode)

---

## Pantalla 2: Auth Modal

### Componente
`AuthModal.tsx` — modal overlay, 2 modos: login / registro, i18n via `useLandingCopy()`

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

## Pantalla 2.5: Language Transition Modal (nuevo v5.0)

### Componente
`LanguageTransitionModal.tsx`

### Objetivo
Comunicar al usuario que la interfaz de practica sera en ingles (inmersion), despues de haber interactuado en su idioma nativo (ES/PT) en la Landing.

### UI
- Copy localizado por idioma (ES/PT)
- Animacion con Motion
- Boton "Let's go" → continua al destino (Dashboard o PracticeSession)

### Navegacion
- Se muestra una vez despues del primer auth
- Click "Let's go" → ejecuta la navegacion pendiente (`pendingNavigationRef` en App.tsx)

---

## Pantalla 4a: Strategy Builder

### Componente
`StrategyBuilder.tsx` (~524 lineas)

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
- Boton "Continuar"

### Datos
- `getStrengthsForScenario(scenarioType)` → `Strength[]`
- `getOpportunitiesForScenario(scenarioType)` → `Opportunity[]`
- `getScriptSectionsForScenario(scenarioType)` → `ScriptSection[]`

---

## Pantalla 8: Session Report (v5.0 — reemplaza Shadowing + Recap + Mindset)

### Componente
`SessionReport.tsx` (~664 lineas)

### Objetivo
Reporte comprehensivo post-sesion que consolida toda la informacion de feedback, pronunciacion y mejora.

### UI
- **Overall Score** — puntuacion general de la sesion
- **Strengths & Opportunities** — resumen de fortalezas e areas de mejora
- **Power Phrases** — frases clave usadas y sugeridas
- **Before/After** — comparaciones de mejora
- **Pronunciation Notes** — tips de pronunciacion
- **Script Sections** — secciones del script con highlights
- **Next Steps** — recomendaciones para la siguiente practica

### Datos
- `feedbackService.getCompletedSummary(sessionId)` → `CompletedPhraseSummary[]`
- `feedbackService.generateResultsSummary(sessionId)` → `ResultsSummary`
- Datos de scenario via `scenario-data.ts` helpers

### Navegacion
- "Volver al Dashboard" → Dashboard

---

## Pantalla 10: Dashboard

### Componente
`DashboardPage.tsx` (~431 lineas)

### UI
- **Header**: BrandLogo + avatar + nombre + logout
- **Credit Balance**: muestra creditos restantes + label contextual (i18n)
- **CreditUpsellModal**: se abre cuando el usuario no tiene creditos e intenta iniciar sesion
- **Practice History** (ultimas sesiones)
- **CTAs**: "Nueva practica" (valida creditos via `handleStartSession`)
- **Ver historial**

### Credit Validation Flow (nuevo v5.0)
1. Click "Start session" → `handleStartSession()` se ejecuta
2. Llama `userService.canStartSession(uid)`
3. Si `allowed: true` → navega a Landing para nueva practica
4. Si `allowed: false` → abre `CreditUpsellModal`

### Service Calls (mock)
- `userService.canStartSession(uid)` — valida creditos
- `paymentService.getCreditsBalance(uid)` — obtiene balance
- `userService.getPracticeHistory(uid)`

---

## Pantalla 10.5: Practice History

### Componente
`PracticeHistoryPage.tsx` (~371 lineas)

### UI
- Lista completa de sesiones pasadas
- Cada card: titulo, fecha, duracion, tag, arena phase, power phrases, SR status
- Before/After highlight
- "Volver" → Dashboard

---

## CreditUpsellModal (nuevo v5.0)

### Componente
`CreditUpsellModal.tsx` (~507 lineas)

### Objetivo
Modal in-app para compra de credit packs cuando el usuario no tiene creditos.

### UI
- Grid de 3 credit packs
- Badges de descuento (13%, 20%)
- Pack featured (3 sesiones)
- Checkout via `paymentService.createCheckout(uid, pack)`
- Post-compra: celebracion de confetti (`canvas-confetti`)
- i18n completo ES/PT/EN (copias internas)
- Estados: browsing → processing → success → error

### Service Calls
- `paymentService.createCheckout(uid, pack)` → `CheckoutResult`

---

## ErrorBoundary (nuevo v5.0)

### Componente
`ErrorBoundary.tsx` (~181 lineas) — Class component

### Objetivo
Evitar la pantalla blanca cuando un componente React crashea durante render.

### UI (fallback)
- Branding inFluentia PRO
- Mensaje bilingue "Algo salio mal / Something went wrong"
- Error message + stack trace en monospace
- Component stack trace (React)
- Boton "Recargar App"
- Fondo navy (#0f172b)

### Implementacion
- Wraps el `<div className="size-full">` entero en `App.tsx`
- `getDerivedStateFromError` + `componentDidCatch`
- Logs en console con `[inFluentia ErrorBoundary]` prefix

---

## Design System

### Componente
`DesignSystemPage.tsx` (~1680 lineas) — herramienta interna accesible via `#design-system`

### Secciones
1. **Colors** — Palette completa con contextos de uso del color primario
2. **Typography** — Escalas y pesos
3. **Components** — Botones, cards, badges, inputs
4. **Session** — Componentes de la sesion de practica
5. **Arena** — PhaseIndicator, ArenaProgressBar
6. **Patterns** — Loading states, error states, empty states
7. **Layouts** — Internal Pages Layout, responsive patterns