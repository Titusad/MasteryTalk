# MasteryTalk PRO — User Journey Map

> **Propósito:** Mapear cada punto de interacción del usuario con el producto —
> lo que piensa, siente, y cómo el sistema interviene — para identificar
> oportunidades de mejora alineadas con la **formación del hábito de uso**.
>
> **Audiencia:** Producto, diseño, growth.
> **Actualizado:** 2026-05-10 (Beta v14.9)

---

## Cómo leer este documento

Cada touchpoint tiene seis dimensiones:

| Dimensión | Definición |
|-----------|-----------|
| **Acción** | Qué está haciendo físicamente el usuario |
| **Pensando** | Su voz interna: dudas, expectativas, objeciones |
| **Siente** (real) | Estado emocional predominante en ese momento |
| **Queremos que sienta** | Estado emocional objetivo que construye el hábito |
| **Sistema interviene** | Elementos del producto que generan la experiencia |
| **Oportunidad** | Brecha entre lo real y lo objetivo; acción concreta de mejora |

Los touchpoints están agrupados en **5 fases** del arco del usuario.

---

## Mapa de fases

```
Fase 0 — Descubrimiento     → Landing Page
Fase 1 — Primera sesión     → Onboarding (2 pasos) → Warm-Up → Feedback
Fase 2 — Decisión           → Upsell → Pago → Confirmación
Fase 3 — Primera sesión paga → Dashboard → Sesión completa → Feedback
Fase 4 — Retención / Hábito → Dashboard recurrente → WhatsApp SR → Emails
Fase 5 — Riesgo de churn    → Nudge de inactividad → Renovación
```

---

## FASE 0 — Descubrimiento

### TP-00 · Landing Page (primer contacto)

**Contexto:** El usuario llega desde un anuncio, recomendación o búsqueda. Posiblemente es la primera vez que escucha de MasteryTalk PRO.

| | |
|---|---|
| **Acción** | Scrollea la landing page. Observa el hero, las secciones, el widget de práctica. |
| **Pensando** | "¿Es esto para mí? ¿Otro app de inglés más? ¿Funciona de verdad? ¿Cuánto cuesta?" |
| **Siente** | Escepticismo mezclado con esperanza. Lleva tiempo queriendo mejorar su inglés. |
| **Queremos que sienta** | Reconocimiento: *"Esto habla de mi situación exacta."* Urgencia de probarlo. |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Hero headline | Texto estático (i18n ES/PT/EN) | Propuesta de valor directa en el idioma del usuario |
| How It Works Tabs | Texto estático + mockup animado | 3 pasos con preview de radar chart real de la app |
| Before & After | Texto estático | Contraste antes/después de la habilidad de comunicación |
| Practice Widget | UI interactiva | Cards de escenario seleccionables; CTA "Probar gratis" |
| Pricing section | Texto estático + datos en vivo | 2 tiers (Monthly / Quarterly); launch pricing auto-aplicado; slots restantes via `/pricing` |
| FAQ accordion | Texto estático + animación `motion/react` | 5 preguntas con apertura animada |
| DotPattern backgrounds | Decoración | Textura visual que diferencia secciones |

**Oportunidad:** La landing muestra el producto pero no muestra al usuario *en su situación*. El copy es profesional pero genérico. Oportunidad: incluir un "momento de reconocimiento" explícito en el hero — una frase que nombre exactamente el dolor ("You speak English, but you freeze when it matters") antes de ofrecer la solución.

---

### TP-01 · CTA → PracticeWidget (intención de probar)

**Contexto:** El usuario decide hacer clic en "Probar gratis" o en una tarjeta de escenario.

| | |
|---|---|
| **Acción** | Selecciona un escenario en el widget (interview, sales, etc.) y hace clic en el CTA. |
| **Pensando** | "Esto es gratis, ¿no? ¿Me pedirán la tarjeta de crédito?" |
| **Siente** | Curiosidad moderada. Ligera tensión por no saber qué sigue. |
| **Queremos que sienta** | Alivio: *"Es una app real, no un formulario de leads."* Momentum. |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Scenario cards | UI interactiva | 3 escenarios con icono Lucide + descripción corta |
| CTA button | Texto estático + animación `motion/react` | "Probar gratis" — dispara Auth Modal |
| AuthModal | Modal animado (AppModal) | scale 0.92→1, `duration 0.5s` — aparece inmediatamente |

**Oportunidad:** El usuario no sabe qué ocurre *después* de hacer clic. Un microcopy bajo el CTA ("Sin tarjeta de crédito. Solo Google.") eliminaría el 80% de la fricción cognitiva antes de que el modal aparezca.

---

## FASE 1 — Primera sesión (Warm-Up gratuito)

### TP-02 · Auth Modal (registro con Google)

**Contexto:** Primera vez que el usuario debe comprometerse con una cuenta.

| | |
|---|---|
| **Acción** | Lee el modal de auth. Hace clic en "Continuar con Google". Autoriza OAuth. |
| **Pensando** | "¿Por qué necesitan mi cuenta de Google? ¿Me van a spamear? ¿Es seguro?" |
| **Siente** | Fricción cognitiva. Evalúa si vale la pena el paso. |
| **Queremos que sienta** | Confianza instantánea. *"Solo un clic y entro."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| AuthModal | Modal animado (AppModal) | BrandLogo visible; copy contextual según authMode (`registro` vs `login`) |
| Google OAuth | Auth externa (Supabase) | Un clic; redirección en 1-2s |
| Popup de Google | UI del SO | Muestra "MasteryTalk PRO" con logo (configurado en Google Cloud Console) |
| Welcome email | Email transaccional (Resend) | Se dispara en `ensure-profile` — llega en minutos |

