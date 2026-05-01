# MasteryTalk PRO — CLAUDE.md

> Briefing permanente para Claude Code. Este archivo define el contexto del producto,
> la arquitectura objetivo, las reglas de trabajo y el plan de mejoras activo.
> Leer completamente antes de cualquier tarea.

## ⚠️ LECTURA OBLIGATORIA AL INICIO DE CADA SESIÓN

Antes de cualquier tarea, leer en este orden:

1. **`CONTRIBUTING.md`** — Cómo trabajamos, flujo de sesión, protocolo de commits
2. **`docs/ROADMAP.md`** — En qué fase estamos, cuál es la próxima tarea priorizada
3. **`.agent/skills/masterytalk-context/SKILL.md`** — Contexto del proyecto, stack, skill routing
4. El skill específico de `.agent/skills/` según el tipo de tarea

> Esta regla existe porque sin leer estos documentos primero, se pierden sesiones
> enteras repitiendo errores ya resueltos o trabajando en tareas fuera de prioridad.

---

## 1. Producto

**MasteryTalk PRO** es un simulador de comunicación profesional en inglés para profesionales
de nearshoring en Latinoamérica (México y Colombia).

**Propuesta de valor:** No vendemos clases. Vendemos acceso a riqueza y poder.
El usuario practica conversaciones profesionales reales con IA y recibe feedback
accionable sobre vocabulario, gramática, fluidez, pronunciación, tono profesional
y persuasión.

**Dos modos de uso (naming canónico — usar siempre estos términos):**
- **Quick Prep** — El usuario tiene una reunión o entrevista pronto. Flujo directo,
  Arena sin scaffolding completo, sesión única con hasta 2 repeticiones del mismo
  escenario. Acceso vía créditos individuales.
- **Conversational Path** — El usuario quiere construir su inglés ejecutivo a largo
  plazo. Progresión por niveles (Interview Mastery / Sales Champion), Lesson Modals
  con coaching IA, retención por hábito. Acceso vía suscripción.

> ⚠️ PROHIBIDO usar las palabras "Maratón" o "Gimnasio" en ningún copy de UI.
> Son metáforas internas de diseño, no términos de producto.

**North Star metric:** 3+ sesiones completadas en los primeros 7 días.

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 + Vite 6 |
| Animaciones | `motion/react` (importar como `motion`, NO `framer-motion`) |
| Iconos | `lucide-react` |
| Backend | Supabase (PostgreSQL + Edge Functions Deno/TypeScript con Hono) |
| Chat IA | GPT-4o — todas las sesiones (free y pagadas, misma calidad) |
| Feedback | Gemini 1.5 Flash |
| TTS práctica | ElevenLabs |
| TTS sistema | Azure Neural |
| STT + pronunciación | Azure Speech REST API |
| Pagos | Mercado Pago (LATAM) |
| Audio cache | Cloudflare R2 |

**Routing:** Hash-based (`#dashboard`, `#practice-session`, etc.).
NO migrar a React Router sin autorización explícita.

**Package manager:** pnpm. No modificar `pnpm-lock.yaml`.

---

## 3. ⚠️ COMPONENT REGISTRY — LEER ANTES DE CREAR CUALQUIER COMPONENTE UI

> **Regla crítica — Buscar antes de crear:**
> Antes de escribir cualquier elemento de UI, verificar este registry.
> Si existe un canónico → reutilizarlo o extenderlo con props.
> Si no existe → crearlo en `src/shared/ui/` para que sea reutilizable.
> **NUNCA crear un header, modal, botón o card desde cero inline en una página.**

### 3.1 Headers — componente canónico: `AppHeader`

**Ubicación:** `src/shared/ui/AppHeader.tsx`

Un solo componente de header para toda la app interna. NO crear headers inline.
El header de Landing es marketing y vive en `LandingPage.tsx` — caso especial.

```tsx
<AppHeader
  variant="app"           // 'app' | 'session' | 'minimal'
  showBackButton={true}
  backLabel="Dashboard"
  onBack={handleBack}
  showProgressBar={false} // solo variant='session'
  currentStep={step}      // requerido si showProgressBar=true
  userName="U"            // iniciales para el avatar
  onLogout={handleLogout}
  onNavigateToAccount={handleAccount}
  rightSlot={<CreditBadge />}
/>
```

| Variant | Altura | max-w | Backdrop | Uso |
|---------|--------|-------|----------|-----|
| `app` | h-14 | max-w-[1440px] | bg-white/90 backdrop-blur-md | Dashboard, History, Account |
| `session` | h-14 | max-w-[1440px] | bg-white/90 backdrop-blur-md | PracticeSession (con ProgressBar) |
| `minimal` | h-14 | max-w-[860px] | bg-white | Vistas de reporte inline |

**Inconsistencias pendientes de migración (no tocar hasta Sprint 1 FSD):**
- `PracticeSessionPage.tsx` — header inline h-12/14 → migrar a `variant="session"`
- `PracticeHistoryPage.tsx` — header inline h-20 → migrar a `variant="app"`
- Report inline en `PracticeHistoryPage.tsx` → migrar a `variant="minimal"`

### 3.2 Modales — componente canónico: `AppModal`

**Ubicación:** `src/shared/ui/AppModal.tsx`

Un solo wrapper de modal. NO reimplementar `motion.div + backdrop` inline.

