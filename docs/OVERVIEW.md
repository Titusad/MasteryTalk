# MasteryTalk PRO — Documento de Overview

> Última actualización: 2026-05-04 (Beta v14.6)
> Para: inversores, nuevos colaboradores, socios, stakeholders.
> Fuente de verdad técnica: `PRODUCT_SPEC.md` y `ROADMAP.md`.

---

## Qué es MasteryTalk PRO

MasteryTalk PRO es un simulador de comunicación profesional en inglés, construido para profesionales en nearshoring de cualquier país del mundo que trabajan — o quieren trabajar — con empresas estadounidenses. Comercialmente, el foco inicial es Colombia, México, Brasil y LATAM en general, mercados donde la demanda de comunicación profesional en inglés para nearshoring es más alta y el acceso a coaching de calidad más limitado.

No es una app de idiomas. No es un curso de inglés. Es una plataforma de práctica deliberada donde el usuario tiene conversaciones reales con una IA que actúa como jefe, cliente, entrevistador o colega de EE.UU., y recibe feedback estructurado después de cada sesión.

**Propuesta de valor en una frase:** Le damos al profesional en nearshoring la habilidad de comunicarse con autoridad en inglés en contextos de alto impacto — entrevistas, reuniones, presentaciones, ventas — sin esperar turno con un tutor humano y a una fracción del costo.

---

## El problema que resuelve

Hay más de 2 millones de profesionales de tecnología en nearshoring alrededor del mundo — con mayor concentración en Colombia (165K), México (800K) y Brasil (500K) — con inglés intermedio-avanzado que no consiguen los roles que merecen, o no avanzan en los que tienen, porque no saben comunicarse con confianza en inglés en entornos corporativos de EE.UU.

El EF English Proficiency Index 2026 confirma el problema: Colombia (485), Brasil (466) y México (459) están clasificados en la banda **Bajo** — los tres principales hubs de talento técnico de la región. Demanda norteamericana en máximos históricos, talento técnico de clase mundial, inglés en banda baja.

El problema no es vocabulario ni gramática. Es:

- No saber cómo estructurar una respuesta en una entrevista bajo presión.
- Evitar el conflicto en reuniones cuando deberían defender su postura.
- Hablar en círculos en lugar de ir directo al punto en presentaciones.
- No entender que en cultura de EE.UU. el silencio se interpreta como falta de criterio.

Los cursos de inglés no entrenan esto. Los tutores humanos cuestan $30–80/hora y hay que agendar. Las apps como Duolingo son entretenimiento, no preparación profesional.

MasteryTalk ataca exactamente ese gap.

---

## A quién va dirigido

**Perfil principal:** Profesional técnico o de negocios en nearshoring, 25–38 años, con inglés B1–C1, que trabaja o busca trabajo en una empresa estadounidense. Puede estar en cualquier país del mundo. El mercado comercial de arranque se concentra en Colombia, México, Brasil y LATAM por volumen de demanda y tamaño del mercado de nearshoring.

**Escenarios de uso típicos:**
- Software engineer que se postula a roles en empresas de EE.UU.
- Product designer que quiere hablar con autoridad en design reviews internacionales.
- Account executive que cierra ventas B2B en inglés con clientes de EE.UU.
- Profesional recién promovido que ahora tiene que presentar en inglés al C-level.

**No es para:** Estudiantes de inglés básico. Turistas. Personas que solo necesitan conversación casual.

---

## Cómo funciona el producto

### El flujo de una sesión

```
Selección de escenario y nivel
    → Setup de contexto (rol, empresa, situación)
        → Micro-lección de preparación (90 segundos — primado de vocabulario)
            → Preparación táctica (briefing generado por IA)
                → Conversación en tiempo real con IA
                    → Análisis y feedback estructurado
                        → Micro-lecciones recomendadas (DeepDiveCard)
```

1. **Setup de contexto:** El usuario elige un escenario (entrevista, reunión, etc.) y una situación específica (puede pegar su descripción de trabajo, agenda o brief de cliente). También puede activar Challenge Mode para saltarse la preparación y ir directo a la conversación.

2. **Micro-lección de preparación:** Antes del briefing, el sistema muestra una lección de 90 segundos — vocabulario clave, power phrase destacada y una pregunta de recall gateada (el CTA está bloqueado hasta que el usuario revela la respuesta). Seleccionada por nivel y ruta activa. Saltada en Challenge Mode, War Room y self-intro.

3. **Briefing personalizado:** La IA genera en tiempo real un briefing táctico: perfil del interlocutor, preguntas probables, frases clave y un framework de respuesta adaptado al perfil del usuario (cargo, industria, experiencia).

