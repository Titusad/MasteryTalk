# inFluentia PRO - Criterios de Aceptacion (QA Guide v5.0)

> Guia de validacion por fases de implementacion.
> Cada fase es auto-contenida y testeable de forma independiente.
> Referencia cruzada: `MASTER_BLUEPRINT.md` v6.0, `PDR_SCREEN_BY_SCREEN.md` v6.0
> Actualizado: 4 marzo 2026 — Prototipo funcional con mock data, i18n ES/PT/EN, paywall system (3 triggers).

---

## Convenciones

| Etiqueta | Significado |
|---|---|
| **P0** | Bloqueante. Si falla, la fase no puede considerarse completada. |
| **P1** | Critico. Afecta la experiencia core pero tiene workaround temporal. |
| **P2** | Importante. Afecta UX o edge cases pero no bloquea el flujo principal. |
| `[MOCK]` | Test ejecutable con mock adapters (datos hardcodeados). |
| `[REAL]` | Test que requiere servicios de produccion conectados. |
| `[SIM]` | Test ejecutable con `?simulate_errors=true` en la URL. |

---

## Fase 0: Prototipo Mock — COMPLETADA

### Objetivo
Validar que el frontend completo funciona correctamente con los 7 mock adapters.
Estado actual: **prototipo funcional, flujo E2E verificado.**

### Precondiciones
- `services/index.ts` en modo 100% mock (~38 lineas)
- App corriendo en Figma Make preview o `localhost`

---

### 0.1 Compilacion y Smoke Tests

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-00 | App compila sin errores | Build/preview en Figma Make | Sin errores de Vite/TypeScript en consola. La app renderiza. | **P0** |
| F0-00b | ErrorBoundary funciona | Provocar error en componente hijo | ErrorBoundary muestra fallback con error message, NO pantalla blanca. | **P0** |
| F0-01 | Landing Page renderiza | Abrir app (hash vacio) | Landing Page visible con hero, PracticeWidget, pricing, FAQ. Sin pantalla blanca. | **P0** |
| F0-02 | Flujo completo 8 steps | `[MOCK]` 1. Escribir escenario en PracticeWidget 2. Click "Comenzar practica" 3. Completar PracticeSetupModal 4. Auth mock (Google) 5. LanguageTransitionModal 6. StrategyBuilder (3 pillars o skip) 7. Extra Context (skip) 8. Generating Script (loader) 9. Pre-Briefing 10. Voice Practice (Arena) 11. Analyzing Feedback 12. ConversationFeedback 13. Session Report 14. Dashboard | El usuario llega al Dashboard sin errores, crashes, ni pantallas en blanco. | **P0** |

---

### 0.2 Landing Page (Pantalla 1)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-03 | PracticeWidget placeholder rotativo | `[MOCK]` Observar textarea vacio ~15 segundos | Placeholder cambia con efecto typewriter. | **P2** |
| F0-04 | Scenario pills | `[MOCK]` Click en pill "Pitch de ventas" | Textarea se llena con texto de la pill. | **P1** |
| F0-05 | Preview de IA contextual | `[MOCK]` Escribir "reunion de presupuesto" | Preview aparece debajo con rol del interlocutor. | **P1** |
| F0-06 | Header nav links | `[MOCK]` Click en "Como funciona", "Beneficios", "Precio" | Smooth scroll a cada seccion. | **P2** |
| F0-07 | Pricing section — credit packs | `[MOCK]` Scroll a precios | Free session card + 3 credit pack cards (1/$4.99, 3/$12.99, 5/$19.99). NO monthly/quarterly plans. | **P1** |
| F0-08 | CTAs header | `[MOCK]` Click "Registrarme", luego "Iniciar sesion" | AuthModal se abre en modo correcto (registro vs login). | **P1** |
| F0-08b | Language picker | `[MOCK]` Click language picker ES→PT | Toda la landing cambia a portugues. | **P1** |

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
| F0-14 | Registro Google (mock) | `[MOCK]` Click "Registrarse con Google" | Mock delay (~300ms) > Modal cierra > LanguageTransitionModal aparece. | **P0** |
| F0-15 | Registro LinkedIn (mock) | `[MOCK]` Click "Registrarse con LinkedIn" | Mismo comportamiento que Google. | **P0** |
| F0-16 | Toggle login/registro | `[MOCK]` Toggle entre modos | Titulo y botones cambian sin cerrar modal. | **P1** |
| F0-17 | Cerrar modal (X) | `[MOCK]` Click X o backdrop | Modal cierra, regresa a Landing. | **P1** |
| F0-18 | Login → LanguageTransitionModal → Dashboard | `[MOCK]` AuthModal modo login > Click Google | Mock auth > LanguageTransitionModal > Navega a Dashboard. | **P0** |

