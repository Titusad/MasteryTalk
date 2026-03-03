# inFluentia PRO - Criterios de Aceptacion (QA Guide v3.0)

> Guia de validacion por fases de implementacion.
> Cada fase es auto-contenida y testeable de forma independiente.
> Referencia cruzada: `MASTER_BLUEPRINT.md` v4.1, `PDR_SCREEN_BY_SCREEN.md` v4.1
> Actualizado: 26 febrero 2026 — Refleja el flujo de 11 steps y el estado real del codigo.

---

## Convenciones

| Etiqueta | Significado |
|---|---|
| **P0** | Bloqueante. Si falla, la fase no puede considerarse completada. |
| **P1** | Critico. Afecta la experiencia core pero tiene workaround temporal. |
| **P2** | Importante. Afecta UX o edge cases pero no bloquea el flujo principal. |
| `[MOCK]` | Test ejecutable con `USE_MOCK = true` (datos hardcodeados). |
| `[REAL]` | Test que requiere servicios de produccion conectados. |
| `[SIM]` | Test ejecutable con `?simulate_errors=true` en la URL. |

---

## Fase 0: Prototipo Mock (`USE_MOCK = true`)

### Objetivo
Validar que el frontend completo funciona correctamente con los 7 mock adapters.
Estado actual: **codigo escrito, pendiente primera compilacion y testing.**

### Precondiciones
- `USE_MOCK = true` en `/src/services/index.ts` (ya esta forzado)
- `RESET_PROTOTYPE = true` en `/src/app/App.tsx` (ya esta activo)
- App corriendo en Figma Make preview o `localhost`

---

### 0.1 Compilacion y Smoke Tests

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-00 | App compila sin errores | Build/preview en Figma Make | Sin errores de Vite/TypeScript en consola. La app renderiza. | **P0** |
| F0-01 | Landing Page renderiza | Abrir app (hash vacio) | Landing Page visible con hero, PracticeWidget, pricing, FAQ. Sin pantalla blanca. | **P0** |
| F0-02 | Flujo completo 11 steps | `[MOCK]` 1. Escribir escenario en PracticeWidget 2. Click "Comenzar practica" 3. Completar PracticeSetupModal 4. Auth mock (Google) 5. StrategyBuilder (3 pillars o skip) 6. Extra Context (skip) 7. Generating Script (loader) 8. Pre-Briefing 9. Voice Practice (Arena) 10. Analyzing Feedback 11. ConversationFeedback 12. Shadowing 13. Analyzing Results 14. Session Recap 15. Mindset (o skip) 16. Dashboard | El usuario llega al Dashboard sin errores, crashes, ni pantallas en blanco. | **P0** |

---

### 0.2 Landing Page (Pantalla 1)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-03 | PracticeWidget placeholder rotativo | `[MOCK]` Observar textarea vacio ~15 segundos | Placeholder cambia con efecto typewriter. | **P2** |
| F0-04 | Scenario pills | `[MOCK]` Click en pill "Pitch de ventas" | Textarea se llena con texto de la pill. | **P1** |
| F0-05 | Preview de IA contextual | `[MOCK]` Escribir "reunion de presupuesto" | Preview aparece debajo con rol del interlocutor. | **P1** |
| F0-06 | Header nav links | `[MOCK]` Click en "Como funciona", "Beneficios", "Precio" | Smooth scroll a cada seccion. | **P2** |
| F0-07 | Pricing cards (4 planes) | `[MOCK]` Scroll a precios | 4 cards: Free ($0), Per-session ($4.99), Mensual ($19.99 destacada), Quarterly ($44.99). | **P1** |
| F0-08 | CTAs header | `[MOCK]` Click "Registrarme", luego "Iniciar sesion" | AuthModal se abre en modo correcto (registro vs login). | **P1** |

---

### 0.3 PracticeSetupModal

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-09 | Modal se abre inline | `[MOCK]` Escribir escenario > Click "Comenzar practica" | PracticeSetupModal se abre con progress bar al 33% (Endowed Progress). | **P0** |
| F0-10 | Scenario type selection | `[MOCK]` Seleccionar "Sales Pitch" | Scenario type queda seleccionado, progress avanza. | **P1** |
| F0-11 | Interlocutor selection | `[MOCK]` Seleccionar interlocutor | Interlocutor queda seleccionado. | **P1** |
| F0-12 | Guided fields por scenario | `[MOCK]` Seleccionar diferentes scenario types | Los campos guiados cambian segun el tipo (ej: STAR fields para interview). | **P1** |
| F0-13 | Loss aversion copy | `[MOCK]` Llegar al ultimo step del modal | Texto motivacional de loss aversion visible. | **P2** |