**Oportunidad:** El modal de auth no refuerza el "por qué" en el momento de fricción. Un headline como *"One click to start your first free session"* dentro del modal reduciría el abandono. La confirmación por email llega después — no ayuda con la fricción en tiempo real.

---

### TP-03 · IntroductionScreen (briefing del nivel + check-in inicial)

**Contexto:** Primera pantalla dentro de la sesión. El usuario ya está autenticado. Para path sessions (no self-intro), esta pantalla incluye el check-in de foco y confianza antes de avanzar.

| | |
|---|---|
| **Acción** | Lee el greeting y el introHeadline del nivel. Ve los 3 pasos. Selecciona su focus area (opcional) y reporta su nivel de confianza (1-5, requerido). Hace clic en "Let's Go" (bloqueado hasta seleccionar confianza). |
| **Pensando** | "¿Qué voy a hacer exactamente? ¿Cuánto tiempo tarda? ¿Cómo me siento hoy?" |
| **Siente** | Anticipación nerviosa. Ligera sorpresa positiva al ser preguntado sobre su estado de ánimo. |
| **Queremos que sienta** | Seguridad de saber exactamente qué sigue. Agency sobre la sesión. *"Esto se adapta a cómo llego hoy."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Greeting personalizado | Texto dinámico (Supabase `getUser`) | "Hey [first name]" — nombre real del usuario |
| Headline con habilidad | Texto estático + acento indigo | `introHeadline` del nivel — nombra exactamente qué se va a dominar |
| 3 Steps cards | Texto estático + animación escalonada | Revelado progresivo: Set the Scene → Strategize → Live Practice |
| Focus area selector | UI interactiva | 6 pillar chips (Vocabulary / Grammar / Fluency / Pronunciation / Professional Tone / Persuasion); opcional |
| Confidence check-in | UI interactiva | Escala 1–5 (Nervous → Confident); **requerido** para activar CTA |
| CTA "Let's Go" (gateado) | Botón animado | Deshabilitado hasta que `confidenceScore !== null`; activa con color al seleccionar |
| Narración de audio | TTS estático (ElevenLabs) | `useNarration` — se reproduce al montar (solo path sessions) |
| Scenario pill | UI estática | Etiqueta "Interview · Level 1: Phone Screen" — contextualiza |

> **Nota:** Para self-intro warm-up, la pantalla usa `minimal={true}` — no muestra focus/confidence, solo el greeting y los 3 steps.

**Oportunidad:** Los campos de focus/confidence no tienen feedback visible de que el AI los usa. Una micro-confirmación post-selección ("Got it — I'll prioritize your Fluency coaching today") antes del CTA reforzaría la causalidad percibida.

---

### TP-04 · SelfIntroContextScreen (elección de setting)

**Contexto:** El usuario elige el contexto en el que se va a presentar (Networking, Team Intro, Client Meeting).

| | |
|---|---|
| **Acción** | Lee las 3 cards de contexto. Selecciona una. Hace clic en "Continue". |
| **Pensando** | "¿Cuál es el más útil para mí ahora mismo?" |
| **Siente** | Ligera emoción de personalización. *"Esto se está adaptando a mí."* |
| **Queremos que sienta** | Agency y relevancia inmediata. El producto es *sobre su situación*. |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| 3 context cards | UI interactiva + animación escalonada (`delay 0.1 + i*0.08`) | Networking / Team / Client con icono Lucide en círculo oscuro |
| Selected state | Animación `spring stiffness 500` | Checkmark aparece con rebote natural |
| CTA disabled state | Texto estático | Botón gris hasta selección; activa con color |
| Copy adaptativo | Texto estático | "Pick the setting — I'll adapt the conversation and feedback to match" |

**Oportunidad:** Las 3 opciones son cortas pero no comunican el *valor diferencial* de cada setting. Un usuario nuevo no sabe si "Networking" es más difícil que "Team Intro". Agregar una etiqueta de dificultad/presión (e.g., "Más desafiante") o una micro-descripción del tipo de interlocutor que tendrán en cada contexto aumentaría la calidad de la elección.

---

### TP-05 · StrategyScreen (metodología + vocabulario de pronunciación)

**Contexto:** Aparece inmediatamente después del IntroductionScreen — ANTES de que el usuario añada su contexto (job description). El usuario aprende el framework primero, luego lo contextualiza.

| | |
|---|---|
| **Acción** | Lee el framework y el ejemplo bad/good. Practica los términos de vocabulario (escucha + graba + recibe score). Hace clic en "I'm Ready" o "Skip". |
| **Pensando** | "¿Esto me va a servir? ¿Estos términos los voy a usar en la práctica?" |
| **Siente** | Preparación activa. El vocabulario drill hace que no sea lectura pasiva. |
| **Queremos que sienta** | *"Tengo la estructura Y las palabras exactas para la próxima conversación."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Framework display | Texto estático + iconos | Estructura metodológica del nivel (name, tagline, explanation) |
| Pattern bad/good | Texto estático + UI | Ejemplo de respuesta débil vs. fuerte |
| Personalized pattern | Texto generado por IA (GPT-4o) | "A Strong Answer Looks Like" con datos del perfil |
| Language toggle | UI interactiva (EN/ES/PT) | Permite leer el coaching en el idioma nativo |
| **VocabularyDrillSection** | UI interactiva (nuevo) | Términos clave del nivel con IPA + definición + Listen (Web Speech TTS) + "Say it" (graba → Azure pronunciation score) |
| Narración de audio | TTS estático (ElevenLabs) | `useNarration` — se reproduce automáticamente |
| Skip button | UI | "I already know this" — respeta al usuario avanzado |

> **Vocabulario profile-aware:** `getVocabularyForProfile()` selecciona los 6 términos más relevantes del `vocabularyBank` del nivel según `industry` y `position` del perfil. Un software engineer ve `scalable/deployment`; un designer ve `iteration/accessibility`. Actualmente implementado para Interview Level 1.

