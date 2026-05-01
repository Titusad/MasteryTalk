# MasteryTalk PRO — User Journey Map

> **Propósito:** Mapear cada punto de interacción del usuario con el producto —
> lo que piensa, siente, y cómo el sistema interviene — para identificar
> oportunidades de mejora alineadas con la **formación del hábito de uso**.
>
> **Audiencia:** Producto, diseño, growth.
> **Actualizado:** 2026-04-29

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
Fase 1 — Primera sesión     → Onboarding → Warm-Up → Feedback
Fase 2 — Decisión           → Upsell → Pago → Confirmación
Fase 3 — Primera sesión paga → Dashboard → Sesión completa → Feedback con nivel
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

### TP-03 · IntroductionScreen (briefing del nivel)

**Contexto:** Primera pantalla dentro de la sesión. El usuario ya está autenticado y adentro de la app.

| | |
|---|---|
| **Acción** | Lee la pantalla de introducción del nivel. Ve los 3 pasos de la sesión. Hace clic en "Let's Go". |
| **Pensando** | "¿Qué voy a hacer exactamente? ¿Cuánto tiempo tarda? ¿Me van a juzgar?" |
| **Siente** | Anticipación nerviosa. Curiosidad sobre cómo funciona el producto. |
| **Queremos que sienta** | Seguridad de saber exactamente qué sigue. Ligereza. *"15 minutos. Puedo hacerlo."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Greeting personalizado | Texto dinámico (Supabase `getUser`) | "Hey [first name]" — nombre real del usuario |
| Headline con habilidad | Texto estático + acento indigo | Nombra exactamente qué se va a dominar |
| 3 Steps cards | Texto estático + animación escalonada (`delay 0.15 * i`) | Revelado progresivo: Set the Scene → Strategize → Live Practice |
| Time estimate | Texto estático + icono Clock | "~15-20 min" — reduce la ansiedad de tiempo |
| Narración de audio | TTS estático (ElevenLabs / Sarah) | `useNarration` — se reproduce al montar el componente |
| Scenario pill | UI estática | Etiqueta "Self-Introduction · Level" — contextualiza |
| CTA "Let's Go" | Botón animado (`whileTap scale 0.97`) | `rounded-full` — consistente con el sistema |

**Oportunidad:** El audio de narración se reproduce automáticamente y puede estar bloqueado por el navegador. Si el usuario no lo escucha, pierde la voz de coaching que establece el tono. Solución: mostrar el `NarrationToggle` de manera más prominente en esta pantalla específica + una indicación visual de que hay audio disponible.

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

### TP-05 · StrategyScreen (metodología del nivel)

**Contexto:** El usuario ve el framework que deberá aplicar en la práctica. Puede saltarlo.

| | |
|---|---|
| **Acción** | Lee el framework (e.g., "Who you are / What you do / Why this role"). Puede copiar anchor phrases. Hace clic en "I'm Ready" o "Skip". |
| **Pensando** | "¿Esto me va a servir de algo o es teoría? ¿Debo memorizarlo?" |
| **Siente** | Ambivalencia. Puede sentir que la práctica es lo que importa, no leer. |
| **Queremos que sienta** | Preparación específica. *"Tengo una estructura concreta para usar en 2 minutos."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Framework display | Texto estático + iconos | Estructura metodológica del nivel |
| Anchor phrases | Texto estático + Copy button | Power phrases copiables con un clic |
| Personalized pattern | Texto generado por IA (GPT-4o) | "A Strong Answer Looks Like" con datos del perfil del usuario |
| Language toggle | UI interactiva (EN/ES/PT) | Permite leer el coaching en el idioma nativo |
| Narración de audio | TTS estático (ElevenLabs) | Se reproduce automáticamente; `useNarration` |
| Skip button | UI | "I already know this" — respeta al usuario avanzado |

**Oportunidad:** El "personalized pattern" (ejemplo de respuesta generado con datos del perfil) es el elemento más valioso de esta pantalla, pero visualmente compite con el resto del contenido. Debería ser el elemento protagonista — con el formato "Bad example → Good example" más prominente y con el nombre del usuario incluido en el ejemplo.

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
| Pillar scores (5) | Texto generado por AI + colores por pilar | Pronunciation (rojo), Fluency (azul), Tone (teal), Grammar (azul), Vocabulary (verde) |
| Before/After examples | Texto generado por AI | Fragmentos reales de la conversación del usuario — lo que dijo vs. lo que debería haber dicho |
| Shadowing practice | Audio ElevenLabs + UI interactiva | El usuario puede grabar su pronunciación de frases corregidas y comparar |
| Content Insights acordeón | Texto generado por AI (Gemini) + `SmoothHeight` | Colapsable — análisis detallado de tono y vocabulario |
| Progression gate (≥75) | Lógica de negocio → UI | Score ≥ 75 → "Level Complete" → siguiente nivel desbloqueado |
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
| HeroCard | UI dinámica | Context-aware: saludo + estado del usuario (new subscriber) |
| RecommendedNextCard | UI dinámica (basada en `weakest pillar` de `GET /progression`) | Recomienda la siguiente sesión basado en el pilar más débil |
| PracticePathsModule | UI dinámica | ProgressionTree con todos los paths y niveles visibles |
| StreakCard | UI dinámica (7-day grid) | Vacío al inicio — empieza a construir el hábito visual |
| WhatsAppActivationCard | UI estática | Primera invitación al SR Coach — disponible desde el primer día |
| PlatformNewsCard | UI estática | Noticias del producto; relevante para early adopters |
| Empty state | UI estática | El banner "START HERE — Professional Self-Introduction" solo si 0 sesiones |