---

### 0.4b Language Transition Modal (nuevo)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-18b | Modal aparece post-auth | `[MOCK]` Completar auth (registro o login) | LanguageTransitionModal se muestra con copy en idioma correcto (ES o PT). | **P1** |
| F0-18c | Click "Let's go" navega | `[MOCK]` Click boton en modal | Modal cierra, navega al destino correcto (PracticeSession o Dashboard). | **P0** |

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
| F0-45 | Continuar a Session Report | `[MOCK]` Click "Continuar" | Transicion a Session Report. | **P0** |

---

### 0.12 Session Report (Pantalla 8 — reemplaza Shadowing + Recap + Mindset)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-46 | Report renderiza | `[MOCK]` Llegar a Session Report | Reporte comprehensivo con scores, phrases, feedback. | **P0** |
| F0-47 | Power phrases visibles | `[MOCK]` Verificar secciones | Frases clave con highlights y tooltips. | **P1** |
| F0-48 | Before/After comparisons | `[MOCK]` Verificar | Comparaciones de mejora visibles. | **P1** |
| F0-49 | Pronunciation notes | `[MOCK]` Verificar | Tips de pronunciacion categorizados. | **P1** |
| F0-50 | Navegar a Dashboard | `[MOCK]` Click "Volver al Dashboard" | Navega a Dashboard (#dashboard). | **P0** |

---

### 0.13 Dashboard (Pantalla 10)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-51 | Dashboard renderiza | `[MOCK]` Llegar a Dashboard | Header, credit balance, historial, CTAs visibles. | **P0** |
| F0-52 | Credit balance display | `[MOCK]` Verificar | Balance de creditos con label correcto. | **P1** |
| F0-53 | Practice history cards | `[MOCK]` Verificar historial | Cards con titulo, fecha, duracion. | **P1** |
| F0-54 | Start session — con creditos | `[MOCK]` Click "Nueva practica" con creditos disponibles | Navega a Landing para nueva practica. | **P0** |
| F0-55 | Start session — sin creditos | `[MOCK]` Click "Nueva practica" sin creditos | CreditUpsellModal se abre. | **P0** |
| F0-56 | CreditUpsellModal | `[MOCK]` Verificar modal | Grid de 3 packs, badges de descuento, boton de checkout. | **P1** |
| F0-57 | CreditUpsellModal — compra simulada | `[MOCK]` Click comprar en modal | Celebracion de confetti, creditos actualizados. | **P1** |
| F0-58 | Logout | `[MOCK]` Click logout | Regresa a Landing, estado limpio. | **P1** |
| F0-59 | "Ver historial" | `[MOCK]` Click | Navega a Practice History. | **P1** |

---

### 0.14 Practice History (Pantalla 10.5)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-60 | Lista de sesiones | `[MOCK]` Navegar a #practice-history | Lista completa de sesiones mock. | **P1** |
| F0-61 | Volver a Dashboard | `[MOCK]` Click "Volver" | Regresa a Dashboard. | **P1** |

---

### 0.15 Hash Navigation

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-62 | Direct navigation | `[MOCK]` Ir a `#dashboard` directo | Dashboard renderiza con datos mock. | **P1** |
| F0-63 | Direct `#practice-session` | `[MOCK]` Ir directo | PracticeSessionPage renderiza (en step strategy). | **P1** |
| F0-64 | Direct `#design-system` | `[MOCK]` Ir directo | DesignSystemPage renderiza. | **P2** |

---

### 0.16 Error Simulation

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-65 | Error simulation activa | `[SIM]` Agregar `?simulate_errors=true` | Errores aleatorios aparecen en service calls. | **P2** |
| F0-66 | ServiceErrorBanner | `[SIM]` Provocar error en conversacion | Banner de error con mensaje en espanol + boton retry. | **P2** |
| F0-67 | Retry funcional | `[SIM]` Click retry en banner | La operacion se reintenta (puede fallar de nuevo por simulacion). | **P2** |
| F0-68 | ErrorBoundary catch | Provocar error de render | ErrorBoundary muestra fallback con stack trace, NO pantalla blanca. | **P1** |

---

### 0.17 Responsive

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-69 | Mobile Landing | `[MOCK]` Viewport 375px | Landing se adapta, hamburger menu funciona. | **P1** |
| F0-70 | Mobile Arena | `[MOCK]` Viewport 375px en Arena | Chat, RecordButton, PhaseIndicator se adaptan. | **P1** |
| F0-71 | Mobile Dashboard | `[MOCK]` Viewport 375px | Dashboard cards se apilan, credit balance visible. | **P2** |

---

### 0.18 i18n (nuevo)

| ID | Test | Pasos | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F0-72 | Landing en Espanol | `[MOCK]` Seleccionar ES | Toda la landing en espanol. | **P1** |
| F0-73 | Landing en Portugues | `[MOCK]` Seleccionar PT | Toda la landing en portugues. | **P1** |
| F0-74 | Auth modal i18n | `[MOCK]` Abrir auth en modo PT | Textos del modal en portugues. | **P1** |
| F0-75 | CreditUpsellModal i18n | `[MOCK]` Abrir modal en modo PT | Textos y labels en portugues. | **P2** |
| F0-76 | Persistencia de idioma | `[MOCK]` Seleccionar PT > Recargar pagina | Idioma se mantiene en PT (localStorage). | **P2** |

---

**Total Fase 0: 77 tests (F0-00 a F0-76)**

---

## Fase 1: Auth Real (Supabase)

### Precondiciones
- Fase 0 completada (prototipo funciona con mocks)
- Supabase configurado con Google + LinkedIn OAuth
- `FASE1_MIGRATION.sql` ejecutado
- env vars configurados → auto-detect activa auth real

| ID | Test | Tipo | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F1-01 | Google Sign-In real | `[REAL]` | OAuth redirect → callback → usuario creado en `auth.users` + `profiles` | **P0** |
| F1-02 | LinkedIn Sign-In real | `[REAL]` | Mismo que F1-01 con LinkedIn OIDC | **P0** |
| F1-03 | Profile auto-created | `[REAL]` | Trigger `handle_new_user` crea row en `profiles` | **P0** |
| F1-04 | RLS: user solo ve su data | `[REAL]` | Query cross-user retorna 0 rows | **P0** |
| F1-05 | Auth persistence | `[REAL]` | Refresh page → usuario sigue logueado | **P1** |
| F1-06 | Sign-out | `[REAL]` | Logout → session destroyed → Landing | **P1** |
| F1-07 | onAuthStateChanged — prevAuthUserRef | `[REAL]` | Callback fires en login/logout, no race condition con OAuth redirect | **P0** |
| F1-08 | Hybrid mode | `[REAL]` | Auth real + conversation/feedback/speech mock → flujo completo sin crashes | **P0** |
| F1-09 | Fallback to mock | `[REAL]` | Sin env vars → auto-detect → mock auth (try-catch en createAuthService) | **P1** |
| F1-10 | Regression F0 | `[REAL]` | Todos los F0-xx siguen pasando con auth real | **P0** |

**Total Fase 1: 10 tests nuevos + 77 regression = 87 tests**

---

## Fase 2: Conversation Engine (GPT-4o + ElevenLabs)

| ID | Test | Tipo | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F2-01 | prepareSession real | `[REAL]` | Edge Function crea session, retorna systemPrompt + firstMessage | **P0** |
| F2-02 | processTurn real | `[REAL]` | GPT-4o response, coherent with context | **P0** |
| F2-03 | isComplete override | `[REAL]` | `false` si turn < 4, `true` si turn >= 8 | **P0** |
| F2-04 | internalAnalysis filtered | `[REAL]` | Guardado en DB pero NO enviado al frontend | **P0** |
| F2-05 | JSON resilience | `[REAL]` | Malformed JSON → retry 1x → fallback message | **P1** |
| F2-06 | GPT-4o vs 4o-mini | `[REAL]` | Free → mini, Paid (creditos) → 4o | **P1** |
| F2-07 | ElevenLabs TTS | `[REAL]` | Audio plays for AI responses | **P1** |
| F2-08 | R2 audio cache | `[REAL]` | Second play → cache hit (no ElevenLabs call) | **P2** |
| F2-09 | Audit log written | `[REAL]` | Row in audit_logs with tokens, latency, cost | **P1** |
| F2-10 | Regression F0+F1 | `[REAL]` | All previous tests pass | **P0** |

**Total Fase 2: 10 tests nuevos + 87 regression = 97 tests**

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
| F3-07 | E2E: Conv → Feedback → Session Report | `[REAL]` | Full flow with real services | **P0** |
| F3-08 | Regression F0-F2 | `[REAL]` | All previous tests pass | **P0** |

**Total Fase 3: 8 tests nuevos + 97 regression = 105 tests**

---

## Fase 4: User Data + Payments (Credit Packs)

| ID | Test | Tipo | Resultado Esperado | Prioridad |
|---|---|---|---|---|
| F4-01 | getPracticeHistory real | `[REAL]` | Real session data from DB | **P0** |
| F4-02 | getPowerPhrases real | `[REAL]` | Power phrases from DB | **P1** |
| F4-03 | canStartSession: free | `[REAL]` | Allowed first session, blocked after (no credits) | **P0** |
| F4-04 | canStartSession: with credits | `[REAL]` | Allowed when credits > 0 | **P0** |
| F4-05 | createCheckout — credit pack | `[REAL]` | Mercado Pago sandbox checkout URL for CreditPack | **P0** |
| F4-06 | Webhook confirms payment | `[REAL]` | Credits added to credit_balances after webhook | **P0** |
| F4-07 | PAYMENT_PENDING flow | `[REAL]` | OXXO/Efecty → pending state → eventual credit addition | **P1** |
| F4-08 | CREDITS_EXHAUSTED error | `[REAL]` | CreditUpsellModal appears when no credits | **P0** |
| F4-09 | SR getTodayCards real | `[REAL]` | Cards sorted by priority from DB | **P1** |
| F4-10 | SR submitAttempt real | `[REAL]` | Score + interval progression in DB | **P1** |
| F4-11 | Regression F0-F3 | `[REAL]` | All previous tests pass | **P0** |

**Total Fase 4: 11 tests nuevos + 105 regression = 116 tests**

---

## Resumen de tests por fase

| Fase | Tests nuevos | Regression | Total acumulado |
|------|-------------|------------|-----------------|
| Fase 0 (Mock) | 77 | — | 77 |
| Fase 1 (Auth) | 10 | 77 | 87 |
| Fase 2 (Conversation) | 10 | 87 | 97 |
| Fase 3 (Feedback+Speech) | 8 | 97 | 105 |
| Fase 4 (User+Credits) | 11 | 105 | 116 |