**Oportunidad:** El "personalized pattern" es el elemento más valioso. Debería ser el elemento protagonista — con el formato Bad → Good más prominente y con el nombre del usuario incluido en el ejemplo.

---

### TP-06 · InterlocutorIntroScreen (presentación inmersiva del interlocutor)

**Contexto:** Pantalla de transición antes de la práctica. Oscura, inmersiva. El usuario "conoce" a quien va a hablar.

| | |
|---|---|
| **Acción** | Lee el nombre y rol del interlocutor. Escucha el audio de briefing. Espera 3s. Hace clic en "I'm ready". |
| **Pensando** | "¿Con quién voy a hablar? ¿Qué tan difícil va a ser?" |
| **Siente** | Tensión controlada. El ambiente oscuro activa el modo de concentración. |
| **Queremos que sienta** | Inmersión y reto aceptado. *"Esto es real. Estoy a punto de practicar algo que importa."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Pantalla `bg-[#0f172b]` | Diseño / contexto visual | Cambio total de atmósfera vs. pantallas blancas anteriores |
| Avatar con pulse rings | Animación `motion/react` | Rings que pulsan continuamente — sensación de "alguien vivo" |
| Hook text del interlocutor | Texto estático + cursiva | Frase de tensión: "15-20 candidates a day. You have 60 seconds." |
| Waveform animada | Animación `motion/react` | Aparece mientras se reproduce el audio; barras de altura variable |
| Narración de audio | TTS estático (ElevenLabs) | Brief del interlocutor; bloquea el CTA hasta que termina (o 3s) |
| CTA bloqueado → activo | Animación de estado | `bg-white/10 text-white/25` → `bg-white text-[#0f172b]` |

**Oportunidad:** Esta es la pantalla que mejor convierte el "ejercicio" en "situación real". Sin embargo, si el audio falla (autoplay bloqueado), el usuario espera 3 segundos y avanza sin haber recibido el contexto. En ese caso, el hook text debería ser más prominente — actuando como fallback visual del audio.

---

### TP-07 · VoicePractice / ArenaSystem (la práctica real)

**Contexto:** El corazón del producto. El usuario habla con la IA en tiempo real.

| | |
|---|---|
| **Acción** | Escucha el primer mensaje del interlocutor. Graba su respuesta. Escucha la réplica. Repite 4-8 turnos. |
| **Pensando** | "¿Lo estoy haciendo bien? ¿Sueno profesional? ¿Entiendo lo que dice?" |
| **Siente** | Adrenalina, inseguridad, concentración. Vulnerabilidad al hablar. |
| **Queremos que sienta** | Flow. El reto es difícil pero manejable. *"Estoy siendo desafiado, y sobreviviendo."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Primer mensaje del AI | Texto generado por GPT-4o + TTS ElevenLabs | In medias res — el interlocutor arranca sin presentarse |
| Revelado de texto palabra por palabra | Animación progresiva | El texto del AI se revela mientras el audio se reproduce |
| RecordButton | UI interactiva + animación | Botón grande; transición a estado de grabación con ondas |
| RecordingWaveformBars | Animación en tiempo real | Barras que responden al volumen del micrófono |
| RecordingTimer | UI dinámica | Muestra el tiempo grabado en tiempo real |
| STT Azure Speech | Procesamiento de audio | Transcripción en tiempo real del audio del usuario |
| Respuesta GPT-4o | Texto generado por IA | Sistema de 7 bloques de prompt: persona + contexto + escenario |
| TTS ElevenLabs | Síntesis de voz | Voz asignada al interlocutor: authoritative (client), direct (manager), analytical (recruiter) |
| Arena phases (Support → Guidance → Challenge) | Lógica de AI | El scaffolding del AI se reduce progresivamente conforme el usuario mejora |
| Power phrases visibles (fase Support) | Texto estático | Frases de apoyo que desaparecen conforme avanza el nivel |
| internalAnalysis (oculto) | Texto generado por GPT-4o | Log de coaching por turno; usado luego en el feedback |
| ServiceErrorBanner | UI de error | Aparece si hay fallo de API — no interrumpe el flujo |

**Oportunidad 1 — El silencio es el mayor punto de abandono.** Entre el fin del audio del AI y el inicio de la grabación del usuario, no hay guía. El usuario no sabe si ya puede hablar. Un indicador más claro del estado ("Now your turn — tap to record") reduciría la hesitación.

**Oportunidad 2 — El feedback de pronunciación en tiempo real está disponible** (Azure Speech scoring) pero no se muestra durante la conversación. Mostrarlo suavemente después de cada turno (un score de 1-3 indicadores) sin romper la inmersión generaría un loop de refuerzo mucho más rápido.

---

### TP-08 · AnalyzingScreen (espera del análisis)

**Contexto:** Pantalla de carga mientras Gemini Flash procesa el feedback. Dura 10-30s.

| | |
|---|---|
| **Acción** | Espera. Lee el mensaje del loader. |
| **Pensando** | "¿Qué tan mal lo hice? ¿Cuánto tiempo más?" |
| **Siente** | Ansiedad y curiosidad. El tiempo de espera amplifica ambas. |
| **Queremos que sienta** | Anticipación positiva. *"Algo valioso está siendo construido para mí."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| AnalyzingScreen (canónico) | UI animada | Loader visual con mensaje contextual |
| Pre-warm paralelo | Optimización técnica | El análisis de Gemini empieza mientras el usuario está en la última fase de práctica |
| Narración de audio | TTS estático (ElevenLabs) | Audio de transición que enmarca la espera como "reflexión" |