4. **Conversación con voz:** El usuario habla con un interlocutor de IA — un entrevistador exigente, un cliente difícil, un VP escéptico — usando su micrófono. El interlocutor responde en audio, presiona, pide claridad, interrumpe. Hay tres fases progresivas: Support (con hints), Guidance (sin hints), Challenge (sin ayuda, máxima presión).

5. **Feedback con doble eje:** Gemini 1.5 Flash analiza la sesión completa y genera:
   - Puntuación por 6 pilares CEFR: Vocabulary, Grammar, Fluency, Pronunciation, Professional Tone, Persuasion
   - Comparación vs. sesión anterior del mismo escenario (delta por pillar)
   - Top 3 micro-lecciones recomendadas según las debilidades de esa sesión

6. **Lecciones entre sesiones:** 50 micro-lecciones disponibles en la biblioteca, con recall activo al final de cada una (preguntas de memoria, no lectura pasiva).

### El sistema de progresión

Hay 5 Rutas de Aprendizaje, cada una con 6 niveles:

| Ruta | Descripción |
|------|-------------|
| **Interview Mastery** | Entrevistas de trabajo en inglés con metodología STAR y más |
| **Remote Meeting Presence** | Controlar agenda, dirigir conversación, cerrar con acuerdos |
| **Presentations** | Estructurar y entregar presentaciones de alto impacto |
| **Sales Champion** | Ventas B2B en inglés con clientes de EE.UU. |
| **U.S. Business Culture** | Comunicación directa, ownership, credibilidad en cultura americana |

**Desbloqueo progresivo:** Al suscribirse, el usuario desbloquea solo su **Primary Path** — elegido a partir de la recomendación del self-intro. Al completar los 6 niveles de ese path, elige y desbloquea el siguiente. Así sucesivamente. No se accede a todas las rutas desde el día 1.

**Primary Path — elegido, no asignado:** La recomendación viene del motor de análisis del self-intro (pillarScores + contexto + profesión). El usuario puede confirmar o cambiar la recomendación antes de suscribirse.

### Self-Intro Warm-Up (free)

Antes de comprar, cualquier usuario puede hacer hasta 3 sesiones gratuitas de auto-presentación profesional (networking, presentación al equipo, reunión con cliente). Funciona como demostración del producto y como diagnóstico de intake — los scores de esa sesión determinan la recomendación del Primary Path. Sin tarjeta de crédito.

### War Room

Acceso rápido sin setup, para practicar cualquier escenario de forma inmediata. Salta el paso de experiencia e inicia directamente en contexto. No requiere que esa ruta esté desbloqueada en el programa — es la válvula de urgencia. Límite: 5 sesiones/mes por usuario suscrito.

### WhatsApp SR Coach

Complemento de retención: el usuario recibe un micro-desafío de audio diario por WhatsApp con una frase profesional clave. Responde en audio, recibe puntuación de pronunciación y retroalimentación inmediata. El sistema usa Spaced Repetition — las frases con menor score se repiten más. Actualmente en modo sandbox (pendiente aprobación Meta Business para producción).

---

## El modelo de programa

MasteryTalk no es una suscripción a una app — es un programa estructurado de 3 meses con un arco de progresión claro:

| Bloque | Duración | Contenido |
|--------|----------|-----------|
| **Foundation Program** | Meses 1–3 | **Primary Path** — elegido por el usuario a partir de la recomendación del self-intro |
| **Advanced Program** | Meses 4–6 | Segunda ruta — el usuario elige entre las restantes al completar el Primary Path |
| **Mastery Program** | Meses 7–9 | Rutas restantes — el usuario elige el orden |

**Business Culture — transversal, no obligatorio:** Los usuarios en otros Primary Paths reciben contenido de Business Culture en cada sesión vía micro-lecciones pre-sesión. No es una ruta obligatoria previa — es un path más, disponible como Primary Path cuando la recomendación lo indica.

**War Room como válvula de urgencia:** Disponible desde el día 1, permite practicar cualquier escenario inmediatamente (5 sesiones/mes) sin esperar a desbloquearlo en el programa. Para el usuario con una entrevista en 3 días, el War Room es la respuesta.

---

## Pricing

| Oferta | Precio | Descripción |
|--------|--------|-------------|
| **Founding Member** | $49/3 meses (~$16/mes) | 25 slots limitados — precio bloqueado para siempre |
| **Programa** (regular) | $129/3 meses (~$43/mes) | Oferta principal — un ciclo completo de programa |
| **Acceso mensual** | $49/mes | Entrada flexible — sin compromiso trimestral |

