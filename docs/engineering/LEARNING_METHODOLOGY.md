# MasteryTalk PRO — Metodología de Aprendizaje

> Este documento define el marco pedagógico de MasteryTalk PRO: el objetivo de aprendizaje,
> las teorías académicas que lo sustentan, cómo cada una se implementa en el producto actual,
> y dónde existen oportunidades de mejora con mayor impacto en el desarrollo del usuario.
>
> Lectura recomendada junto a: [`CEFR_CALIBRATION.md`](./CEFR_CALIBRATION.md) (umbrales de medición)
> Última actualización: 2026-05-01 — v1.0

---

## §1 — Objetivo de aprendizaje: Professional Proficiency

### 1.1 Definición operacional

"Professional Proficiency" en MasteryTalk PRO se define como la capacidad de comunicarse en inglés de manera efectiva, fluida y culturalmente apropiada en contextos de trabajo remoto con equipos de Estados Unidos — sin que el idioma sea un obstáculo para el desempeño profesional.

Este concepto tiene dos umbrales concretos dentro del marco CEFR:

| Umbral | Nivel CEFR | Significado práctico |
|--------|-----------|---------------------|
| **Mínimo funcional** | **B2** | El usuario puede participar activamente en reuniones, entrevistas y presentaciones sin causar "strain" al interlocutor nativo. Puede expresar ideas complejas con errores no-sistemáticos que no impiden la comunicación. |
| **Efectividad plena** | **C1** | El usuario comunica con fluidez, precisión y registro apropiado. Puede persuadir, negociar y manejar objeciones. El inglés deja de ser un esfuerzo consciente y se convierte en un instrumento. |

> **Nota:** MasteryTalk no promete ni certifica nivel CEFR. B2 y C1 son los benchmarks internos
> que guían el diseño del sistema de progresión y feedback.

### 1.2 Mapa de progresión

El camino de cualquier usuario hacia Professional Proficiency sigue esta progresión, con hitos observables en cada transición:

```
A2 → B1 → B2 → C1
```

| Transición | Hito clave | Señal observable en MasteryTalk |
|------------|-----------|--------------------------------|
| **A2 → B1** | Inteligibilidad básica | El usuario completa una sesión sin pausas paralizantes. Puede responder preguntas directas aunque cometa errores frecuentes. |
| **B1 → B2** | Funcionalidad profesional | El usuario sostiene una conversación de 8–12 turnos sobre su área de trabajo sin que el interlocutor IA necesite reformular preguntas. Fluency ≥ 63, Grammar ≥ 67. |
| **B2 → C1** | Influencia y precisión | El usuario puede persuadir, manejar objeciones y ajustar su registro según la audiencia. Persuasion ≥ 78, Professional Tone ≥ 80. |

**Estimación de sesiones por transición** (referencia, no garantía):

| Transición | Sesiones estimadas | Supuesto |
|------------|-------------------|---------|
| A2 → B1 | 15–25 sesiones | 3–4 sesiones/semana |
| B1 → B2 | 30–50 sesiones | 3–4 sesiones/semana |
| B2 → C1 | 50–80 sesiones | práctica intensiva en escenarios de alta complejidad |

> Estas estimaciones se basan en estudios de adquisición de segunda lengua (ALTE, 2002; British Council, 2013)
> adaptados al contexto de práctica activa deliberada. Deberán calibrarse empíricamente cuando el dataset
> de sesiones supere las 500.

---

## §2 — Base académica establecida

### 2.1 Task-Based Language Teaching — TBLT

**Referencia:** Willis (1996), Ellis (2003, 2018), Long (2015)

**Principio central:** El aprendizaje de una lengua ocurre de manera más efectiva cuando el usuario realiza tareas comunicativas auténticas con un propósito real, no ejercicios lingüísticos descontextualizados.

Una "tarea" en TBLT tiene tres características:
1. **Propósito real:** la comunicación existe para lograr algo (convencer, informar, acordar)
2. **Gap de información:** el interlocutor no sabe lo que el usuario va a decir
3. **Evaluación por resultado:** el éxito se mide por si la comunicación funcionó, no por si la gramática fue perfecta