**Oportunidad:** La pantalla de análisis es una oportunidad perdida de micro-educación. Mientras se procesa el feedback, se podría mostrar una frase de power phrase del escenario que practicó — algo que ya escuchó en la sesión. Esto reforzaría la memoria y daría la sensación de que el tiempo de espera "hace algo".

---

### TP-09 · FeedbackScreen (resultados de la sesión)

**Contexto:** La pantalla de mayor valor emocional y cognitivo. El usuario ve su score y análisis detallado.

| | |
|---|---|
| **Acción** | Lee el score de proficiencia. Revisa los 5 pillars (Pronunciation, Fluency, Tone, Grammar, Vocabulary). Lee el Before/After con ejemplos reales de su conversación. Hace shadowing de frases. |
| **Pensando** | "¿Cuánto mejoré? ¿Qué me falta trabajar? ¿Esto es preciso?" |
| **Siente** | Orgullo si el score es bueno. Frustración o decepción si es bajo. En ambos casos, curiosidad genuina sobre los detalles. |
| **Queremos que sienta** | Claridad accionable. *"Sé exactamente qué mejorar y cómo."* Motivación para la siguiente sesión. |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Proficiency score (hero) | Número generado por AI (Gemini) | Score 0-100 prominente — establece el ancla emocional |
| ProficiencyGauge | UI animada | Gauge que se llena animadamente al montar |
| Pillar scores (6) | Texto generado por AI + colores por pilar | Vocabulary, Grammar, Fluency, Pronunciation, Professional Tone, Persuasion — alineados al marco CEFR |
| Before/After examples | Texto generado por AI | Fragmentos reales de la conversación del usuario — lo que dijo vs. lo que debería haber dicho |
| Shadowing practice | Audio ElevenLabs + UI interactiva | El usuario puede grabar su pronunciación de frases corregidas y comparar |
| ScenarioDeltaCard | UI dinámica (bottomSlot) | Compara los 6 pilares de esta sesión vs. la sesión anterior del mismo scenarioType — barra ghost del score previo + delta en verde/rojo. Requiere ≥ 2 sesiones del mismo escenario. |
| Content Insights acordeón | Texto generado por AI (Gemini) + `SmoothHeight` | Colapsable — análisis detallado de tono y vocabulario |
| Progression gate (≥75) | Lógica de negocio → UI | Score ≥ 75 → `LevelMilestoneModal` con confetti → siguiente nivel desbloqueado |
| LevelMilestoneModal | Modal animado (canvas-confetti) | Celebración al completar nivel: badge path/level, score, CTA "Continue" |
| Narración de audio | TTS estático (ElevenLabs) | Coach que introduce la pantalla de resultados |
| Retry / Practice Again | UI estática | Regreso al flujo — reinicio sin perder el contexto |

**Oportunidad 1 — El Before/After es el elemento más poderoso** de todo el producto. Sin embargo, su impacto depende de que el usuario entienda que los ejemplos son *suyos*, de *esa sesión*. Un header como "Extracted from your session — exactly what you said" aumentaría la credibilidad percibida del AI.

**Oportunidad 2 — El shadowing no tiene suficiente presencia.** Es la acción de mayor impacto para la pronunciación, pero aparece como elemento secundario. Debería tener una entrada más prominente, quizás como el primer paso del feedback antes del score.

---

### TP-10 · PathRecommendationCard (recomendación personalizada post warm-up)

**Contexto:** Solo aparece después del warm-up de self-intro. Recomienda un Learning Path basado en el desempeño.

| | |
|---|---|
| **Acción** | Lee la recomendación de path. Evalúa si la razón tiene sentido. Decide si hace clic en "Start This Path" o "Explore All". |
| **Pensando** | "¿Por qué este path y no otro? ¿Confiás en lo que dice el AI?" |
| **Siente** | Curiosidad intelectual. Apertura a continuar — el producto acaba de demostrar su valor. |
| **Queremos que sienta** | Que la recomendación es *sobre él* — personalizada, fundamentada, útil. No una venta. |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Separador "Based on your session" | Texto estático + icono Sparkles | Señala que lo que sigue es derivado de *su* sesión |
| Path icon + headline | UI estática | Identidad visual del path recomendado |
| Reason text | Texto generado por AI (path-recommendation.ts) | Razón específica basada en `pillarScores + selfIntroContext + profile` |
| Focus detail | Texto generado por AI | Detalle táctico del área de mejora |
| Dark gradient card `from-[#0f172b] to-[#1e293b]` | Diseño | Contraste con el fondo blanco del feedback — establece "diferente, importante" |
| Decorative indigo orb | Animación blur | Acento visual que da profundidad sin distraer |
| CTA "Start This Path" | Botón estilo app (`rounded-lg`) | Lleva al PathPurchaseModal pre-seeded con el path recomendado |

**Oportunidad:** La razón de la recomendación está bien generada por AI, pero su lenguaje es académico. En este momento post-práctica el usuario está emocionalmente activado — la razón debería estar en lenguaje de *consecuencia profesional* ("Your hesitation pattern costs you credibility in client meetings") más que de *descripción de habilidad*.

---

## FASE 2 — Decisión / Conversión

### TP-11 · UpsellScreen / PathPurchaseModal (momento de compra)

**Contexto:** El mayor momento de intención de toda la app. El usuario acaba de terminar su primera sesión.