- Los primeros 25 suscriptores obtienen precio Founding Member automáticamente — el backend lo aplica mientras queden slots.
- Después de 90 días, el programa continúa al siguiente bloque automáticamente.
- No existen créditos individuales, pruebas gratuitas con tarjeta, ni plan anual.

**Benchmark competitivo:** Talaera cobra $20/mes por sesiones en vivo con coach humano con agenda previa. MasteryTalk a $43/mes (Programa) ofrece un programa estructurado con IA 24/7, progresión medible en CEFR y outcomes concretos — el doble de precio, diez veces más accesible.

**Margen bruto (ciclo 90 días, ~15 sesiones/mes):**
- Founding Member ($49/3mo): ~77%
- Programa regular ($129/3mo): ~91%
- Monthly ($49/mo × 3 = $147/ciclo): ~77%

---

## Stack tecnológico

### Frontend
- **React 18 + TypeScript + Tailwind CSS v4 + Vite 6**
- Arquitectura FSD (Feature-Sliced Design): `app → pages → widgets → features → entities → shared`
- Hash-based routing (`#dashboard`, `#practice-session`)
- Deploy en **Vercel** con auto-deploy en push a `main`

### Backend
- **Supabase Edge Functions** (Deno + Hono) — un solo Edge Function monolítico con múltiples rutas
- Base URL: `https://zkuryztcwmazspscomiu.supabase.co/functions/v1/make-server-08b8658d`
- Base de datos: **Supabase PostgreSQL** + KV store propio para perfil de usuario y progresión
- Scheduler: **Supabase pg_cron** (diario, 9 AM) para el SR Coach y nudges de inactividad

### IA y voz
| Función | Tecnología |
|---------|-----------|
| Conversación en sesión | **GPT-4o** — todas las sesiones, sin degradación |
| Análisis de feedback | **Gemini 1.5 Flash** |
| TTS dinámico (primary) | **OpenAI `gpt-4o-mini-tts`** — voces `cedar` (interlocutor) + `marin` (usuario) |
| TTS dinámico (fallback) | **ElevenLabs** `eleven_turbo_v2_5` |
| Narración de coach | **ElevenLabs** pre-generado — archivos en Cloudflare R2 vía Supabase Storage ($0 por usuario) |
| STT + pronunciación | **Azure Speech REST API** |

### Infraestructura de negocio
| Función | Tecnología |
|---------|-----------|
| Pagos y suscripciones | **Stripe** (live mode, subscriptions) |
| Email transaccional | **Resend** (`hello@masterytalk.pro`) — English only |
| Email marketing | **Loops.so** (`mail.go.masterytalk.pro`) — 5 secuencias lifecycle, English only |
| WhatsApp SR Coach | **Twilio** + **Meta Business API** |
| Monitoreo de errores | **Sentry** (`@sentry/react`, producción) |
| Auth | **Supabase Auth** — Google OAuth |

### Política de idioma
El selector de idioma (ES / PT / EN) aplica **exclusivamente a la landing page**. El dashboard, las sesiones de práctica, los emails transaccionales y los emails de marketing están en inglés. La inmersión comienza en el primer contacto.

### Costo por usuario activo
El costo de IA por usuario (~15 sesiones/mes) es aproximadamente **$4.03/mes** — principalmente GPT-4o para conversación. La optimización de TTS a OpenAI primary redujo el costo ~20x (de $1.80 a $0.09 por sesión).

---

## Emails automáticos

### Transaccionales (Resend)
| Email | Trigger |
|-------|---------|
| Welcome | Registro de nuevo usuario |
| Subscription confirmation | Pago completado via Stripe webhook |
| Session summary | Después de cada práctica |
| Renewal confirmation | Cobro recurrente exitoso (dos variantes: con/sin actividad) |
| Inactivity nudge | 7+ días sin sesión (máx. 1 cada 14 días) |

### Marketing lifecycle (Loops.so)
| Loop | Trigger | Delay | Filtro |
|------|---------|-------|--------|
| Activation | contact_created | D+2 | — |
| Conversion | contact_created | D+5 | first_session_completed = true, no suscrito |
| Reactivation | contact_created | D+7 | first_session_completed = false |
| Post-session upsell | first_session_completed | inmediato | no suscrito |
| Urgency | contact_created | D+21 | no suscrito |

Todos los emails en **inglés**. El welcome D+0 lo hace Resend. Loops arranca desde D+2.

---

## Estado actual — Beta v14.6 (2026-05-04)