```tsx
<AppModal
  open={isOpen}
  onClose={handleClose}
  size="md"            // 'sm' | 'md' | 'lg' | 'full'
  showCloseButton={true}
  accentBar={false}    // barra verde de marca en el top
>
  {/* contenido */}
</AppModal>
```

| Size | max-w | Uso |
|------|-------|-----|
| `sm` | max-w-sm | Confirmaciones simples |
| `md` | max-w-md | AuthModal, LanguageTransitionModal |
| `lg` | max-w-2xl | CreditUpsellModal, formularios complejos |
| `full` | full-screen | LevelDrawer, vistas de reporte |

**Especificaciones fijas (NO modificar en ningún modal):**
- Backdrop: `bg-[#0f172b]/60 backdrop-blur-sm`
- Card: `bg-white rounded-3xl shadow-2xl overflow-hidden`
- Animación: `scale 0.92→1, y 24→0, opacity 0→1, duration 0.5s ease spring`
- Close button: `absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100`

### 3.3 Botones — variantes canónicas

```tsx
// Primario app (páginas internas) — #0f172b + rounded-lg
<button className="bg-[#0f172b] text-white px-5 py-2.5 rounded-lg text-sm
                   font-medium hover:bg-[#1d293d] transition-colors">

// Primario landing (marketing) — #2d2d2d + rounded-full
<button className="bg-[#2d2d2d] text-white px-8 py-3.5 rounded-full text-base
                   font-medium hover:bg-[#1a1a1a] transition-colors shadow-lg">

// Secundario app
<button className="border border-[#e2e8f0] text-[#0f172b] px-5 py-2.5 rounded-lg
                   text-sm font-medium hover:bg-[#f8fafc] transition-colors">

// Ghost / texto
<button className="text-[#45556c] hover:text-[#0f172b] text-sm transition-colors">

// Destructivo
<button className="text-red-600 hover:text-red-700 text-sm transition-colors">
```

**Regla de border-radius — NUNCA romper:**
- Landing/marketing → siempre `rounded-full`
- App interna → siempre `rounded-lg`
- `rounded-xl`, `rounded-2xl`, `rounded-3xl` en botones: PROHIBIDO

### 3.4 Cards — variantes canónicas

```tsx
// Card de app — estándar en páginas internas
<div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">

// Card de landing/marketing
<div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

// Card compacta (feedback, niveles, items de lista)
<div className="bg-white rounded-xl border border-[#e2e8f0] p-4">

// Card oscura (bloques de oferta, hero de report)
<div className="bg-[#0f172b] rounded-2xl p-6">

// Card de éxito / highlight
<div className="bg-[#DBEDDF] rounded-xl p-4">
```

**Regla — NUNCA mezclar entre contextos:**
- App interna: `rounded-2xl` + `border-[#e2e8f0]`
- Landing/marketing: `rounded-3xl` + `border-gray-200`

### 3.5 Componentes canónicos existentes en `shared/`

Importar siempre desde `shared/ui/`. NUNCA reimplementar:

| Componente | Cuándo usar |
|-----------|-------------|
| `BrandLogo` | Todo header y modal que muestre branding |
| `PastelBlobs` | Todas las páginas internas (bg-[#f0f4f8]) |
| `MiniFooter` | Todas las páginas internas |
| `AnalyzingScreen` | Loaders: generating-script, analyzing-feedback |
| `RecordButton` | Arena, VoicePractice, ejercicios de voz |
| `RecordingWaveformBars` | Junto a RecordButton mientras graba |
| `RecordingTimer` | Junto a RecordButton mientras graba |
| `SessionProgressBar` | Header de PracticeSession únicamente |
| `ServiceErrorBanner` | Errores de API en flujo activo |
| `SmoothHeight` | Acordeones, paneles expandibles |
| `DotPattern` | Fondos blancos en secciones de landing |

### 3.6 Cuándo está permitido crear un componente nuevo

Solo si se cumplen TODAS estas condiciones:
1. No existe en el registry ni es variación de uno existente.
2. Es específico de una feature y no tiene sentido en `shared/`.
3. Hacerlo genérico añadiría complejidad innecesaria.

En ese caso: crear en `src/features/{feature}/ui/` con nombre descriptivo.

---

## 4. Design System — Escalas canónicas

> Todos los valores marcados como PROHIBIDO generan inconsistencias visuales.
> Claude Code debe usar ÚNICAMENTE los valores de estas tablas.

### 4.1 Escala tipográfica

| Token | Tamaño / Peso | Line-height | Uso |
|-------|--------------|-------------|-----|
| `text-display` | 36-48px / 700 | 1.1 | Headlines hero de landing |
| `text-4xl font-semibold` | 36px / 600 | 1.2 | Títulos de página grandes |
| `text-2xl font-semibold` | 24px / 600 | 1.3 | Títulos de página app ← heading-1 |
| `text-xl font-semibold` | 20px / 600 | 1.4 | Títulos de sección, cards ← heading-2 |
| `text-base font-semibold` | 16px / 600 | 1.4 | Subtítulos, labels de sección ← heading-3 |
| `text-base` | 16px / 400 | 1.6 | Cuerpo de texto landing |
| `text-sm` | 14px / 400 | 1.5 | **Cuerpo estándar de app ← el más usado** |
| `text-sm font-medium` | 14px / 500 | 1.5 | Labels, nombres de nivel, badges |
| `text-xs font-medium` | 12px / 500 | 1.4 | Etiquetas uppercase, tags, pills |
| `text-xs` | 12px / 400 | 1.4 | Metadata, timestamps, disclaimers |
| `text-5xl font-bold` | 48px / 700 | 1.0 | Scores grandes (74%, B2) |

**Pesos permitidos en app interna: 400, 500, 700. PROHIBIDO: 300, 600.**
Landing puede usar 300 para headlines hero únicamente.

**PROHIBIDO en cualquier contexto:**
- Font-sizes arbitrarios: `text-[13px]`, `text-[15px]`, `text-[17px]`
- `style={{ fontWeight: 600 }}` inline — usar `font-semibold` de Tailwind
- `style={{ fontSize: '...' }}` inline — usar la escala de Tailwind

### 4.2 Escala de espaciado

Solo estos valores están permitidos. Saltar de 4 a 6 directamente.

| Clase Tailwind | px | Uso |
|---------------|-----|-----|
| `gap-1`, `p-1` | 4px | Separación mínima entre elementos inline |
| `gap-2`, `p-2` | 8px | Gap entre icono y texto, elementos muy juntos |
| `gap-3`, `p-3` | 12px | Gap entre elementos de card, items de lista |
| `gap-4`, `p-4` | 16px | Padding cards compactas, gap estándar en grids |
| `gap-6`, `p-6` | 24px | **Padding estándar de cards, gap entre secciones ← el más usado** |
| `p-8` | 32px | Padding modales, secciones con respiro |
| `p-10`, `p-12` | 40-48px | Padding hero, secciones de landing |
| `px-5 py-2.5` | — | Botones app interna (fijo, no cambiar) |
| `px-8 py-3.5` | — | Botones landing (fijo, no cambiar) |

**PROHIBIDO: `p-5`, `p-7`, `p-9`, `gap-5`, `gap-7`** — rompen la escala.

### 4.3 Escala de border-radius

| Clase Tailwind | px | Uso |
|---------------|-----|-----|
| `rounded`, `rounded-sm` | 4-6px | Badges inline, chips, tags pequeños |
| `rounded-lg` | 8px | **Botones de app, inputs, dropdowns ← estándar app** |
| `rounded-xl` | 12px | Cards compactas, items de lista, level pills |
| `rounded-2xl` | 16px | **Cards estándar de app ← el más usado en app** |
| `rounded-3xl` | 24px | Cards de landing/marketing, modales |
| `rounded-full` | 9999px | **Botones de landing, avatares, badges circulares** |

**PROHIBIDO en botones: `rounded-xl`, `rounded-2xl`, `rounded-3xl`.**
**App interna: `rounded-lg` (botones), `rounded-2xl` (cards). NUNCA mezclar.**

### 4.4 Escala de sombras (elevación)

| Clase Tailwind | Nivel | Uso |
|---------------|-------|-----|
| Sin sombra | 0 | Cards sobre fondo blanco, elementos planos |
| `shadow-sm` | 1 | **Cards estándar sobre #f0f4f8 ← el más usado** |
| `shadow` | 2 | Cards en hover state, dropdowns |
| `shadow-lg` | 3 | CTAs de landing, floating buttons |
| `shadow-2xl` | 4 | Modales ÚNICAMENTE |

**PROHIBIDO en cards: `shadow-md`, `shadow-xl`, `shadow-2xl`.**
**Hover en cards: de `shadow-sm` a `shadow` — nunca saltar más de un nivel.**

### 4.5 Colores — referencia completa

**Primarios (nunca mezclar entre contextos):**

| Contexto | Color | Uso |
|----------|-------|-----|
| App interna | `#0f172b` | Botones, navbar, tabs activos, textos principales |
| Landing/Marketing | `#2d2d2d` | CTAs, header público, pricing |

**Backgrounds:**

| Token | Hex | Uso |
|-------|-----|-----|
| Páginas internas | `#f0f4f8` | Background de todas las páginas de app |
| Blanco | `#ffffff` | Cards, modales, headers |
| Sutil | `#f8fafc` | Hover states, filas alternas |

**Bordes:**

| Token | Hex | Uso |
|-------|-----|-----|
| App estándar | `#e2e8f0` | Cards, inputs, separadores en app |
| Landing | `gray-200` (Tailwind) | Cards y separadores en landing |

**Texto:**

| Token | Hex / Tailwind | Uso |
|-------|---------------|-----|
| Principal | `#0f172b` | Títulos y cuerpo sobre fondo claro |
| Secundario | `#45556c` | Texto de soporte, subtítulos |
| Terciario | `#62748e` | Metadata, placeholders |
| Muted | `#94a3b8` | Disabled, hints muy secundarios |
| Sobre oscuro | `#ffffff` | Texto sobre bg-[#0f172b] |

**Semánticos:**

| Token | Hex | Uso |
|-------|-----|-----|
| Success | `#00C950` | Checks, estados completados |
| Error | `#ef4444` (red-500) | Errores, destructivos |

**Paleta pastel (SOLO decorativa — nunca para texto ni estado):**

| Nombre | Hex | Uso |
|--------|-----|-----|
| Peach | `#FFE9C7` | Hero blobs, fondos decorativos |
| Blue | `#D9ECF0` | Hero blobs, stats |
| Green | `#DBEDDF` | Cards highlight, badges de éxito |
| Lavender | `#E1D4FF` | Acentos hero |

### 4.6 Reglas de contexto visual

**Si la página tiene `PastelBlobs` + `MiniFooter` → contexto app:**
- Color primario: `#0f172b`
- Cards: `rounded-2xl border-[#e2e8f0]`
- Botones: `rounded-lg`

**Si la página tiene `DotPattern` + footer completo → contexto landing:**
- Color primario: `#2d2d2d`
- Cards: `rounded-3xl border-gray-200`
- Botones: `rounded-full`

---

## 5. Arquitectura objetivo — Feature Slice Design (FSD)

La regla fundamental: **las capas superiores pueden importar de las inferiores, nunca al revés.**

```
app → pages → widgets → features → entities → shared
```

### Estructura de carpetas objetivo

```
LandinginfluentiavMVP/                   ← raíz del código
└── src/
    ├── app/
    │   └── App.tsx                          ← solo routing y providers
    │
    ├── pages/                               ← CAPA: pages
    │   ├── LandingPage.tsx
    │   ├── DashboardPage.tsx
    │   ├── AccountPage.tsx
    │   ├── LibraryPage.tsx
    │   └── PracticeHistoryPage.tsx
    │
    ├── widgets/                             ← CAPA: widgets
    │   ├── session-report/
    │   │   ├── SessionReport.tsx
    │   │   └── ConversationalPathOffer.tsx  ← nuevo (plan Fase 2)
    │   ├── practice-widget/
    │   │   └── PracticeWidget.tsx
    │   ├── credit-upsell/
    │   │   └── CreditUpsellModal.tsx
    │   └── interview-briefing/
    │       └── InterviewBriefingScreen.tsx
    │
    ├── features/                            ← CAPA: features
    │   ├── practice-session/
    │   │   ├── model/
    │   │   │   ├── session-api.ts
    │   │   │   └── session.constants.ts
    │   │   ├── ui/
    │   │   │   ├── PracticeSessionPage.tsx
    │   │   │   ├── ExtraContextScreen.tsx
    │   │   │   ├── KeyExperienceScreen.tsx
    │   │   │   ├── PreBriefingScreen.tsx
    │   │   │   ├── VoicePractice.tsx
    │   │   │   └── ConversationFeedback.tsx
    │   │   └── lib/briefing/
    │   ├── arena/
    │   │   ├── ArenaSystem.tsx
    │   │   └── BriefingRoom.tsx
    │   ├── dashboard/
    │   │   ├── model/
    │   │   └── ui/
    │   └── progression/
    │       ├── LevelDrawer.tsx
    │       └── LessonStepper.tsx
    │
    ├── entities/                            ← CAPA: entidades de dominio
    │   ├── session/index.ts                 ← Session, SessionConfig, Step, SessionMode
    │   ├── user/index.ts                    ← User, UserPlan, OnboardingProfile
    │   └── feedback/index.ts               ← RealFeedbackData, SessionSummary
    │
    ├── shared/                              ← CAPA: compartido
    │   ├── ui/                              ← Component Registry vive aquí
    │   │   ├── AppHeader.tsx                ← ★ CANÓNICO
    │   │   ├── AppModal.tsx                 ← ★ CANÓNICO
    │   │   ├── BrandLogo.tsx
    │   │   ├── RecordButton.tsx
    │   │   ├── AnalyzingScreen.tsx
    │   │   ├── PastelBlobs.tsx
    │   │   ├── MiniFooter.tsx
    │   │   ├── SessionProgressBar.tsx
    │   │   ├── ServiceErrorBanner.tsx
    │   │   ├── SmoothHeight.tsx
    │   │   ├── DotPattern.tsx
    │   │   └── index.ts                     ← barrel re-export
    │   ├── i18n/
    │   │   ├── landing-i18n.ts
    │   │   └── LandingLangContext.tsx
    │   ├── lib/
    │   │   ├── sessionCache.ts
    │   │   ├── spacedRepetition.ts
    │   │   ├── useUsageGating.ts
    │   │   └── useMediaRecorder.ts
    │   └── config/constants.ts
    │
    └── services/                            ← SIN CAMBIOS
        ├── index.ts
        ├── types.ts
        ├── errors.ts
        ├── interfaces/
        ├── adapters/mock/ + supabase/
        └── prompts/
            ├── assembler.ts                     ← inyecta bloques en el system prompt
            ├── personas.ts                      ← 10 interlocutores por escenario
            ├── templates.ts                     ← bloques compartidos (master, output, arena)
            ├── analyst.ts                       ← prompts para Gemini (feedback + script)
            └── scenarios/                       ← ★ SCENARIO REGISTRY (ver §16)
                ├── index.ts                     ← barrel + SCENARIO_ADAPTATION Record
                ├── interview.ts
                ├── sales.ts
                ├── meeting.ts
                └── presentation.ts
```

### Orden de migración (siempre de abajo hacia arriba)

```
Sprint 1: shared/ui/  — dividir shared/index.tsx + crear AppHeader + AppModal
Sprint 2: entities/   — extraer tipos de services/types.ts
Sprint 3: features/   — reorganizar practice-session/, arena/, progression/
Sprint 4: widgets/    — SessionReport, CreditUpsellModal, InterviewBriefingScreen
Sprint 5: pages/      — mover páginas, actualizar App.tsx
```

**Regla de oro:** Nunca mover un archivo Y cambiar su contenido en el mismo paso.
Primero mover → verificar que compila → luego refactorizar.

---

## 6. Flujo de usuario actual

```
Landing (#)
  └── PracticeWidget → PracticeSetupModal → Auth (Google)
        └── LanguageTransitionModal (solo ES/PT, no EN)
              └── PracticeSessionPage (#practice-session)
                    1. extra-context         ← ContextScreen (presets + custom form + skip)
                    2. generating-script     ← AnalyzingScreen + API call
                    3. pre-briefing          ← InterviewBriefingScreen
                    4. practice              ← VoicePractice + ArenaSystem
                    5. analyzing             ← AnalyzingScreen (pre-warm paralelo)
                    6. conversation-feedback ← ConversationFeedback
                    7. session-recap         ← SessionReport
                    → Dashboard (#dashboard)

Dashboard (#dashboard)
  ├── ProgressionTree → LevelDrawer → LessonStepper
  ├── PracticeDropdown (Quick Prep)
  └── CreditUpsellModal
```

**Bifurcación por scenarioType en generating-script:**
- `interview` → `generateInterviewBriefing` → `InterviewBriefingScreen`
- `sales` → `generateScript` + `generatePreparationToolkit` (paralelo) → `InterviewBriefingScreen`
- Otros → `generateScript` → `PreBriefingScreen`

**Arena — configuración por modo:**
- Quick Prep: arranca en fase `Guidance` (presión real desde el inicio)
- Conversational Path: arranca en fase `Support` (scaffolding completo)

**Repeticiones en Quick Prep:**
- La sesión gratuita permite hasta 2 repeticiones del mismo escenario.
- Repetición = mismo contexto, mismo interlocutor, nueva conversación desde cero.
- Objetivo: el usuario mide su mejora practicando el mismo escenario 3 veces en total.

---

## 7. Plan de mejoras UX activo (4 fases)

### Fase 1 — Widget Landing: Quick Prep / Conversational Path
**Archivos:** `PracticeWidget.tsx`, `App.tsx`, `session-types.ts`, `landing-i18n.ts`
- Toggle de modo: ⚡ Quick Prep / 🎯 Conversational Path
- Panel Quick Prep: 4 scenario cards (interview, sales, negotiation, csuite)
- Panel Conversational Path: 2 path cards con preview de niveles
- `SessionMode = 'quick-prep' | 'conversational-path'` en flowState
- Arena Quick Prep arranca en `Guidance`, Conversational Path en `Support`

### Fase 2 — ConversationalPathOffer en SessionReport
**Archivos:** `SessionReport.tsx`, `App.tsx`
- Bloque al final del report, condicional a `pillarScores` con ≥4 pillars
- 3 pilares débiles = `pillarScores` ordenado ascendente, primeros 3
- CTA "Activar mi Conversational Path" → Dashboard con path pre-seleccionado

### Fase 3 — Extra Context: Situation Presets ✅ IMPLEMENTADO
**Archivos:** `ContextScreen.tsx`, `scenario-presets.ts`, Edge Function prebriefing
- ✅ Presets de situación por escenario (3 × interview, sales, meeting, presentation)
- ✅ UI: preset cards como opción primaria, formulario colapsable secundario, skip siempre visible
- ✅ Preset fluye como `{ situationContext }` → `processGuidedFields()` → arsenal del prompt
- ✅ Compatible con `cvSummary` del perfil — combinación automática sin fricción
- ⏳ Persistir `cvSummary` en perfil (pre-llenar en sesiones siguientes) — pendiente
- ⏳ Preview de preguntas en tiempo real — pendiente

### Fase 4 — Dashboard adaptivo
**Archivos:** `DashboardPage.tsx`, Edge Function `/sessions/count`
- Vista Quick Prep (<3 sesiones): ReadinessScore + "Practicar de nuevo", sin ProgressionTree
- Vista Conversational Path (≥3 sesiones o modo=conversational-path): Dashboard actual
- Banner de transición en la 3ra sesión: "¿Activar tu Conversational Path?"

---

## 8. Modelo de negocio

### Sesión gratuita
- 1 sesión completa con GPT-4o (misma calidad que sesiones pagadas, sin degradar)
- Incluye hasta 2 repeticiones del mismo escenario (3 intentos totales en Quick Prep)
- Paywall al intentar una nueva sesión distinta sin créditos
- Paywall al intentar una 3ra repetición sin créditos

### Quick Prep — créditos individuales
- $4.99 / sesión individual
- Sin suscripción, sin compromiso
- Acceso a todos los escenarios: interview, sales, negotiation, csuite, networking

### Conversational Path — suscripción
- $19.99 / mes
- $49.99 / trimestre (~17% de ahorro vs mensual)
- Acceso al Progression Tree completo (Interview Mastery + Sales Champion)
- Lesson Modals con coaching IA personalizado
- Sesiones ilimitadas dentro del path

### Paywall triggers
1. **Extra repetición** — el usuario quiere una 3ra repetición de Quick Prep en sesión gratuita
2. **Nueva sesión** — el usuario quiere iniciar una sesión distinta sin créditos/suscripción

### Relación entre modos y planes
- Quick Prep → créditos individuales ($4.99/sesión)
- Conversational Path → suscripción ($19.99/mes o $49.99/trimestre)
- Un usuario suscrito puede usar Quick Prep sin cargo adicional (incluido en suscripción)

### GPT-4o en todas las sesiones
Todas las sesiones, incluida la gratuita, usan GPT-4o completo.
El objetivo es que el usuario viva la experiencia de máxima calidad desde el primer contacto.
NO implementar degradación a GPT-4o-mini en ningún flujo.

---

## 9. Reglas operacionales

---

### 🛑 REGLA ABSOLUTA — CONFIRMAR ANTES DE ESCRIBIR CÓDIGO

**NUNCA escribir, modificar ni eliminar código sin haber recibido confirmación explícita.**

Este es el protocolo obligatorio para CADA tarea, sin excepciones:

**Paso 1 — Análisis (solo texto, cero código)**
Antes de tocar cualquier archivo, presentar un plan con este formato exacto:

```
📋 PLAN DE CAMBIOS

Archivos a modificar:
  - LandinginfluentiavMVP/src/path/archivo.tsx — [descripción del cambio]

Archivos a crear:
  - LandinginfluentiavMVP/src/path/nuevo.tsx — [descripción]

Archivos a eliminar:
  - (ninguno) o [lista]

Impacto en otros componentes:
  - [qué otros archivos podrían verse afectados]

¿Procedo con estos cambios?
```

**Paso 2 — Esperar respuesta**
No escribir una sola línea de código hasta recibir confirmación.
Las respuestas válidas son: "sí", "procede", "adelante", o cualquier aprobación explícita.
Si la respuesta es una corrección o pregunta → ajustar el plan y volver al Paso 1.

**Paso 3 — Ejecutar con scope mínimo**
Una vez confirmado, implementar exactamente lo aprobado.
Si durante la implementación aparece algo inesperado que requiere tocar archivos
adicionales no mencionados en el plan → PAUSAR y notificar antes de continuar.

**Paso 4 — Resumen de cambios**
Al finalizar, listar todos los archivos modificados/creados/eliminados.

> Esta regla existe porque modificaciones sin confirmación previa han dañado
> componentes funcionales. No hay excepciones por "cambios pequeños" o "solo
> una línea". Todo cambio requiere confirmación.

---

### Regla #0 — Leer skills antes de actuar + Diagnóstico antes de instruir al usuario

**Al inicio de cada tarea**, leer el skill correspondiente en `.agent/skills/` según la tarea:

| Tarea | Skill |
|-------|-------|
| UI / React / componentes | `frontend-design` |
| Edge Functions / Supabase / API | `api-patterns` |
| Debugging de errores | `systematic-debugging` |
| Deployments | `deployment-procedures` |
| Refactors multi-archivo | `architecture` |
| Tests | `testing-patterns` |

Siempre leer `.agent/skills/masterytalk-context/SKILL.md` primero para contexto del proyecto.

---

**Antes de pedirle al usuario que haga cualquier cosa**, hacer el trabajo de diagnóstico primero:

1. **Credenciales y API keys** — Buscar en `supabase/.env.local`, `.env.local`, `.env` antes de pedir al usuario que vaya a un dashboard. Comando: `grep -r "NOMBRE_KEY" supabase/.env.local .env.local .env 2>/dev/null`

2. **Logs de error** — Antes de dar instrucciones de re-deploy o re-envío, leer los logs de Supabase para confirmar qué está fallando exactamente.

3. **Estado actual** — Antes de pedir al usuario que verifique algo en un dashboard externo, verificar primero con scripts locales o comandos bash lo que se pueda verificar localmente.

4. **Instrucción completa siempre** — Cada instrucción que se le da al usuario debe tener:
   - Qué hacer (acción exacta)
   - Dónde hacerlo (ruta exacta, URL exacta, comando exacto)
   - Qué debe ver como resultado (texto exacto esperado)

> Esta regla existe porque se le hizo dar vueltas innecesarias al usuario: buscar API keys
> en dashboards externos cuando estaban en `.env.local`, re-enviar webhooks múltiples veces
> sin verificar primero qué código estaba desplegado, y dar instrucciones a medias sin
> resultado esperado.

---

### Regla #1 — Buscar antes de crear

1. Consultar el Component Registry (Sección 3).
2. Consultar las escalas del Design System (Sección 4).
3. Si existe canónico → usar o extender con props.
4. Si no existe → crear en `src/shared/ui/` con props genéricas.
5. NUNCA crear header, modal, botón o card inline desde cero.

### Regla #2 — Scope mínimo

- Editar SOLO los archivos listados en el plan confirmado.
- No refactorizar código que funciona si no es parte del pedido.
- No renombrar variables, funciones o archivos sin que se pida explícitamente.
- No "mejorar" código adyacente aunque parezca una buena idea.

### Regla #3 — Integridad del código

- No crear mocks ni demo modes para evitar arreglar bugs reales.
- No desconectar integraciones existentes (Supabase, OpenAI, Azure) sin autorización.
- Nunca `catch () {}` vacíos — siempre `console.error('[Componente] Failed to X:', err)`.
- No usar `style={{ }}` inline para tipografía o colores — usar clases Tailwind de las escalas.

### Regla #4 — Ambigüedad

Si el request es ambiguo o podría interpretarse de más de una forma:
PREGUNTAR antes de asumir. Una pregunta de clarificación es siempre mejor que
implementar algo incorrecto que hay que revertir.

---

## 10. Archivos protegidos — NUNCA modificar

```
LandinginfluentiavMVP/src/app/components/figma/ImageWithFallback.tsx
LandinginfluentiavMVP/supabase/functions/server/kv_store.tsx
LandinginfluentiavMVP/utils/supabase/info.tsx
LandinginfluentiavMVP/package-lock.json
```

---

## 11. Naming conventions

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes | PascalCase | `AppHeader.tsx` |
| Hooks | camelCase con `use` | `useMediaRecorder.ts` |
| Utilidades | camelCase | `sessionCache.ts` |
| Feature slices | kebab-case | `practice-session/` |
| Tipos | PascalCase descriptivo | `RealFeedbackData` |
| Modo Quick Prep | `'quick-prep'` | En código y props |
| Modo Conversational Path | `'conversational-path'` | En código y props |

---

## 12. Service Layer

Auto-detect: `VITE_SUPABASE_URL` configurado → per-service switching; si no → 100% mock.

Servicios: `authService` · `conversationService` · `feedbackService` ·
`speechService` · `userService` · `paymentService` · `spacedRepetitionService`

---

## 13. Backend — Hono Edge Functions

- Base URL: `https://{project-id}.supabase.co/functions/v1/make-server-08b8658d`
- Auth: `Authorization: Bearer <token>` en todos los endpoints salvo `/health`
- KV store: `get`, `set`, `getByPrefix` — NO existe función `list`
- File writes: solo en `/tmp`
- Imports externos: preferir `npm:` y `jsr:`

**Endpoints clave:**
```
GET  /health
GET  /auth/status
POST /sessions              ← guardar sesión post-práctica
GET  /sessions              ← historial de sesiones
PUT  /profile               ← actualizar perfil (cvSummary, sessionMode, etc.)
POST /progression/lesson    ← generar contenido de lección (GPT-4o)
POST /progression/complete-lesson
GET  /sessions/count        ← total de sesiones del usuario (para Dashboard adaptivo)
```

---

## 14. i18n

- Landing: ES (default) · PT · EN
- App y feedback: siempre EN (inmersión)
- `LanguageTransitionModal` se salta para usuarios EN
- Hook: `useLandingCopy()` desde `LandingLangContext`
- Persistencia: `localStorage('influentia_lang')`

---

---

## 15. Estado actual del proyecto (2026-04-30)

### ✅ Completado y estable

| Área | Estado | Notas |
|------|--------|-------|
| FSD Architecture | ✅ 90%+ | `app/components/` legacy es el único residuo |
| AppHeader + AppModal | ✅ | Canónicos en `src/shared/ui/` |
| Design tokens | ✅ | Centralizados en `shared/design-tokens.ts` |
| Font system | ✅ | Poppins global en `body` vía `theme.css`; `.font-montserrat` utility; cero `fontFamily` inline |
| Auth security | ✅ | `getAuthToken()` en todos los Edge Function calls; OAuth flash resuelto con `masterytalk_auth_loading` flag |
| Auth UX | ✅ | `AuthLoadingScreen` branded; `ProfileDropdown` como componente propio (hooks fix) |
| Service adapters | ✅ | 6 adapters reales (auth, conversation, speech, feedback, user, SR) |
| Test coverage | ✅ 90 tests | Vitest: SR logic (22), Auth flow (7), Feedback adapter (7), Scenario presets (20), Assembler scenarios (22) |
| Error handling | ✅ | FeedbackError, retry/backoff, timeouts |
| Edge Functions | ✅ | TTS (turbo_v2_5), STT, Feedback, Briefing, Pronunciation, SSE streaming |
| Scenario system | ✅ | Meeting + presentation: SCENARIO_ADAPTATION, dual-axis evaluación, gap analysis — ver §16 |
| Situation Presets | ✅ | ContextScreen con 12 presets (3 × 4 escenarios), sin asunción de rol |
| Dashboard layout | ✅ | 3 filas: WA banner → HeroCard → 4 widgets → (1/4 SideNav + 3/4 paths); DashboardSkeleton completo |
| ProgressionTree | ✅ | Path title + description; level taglines; Lock icon + hint; self-intro como primer path |
| AccountPage | ✅ | 100% inglés; todos los campos editables y guardados en KV backend |
| Lessons Library | ✅ | 50 micro-lecciones; dual-axis recommendation (debilidad + path/level); `MicroLesson` con `pathIds`, `levelIds`, `audioUrl`; nav renombrado "Lessons Library" |
| DeepDiveCard | ✅ | Tarjeta post-sesión en FeedbackScreen `bottomSlot` — lecciones recomendadas por pilares débiles + contexto de sesión |
| RecommendedLessonsCard | ✅ | Tarjeta en Dashboard (catch-up entre sesiones); link funcional a Lessons Library |
| LessonModal audio | ✅ | Play/pause player opcional cuando la lección tiene `audioUrl` pre-generado |
| TTS optimization | ✅ | OpenAI `gpt-4o-mini-tts` PRIMARY para TTS dinámico (~20× más barato: $0.09 vs $1.80/sesión); ElevenLabs = FALLBACK dinámico + narración coach pre-generada (R2, costo $0 por usuario) |
| War Room limit | ✅ | 5 sesiones/mes; contador en botón Dashboard; backend: `war_room_monthly_count` + `war_room_month` en KV profile |

### ⚠️ Pendiente — próximas sesiones

| Prioridad | Tarea | Notas |
|-----------|-------|-------|
| 🔴 Alta | **Supabase Pro** | Free tier se pausa tras 7 días sin actividad — CRÍTICO antes de usuarios pagos |
| 🔴 Alta | **Twilio WhatsApp producción** | Meta verification en revisión (enviado 2026-04-29); pasos 2-4 bloqueados |
| 🟡 Media | **E2E tests** | Playwright: onboarding → practice → feedback |
| 🟡 Media | **Mobile responsiveness** | Revisar todos los flujos en mobile |
| 🟡 Media | **Supabase CLI migrations** | Schema no está versionado |
| 🟢 Baja | **WCAG accessibility** | Sin auditoría a11y actual |
| 🟢 Baja | **Strip console.log** | Statements en producción — agregar vite-plugin-remove-console |

### 🔴 Issues TypeScript conocidos (pre-existentes, no tocar sin plan)

```
PracticeSessionPage.tsx:584,941,947  — params implicitly any
PracticeWidget.tsx:412-454           — disabled/badge props missing on ScenarioOption
LibraryPage.tsx:23,253               — LessonModal import (componente pendiente de crear)
CreditUpsellModal.tsx:263            — Expected 2 args, got 1
```

### Usos legítimos de `publicAnonKey` (NO son bugs — no tocar)

```
auth.supabase.ts       — apikey header estándar Supabase
session-api.ts         — apikey header estándar Supabase
PracticeHistoryPage.tsx — apikey header estándar Supabase REST
```

---

## 16. Scenario Registry — reglas de mantenimiento

> Esta sección documenta cómo está organizado el sistema de escenarios y cómo extenderlo.
> Leer antes de tocar cualquier archivo de prompts.

### Arquitectura del sistema de escenarios

Cada escenario activo (`interview`, `sales`, `meeting`, `presentation`) tiene dos registros independientes:

**Frontend — `src/services/prompts/scenarios/{scenario}.ts`**
- Exporta `SCENARIO_ADAPTATION_{SCENARIO}`: string con vocabulario, arco de conversación, closure protocol y boundary guardrails
- Se inyecta como Block 4.5 en el system prompt del AI conversacional (GPT-4o)
- Consumido por `assembler.ts` vía `scenarios/index.ts`

**Backend — `supabase/functions/make-server-08b8658d/scenarios/{scenario}.ts`**
- Exporta `{SCENARIO}_DUAL_AXIS_BLOCK`: instrucciones de evaluación dual-axis para Gemini
- Exporta `{SCENARIO}_OUTPUT_FIELDS`: campos JSON adicionales en el output del analista
- Exporta `get{Scenario}GapAnalysis(filledKeys)`: lógica de detección de gaps en el pre-briefing
- `interview.ts` también exporta `buildInterviewBriefingBlock()` (depende de parámetros runtime)
- Consumido por `analyst-prompt.ts` y `prebriefing-prompts.ts` vía `scenarios/index.ts`

**Presets — `src/features/practice-session/model/scenario-presets.ts`**
- 3 presets por escenario activo (12 total)
- Cada preset describe solo la SITUACIÓN (empresa, stakes, contexto) — sin asumir el rol del usuario
- Se inyecta como `{ situationContext: preset.context }` → `processGuidedFields()` → `userArsenal`

### Cómo agregar un nuevo escenario

1. Agregar el tipo a `ScenarioType` en `src/entities/session/index.ts`
2. Crear `src/services/prompts/scenarios/{nuevo}.ts` con `SCENARIO_ADAPTATION_{NUEVO}`
3. Re-exportar desde `src/services/prompts/scenarios/index.ts`
4. Crear `supabase/functions/make-server-08b8658d/scenarios/{nuevo}.ts` con dual-axis block, output fields y gap analysis
5. Re-exportar desde `supabase/functions/make-server-08b8658d/scenarios/index.ts` y agregar al dispatcher `getScenarioGapAnalysis()`
6. Agregar interlocutores en `personas.ts` → `INTERLOCUTORS_BY_SCENARIO` y `DEFAULT_INTERLOCUTOR`
7. Agregar interlocutor intel en `prebriefing-prompts.ts` → `INTERLOCUTOR_INTEL`
8. Agregar 2-3 presets en `scenario-presets.ts`
9. Escribir tests: preset integrity + assembler adaptation block

### Escenarios activos vs definidos

| ScenarioType | SCENARIO_ADAPTATION | Dual-axis eval | Presets | Activo en UI |
|-------------|--------------------|--------------------|---------|--------------|
| `interview` | ✅ | ✅ | ✅ 3 | ✅ |
| `sales` | ✅ | ✅ | ✅ 3 | ✅ |
| `meeting` | ✅ | ✅ | ✅ 3 | ✅ |
| `presentation` | ✅ | ✅ | ✅ 3 | ✅ |
| `client` | ❌ | ❌ | ❌ | ❌ |
| `csuite` | ❌ | ❌ | ❌ | ❌ |
| `self-intro` | ❌ | ❌ | ❌ | ❌ |

---

*v1.6 — 2026-04-30*
*Cambios: §15 actualizado a Beta v14.1 · Lessons Library 50 lecciones dual-axis · DeepDiveCard + RecommendedLessonsCard · LessonModal audio player · TTS optimization (OpenAI primary, ElevenLabs fallback) · War Room 5/month limit*