| | |
|---|---|
| **Acción** | Lee el headline, revisa los 3 value cards, ve el precio. Decide si compra o sigue al dashboard. |
| **Pensando** | "¿Vale la pena? ¿Voy a usar esto realmente? ¿O lo abandono como todos los apps?" |
| **Siente** | Post-achievement high + duda racional. El confetti activa un estado positivo momentáneo. |
| **Queremos que sienta** | Que la compra es el paso lógico inmediato. Que no hacerlo sería perder el momentum. |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Confetti de canvas | Animación de celebración | 3 oleadas de 100+50+50 partículas; colores de marca |
| Trophy icon animado | Animación `spring stiffness 200` | Aparece primero — establece el tono de logro |
| Demo Score pill | Texto dinámico (de la sesión) | Muestra el score de la sesión justo terminada — ancla el valor |
| Headline por escenario | Texto estático por escenario | e.g., "You've got the fundamentals — now let's build mastery" |
| Value cards (3) | Texto estático | All paths · WhatsApp SR Coach · Unlimited sessions |
| Conversion hook | Texto estático | "Invest in your professional English." |
| Fondo `bg-[#0f172b]` | Diseño | Misma atmósfera del InterlocutorIntroScreen — coherencia emocional |
| CTA "Unlock MasteryTalk PRO" | Botón `rounded-lg bg-white` | Abre PathPurchaseModal (Monthly / Quarterly, launch pricing auto) |
| Skip option | Texto ghost | "Continue to Dashboard" — existe pero es visualmente menor |

**Oportunidad:** La prop `proficiencyScore` ya está conectada pero su impacto podría ser mayor. Si el score es bajo (< 60), el headline debería cambiar a un mensaje de gap más urgente ("There's a real gap here — and 18 sessions to close it"). Si es alto (≥ 80), reforzar el momentum ("You're already above average — let's lock that in"). El framing condicional por score aumenta la relevancia.

---

### TP-12 · Stripe Checkout (pago)

**Contexto:** El usuario sale de la app hacia Stripe. Momento de mayor frialdad del journey.

| | |
|---|---|
| **Acción** | Ingresa datos de tarjeta. Hace clic en "Suscribirse". |
| **Pensando** | "¿Es seguro? ¿Puedo cancelar? ¿Qué pasa si no me gusta?" |
| **Siente** | Ansiedad transaccional. El estado emocional cae desde el high del UpsellScreen. |
| **Queremos que sienta** | Confianza institucional. *"Stripe es seguro. Puedo cancelar cuando quiera."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Stripe Checkout (hosted) | UI de Stripe | Branding de Stripe + nombre "MasteryTalk PRO" visible |
| Pricing pre-seleccionado | Configuración de checkout | El tier elegido en el modal llega pre-cargado |
| Success URL | Redirección | `/#dashboard?payment=success&tier={tier}` — retorno automático |
| Cancel URL | Redirección | `/#dashboard?payment=cancelled` — salida limpia |

**Oportunidad:** La transición de la app a Stripe es un cambio de contexto abrupto. No hay forma de reducirlo con Stripe Checkout hospedado. Sin embargo, el copy del modal *previo* al checkout puede hacer el trabajo: incluir explícitamente "Cancel anytime from your account" antes del botón de pago reduce la fricción percibida.

---

### TP-13 · Payment Success / Celebration Modal (confirmación)

**Contexto:** El usuario regresa a la app después del pago. Primer momento como suscriptor.

| | |
|---|---|
| **Acción** | Ve el modal de celebración. Lee qué se desbloqueó. Hace clic en "Explore your paths". |
| **Pensando** | "¿Funcionó? ¿Ya tengo acceso? ¿Qué puedo hacer ahora?" |
| **Siente** | Alivio + satisfacción. Necesita confirmación inmediata de que el pago fue exitoso. |
| **Queremos que sienta** | Bienvenida a un nuevo nivel. *"Tomé la decisión correcta."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Confetti de celebración | Animación de canvas | 60 partículas en colores de marca |
| Modal de celebración | AppModal animado | Tier name + what's unlocked + CTA |
| Subscription confirmation email | Email transaccional (Resend) | Confirmación del tier, siguiente fecha de cobro, enlace de gestión |
| Dashboard refresh | Lógica de app | `GET /progression` devuelve todos los niveles desbloqueados |
| ProgressionTree | UI dinámica | Los paths aparecen abiertos — cambio visual inmediato post-pago |

**Oportunidad:** El modal de celebración es correcto emocionalmente, pero el email de confirmación debería llegar dentro de los 5 minutos siguientes (tiene probabilidad de churn si no hay confirmación en el correo). Verificar que el delay del webhook + email no supere ese umbral.

---

## FASE 3 — Primera sesión paga

### TP-14 · Dashboard (primer retorno post-pago)

**Contexto:** El usuario regresa al dashboard habiendo pagado. Ve su progresión desbloqueada por primera vez.

| | |
|---|---|
| **Acción** | Explora el dashboard. Ve su ProgressionTree con niveles desbloqueados. Decide qué path iniciar. |
| **Pensando** | "¿Por dónde empiezo? ¿Cuál es el orden correcto?" |
| **Siente** | Excitación + leve overwhelm. Muchas opciones disponibles simultáneamente. |
| **Queremos que sienta** | Dirección clara. *"Hay un siguiente paso obvio para mí."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| **HeroCard** | UI dinámica | Context-aware: saludo + diagnosis + estado del usuario. Integra el `englishGoal` del usuario como pill ("Goal: Job Interview") con botón de edición. CEFR badge + gate pills; "Day X of 90"; streak 7-day grid |
| **Quick Session** (AppHeader) | Botón en header | Ex-War Room — acceso inmediato a sesión libre. Deshabilitado para usuarios free y para usuarios pago sin sesiones completadas |
| **Row 2 — 4 widgets informativos** | Grid 4 columnas | SRDashboardCard · ProgressChartCard · RecommendedLessonsCard · PlatformNewsCard — todos con empty states educativos |
| SRDashboardCard | UI dinámica | Pronunciación diaria con sistema Leitner. Empty state: explica el sistema y CTA a primera sesión |
| ProgressChartCard | UI dinámica (recharts) | Evolución del avg score últimas 10 sesiones; CEFR milestones. Empty state: explica los 5 pilares evaluados |
| RecommendedLessonsCard | UI dinámica | Micro-lecciones según pilar más débil. Empty state: explica qué aparecerá aquí post-sesión |
| PlatformNewsCard | UI estática | Noticias del producto |
| **PracticePathsModule** | UI dinámica | ProgressionTree: primary path activo + otros paths con overlay de suscripción. Muestra banner "Complete your warm-up first" si 0 sesiones. `ChooseNextPathModal` al completar path |
| CrossPathCard | UI dinámica (columna izquierda de Row 3) | Progreso comparado entre paths; empty state con barras placeholder |
| SinceYouStartedCard | UI dinámica | Delta por pillar; visible con ≥ 2 sesiones |
| WhatsApp banner | Banner superior condicional | Solo cuando WhatsApp no está verificado |