El ciclo TBLT estándar: **Pre-task → Task → Post-task report**

**Por qué sigue siendo válido:** 40 años de evidencia empírica. Es el marco más respaldado para el desarrollo de competencia comunicativa oral en contextos de segunda lengua. Las meta-análisis recientes (Bryfonski & McKay, 2017) confirman su efectividad especialmente en fluency y complejidad léxica.

---

### 2.2 Output Hypothesis

**Referencia:** Swain (1985, 1995, 2005)

**Principio central:** Producir lenguaje (hablar) no es simplemente el resultado del aprendizaje — es parte esencial del proceso de adquisición. El "pushed output" — ser empujado a decir algo de manera más precisa o apropiada — activa el procesamiento lingüístico que la comprensión sola no activa.

Tres funciones del output en la adquisición:
1. **Noticing:** Al producir, el usuario nota el gap entre lo que quiere decir y lo que puede decir
2. **Hypothesis testing:** El usuario prueba si una forma lingüística es correcta en contexto
3. **Metalinguistic reflection:** El output fuerza al usuario a reflexionar sobre su propio lenguaje

**Por qué sigue siendo válido:** Complementa y no contradice el Input Hypothesis de Krashen. La evidencia respalda que la práctica de output mejora la fluidez, la precisión y la complejidad gramatical de maneras que el input comprensible solo no logra (Swain & Lapkin, 1995; McDonough, 2005).

---

### 2.3 Deliberate Practice

**Referencia:** Ericsson, Krampe & Tesch-Römer (1993); Ericsson (2006)

**Principio central:** La expertise no surge de la práctica en general, sino de práctica deliberada: repetición estructurada en el límite de la competencia actual, con feedback inmediato y específico, y corrección activa de errores.

Características de la práctica deliberada:
1. **Zona de desarrollo:** La tarea está justo por encima del nivel actual (no muy fácil, no imposible)
2. **Feedback inmediato:** El usuario recibe información específica sobre qué salió mal y por qué
3. **Corrección activa:** El usuario no solo recibe feedback — intenta corregir y practica de nuevo
4. **Intencionalidad:** El usuario está enfocado en mejorar, no solo en ejecutar

> **Nota:** La versión simplificada de "10,000 horas" fue parcialmente refutada. La cantidad de práctica
> importa menos que la calidad y el tipo. La clave es el feedback específico y la corrección activa,
> no la acumulación de tiempo.

---

### 2.4 CEFR como marco de medición

**Referencia:** Council of Europe (2020). *CEFR Companion Volume.* Ver [`CEFR_CALIBRATION.md`](./CEFR_CALIBRATION.md) para la implementación específica.

El CEFR provee los descriptores de competencia que permiten al sistema ubicar al usuario en un nivel y definir el siguiente hito concreto. Es el marco de **medición**, no el marco de **aprendizaje**. Los dos son complementarios:

| CEFR | Dice | Qué hace en MasteryTalk |
|------|------|------------------------|
| Qué sabe/puede hacer el usuario | Define los criterios de evaluación | Calibra el sistema de scoring por pilar |
| Cómo llegó ahí | No lo define — no es su propósito | Lo definen los frameworks de esta sección |

---

## §3 — Hallazgos modernos

### 3.1 Willingness to Communicate — WTC

**Referencia:** MacIntyre, Clément, Dörnyei & Noels (1998); MacIntyre & Legatto (2011)

**Principio central:** El predictor más fuerte del desarrollo lingüístico real no es el nivel actual del usuario — es su disposición a comunicarse en la lengua extranjera, especialmente en situaciones de incertidumbre o riesgo social.

WTC es una variable de estado, no de rasgo: fluctúa según el contexto, el interlocutor, el tema y el nivel de ansiedad en el momento. Un usuario con B2 técnico puede tener WTC baja y evitar hablar en reuniones reales. Un usuario con B1 y WTC alta se desarrolla más rápido porque genera más oportunidades de práctica.