---

### 0.4 Auth Modal (Pantalla 2)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-14 | Registro Google (mock) | `[MOCK]` Click "Registrarse con Google" | Mock delay (~1s) > Modal cierra > Navega a PracticeSessionPage. | **P0** |
| F0-15 | Registro LinkedIn (mock) | `[MOCK]` Click "Registrarse con LinkedIn" | Mismo comportamiento que Google. | **P0** |
| F0-16 | Toggle login/registro | `[MOCK]` Toggle entre modos | Titulo y botones cambian sin cerrar modal. | **P1** |
| F0-17 | Cerrar modal (X) | `[MOCK]` Click X o backdrop | Modal cierra, regresa a Landing. | **P1** |
| F0-18 | Login → Dashboard | `[MOCK]` AuthModal modo login > Click Google | Mock auth > Navega a Dashboard (no a PracticeSession). | **P0** |

---

### 0.5 Strategy Builder (Pantalla 4a)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-19 | Stepper horizontal visible | `[MOCK]` Llegar a Strategy Builder | 3 pasos en stepper, paso 1 activo. | **P1** |
| F0-20 | Coach questions por scenario | `[MOCK]` Verificar con "sales" y luego "interview" | Preguntas diferentes por scenario type. | **P1** |
| F0-21 | Framework tooltips | `[MOCK]` Hover/click en tooltip de framework | STAR (interview), BATNA (negotiation), SPIN/MEDDIC (sales) visibles. | **P2** |
| F0-22 | Skip Strategy | `[MOCK]` Click "Skip" | Avanza a Extra Context sin pillars. | **P1** |
| F0-23 | Complete 3 pillars | `[MOCK]` Llenar los 3 pilares y completar | Stepper muestra 3/3, boton "Continue to Practice". | **P0** |

---

### 0.6 Extra Context (Pantalla 4b)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-24 | Screen renderiza | `[MOCK]` Llegar a Extra Context | Tabs de Escribir/URL/Archivo visibles. | **P1** |
| F0-25 | Skip funciona | `[MOCK]` Click "Saltar" | Avanza a Generating Script loader. | **P0** |

---

### 0.7 Generating Script Loader (Pantalla 4c)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-26 | Loader renderiza y completa | `[MOCK]` Llegar al loader | Animacion de analisis, mindset content, transicion automatica a Pre-Briefing. | **P0** |
| F0-27 | prepareSession ejecuta | `[MOCK]` Console log | `[MockConversation] Session prepared` visible en console. | **P1** |

---

### 0.8 Pre-Briefing (Pantalla 4d)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-28 | Cheat sheet visible | `[MOCK]` Llegar a Pre-Briefing | Resumen de estrategia y tips visibles. | **P1** |
| F0-29 | Cultural coaching card | `[MOCK]` Verificar cultural tips | Card con tips culturales relevantes al scenario. | **P2** |
| F0-30 | Before/After examples | `[MOCK]` Verificar comparaciones | Al menos 1 ejemplo before/after visible. | **P2** |
| F0-31 | Continuar a Arena | `[MOCK]` Click "Comenzar practica" | Transicion a Voice Practice (Arena). | **P0** |

---

### 0.9 Voice Practice — Arena (Pantalla 5)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-32 | Primer mensaje IA aparece | `[MOCK]` Entrar a Arena | Burbuja de chat con primer mensaje del interlocutor. | **P0** |
| F0-33 | PhaseIndicator visible | `[MOCK]` Verificar UI | Badge "Support" visible al inicio. | **P1** |
| F0-34 | Boton de grabar funcional | `[MOCK]` Click RecordButton | Inicia grabacion (simulada), WaveformBars y Timer aparecen. | **P0** |
| F0-35 | Transcripcion mock | `[MOCK]` Completar grabacion | Texto de usuario aparece en chat (mock transcription). | **P0** |
| F0-36 | Respuesta IA | `[MOCK]` Despues de transcripcion | AI typing indicator → burbuja de respuesta IA. | **P0** |
| F0-37 | Phase transition | `[MOCK]` Interactuar 2+ veces | PhaseTransitionToast aparece, badge cambia a "Guidance". | **P1** |
| F0-38 | Power Phrases (Support) | `[MOCK]` En fase Support | Power Phrases visibles y clickeables. | **P1** |
| F0-39 | TrySayingHint (Support) | `[MOCK]` En fase Support | Hint de "Try saying..." visible. | **P2** |
| F0-40 | Conversacion completa | `[MOCK]` Interactuar hasta isComplete | Conversacion termina, transicion a Analyzing Feedback. | **P0** |

