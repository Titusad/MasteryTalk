# MasteryTalk PRO — Documento de Overview

> Última actualización: 2026-05-03 (Beta v14.3)
> Para: inversores, nuevos colaboradores, socios, stakeholders.
> Fuente de verdad técnica: `PRODUCT_SPEC.md` y `ROADMAP.md`.

---

## Qué es MasteryTalk PRO

MasteryTalk PRO es un simulador de comunicación profesional en inglés, construido para profesionales en nearshoring de cualquier país del mundo que trabajan — o quieren trabajar — con empresas estadounidenses. Comercialmente, el foco inicial es Colombia, México, Brasil y LATAM en general, mercados donde la demanda de comunicación profesional en inglés para nearshoring es más alta y el acceso a coaching de calidad más limitado.

No es una app de idiomas. No es un curso de inglés. Es una plataforma de práctica deliberada donde el usuario tiene conversaciones reales con una IA que actúa como jefe, cliente, entrevistador o colega de EE.UU., y recibe feedback estructurado después de cada sesión.

**Propuesta de valor en una frase:** Le damos al profesional en nearshoring la habilidad de comunicarse con autoridad en inglés en contextos de alto impacto — entrevistas, reuniones, presentaciones, ventas — sin esperar turno con un tutor humano y a una fracción del costo.

---

## El problema que resuelve

Hay millones de profesionales en nearshoring alrededor del mundo — con mayor concentración en Colombia, México, Brasil y el resto de LATAM — con inglés intermedio-avanzado que no consiguen los roles que merecen, o no avanzan en los que tienen, porque no saben comunicarse con confianza en inglés en entornos corporativos de EE.UU.

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
        → Preparación táctica (briefing generado por IA)
            → Conversación en tiempo real con IA
                → Análisis y feedback estructurado
                    → Micro-lecciones recomendadas