**Factores que reducen WTC en profesionales nearshoring:**
- Miedo al juicio de colegas nativos
- Historia de correcciones públicas humillantes
- Autopercepción de "acento inaceptable"
- Stakes altos: el trabajo y la carrera dependen del inglés

**Insight clave para diseño de producto:** Reducir la ansiedad percibida aumenta la práctica real, que a su vez aumenta la competencia. La seguridad psicológica no es un detalle de UX — es un prereq del aprendizaje.

---

### 3.2 L2 Motivational Self System — L2MSS

**Referencia:** Dörnyei (2009); Dörnyei & Ushioda (2011)

**Principio central:** La motivación más poderosa para aprender un idioma no es instrumental ("lo necesito para el trabajo") sino identitaria. El L2MSS tiene tres componentes:

1. **Ideal L2 Self:** La imagen vívida del yo futuro que habla el idioma con fluidez — la versión de uno mismo que comunica con autoridad, accede a oportunidades, es respetado por equipos internacionales.
2. **Ought-to L2 Self:** El yo que debe aprender el idioma para cumplir expectativas externas (el jefe, el cliente, el mercado). Motivación más frágil.
3. **L2 Learning Experience:** El placer o displacer de las sesiones de práctica en sí mismas. Si el proceso es satisfactorio, la motivación se auto-sustenta.

**Insight clave:** La brecha entre el Ideal Self y el estado actual genera tensión motivacional positiva. El producto debe hacer esa brecha visible y la distancia parecer superable — no lejana e inalcanzable.

---

### 3.3 Productive Failure

**Referencia:** Kapur (2016); Kapur & Bielaczyc (2012)

**Principio central:** Intentar resolver un problema antes de recibir instrucción produce mayor aprendizaje que instrucción-primero, aunque el primer intento fracase. El "fallo productivo" activa el procesamiento profundo que hace que el feedback posterior sea más efectivo.

**Mecanismo:** cuando el usuario intenta primero, genera hipótesis, activa conocimiento previo y nota sus propios gaps. Cuando llega el feedback, tiene un "gancho cognitivo" donde anclar la nueva información.

**Condición necesaria:** El ambiente debe ser psicológicamente seguro. Si el fallo es humillante, el efecto se revierte — el usuario evita intentar para no exponerse.

---

### 3.4 Retrieval Practice

**Referencia:** Roediger & Karpicke (2006); Kornell & Bjork (2008); Adesope, Trevisan & Sundararajan (2017, meta-análisis)

**Principio central:** Recuperar activamente información de la memoria (testing, recall) es significativamente más efectivo para la retención a largo plazo que releer o revisar el material. El "testing effect" es uno de los hallazgos más robustamente replicados en ciencia cognitiva.

El efecto se amplifica cuando:
- La recuperación es difícil (pero exitosa)
- Hay espaciado entre sesiones de recuperación
- El feedback correctivo sigue inmediatamente al error

**Implicación directa:** Un sistema de Spaced Repetition que pide al usuario **recordar activamente** (producir la respuesta, no solo reconocerla) es más efectivo que uno que muestra la información con frecuencia.

---

### 3.5 Interactional Competence

**Referencia:** Hall (1999); Young (2011); Pekarek Doehler (2018)

**Principio central:** La competencia lingüística no es una propiedad del individuo — es co-construida en la interacción. Saber el idioma no es suficiente: hay que saber cómo gestionar secuencias de conversación, manejar turnos, reparar malentendidos, señalar acuerdo/desacuerdo y ajustar el mensaje en tiempo real según la respuesta del interlocutor.

El CEFR mide competencias individuales. La Interactional Competence describe lo que realmente ocurre en una reunión, entrevista o llamada de ventas: un fenómeno conjunto, emergente, impredecible.