---

### 0.10 Analyzing Feedback Loader (Pantalla 6)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-41 | Loader renderiza | `[MOCK]` Llegar al loader | Animacion + mindset content + auto-transicion. | **P0** |

---

### 0.11 Conversation Feedback (Pantalla 7)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-42 | Strengths cards | `[MOCK]` Llegar a Feedback | Al menos 2 strength cards con titulo y descripcion. | **P1** |
| F0-43 | Opportunities cards | `[MOCK]` Verificar opportunities | Cards con tag de categoria (ej: "Negotiation technique"). | **P1** |
| F0-44 | Script mejorado | `[MOCK]` Scroll al script | Secciones numeradas con highlights de color. | **P1** |
| F0-45 | Continuar a Shadowing | `[MOCK]` Click "Continuar" | Transicion a Shadowing Practice. | **P0** |

---

### 0.12 Shadowing Practice (Pantalla 8)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-46 | Primera frase renderiza | `[MOCK]` Llegar a Shadowing | Frase con stress markers (negritas) visible. | **P0** |
| F0-47 | Play model audio | `[MOCK]` Click play | Simulacion de audio (delay basado en text length). | **P1** |
| F0-48 | Record attempt | `[MOCK]` Grabar respuesta | Score aparece con AccuracyRing. | **P0** |
| F0-49 | Three-band scoring visual | `[MOCK]` Ver scores | < 80 = rojo (retry), 80-84 = amarillo (pass), >= 85 = verde (mastery). | **P1** |
| F0-50 | Retry on fail | `[MOCK]` Score < 80 | Opcion de retry visible. Max 3 attempts. | **P1** |
| F0-51 | Advance on pass | `[MOCK]` Score >= 80 | Siguiente frase o completar shadowing. | **P0** |
| F0-52 | Word feedback | `[MOCK]` Ver feedback | Word + phonetic + tip visibles. | **P1** |
| F0-53 | Complete shadowing | `[MOCK]` Terminar 3 frases | Transicion a Analyzing Results. | **P0** |

---

### 0.13 Analyzing Results Loader (Pantalla 9a)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-54 | Loader renderiza | `[MOCK]` Llegar al loader | Animacion + mindset + auto-transicion a Session Recap. | **P0** |

---

### 0.14 Session Recap (Pantalla 9b)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-55 | Results summary | `[MOCK]` Llegar a Recap | totalPhrases, totalTime, overallSentiment visibles. | **P1** |
| F0-56 | Pronunciation notes | `[MOCK]` Verificar notas | Tips categorizados (Claridad, Ritmo, Entonacion). | **P1** |
| F0-57 | Improvement areas | `[MOCK]` Verificar areas | 3 areas personalizadas visibles. | **P1** |
| F0-58 | Completed phrases cards | `[MOCK]` Verificar cards | Cards con phrase, highlight word, phonetic. | **P1** |
| F0-59 | Cheat sheet colapsable | `[MOCK]` Toggle cheat sheet | Seccion se expande/colapsa con script generado. | **P2** |
| F0-60 | Download cheat sheet | `[MOCK]` Click download | Archivo de texto se genera/descarga. | **P2** |
| F0-61 | SR cards notification | `[MOCK]` Verificar | Indica cuantas SR cards se crearon. | **P2** |
| F0-62 | Continuar a Mindset | `[MOCK]` Click continuar | Transicion a MindsetPulse. | **P0** |

---

### 0.15 Mindset (Pantalla 9c)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-63 | 3 fases del cuestionario | `[MOCK]` Completar las 3 fases | Confidence (1-5), Biggest Fear (text), Self-Assessment (1-5). | **P1** |
| F0-64 | Coaching response | `[MOCK]` Completar cuestionario | MindsetCoachCard aparece con coaching personalizado. | **P1** |
| F0-65 | Skip mindset | `[MOCK]` Click "Saltar" | Navega directo a Dashboard. | **P1** |
| F0-66 | Continuar a Dashboard | `[MOCK]` Click "Continuar" | Navega a Dashboard. | **P0** |