```

1. **Setup de contexto:** El usuario elige un escenario (entrevista, reunión, etc.) y una situación específica (puede pegar su descripción de trabajo, agenda o brief de cliente). También puede activar Challenge Mode para saltarse la preparación y ir directo a la conversación.

2. **Briefing personalizado:** La IA genera en tiempo real un briefing táctico: perfil del interlocutor, preguntas probables, frases clave y un framework de respuesta adaptado al perfil del usuario (cargo, industria, experiencia).

3. **Conversación con voz:** El usuario habla con un interlocutor de IA — un entrevistador exigente, un cliente difícil, un VP escéptico — usando su micrófono. El interlocutor responde en audio, presiona, pide claridad, interrumpe. Hay tres fases progresivas: Support (con hints), Guidance (sin hints), Challenge (sin ayuda, máxima presión).

4. **Feedback con doble eje:** Gemini 1.5 Flash analiza la sesión completa y genera:
   - Puntuación por 6 dimensiones profesionales (claridad estructural, precisión léxica, fluidez, tono profesional, confianza en delivery, impacto ejecutivo)
   - Patrones de interferencia lingüística LATAM detectados (calcos, falsos cognados, evasión de conflicto, lenguaje de deference)
   - Top 3 micro-lecciones recomendadas según las debilidades de esa sesión

5. **Lecciones entre sesiones:** 50 micro-lecciones disponibles en la biblioteca, con recall activo al final de cada una (preguntas de memoria, no lectura pasiva).

### El sistema de progresión

Hay 5 Rutas de Aprendizaje, cada una con 6 niveles:

| Ruta | Descripción |
|------|-------------|
| **Interview Mastery** | Entrevistas de trabajo en inglés con metodología STAR y más |
| **Remote Meeting Presence** | Controlar agenda, dirigir conversación, cerrar con acuerdos |
| **Presentations** | Estructurar y entregar presentaciones de alto impacto |
| **Sales Champion** | Ventas B2B en inglés con clientes de EE.UU. |
| **U.S. Business Culture** | Comunicación directa, ownership, credibilidad en cultura americana |

Cada nivel tiene mayor dificultad: el interlocutor se vuelve más exigente, los temas más complejos, las apuestas más altas.

Con cualquier suscripción activa, **todos los niveles de todas las rutas se desbloquean de inmediato**.

### Self-Intro Warm-Up (free)

Antes de comprar, cualquier usuario puede hacer hasta 3 sesiones gratuitas de auto-presentación profesional (networking, presentación al equipo, reunión con cliente). Funciona como demostración del producto con experiencia completa — sin tarjeta de crédito.

### War Room

Acceso rápido sin setup, para practicar en cualquier momento. Salta el paso de experiencia e inicia directamente en contexto. Límite: 5 sesiones/mes por usuario suscrito.

### WhatsApp SR Coach

Complemento de retención: el usuario recibe un micro-desafío de audio diario por WhatsApp con una frase profesional clave. Responde en audio, recibe puntuación de pronunciación y retroalimentación inmediata. El sistema usa Spaced Repetition — las frases con menor score se repiten más. Actualmente en modo sandbox (pendiente aprobación Meta Business para producción).

---

## El modelo de programa

MasteryTalk no es una suscripción a una app — es un programa estructurado de 3 meses con un arco de progresión claro:

| Bloque | Duración | Contenido |
|--------|----------|-----------|
| **Foundation Program** | Meses 1–3 | Business Culture — cómo operar en entornos corporativos de EE.UU. |
| **Advanced Program** | Meses 4–6 | Ruta principal elegida (Interview, Sales, Meeting, etc.) |
| **Mastery Program** | Meses 7–9 | Rutas restantes + práctica transversal |

**Progresión de desbloqueo:** Al suscribirse se desbloquea Business Culture completo. Conforme el usuario avanza en los niveles de Business Culture, las demás rutas se van desbloqueando — Interview en nivel 2, Meeting en nivel 3, Presentations en nivel 4, Sales en nivel 5.

**War Room como válvula de urgencia:** Disponible desde el día 1, permite practicar cualquier escenario inmediatamente (5 sesiones/mes) sin esperar a desbloquearlo en el programa. Para el usuario con una entrevista en 3 días, el War Room es la respuesta.

## Pricing

| Oferta | Precio | Descripción |
|--------|--------|-------------|
| **Founding Member** | $49/3 meses | 25 slots limitados — precio de fundador, auto-aplicado |
| **Programa** (regular) | $129/3 meses (~$43/mes) | Oferta principal — un ciclo completo de programa |
| **Acceso mensual** | $29/mes | Entrada — para quien no puede comprometerse 3 meses |

- Los primeros 25 suscriptores obtienen precio Founding Member automáticamente.
- Después de 90 días, el programa continúa al siguiente bloque — no hay "programa terminado".
- No existen créditos individuales, pruebas gratuitas con tarjeta, ni plan anual.

**Benchmark competitivo:** Talaera cobra $20/mes por sesiones en vivo con coach humano con agenda previa. MasteryTalk a $43/mes ofrece un programa estructurado con IA 24/7, progresión medible en CEFR y outcomes concretos — el doble de precio, diez veces más accesible.

**Margen bruto:** 69% en Monthly Launch, 80% en Monthly regular.

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
| Email transaccional | **Resend** (`hello@masterytalk.pro`) |
| Email marketing | **Loops.so** (`mail.go.masterytalk.pro`) — lifecycle nurturing post-registro |
| WhatsApp SR Coach | **Twilio** + **Meta Business API** |
| Monitoreo de errores | **Sentry** (`@sentry/react`, producción) |
| Auth | **Supabase Auth** — Google OAuth |

### Costo por usuario activo
El costo de IA por usuario (~15 sesiones/mes) es aproximadamente **$4.03/mes** — principalmente GPT-4o para conversación. La optimización de TTS a OpenAI primary redujo el costo ~20x (de $1.80 a $0.09 por sesión).

---

## Emails automáticos

| Email | Trigger |
|-------|---------|
| Bienvenida | Registro de nuevo usuario |
| Confirmación de suscripción | Pago completado via Stripe webhook |
| Resumen de sesión | Después de cada práctica |
| Confirmación de renovación | Cobro recurrente exitoso |
| Nudge de inactividad | 7+ días sin sesión (máx. 1 cada 14 días) |

Los emails de lifecycle marketing (D+2, D+5, D+7, etc.) los maneja Loops.so con secuencias por idioma (ES/PT/EN).

---

## Estado actual — Beta v14.3 (2026-05-01)

### Live y funcionando
- 5 escenarios activos: interview, meeting, presentation, sales, culture
- Stripe subscriptions live — pago real, activación inmediata
- Flujo completo: setup → briefing → conversación → feedback → micro-lecciones
- 50 micro-lecciones con recall activo y recomendación dual-eje
- WhatsApp SR Coach (sandbox — pendiente aprobación Meta)
- Landing page en 3 idiomas (ES / PT / EN)
- Sistema de emails transaccionales (5 plantillas)
- Admin dashboard con tracking de costos de API
- Monitoreo de errores con Sentry
- Challenge Mode (práctica sin briefing)
- Selector de foco de sesión y check-in de confianza pre-sesión
- Dashboard con: goal anchor, score trajectory chart (recharts), progression tree, recommended next session

### Gaps conocidos
- WhatsApp en sandbox (requiere aprobación Meta Business — en proceso)
- Stripe Customer Portal requiere activación manual en Stripe Dashboard settings
- Google OAuth muestra nombre de app de desarrollo en algunos contextos

### Próximas prioridades
1. **Producción de WhatsApp** — migración de sandbox a número dedicado (~1 semana post-aprobación Meta)
2. **Infraestructura corporativa** — migrar cuentas a billing corporativo antes de usuarios pagos
3. **Sprint C pedagógico** — curva de dificultad progresiva por nivel + dimensión de Interaction Management en feedback
4. **Conversión** — A/B test de copy de precios, testimonios, sistema de referidos

---

## Roadmap de alto nivel

| Fase | Objetivo | Estado |
|------|----------|--------|
| **Phase 1** | Beta launch — todo lo necesario antes del primer usuario pagador | ~90% complete |
| **Phase 2** | Crecimiento y retención — emails, dashboard, conversión | En progreso |
| **Phase 2.5** | Profundidad pedagógica — ciencia del aprendizaje aplicada | Sprint A+B completo |
| **Phase 3** | Expansión de contenido — más rutas, más razones para quedarse | Sales + Culture completados |
| **Phase 4** | Escala y monetización — B2B, enterprise, all-access bundle | Pendiente retención data |

---

## Lo que NO existe (para evitar confusión)

- No hay créditos individuales por sesión
- No hay prueba gratuita con tarjeta de crédito
- No hay plan anual (aún)
- No hay clases en vivo con humanos
- No hay app móvil (pendiente PMF en web)
- No hay acceso a todas las rutas desde el día 1 — se desbloquean progresivamente
- No hay escenarios de negociación, C-suite o clientes externos (roadmap futuro)
- Los precios $12.99, $19.99, $29.99 EB y $47.99 son legacy — la nueva estructura es $29/mo · $49/3mo · $129/3mo

---

## Métricas norte

| Métrica | Objetivo |
|---------|----------|
| North Star | 3+ sesiones completadas en los primeros 7 días |
| CAC objetivo (Monthly) | < $22 (launch) / < $33 (regular) |
| LTV estimado (5 meses avg) | ~$65 (Monthly EB) / ~$100 (Monthly regular) |
| Gross margin objetivo | 69–80% |
| Costo por usuario activo | ~$4.03/mes (15 sesiones) |

---

*Documento generado de PRODUCT_SPEC.md v2.8 y ROADMAP.md Beta v14.3.*
*Para cambios en pricing, escenarios o features → actualizar PRODUCT_SPEC.md primero.*