**Habilidades de IC relevantes para nearshoring:**
- Turn-taking en reuniones de video (señales de que vas a hablar, ceder el turno)
- Backchanneling (señalar que escuchas sin interrumpir)
- Clarification requests sin parecer incompetente
- Repair: corregirse a sí mismo fluidamente sin perder el hilo
- Topic management: introducir un punto, mantenerlo, cerrarlo

---

## §4 — Implementación en MasteryTalk

### 4.1 TBLT

| Dimensión | Estado actual | Dónde aplica | Oportunidad de mejora |
|-----------|--------------|-------------|----------------------|
| **Tareas auténticas** | ✅ 6 escenarios reales (interview, meeting, sales, presentation, culture, self-intro) | `ArenaSystem`, scenario prompts | Aumentar complejidad progresiva dentro de cada path — las tareas del nivel 3 deberían ser más difíciles que las del nivel 1 |
| **Propósito real** | ✅ Presets de situación contextualizados (empresa, stakes, objetivo) | `ExtraContextScreen`, `scenario-presets.ts` | El usuario podría definir su propio propósito con mayor especificidad durante onboarding |
| **Ciclo pre-task** | ✅ `InterviewBriefingScreen` / `PreBriefingScreen` | `PracticeSessionPage` — paso pre-briefing | El pre-briefing da demasiadas hints — ver §4.6 Productive Failure |
| **Post-task report** | ✅ `ConversationFeedback` + `SessionReport` | Pasos 6 y 7 del flujo | Añadir reflexión guiada del usuario antes del feedback del sistema |
| **Secuenciación de tareas** | ⚠️ Los niveles dentro de un path no tienen dificultad progresiva documentada | `ProgressionTree`, levels | Definir la curva de dificultad explícita por path y nivel |

---

### 4.2 Output Hypothesis

| Dimensión | Estado actual | Dónde aplica | Oportunidad de mejora |
|-----------|--------------|-------------|----------------------|
| **Producción activa** | ✅ Voice practice con STT en cada turno | `VoicePractice`, `ArenaSystem` | Core del producto — bien implementado |
| **Noticing del gap** | ✅ Feedback por pilar tras cada sesión | `ConversationFeedback` | El feedback muestra el gap pero no siempre conecta con el momento exacto de la sesión donde ocurrió |
| **Pushed output** | ❌ No implementado | — | El AI interlocutor podría pedir reformulaciones explícitas: *"Could you say that in a more formal way?"* o *"I didn't quite follow — can you rephrase?"* |
| **Hypothesis testing** | ⚠️ Implícito en la conversación | `ArenaSystem` turns | Hacer explícito: al final de la sesión, mostrar 2–3 frases propias del usuario junto a su alternativa mejorada |

---

### 4.3 Deliberate Practice

| Dimensión | Estado actual | Dónde aplica | Oportunidad de mejora |
|-----------|--------------|-------------|----------------------|
| **Zona de desarrollo** | ⚠️ Los escenarios tienen dificultad fija, no adaptativa | `ArenaSystem`, personas | La dificultad del interlocutor debería escalar con el nivel del usuario |
| **Feedback inmediato** | ✅ Feedback post-sesión por pilar con score | `ConversationFeedback` | El feedback es post-sesión. Para pronunciación, feedback en-turno podría ser más efectivo |
| **Corrección activa** | ✅ `DeepDiveCard` → lecciones específicas al pilar débil | `FeedbackScreen`, `Lessons Library` | Añadir "micro-drill" dentro de la sesión: practicar una frase o patrón específico que falló reiteradamente |
| **Intencionalidad** | ⚠️ El usuario no establece un objetivo específico antes de practicar | `ExtraContextScreen` | Pregunta pre-sesión: *"¿En qué quieres enfocarte hoy?"* con opciones derivadas del pilar más débil del usuario |

---

### 4.4 Willingness to Communicate — WTC