---

### 0.16 Dashboard (Pantalla 10)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-67 | Dashboard renderiza | `[MOCK]` Llegar a Dashboard | Header, gauges, historial, widgets visibles. | **P0** |
| F0-68 | 3 dimensiones con gauges | `[MOCK]` Verificar SVG gauges | Comunicacion, Pronunciacion, Mentalidad con datos mock. | **P1** |
| F0-69 | ProfileCompletionBanner | `[MOCK]` Si perfil incompleto | Banner pide completar industry/position/seniority. | **P2** |
| F0-70 | Practice history cards | `[MOCK]` Verificar historial | Cards con titulo, fecha, duracion, before/after highlight. | **P1** |
| F0-71 | SR widget | `[MOCK]` Verificar SR cards | Today's cards con boton de practica. | **P1** |
| F0-72 | "Nueva practica" | `[MOCK]` Click CTA | Navega a Landing. | **P1** |
| F0-73 | "Ver historial" | `[MOCK]` Click | Navega a Practice History. | **P1** |
| F0-74 | Logout | `[MOCK]` Click logout | Regresa a Landing, estado limpio. | **P1** |

---

### 0.17 Practice History (Pantalla 10.5)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-75 | Lista de sesiones | `[MOCK]` Navegar a #practice-history | Lista completa de sesiones mock. | **P1** |
| F0-76 | Volver a Dashboard | `[MOCK]` Click "Volver" | Regresa a Dashboard. | **P1** |

---

### 0.18 Hash Navigation

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-77 | Direct navigation | `[MOCK]` Ir a `#dashboard` directo | Dashboard renderiza con datos mock. | **P1** |
| F0-78 | Direct `#practice-session` | `[MOCK]` Ir directo | PracticeSessionPage renderiza (en step strategy). | **P1** |
| F0-79 | Direct `#design-system` | `[MOCK]` Ir directo | DesignSystemPage renderiza. | **P2** |

---

### 0.19 Error Simulation

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-80 | Error simulation activa | `[SIM]` Agregar `?simulate_errors=true` | Errores aleatorios aparecen en service calls. | **P2** |
| F0-81 | ServiceErrorBanner | `[SIM]` Provocar error en conversacion | Banner de error con mensaje en espanol + boton retry. | **P2** |
| F0-82 | Retry funcional | `[SIM]` Click retry en banner | La operacion se reintenta (puede fallar de nuevo por simulacion). | **P2** |

---

### 0.20 Responsive

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-83 | Mobile Landing | `[MOCK]` Viewport 375px | Landing se adapta, hamburger menu funciona. | **P1** |
| F0-84 | Mobile Arena | `[MOCK]` Viewport 375px en Arena | Chat, RecordButton, PhaseIndicator se adaptan. | **P1** |
| F0-85 | Mobile Dashboard | `[MOCK]` Viewport 375px | Dashboard cards se apilan, gauges visibles. | **P2** |

---

**Total Fase 0: 86 tests (F0-00 a F0-85)**

---

## Fase 1: Auth Real (Supabase)

### Precondiciones
- Fase 0 completada (prototipo funciona con mocks)
- Supabase configurado con Google + LinkedIn OAuth
- `FASE1_MIGRATION.sql` ejecutado
- `USE_MOCK = false` (o auto-detect con env vars)

| ID | Test | Tipo | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F1-01 | Google Sign-In real | `[REAL]` | OAuth redirect → callback → usuario creado en `auth.users` + `profiles` | **P0** |
| F1-02 | LinkedIn Sign-In real | `[REAL]` | Mismo que F1-01 con LinkedIn OIDC | **P0** |
| F1-03 | Profile auto-created | `[REAL]` | Trigger `handle_new_user` crea row en `profiles` | **P0** |
| F1-04 | RLS: user solo ve su data | `[REAL]` | Query cross-user retorna 0 rows | **P0** |
| F1-05 | Auth persistence | `[REAL]` | Refresh page → usuario sigue logueado | **P1** |
| F1-06 | Sign-out | `[REAL]` | Logout → session destroyed → Landing | **P1** |
| F1-07 | onAuthStateChanged | `[REAL]` | Callback fires en login/logout | **P0** |
| F1-08 | Hybrid mode | `[REAL]` | Auth real + conversation/feedback/speech mock → flujo completo sin crashes | **P0** |
| F1-09 | Fallback to mock | `[REAL]` | Sin env vars → auto-detect → mock auth | **P1** |
| F1-10 | Regression F0 | `[REAL]` | Todos los F0-xx siguen pasando con auth real | **P0** |