**Layout dashboard:**
```
Row 0: WhatsApp banner (condicional)
Row 1: HeroCard (con englishGoal integrado)
Row 2: [SRDashboard] [ProgressChart] [RecommendedLessons] [PlatformNews]
Row 3: [CrossPathCard + SinceYouStarted] [PracticePathsModule]
```

**Oportunidad:** El dashboard muestra demasiado para un usuario nuevo. El `HeroCard` con la acción "Start Warm-Up" debería ser el único foco en la primera visita — los módulos de la columna izquierda de Row 3 son irrelevantes hasta la 2da sesión.

---

### TP-15 · Sesión paga completa (flujo detallado)

**Contexto:** El usuario inicia una sesión en un nivel específico de un path (no self-intro). El flujo es más rico que el warm-up.

**Flujo de pasos:**

```
IntroductionScreen (greeting + confidence/focus check-in)
  → StrategyScreen (metodología + vocabulary drill)
  → ContextScreen (situación + job description + presets)
  → [generating — IA prepara el briefing de preguntas en background]
  → PracticePrepScreen (briefing de preguntas con stepper — BriefingStepperCarousel)
  → InterlocutorIntroScreen (presentación inmersiva)
  → VoicePractice (conversación real)
  → AnalyzingScreen (espera)
  → FeedbackScreen (resultados + shadowing + ScenarioDeltaCard + progresión)

Pasos omitidos en Challenge Mode: strategy + practice-prep
Pasos omitidos en War Room: intro + strategy (va directo a context)
```

> **Navegación lateral:** El `PracticeSideNav` muestra en tiempo real: Introduction ✓ → Strategy ✓ → Your Situation ✓ → Q&A Preparation ● → Live Practice ○. Los pasos completados son clickeables (navegación hacia atrás).
> **Pre-session lesson eliminado:** El `PreSessionLessonScreen` fue reemplazado por el `VocabularyDrillSection` dentro de `StrategyScreen`. Ya no existe como paso separado del flujo.

**Touchpoints nuevos vs. warm-up:**

#### TP-15a · ContextScreen (setup de la situación)

**Contexto:** Aparece DESPUÉS de StrategyScreen. El usuario ya tiene el framework — ahora lo aplica a su situación real.

| | |
|---|---|
| **Acción** | Ingresa el Job Description (o elige un preset situacional). Hace clic en Continue. |
| **Pensando** | "¿Qué tanto contexto necesito dar? ¿Más contexto = mejor práctica?" |
| **Siente** | Ligera fricción cognitiva. Pero también: *"Esto se va a personalizar para mí."* |
| **Queremos que sienta** | Que el framework que acaba de aprender se va a aplicar a SU situación específica. |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Job Description textarea | UI estática | Pre-llenado con el último JD del perfil (`lastJobDescription`) si existe |
| Situation presets (3 por escenario) | Texto estático + UI interactiva | Cards de contexto situacional — empresa, stakes — sin asumir el rol del usuario |
| Challenge Mode toggle | UI interactiva | "No hints, no prep. Exactly like the real thing." — salta el briefing completo |
| Preset injection | Lógica de backend | `processGuidedFields()` combina preset + cvSummary → `userArsenal` del prompt |

> **Nota:** Focus area y confidence score ya fueron recolectados en `IntroductionScreen`. No aparecen en esta pantalla.

**Oportunidad:** La persistencia del JD en el perfil (`lastJobDescription`) es invisible para el usuario. Una señal explícita de "Usando tu perfil de: [extracto de JD]" haría que el usuario perciba que la app lo recuerda.

---

#### TP-15b · PracticePrepScreen (briefing por pregunta)

**Contexto:** La IA ya generó las preguntas en background (durante el paso "generating"). El usuario llega con el framework aprendido y su contexto cargado.

| | |
|---|---|
| **Acción** | Va pregunta por pregunta. Para cada una: lee la pregunta → entiende la estrategia → graba su respuesta → ve su transcripción + la respuesta mejorada. |
| **Pensando** | "¿Esta pregunta me la van a hacer de verdad? ¿Qué tan convincente estoy sonando?" |
| **Siente** | Alta concentración. El micro-loop (grabo → veo qué dije → veo cómo debería sonar) crea aprendizaje acelerado. |
| **Queremos que sienta** | Preparación real. *"Cuando entre a la conversación, ya practiqué lo más difícil."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| BriefingStepperCarousel | UI interactiva | 4 sub-pasos por pregunta (flipbook animation): QuestionCard → StrategyCard → AnswerCard → FeedbackCard |
| Progress row | UI estática | "Question X of N · dots · X/N mastered" — progreso dentro del briefing |
| `exampleAnswer` por pregunta | Texto generado por GPT-4o | Respuesta de ejemplo personalizada con datos del perfil |
| RecordButton + STT Azure | Audio en tiempo real | Grabación y transcripción por pregunta |
| **"Your Answer"** | Texto dinámico (nuevo) | Transcripción literal de lo que el usuario dijo — visible en FeedbackCard antes del Improved Response |
| Improved Response + key changes | Texto generado por IA | Evaluación + versión mejorada de la respuesta |
| Practice Saying It (shadowing) | UI interactiva | El usuario puede grabar la respuesta mejorada y comparar pronunciación |
| **PracticeSideNav** | UI dinámica lateral | Muestra: Introduction ✓ → Strategy ✓ → Your Situation ✓ → Q&A Preparation ● → Live Practice ○; pasos completados son clickeables |
| Narración de audio | TTS estático (ElevenLabs) | `useNarration(READINESS_URLS[...])` — acompaña la pantalla |