| Dimensión | Estado actual | Dónde aplica | Oportunidad de mejora |
|-----------|--------------|-------------|----------------------|
| **Reducción de ansiedad** | ✅ Arena arranca en fase `Support` (Conversational Path) | `ArenaSystem` — phase management | El modo Support podría ser más explícito: *"Este espacio es solo para ti — aquí no te juzga nadie"* |
| **Warm-up de bajo stakes** | ✅ `self-intro` como primer path gratuito | `ProgressionTree`, free path | Considerar un ramp-up de 2–3 minutos al inicio de cada sesión antes del escenario principal |
| **Métricas de confianza** | ❌ No existe medición de WTC o confianza percibida | — | Check-in pre-sesión de 1 pregunta: *"¿Cómo te sientes hoy para practicar? (1–5)"* → dato para personalizar el tono del interlocutor |
| **Celebración de intentos** | ⚠️ El feedback celebra scores altos, no el acto de intentar | `SessionReport` | Añadir reconocimiento explícito al finalizar: *"Completaste X sesiones esta semana — eso es lo que construye el progreso"* |
| **Historial de progreso** | ⚠️ El dashboard muestra nivel actual pero no la trayectoria de mejora | `DashboardPage` | Mostrar evolución de scores en el tiempo — ver que mejoraste de B1 a B2 en 6 semanas es el mayor motivador de WTC |

---

### 4.5 L2 Motivational Self System

| Dimensión | Estado actual | Dónde aplica | Oportunidad de mejora |
|-----------|--------------|-------------|----------------------|
| **Ideal L2 Self** | ✅ Landing: *"acceso a riqueza y poder"* — framing identitario correcto | `LandingPage` | El framing identitario existe en marketing pero desaparece dentro del producto. El Dashboard debería recordar al usuario su objetivo original |
| **Ought-to Self** | ⚠️ Implícito en el contexto de trabajo | — | Evitar depender de motivación externa. Reforzar el Ideal Self con personalización |
| **L2 Learning Experience** | ✅ UX de alta calidad + celebración post-sesión | Toda la app | Mantener y mejorar — la calidad de la experiencia es el sustento de la motivación intrínseca |
| **Personalización del Ideal Self** | ❌ El objetivo del usuario no se captura ni se usa | `AccountPage`, onboarding | Durante onboarding: *"¿Cuál es la situación concreta que quieres lograr con tu inglés?"* → se muestra en Dashboard como recordatorio anclado |

---

### 4.6 Productive Failure

| Dimensión | Estado actual | Dónde aplica | Oportunidad de mejora |
|-----------|--------------|-------------|----------------------|
| **Intento antes de instrucción** | ✅ El flujo es práctica → feedback → lección | `PracticeSessionPage` flow | Preservar este orden. No invertirlo bajo ninguna circunstancia |
| **Pre-briefing y hints** | ⚠️ `InterviewBriefingScreen` da contexto detallado antes de practicar | Pre-briefing step | El pre-briefing informa contexto (correcto) pero no debe resolver los retos del usuario — solo enmarcar la situación |
| **Ambiente seguro** | ✅ Práctica privada con AI, sin juicio social | `ArenaSystem` | Hacer más explícita la seguridad: *"Tu sesión es privada — solo tú ves los resultados"* |
| **Challenge Mode** | ❌ No existe opción de practicar sin pre-briefing | — | Para usuarios B2+: opción de "Modo desafío" que lanza directo al escenario sin contexto previo |

---

### 4.7 Retrieval Practice

| Dimensión | Estado actual | Dónde aplica | Oportunidad de mejora |
|-----------|--------------|-------------|----------------------|
| **Spaced Repetition** | ✅ Sistema SR + WhatsApp SR Coach | `spacedRepetition.ts`, SR edge function | Bien implementado como sistema de distribución. El problema está en el formato del contenido |
| **Formato de recall activo** | ⚠️ Las lecciones son textos para leer, no ejercicios de recall | `Lessons Library`, `LessonModal` | Añadir al final de cada lección 2–3 preguntas de recall: *"Sin mirar, ¿cuáles son las 3 formas de iniciar un desacuerdo profesional?"* |
| **SR como producción** | ✅ Audio challenge de WhatsApp — ya es recall activo | WhatsApp SR Coach | Potenciarlo con respuesta de voz del usuario, no solo reconocimiento |
| **Interleaving** | ❌ No implementado | — | Mezclar pilares en sesiones de repaso en lugar de practicarlos de forma aislada — el interleaving aumenta retención aunque se sienta más difícil |