**Total Fase 1: 10 tests nuevos + 86 regression = 96 tests**

---

## Fase 2: Conversation Engine (GPT-4o + ElevenLabs)

| ID | Test | Tipo | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F2-01 | prepareSession real | `[REAL]` | Edge Function crea session, retorna systemPrompt + firstMessage | **P0** |
| F2-02 | processTurn real | `[REAL]` | GPT-4o response, coherent with context | **P0** |
| F2-03 | isComplete override | `[REAL]` | `false` si turn < 4, `true` si turn >= 8 | **P0** |
| F2-04 | internalAnalysis filtered | `[REAL]` | Guardado en DB pero NO enviado al frontend | **P0** |
| F2-05 | JSON resilience | `[REAL]` | Malformed JSON → retry 1x → fallback message | **P1** |
| F2-06 | GPT-4o vs 4o-mini | `[REAL]` | Free → mini, Paid → 4o | **P1** |
| F2-07 | ElevenLabs TTS | `[REAL]` | Audio plays for AI responses | **P1** |
| F2-08 | R2 audio cache | `[REAL]` | Second play → cache hit (no ElevenLabs call) | **P2** |
| F2-09 | Audit log written | `[REAL]` | Row in audit_logs with tokens, latency, cost | **P1** |
| F2-10 | Regression F0+F1 | `[REAL]` | All previous tests pass | **P0** |

**Total Fase 2: 10 tests nuevos + 96 regression = 106 tests**

---

## Fase 3: Feedback + Pronunciation (Gemini + Azure)

| ID | Test | Tipo | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F3-01 | analyzeFeedback real | `[REAL]` | Gemini generates relevant strengths + opportunities | **P0** |
| F3-02 | generateImprovedScript real | `[REAL]` | Script sections with highlights generated | **P0** |
| F3-03 | scorePronunciation real | `[REAL]` | Azure Speech returns score + word feedback | **P0** |
| F3-04 | transcribe real | `[REAL]` | Azure STT returns accurate transcription | **P0** |
| F3-05 | generateResultsSummary | `[REAL]` | Pronunciation notes + improvement areas | **P1** |
| F3-06 | SR cards auto-created | `[REAL]` | Phrases with score < 85 → new SR cards | **P1** |
| F3-07 | E2E: Conv → Feedback → Shadowing → Recap | `[REAL]` | Full flow with real services | **P0** |
| F3-08 | Regression F0-F2 | `[REAL]` | All previous tests pass | **P0** |

**Total Fase 3: 8 tests nuevos + 106 regression = 114 tests**

---

## Fase 4: User Data + Payments

| ID | Test | Tipo | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F4-01 | getPracticeHistory real | `[REAL]` | Real session data from DB | **P0** |
| F4-02 | getPowerPhrases real | `[REAL]` | Power phrases from DB | **P1** |
| F4-03 | canStartSession: free | `[REAL]` | Allowed first session, blocked after | **P0** |
| F4-04 | canStartSession: paid | `[REAL]` | Always allowed for paid plans | **P0** |
| F4-05 | createCheckout | `[REAL]` | Mercado Pago sandbox checkout URL | **P0** |
| F4-06 | Webhook confirms payment | `[REAL]` | Plan updated in profiles after webhook | **P0** |
| F4-07 | PAYMENT_PENDING flow | `[REAL]` | OXXO/Efecty → pending state → eventual confirmation | **P1** |
| F4-08 | SR getTodayCards real | `[REAL]` | Cards sorted by priority from DB | **P1** |
| F4-09 | SR submitAttempt real | `[REAL]` | Score + interval progression in DB | **P1** |
| F4-10 | Regression F0-F3 | `[REAL]` | All previous tests pass | **P0** |

**Total Fase 4: 10 tests nuevos + 114 regression = 124 tests**

---

## Resumen de tests por fase

| Fase | Tests nuevos | Regression | Total acumulado |
|------|-------------|------------|-----------------|
| Fase 0 (Mock) | 86 | — | 86 |
| Fase 1 (Auth) | 10 | 86 | 96 |
| Fase 2 (Conversation) | 10 | 96 | 106 |
| Fase 3 (Feedback+Speech) | 8 | 106 | 114 |
| Fase 4 (User+Payments) | 10 | 114 | 124 |