**Oportunidad:** El stepper de 4 sub-pasos es poderoso pero largo. Para usuarios con experiencia (>3 sesiones), considerar un modo "rápido" que omita el StrategyCard y vaya directo a grabar.

---

## FASE 4 — Retención y formación del hábito

### TP-16 · Dashboard recurrente (2da sesión en adelante)

**Contexto:** El usuario regresa un día o semana después. Este es el momento crítico del hábito.

| | |
|---|---|
| **Acción** | Entra al dashboard. Ve su streak. Ve la recomendación de siguiente sesión. Decide si practica hoy. |
| **Pensando** | "¿Dónde me quedé? ¿Mejoré algo? ¿Tengo 15 minutos ahora?" |
| **Siente** | El hábito todavía no está formado. Alta probabilidad de postergación. |
| **Queremos que sienta** | Momentum por progresión visible. *"Perdería mi racha si no practico hoy."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| StreakCard (7-day grid) | UI dinámica | Cuadros de los últimos 7 días — visual de racha que se "rompe" si no practica |
| RecommendedNextCard | UI dinámica (weakest pillar) | Siguiente sesión personalizada — no hay que decidir |
| HeroCard con diagnosis | UI dinámica + texto estático | Estado del usuario + churn gap si inactivo |
| CrossPathCard | UI dinámica (≥2 paths) | Progreso comparado entre paths |
| SRDashboardCard | UI dinámica | Última frase del SR Coach si hay WA conectado |

**Oportunidad clave para el hábito:** El StreakCard existe pero su **lenguaje visual de pérdida** no está suficientemente activado. En apps con alta retención (Duolingo, Headspace), la streak rota tiene una reacción emocional fuerte. Agregar una animación sutil de "breaking" si el usuario entra y tiene 1 día sin practicar (cuadro en rojo/gris con animación de crack) crearía el tipo de tensión que genera acción.

---

### TP-17 · WhatsApp SR Coach (reto diario de pronunciación)

**Contexto:** El usuario recibe un mensaje de WhatsApp cada día con una frase de su sesión para practicar pronunciación.

| | |
|---|---|
| **Acción** | Lee el reto en WhatsApp. Graba un audio con la frase. Recibe feedback de score. |
| **Pensando** | "¿Vale la pena tomarse 2 minutos para esto? ¿El score es real?" |
| **Siente** | Dependiendo del score: satisfacción (88/100) o frustración motivante (62/100). |
| **Queremos que sienta** | Que el progreso ocurre *fuera* de la app — en el canal donde ya está. |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Mensaje de reto | Texto estático + Spanglish (i18n ES/PT/EN) | Contexto del punto débil + frase exacta a repetir |
| Audio TTS de la frase | ElevenLabs vía `cron-daily-sr` | El usuario escucha la pronunciación correcta antes de grabar |
| STT + Pronunciation Score | Azure Speech API | Score 0-100 + feedback de la sílaba específica donde falló |
| Feedback por score | Texto condicional (good/needs work) | Mensajes directos: "Pronunciación de 'deliverables' perfecta" vs. "Cortaste la fluidez" |
| Spaced Repetition logic | Backend (`spacedRepetition.ts`) | La frase reaparece en 1/3/7/14 días según el score |

**Oportunidad 1 — El comando "Repetir"** existe pero no está suficientemente comunicado en el onboarding del canal. Los usuarios que no saben que puede pedir la frase de nuevo tienen una barrera adicional.

**Oportunidad 2 — La activación del canal** (configurar el número en el dashboard) todavía requiere que el usuario tome la iniciativa. Una invitación más directa en la pantalla de FeedbackScreen post-primera-sesión ("Practice this phrase again tomorrow on WhatsApp — activate your coach in 30 seconds") aumentaría la tasa de activación del SR Coach.

---

### TP-18 · Emails de lifecycle (nurturing y transaccionales)

**Contexto:** El usuario recibe emails en momentos clave del journey.

| Email | Momento | Canal | Objetivo de hábito |
|-------|---------|-------|--------------------|
| Welcome | Registro | Resend | Primera impresión; invitar a primera sesión |
| Post-session summary | Cada sesión completada | Resend | Refuerzo del valor; ver el progreso por escrito |
| Loops D+2 | 2 días sin sesión | Loops | Activación suave — "¿Completaste tu primera sesión?" |
| Loops D+5 | 5 días sin sesión | Loops | Social proof + CTA de suscripción |
| Loops D+7 (sin sesión) | 7 días sin sesión | Loops | Re-activación — objeción "no tengo tiempo" |
| Inactivity nudge | 7 días sin sesión (suscriptor) | Resend | Recordar que tiene una suscripción activa |
| Subscription confirmed | Post-pago | Resend | Confirmar, reducir ansiedad post-compra |
| Renewal confirmed | Renovación mensual | Resend | Momento de recomitment — ideal para recordar el valor |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| `welcomeEmailHtml()` | Template HTML estático (Resend) | Branding + CTA a primera sesión |
| `sessionSummaryEmailHtml()` | Template HTML dinámico (scores, key improvements) | Datos reales de la sesión — scores + frases mejoradas |
| Loops sequences (5) | Texto de nurturing (Loops dashboard) | English only — sin branches de idioma (ver política §6.3 PRODUCT_SPEC) |
| `inactivityNudgeEmailHtml()` | Template HTML + lógica de throttle | Max 1 por 14 días; solo para suscriptores inactivos |