---

### 4.8 Interactional Competence

| Dimensión | Estado actual | Dónde aplica | Oportunidad de mejora |
|-----------|--------------|-------------|----------------------|
| **Conversación multi-turno** | ✅ Arena con 8–12 turnos en contexto real | `ArenaSystem` | Core del producto — bien implementado |
| **10 personas con estilos distintos** | ✅ `personas.ts` — perfiles de interlocutor variados | `INTERLOCUTORS_BY_SCENARIO` | Documentar explícitamente qué competencias interaccionales desarrolla cada persona |
| **Turn-taking y backchanneling** | ❌ No se evalúa ni se entrena explícitamente | — | Añadir al sistema de feedback: detección de patrones de turno (¿el usuario interrumpió? ¿cedió el turno cuando debía?) |
| **Repair y rephrase** | ❌ No se evalúa | — | El pilar "Fluency" podría incluir una sub-dimensión de repair: capacidad de auto-corregirse y continuar fluidamente |
| **Evaluación de IC** | ❌ Los 6 pilares miden producción individual | `CEFR_CALIBRATION.md` | Considerar un 7° pilar implícito: "Interaction Management" — medido por coherencia multi-turno y manejo de quiebres comunicativos |

---

## §5 — Gaps y oportunidades priorizadas

| # | Gap | Framework | Oportunidad concreta | Impacto | Complejidad |
|---|-----|-----------|---------------------|---------|-------------|
| 1 | No hay medición de ansiedad/confianza | WTC | Check-in pre-sesión (1 pregunta, 1–5) → personalizar tono del interlocutor | 🔴 Alto | 🟢 Baja |
| 2 | Las lecciones son lecturas, no recalls | Retrieval Practice | Añadir 2–3 preguntas de recall al final de cada `LessonModal` | 🔴 Alto | 🟢 Baja |
| 3 | El Ideal Self desaparece dentro del producto | L2MSS | Capturar objetivo específico en onboarding → anclar en Dashboard | 🔴 Alto | 🟡 Media |
| 4 | No hay trayectoria de progreso visible | WTC + L2MSS | Gráfica de evolución de scores en el tiempo en Dashboard | 🔴 Alto | 🟡 Media |
| 5 | No hay pushed output en la conversación | Output Hypothesis | AI interlocutor pide reformulaciones en momentos clave | 🟡 Medio | 🟡 Media |
| 6 | El objetivo de sesión no es explícito | Deliberate Practice | Pregunta pre-sesión: *"¿En qué quieres enfocarte hoy?"* | 🟡 Medio | 🟢 Baja |
| 7 | La dificultad de escenarios es fija | Deliberate Practice | Curva de dificultad progresiva documentada por nivel y path | 🟡 Medio | 🔴 Alta |
| 8 | Turn-taking e IC no se evalúan | Interactional Competence | Sub-dimensión de Interaction Management en feedback | 🟡 Medio | 🔴 Alta |
| 9 | Challenge Mode ausente | Productive Failure | Modo sin pre-briefing para usuarios B2+ | 🟢 Bajo | 🟢 Baja |

---

## §6 — Principios de diseño pedagógico

Estos principios derivan directamente del marco metodológico y deben guiar las decisiones de producto. Cuando exista tensión entre ellos, el orden de prioridad es el mismo que el orden de lista.

**P1 — Producción primero, instrucción después**
El usuario practica antes de recibir contenido explicativo. El flujo práctica → feedback → lección nunca se invierte. Las lecciones son consecuencia del error, no prerequisito de la práctica.