**Oportunidad:** El dashboard muestra demasiado al mismo tiempo para un usuario nuevo. El `RecommendedNextCard` debería ser el elemento más prominente en la primera visita post-pago — con un mensaje como "Start here. Your first real session is ready." Los demás módulos (StreakCard, WhatsApp, CrossPath) pueden esperar a la segunda visita.

---

### TP-15 · Sesión paga completa (flujo detallado)

**Contexto:** El usuario inicia una sesión en un nivel específico de un path (no self-intro). El flujo es más rico que el warm-up.

**Flujo de pasos:**

```
IntroductionScreen
  → ContextScreen (situación + job description + presets)
  → StrategyScreen (metodología + examples personalizados)
  → PracticePrepScreen (briefing de preguntas con stepper)
  → InterlocutorIntroScreen (presentación inmersiva)
  → VoicePractice (conversación real)
  → AnalyzingScreen (espera)
  → FeedbackScreen (resultados + shadowing + progresión)
```

**Touchpoints nuevos vs. warm-up:**

#### TP-15a · ContextScreen (setup de la situación)

| | |
|---|---|
| **Acción** | Ingresa el Job Description (o elige un preset). Opcionalmente llena el formulario de contexto. |
| **Pensando** | "¿Qué tanto contexto necesito dar? ¿Más contexto = mejor práctica?" |
| **Siente** | Ligera fricción cognitiva. Pero también: *"Esto se va a personalizar para mí."* |
| **Queremos que sienta** | Que cada campo que llena hace la sesión más precisa. Inversión percibida. |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| Job Description textarea | UI estática | Pre-llenado con el último JD del perfil (`cvSummary`) si existe |
| Situation presets (3 por escenario) | Texto estático + UI interactiva | Cards de contexto situacional — la empresa, los stakes — sin asumir el rol del usuario |
| Preset injection | Lógica de backend | `processGuidedFields()` combina preset + cvSummary → `userArsenal` del prompt |
| Skip button | UI | Siempre visible — respeta al usuario con prisa |

**Oportunidad:** La persistencia del JD en el perfil (`cvSummary`) es invisible para el usuario. Una señal explícita de "Usando tu perfil de: [extracto de JD]" haría que el usuario perciba que la app lo recuerda — clave para el hábito de retorno.

#### TP-15b · PracticePrepScreen (briefing por pregunta con stepper)

| | |
|---|---|
| **Acción** | Va pregunta por pregunta. Para cada una: lee la pregunta → entiende la estrategia → graba su respuesta → recibe feedback por pregunta. |
| **Pensando** | "¿Esta pregunta me la van a hacer de verdad? ¿Qué tan convincente estoy sonando?" |
| **Siente** | Alta concentración. La grabación por pregunta crea un micro-loop de aprendizaje. |
| **Queremos que sienta** | Preparación real. *"Cuando entre a la conversación, ya practiqué lo más difícil."* |

**Sistema interviene:**

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| BriefingStepperCarousel | UI interactiva + stepper | 4 sub-pasos por pregunta: see → strategize → record → feedback |
| `exampleAnswer` por pregunta | Texto generado por GPT-4o | Respuesta de ejemplo personalizada con datos del perfil del usuario |
| RecordButton + STT Azure | Audio en tiempo real | Grabación y transcripción por pregunta individual |
| Feedback por pregunta | Texto generado por AI (Gemini Flash o local) | Evaluación específica de esa respuesta |
| ReadinessScore | UI dinámica | Score de preparación que sube al completar más preguntas |
| Narración de audio | TTS estático (ElevenLabs) | `useNarration(READINESS_URLS[...])` — acompaña la pantalla de preparación |

**Oportunidad:** El stepper de 4 sub-pasos (see/strategize/record/feedback) es poderoso pero largo. Para usuarios con experiencia (>3 sesiones completadas), considerar un modo "rápido" que omita el paso de "strategize" y vaya directo a grabar — respetando el tiempo del usuario habitual.

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
| Loops sequences (5) | Texto de nurturing (Loops dashboard) | Branch por `language` (ES/PT/EN) — automatizado |
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

*v1.0 — 2026-04-29*
*Scope: Flujo completo desde landing hasta renovación. Basado en análisis de código fuente, PRODUCT_SPEC v2.0, BRAND_VOICE v1.0, DESIGN_SYSTEM v1.4, SYSTEM_PROMPTS v1.1.*