**Oportunidad:** El **session summary email** es el email de mayor valor del producto — muestra las métricas reales del usuario. Sin embargo, no tiene un CTA visible a "Practice Again" ni a "See your next recommended session". Este email, que llega inmediatamente post-sesión, es el momento de mayor intención — conectarlo directamente a la siguiente sesión con un deep link (`/#dashboard?start=true`) aumentaría la frecuencia de uso.

---

## FASE 5 — Riesgo de churn y reactivación

### TP-19 · Inactivity Nudge (7 días sin práctica)

**Contexto:** El usuario suscrito no ha practicado en 7 días. El sistema le envía un email.

| | |
|---|---|
| **Acción** | Recibe el email. Lo lee (o no). Hace clic en el CTA (o no). |
| **Pensando** | "Sí, sé que no he practicado... pero ahora no tengo tiempo." |
| **Siente** | Ligera culpa. Posiblemente ya olvidó qué habilidad estaba trabajando. |
| **Queremos que sienta** | Que el costo de no practicar es concreto — no moral, sino profesional. |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| `inactivityNudgeEmailHtml()` | Email transaccional (Resend) | Mensaje de reactivación; throttle de 14 días |
| Loops re-activación D+7 | Email de marketing (Loops) | Objeción "no tengo tiempo" + argumento de 15 min/día |

**Oportunidad:** El nudge de inactividad existe, pero sus dos versiones (Resend + Loops) podrían estar llegando en el mismo período y generar sensación de spam. Coordinar la lógica de throttle entre ambos canales (una sola comunicación de reactivación por semana) protege la entregabilidad y la relación con el usuario.

---

### TP-20 · Subscription Renewal (renovación mensual)

**Contexto:** El usuario recibe la confirmación de renovación automática.

| | |
|---|---|
| **Acción** | Lee el email de renovación. Evalúa si el producto sigue valiendo lo que paga. |
| **Pensando** | "¿Cuánto he usado esto este mes? ¿Vale la pena renovar?" |
| **Siente** | Calculación racional. Si usó poco, aumenta el riesgo de cancelación. |
| **Queremos que sienta** | Orgullo por el progreso. *"Pagué y mejoré. Otro mes."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| `renewalConfirmationEmailHtml()` | Email transaccional (Resend) | Confirmación de cobro + enlace a Customer Portal |
| Customer Portal (Stripe) | UI de Stripe | Cancelar, cambiar método de pago, ver historial |

**Oportunidad:** El email de renovación actualmente *confirma el cobro* pero no *refuerza el valor*. Este es el momento de mayor riesgo de cancelación. Incluir en el email un resumen del mes: "Este mes completaste X sesiones. Tu mayor mejora fue Pronunciation (+Y puntos)." Convierte una factura en una prueba de ROI.

---

## Resumen estratégico — Puntos de apalancamiento para el hábito

Los siguientes son los 5 touchpoints con mayor impacto en la formación del hábito, ordenados por palanca:

| # | Touchpoint | Por qué importa | Acción recomendada |
|---|-----------|-----------------|-------------------|
| 1 | **TP-07 VoicePractice** | Es donde el valor se entrega — y donde se puede perder si hay fricción técnica | Señal más clara de "tu turno". Score de pronunciación por turno visible. |
| 2 | **TP-09 FeedbackScreen** | Mayor impacto emocional. El usuario decide aquí si volverá. | Elevar el Before/After como primer elemento. Frase del SR Coach conectada desde aquí. |
| 3 | **TP-16 Dashboard recurrente** | Donde se rompe o se consolida el hábito | StreakCard con "loss aversion" visual. RecommendedNext más prominente en primera visita. |
| 4 | **TP-17 WhatsApp SR Coach** | Único touchpoint fuera de la app — el más poderoso para el hábito diario | Onboarding del canal más visible; invitación desde FeedbackScreen. |
| 5 | **TP-20 Renewal email** | Momento de mayor riesgo de churn — oportunidad de reforzar ROI | Incluir resumen de progreso del mes en el email de renovación. |

---

*v1.2 — 2026-05-10*
*Cambios: (1) TP-03 IntroductionScreen: añadido confidence check-in + focus selector (movidos desde ContextScreen); CTA gateado. (2) TP-05 StrategyScreen: documenta VocabularyDrillSection (IPA + TTS + Azure scoring, profile-aware) en reemplazo de anchor phrases pasivas. (3) Flujo de Fase 3 reordenado: intro → strategy → context → practice-prep (strategy antes de context). (4) TP-15a.1 eliminado (Focus/Confidence movidos a TP-03). (5) TP-15a.2 PreSessionLessonScreen eliminado — reemplazado por VocabularyDrillSection en StrategyScreen. (6) TP-14 Dashboard actualizado: GoalAnchorCard integrado en HeroCard, War Room → Quick Session en header, Row 2 con 4 widgets + empty states, layout documentado. (7) TP-15b PracticePrepScreen: documenta "Your Answer" (transcripción visible), flipbook animation, PracticeSideNav con flow steps.*

*v1.1 — 2026-05-01*
*Cambios: Añadido TP-15a.1 (Focus Area + Confidence Check-in) en Fase 3 › ContextScreen — documenta Sprint A.1 + A.2 de Phase 2.5 Pedagogical Depth.*
*v1.0 — 2026-04-29*
*Scope: Flujo completo desde landing hasta renovación. Basado en análisis de código fuente, PRODUCT_SPEC v2.0, BRAND_VOICE v1.0, DESIGN_SYSTEM v1.4, SYSTEM_PROMPTS v1.1.*