**P2 — La seguridad psicológica es infraestructura, no feature**
Si el usuario siente que será juzgado o avergonzado, no habla. No hablar es el único fracaso real. Toda decisión de diseño que aumenta la ansiedad percibida debe ser rechazada.

**P3 — El feedback debe ser específico, inmediato y orientado a la siguiente acción**
Un score sin dirección no produce cambio. Cada dato de feedback debe tener una acción recomendada: no *"tu fluency es 54/100"* sino *"en tu próxima sesión, reemplaza las pausas llenas (um, uh) por silencio breve — suenas más seguro."*

**P4 — La dificultad óptima está justo al límite de la competencia actual**
Demasiado fácil no desarrolla. Demasiado difícil desmotiva. La curva de dificultad dentro de cada path debe estar calibrada al nivel CEFR objetivo del level en curso.

**P5 — La motivación identitaria supera a la instrumental**
*"Necesito el inglés para mi trabajo"* es frágil. *"Me veo como alguien que comunica con autoridad en inglés"* es duradera. El producto debe reforzar la identidad deseada, no solo la utilidad inmediata.

**P6 — Recuperar es más valioso que revisar**
Una pregunta de recall vale más que releer la lección tres veces. Los sistemas de refuerzo deben pedir producción activa, no reconocimiento pasivo.

**P7 — La conversación es el medio y el fin**
La competencia comunicativa profesional no se desarrolla leyendo sobre comunicación. Se desarrolla comunicando. Todo el producto orbita alrededor de la práctica conversacional activa.

---

## Referencias

- Council of Europe (2020). *Common European Framework of Reference for Languages: Companion Volume.* Council of Europe Publishing.
- Willis, J. (1996). *A Framework for Task-Based Learning.* Longman.
- Ellis, R. (2003). *Task-based Language Learning and Teaching.* Oxford University Press.
- Ellis, R. (2018). *Reflections on Task-Based Language Teaching.* Multilingual Matters.
- Swain, M. (1985). Communicative competence: Some roles of comprehensible input and comprehensible output in its development. En Gass & Madden (Eds.), *Input in Second Language Acquisition.*
- Swain, M. (1995). Three functions of output in second language learning. En Cook & Seidlhofer (Eds.), *Principle and Practice in Applied Linguistics.*
- Ericsson, K.A., Krampe, R.T. & Tesch-Römer, C. (1993). The role of deliberate practice in the acquisition of expert performance. *Psychological Review, 100*(3), 363–406.
- MacIntyre, P.D., Clément, R., Dörnyei, Z. & Noels, K.A. (1998). Conceptualizing willingness to communicate in a L2: A situational model of L2 confidence and affiliation. *The Modern Language Journal, 82*(4), 545–562.
- Dörnyei, Z. (2009). The L2 Motivational Self System. En Dörnyei & Ushioda (Eds.), *Motivation, Language Identity and the L2 Self.* Multilingual Matters.
- Kapur, M. (2016). Examining productive failure, productive success, unproductive failure, and unproductive success in learning. *Educational Psychologist, 51*(2), 289–299.
- Roediger, H.L. & Karpicke, J.D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255.
- Hall, J.K. (1999). A prosaics of interaction: The development of interactional competence in another language. En Hinkel (Ed.), *Culture in Second Language Teaching and Learning.* Cambridge University Press.
- Young, R.F. (2011). Interactional competence in language learning, teaching, and testing. En Hinkel (Ed.), *Handbook of Research in Second Language Teaching and Learning, Vol. 2.*
- Bryfonski, L. & McKay, T.H. (2017). TBLT implementation and evaluation: A meta-analysis. *Language Teaching Research, 23*(5), 603–632.
- Adesope, O.O., Trevisan, D.A. & Sundararajan, N. (2017). Rethinking the use of tests: A meta-analysis of practice testing. *Review of Educational Research, 87*(3), 659–701.

---

*v1.0 — 2026-05-01*
*Autores: MasteryTalk PRO Product Team*
*Revisión recomendada: cuando el dataset de sesiones supere las 500 para calibración empírica de estimaciones de progresión*