### Live y funcionando
- 5 escenarios activos (+ self-intro free): interview, meeting, presentation, sales, culture
- Stripe subscriptions live — FM $49/3mo · Programa $129/3mo · Monthly $49/mo
- Flujo completo: setup → micro-lección → briefing → conversación → feedback → micro-lecciones recomendadas
- **Pre-session lesson step (§7.9):** micro-lección de 90 segundos entre context y strategy — recall gateado, seleccionada por nivel/ruta o pilar más débil
- 50 micro-lecciones con recall activo y recomendación dual-eje
- WhatsApp SR Coach (sandbox — pendiente aprobación Meta)
- Landing page en 3 idiomas (ES / PT / EN) — único punto multiidioma
- 5 emails transaccionales (Resend) + 5 secuencias lifecycle (Loops.so backend listo)
- Admin dashboard con tracking de costos de API
- Monitoreo de errores con Sentry
- Challenge Mode (práctica sin briefing ni hints)
- Selector de foco de sesión y check-in de confianza pre-sesión
- **Dashboard de progreso:**
  - Goal anchor (Ideal Self del usuario)
  - Score trajectory chart (últimas 10 sesiones, recharts, CEFR milestones)
  - "Since you started" card — delta de pilares primera vs. última sesión
  - Comparación per-escenario en FeedbackScreen (delta vs. sesión anterior del mismo tipo)
  - CEFR badge dinámico con gate pills
  - Day X of 90 counter
  - Streak 7-day grid
- **Celebraciones:** LevelMilestoneModal (confetti en level completion ≥75) + ChooseNextPathModal (confetti + LinkedIn share en path completion)
- **Modelo de programa:** Primary Path desde self-intro, desbloqueo progresivo implementado
- Progression tree con ChooseNextPathModal para elegir siguiente ruta

### Gaps conocidos
- WhatsApp en sandbox (requiere aprobación Meta Business — en proceso)
- Loops.so sequences backend listo, falta configurar las 5 secuencias en el dashboard y actualizar copy
- Stripe Customer Portal requiere activación manual en Stripe Dashboard settings
- Google OAuth muestra nombre de app de desarrollo en algunos contextos

### Próximas prioridades
1. **Loops.so sequences** — configurar las 5 secuencias con copy revisado en el dashboard
2. **Producción de WhatsApp** — migración de sandbox a número dedicado (~1 semana post-aprobación Meta)
3. **Infraestructura corporativa** — migrar cuentas a billing corporativo antes de usuarios pagos
4. **Sprint C pedagógico** — curva de dificultad progresiva por nivel + dimensión de Interaction Management en feedback

---

## Roadmap de alto nivel

| Fase | Objetivo | Estado |
|------|----------|--------|
| **Phase 0** | Pre-launch repositioning — programa model, pricing, progresión | ✅ Completo |
| **Phase 1** | Beta launch — todo lo necesario antes del primer usuario pagador | ✅ Completo |
| **Phase 2** | Crecimiento y retención — emails, dashboard, conversión | ✅ En producción |
| **Phase 2.5** | Profundidad pedagógica — ciencia del aprendizaje aplicada | Sprint A+B+B.4 completo |
| **Phase 3** | Expansión de contenido — más rutas, más razones para quedarse | Sales + Culture completados |
| **Phase 4** | Escala y monetización — B2B, enterprise, all-access bundle | Pendiente retención data |

---

## Lo que NO existe (para evitar confusión)

- No hay créditos individuales por sesión
- No hay prueba gratuita con tarjeta de crédito
- No hay plan anual (pendiente data de retención)
- No hay clases en vivo con humanos
- No hay app móvil (pendiente PMF en web)
- No se desbloquean todas las rutas desde el día 1 — Progressive model: Primary Path primero, luego una ruta a la vez
- No hay escenarios de negociación, C-suite o clientes externos (roadmap futuro)
- Precios legacy retirados: $12.99, $19.99, $29.99 EB, $47.99 — la estructura actual es $49/mo · $49/3mo FM · $129/3mo Programa

---

## Métricas norte

| Métrica | Objetivo |
|---------|----------|
| North Star | 3+ sesiones completadas en los primeros 7 días |
| Costo IA por usuario activo | ~$4.03/mes (15 sesiones) |
| Gross margin (Programa $129/3mo) | ~91% |
| Gross margin (Monthly $49/mo) | ~77% |
| Gross margin (FM $49/3mo) | ~77% |
| Benchmark competitivo | Talaera $20/sesión human coach → MasteryTalk $43/mo IA 24/7 |

---

*Generado de PRODUCT_SPEC.md v3.3 y ROADMAP.md Beta v14.6.*
*Para cambios en pricing, escenarios o features → actualizar PRODUCT_SPEC.md primero.*
