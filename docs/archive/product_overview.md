# inFluentia PRO - Product Overview

## 1. ¿Qué es inFluentia PRO?
**inFluentia PRO** es una plataforma inmersiva de entrenamiento conversacional basada en Inteligencia Artificial, diseñada específicamente para **profesionales no nativos de habla inglesa**. Su objetivo es ayudar a sus usuarios a refinar su "tono ejecutivo" (Executive Presence) y su capacidad de persuasión en situaciones de alto impacto y de ciclo completo (entrevistas de trabajo, ventas B2B, liderazgo).

A diferencia de las aplicaciones tradicionales de idiomas que se enfocan en la gramática básica o en vocabulario cotidiano, inFluentia PRO se enfoca en la **competencia profesional y el impacto comunicativo**.

---

## 2. ¿Qué dolor (Pain Points) soluciona?

1. **El Síndrome de la Mente en Blanco bajo presión:**
   Candidatos y ejecutivos brillantes en su idioma nativo que, ante situaciones de estrés (una entrevista en Big Tech o un pitch a un cliente de EE. UU.), pierden fluidez, estructura y terminan sonando menos competentes de lo que realmente son.
   
2. **Falta de práctica hiper-realista a nivel directivo:**
   Los profesionales Senior necesitan practicar con un interlocutor que iguale su nivel de exigencia (ej. un inversor escéptico o un reclutador implacable). inFluentia PRO simula de forma dinámica estas personalidades, permitiendo hacer "role real" en un entorno seguro antes de la llamada real.

3. **La superficialidad del "Feedback":**
   Normalmente, practicar frente al espejo no ofrece correcciones reales, y los tutores de inglés no siempre tienen el contexto de negocios para evaluar un *framework* STAR o la persuasión de un alegato de ventas. inFluentia PRO proporciona retroalimentación instantánea, objetiva y holística:
   * **Nivel fonético:** detectando con Azure problemas exactos de pronunciación y ritmo.
   * **Nivel discursivo (Executive Tone):** detectando si la respuesta fue repetitiva, careció de impacto o le faltó estructura (ej. no usar datos o ignorar la métrica en respuestas).

---

## 3. ¿Cómo funciona la App? (El "Core Loop")

La aplicación funciona mediante un ciclo de aprendizaje (Learning Loop) que integra preparación, práctica bajo presión y remediación.

### A. Preparación Contextual (El Perfil)
El usuario ingresa su industria, el cargo deseado e incluso puede cargar su CV para que el sistema tenga contexto real. Todo esto alimenta dinámicamente el `System Prompt` de los simuladores.

### B. El Árbol de Progresión (Dashboard)
Los usuarios navegan a través de un **Árbol de Progresión** estructurado por ramas (`Interview`, `Sales`). Los niveles aumentan progresivamente en complejidad (ej. Phone Screen -> Behavioral Round -> Executive Presentation).

### C. La Sala de Práctica (Briefing y Arena)
Cuando el usuario selecciona un escenario, entra al flujo interactivo:
1. **Briefing Room (La Pre-via):** Se le entregan las "Anticipated Questions" (lo que el interlocutor le va a preguntar), el "Por qué" se lo preguntarán y frases de "Toolbox" adaptadas al escenario para que arme sus propias respuestas en el momento.
2. **The Arena (Practice Session):** Conversación interactiva en tiempo real por voz. El sistema usa:
   * **GPT-4o:** Prompts altamente especializados para actuar como un entrevistador/comprador hiper-realista que reacciona de forma dinámica.
   * **ElevenLabs:** Para una voz humana y fluida (Text-to-Speech).
   * **Coaching en vivo:** Si el usuario se atasca, la UI le avisa con un "Coaching Hint" (ayudas contextuales en pantalla).

### D. Análisis Profundo Post-Sesión
Al presionar "Finalizar", el backend (ejecutando en Edge Functions de Supabase) corre un análisis intensivo y entrega:
* Un reporte de **Calidad de Contenido** (Relevancia, Estructura, Ejemplos, Impacto).
* **Mejora del Script:** Transforma la respuesta balbuceante del usuario en una versión pulida, utilizando un formato *Side-by-Side* (Antes y Después).
* **Azure Pronunciation Assessment (Phoneme level):** Extrae palabras exactas donde hubo fallos fonéticos (omisiones, mala pronunciación) para revisión de fluidez.

### E. Remediación (Lesson Modal - El flujo rediseñado)
Si el usuario obtiene un bajo rendimiento en alguna nota clave (Ej. *Professional Tone* o *STAR Method*), la plataforma no lo deja avanzar en su árbol de progresión y lo envía a una **Lección Estructurada ("Study Phase")**.
Esta modal de 5 pasos se genera dinámicamente con IA de acuerdo al punto débil detectado:
1. **Concepto:** Define el modelo mental teórico (ej. Cómo anclar tu respuesta a una métrica).
2. **Escenario:** Demuestra la teoría en práctica dentro de un reto.
3. **Comparación:** Un "Antes vs. Después" destacando cómo un amateur respondería vs. un profesional.
4. **Toolkit (Shadowing):** Una lista interactiva de frases clave extraídas por IA que el usuario debe escuchar y repetir frente al micrófono.
5. **Ejercicio de Voz (El Test):** El usuario graba una respuesta final usando las lecciones aprendidas. Solo tras pasar satisfactoriamente este test, el usuario "desbloquea" la siguiente fase de su Árbol de Progresión.

---

> **En resumen:** inFluentia PRO transforma a profesionales con un "inglés suficiente pero oxidado" en comunicadores perspicaces, asertivos y convincentes. Combina la práctica intensiva impulsada por LLMs con mecánicas de juego (árboles de progresión y desbloqueos) y retroalimentación profunda usando el estado del arte en Speech Models.
