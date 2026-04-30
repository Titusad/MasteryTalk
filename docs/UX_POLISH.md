# MasteryTalk PRO — UX Polish & Habit Loop Plan

> **Propósito:** Plan de ejecución para cerrar las dos roturas del Hook Model identificadas
> en el Diagnóstico Hooked v1.0 y optimizar la formación de hábito de uso.
> Consultar al inicio de cada sesión de trabajo relacionada con UX/retención.
>
> **Origen:** Análisis de Journey Map (JOURNEY.md) + Diagnóstico Hooked + Roadmap v4.0
> **Estado:** Listo para desarrollo — pendiente de baseline pre-Sprint 1
> **Actualizado:** 2026-04-29 (v1.1 — Mastery Audit, Sprint 5, iniciativas clasificadas)

---

## Contexto: las dos roturas del loop

```
TRIGGER INTERNO          ACTION              VARIABLE REWARD
Ansiedad profesional  →  Práctica con IA  →  Score + Before/After
"Tengo reunión mañana"   15 min Voice           Recompensa Self

        ↑                                           ↓
  ROTURA #1                                   ROTURA #2
  Dashboard no muestra            Feedback no conecta con
  la inversión acumulada          activación del SR Coach

        ←  ←  WhatsApp diario  ←  ←  INVESTMENT  ←  ←
              "Tu reto de hoy"     SR Coach activado
```

**Rotura #1 — Inversión invisible:** el dashboard recurrente no muestra al usuario
lo que ya construyó. La inversión existe en el KV pero no se convierte en evidencia
de progreso. El usuario decide cada vez "¿lo hago hoy?" como si fuera la primera vez.

**Rotura #2 — El loop no se cierra:** después del FeedbackScreen (mayor intención
del journey), el producto invita a comprar o ir al dashboard. No pide la activación
del SR Coach — que es el trigger externo del próximo loop.

---

## Pre-trabajo obligatorio antes de Sprint 1

Medir estos baselines **antes** de que arranque Sprint 1. Sin ellos, los resultados
post-sprint no producen conclusiones válidas.

| Métrica | Cómo medir | Dónde |
|---------|-----------|-------|
| Tasa actual de activación WA (desde Dashboard) | `whatsapp_verified = true` / total usuarios con ≥1 sesión | Supabase KV query |
| Drop-off intra-sesión (% que no completan todos los turnos) | Sesiones con `turns < 4` / total sesiones | KV store `sessions` |
| % usuarios que hacen shadowing en FeedbackScreen | Evento existente o conteo manual de logs | Analytics / Sentry |
| Tasa de apertura del renewal email actual | Resend dashboard | Resend |

---

## Sprint 1 — Cerrar Rotura #2
> **Objetivo:** El primer loop completo (Trigger → Action → Reward → Investment)
> se cierra dentro de la primera sesión. El SR Coach se activa cuando la intención es máxima.
>
> **Estimado:** 1 semana. Los ítems #3 y #4 van en PR independiente en las primeras 48h.

---

### 1.1 · WhatsApp Activation Card en FeedbackScreen

**Mecánica:** Al final del FeedbackScreen, antes del CTA "Practice Again", mostrar
la tarjeta de activación del SR Coach. Solo visible si `!userProfile.whatsapp_verified`.

**Componente a reutilizar:** `src/features/dashboard/ui/WhatsAppActivationCard.tsx`
(ya existe en Dashboard). Adaptar para contexto post-feedback.

**Estado de descarte (punto ciego crítico):**
- Agregar campo `wa_card_dismissed_at` al perfil KV (`profile:{userId}`)
- Si el usuario hace clic en "Maybe later": guardar timestamp + ocultar la tarjeta
  durante las siguientes **3 sesiones** (no días — sesiones completadas)
- Contador: `wa_dismiss_session_count` — se incrementa en cada sesión post-descarte
- A la sesión N+3: la tarjeta reaparece una sola vez más; si vuelve a descartar,
  `wa_card_permanently_dismissed = true` → nunca vuelve a mostrarse

**Lógica de visibilidad:**
```
mostrar si:
  !whatsapp_verified
  && !wa_card_permanently_dismissed
  && (wa_card_dismissed_at === null || sessions_since_dismiss >= 3)
```

**Oferta para todos:** usuarios free (warm-up completado) Y usuarios pagos.
El costo de un usuario free en WhatsApp es centavos; su probabilidad de conversión
post-activación del SR Coach es significativamente mayor que sin él.

**Archivos a modificar:**
- `src/features/practice-session/ui/FeedbackScreen.tsx` — agregar sección final
- `src/features/dashboard/ui/WhatsAppActivationCard.tsx` — agregar prop `variant="feedback"` para copy adaptado
- `supabase/functions/make-server-08b8658d/routes/profile.ts` — agregar campos al whitelist de PUT /profile

**Copy en variante `feedback`:**
> "Practice this phrase tomorrow on WhatsApp — activate your coach in 30 seconds."

**Criterio de aceptación:**
- Card visible al finalizar sesión (free y pago) cuando WA no está activado
- "Maybe later" guarda dismissedAt y oculta por 3 sesiones
- "Permanently dismiss" oculta para siempre
- Si WA ya está verificado: card no aparece

---

### 1.2 · Preferencia de horario en onboarding del SR Coach

**Por qué es bloqueante para la métrica:** si el cron corre a 9AM UTC y el usuario
está en México (UTC-6), el primer reto llega a las 3AM. El usuario lo ignora y el
hábito nunca arranca. Sin preferencia de horario, el KPI de activación no es medible.

**Mecánica:** en el flujo de activación del SR Coach (WhatsAppActivationCard),
después de verificar el número, preguntar: "¿A qué hora prefieres tu reto diario?"
Opciones: Mañana (7AM), Mediodía (12PM), Tarde (6PM) — en la zona horaria del usuario.

**Implementación:**
- Campo nuevo en KV: `wa_preferred_hour` (número 7, 12, 18 en hora local)
- Campo nuevo: `wa_timezone` (detectar del browser: `Intl.DateTimeFormat().resolvedOptions().timeZone`)
- El `cron-daily-sr` debe leer `wa_preferred_hour` + `wa_timezone` por usuario para
  calcular el momento exacto de envío en lugar de usar hora fija global

**Archivos a modificar:**
- `src/features/dashboard/ui/WhatsAppActivationCard.tsx` — agregar paso de horario
- `supabase/functions/make-server-08b8658d/routes/cron.ts` — lógica de scheduling por usuario
- KV profile: nuevos campos `wa_preferred_hour`, `wa_timezone`

**Criterio de aceptación:**
- Usuario puede elegir franja horaria durante la activación
- Timezone se detecta automáticamente (no se le pide al usuario)
- Cron respeta la preferencia en el primer envío post-activación

---

### 1.3 · Header "Extracted from your session" en Before/After *(PR día 1-2)*

**Mecánica:** agregar una línea de encabezado sobre los ejemplos del Before/After
que establezca que el contenido viene de la sesión real del usuario.

**Copy exacto:**
```
Extracted from your session — exactly what you said.
```

**Implementación:** texto estático. Una línea en `FeedbackScreen.tsx` sobre el
componente de comparación. Estilo: `text-xs font-medium text-[#94a3b8] uppercase
tracking-wider` — consistente con los labels de sección del Design System.

**Archivos a modificar:**
- `src/features/practice-session/ui/FeedbackScreen.tsx` — 1 línea de JSX

**Criterio de aceptación:** texto visible sobre el Before/After en todas las sesiones.

---

### 1.4 · "Cancel anytime" en PathPurchaseModal *(PR día 1-2)*

**Mecánica:** agregar microcopy debajo del CTA de pago principal para reducir
ansiedad transaccional antes de que el usuario salga a Stripe.

**Copy exacto:**
```
Cancel anytime from your account. No hidden fees.
```

**Implementación:** texto estático bajo el botón primario de pago.
Estilo: `text-xs text-[#94a3b8] text-center mt-2`.

**Archivos a modificar:**
- Localizar el componente `PathPurchaseModal` o el modal de pricing — agregar 1 línea

**Criterio de aceptación:** microcopy visible debajo del CTA en los 3 tiers.

---

### 1.5 · Spike: Auditoría de `beforeAfterComparisons` en Gemini

**Tipo:** investigación técnica (max 4 horas). No produce código — produce decisión.

**Pregunta:** ¿El campo `beforeAfterComparisons` en `RealFeedbackData` devuelve
la cita literal de lo que dijo el usuario, o una paráfrasis/síntesis de Gemini?

**Cómo ejecutarlo:**
1. Tomar logs de las últimas 20-30 sesiones con feedback completado
2. Comparar el campo `before` en `beforeAfterComparisons` con la transcripción
   STT de la misma sesión
3. Clasificar: literal / paráfrasis / síntesis

**Output requerido:** documento de 1 párrafo con la conclusión:
- Si **literal** → DiffHighlighter entra en Sprint 5 sin cambios de prompt
- Si **paráfrasis** → necesitamos modificar el prompt de Gemini para pedir cita
  textual antes de implementar el DiffHighlighter. Estimar esfuerzo adicional.

**Dueño:** asignar antes de que arranque Sprint 1.

---

### 1.6 · Spike: Latencia p95 de Azure Pronunciation Assessment

**Tipo:** investigación técnica (max 4 horas). No produce código — produce decisión.

**Pregunta:** ¿El score de Azure Speech se puede mostrar después de cada turno
sin romper la percepción de fluidez de la conversación?

**Cómo ejecutarlo:**
1. Instrumentar 10 llamadas a `/pronunciation-assess` con timestamps
2. Medir: tiempo desde fin de grabación → score disponible (p50, p95)
3. Si p95 < 2s → MicroScoreToast es viable
4. Si p95 > 3s → el toast generaría latencia perceptible; rediseñar o descartar

**Output requerido:** número de latencia p95 + recomendación go/no-go para MicroScoreToast.

**Dueño:** asignar antes de que arranque Sprint 1.

---

### Métricas de éxito Sprint 1

> Evaluar a **14 días** post-shipping.

| Métrica | Hipótesis | Umbral mínimo viable |
|---------|-----------|---------------------|
| Tasa de activación WA (desde FeedbackScreen) | 20-30% | >10% (vs. baseline actual) |
| Tasa de respuesta al primer mensaje WA en D+1 | 40% | >25% |
| % usuarios que ven el Before/After header | 100% de sesiones con feedback | — |

> **Nota sobre umbrales:** los números son hipótesis, no compromisos.
> El éxito real se mide como delta desde el baseline medido en pre-trabajo,
> no como número absoluto.

---

## Mastery Audit — Feature de retención
> **Decisión anclada:** MasteryTalk es app con servicio premium. El Mastery Audit
> es una feature, no un producto. Se mide por su efecto en retención del producto
> principal, no por revenue directo. Esta decisión gobierna todas las decisiones
> operativas que siguen.
>
> **Sprint de implementación:** Sprint 2 (depende de que Sprint 1 esté live —
> la card se posiciona después de WhatsAppActivationCard en FeedbackScreen).
>
> **Referencia:** ver plan de fases operativas completo en el documento del usuario.

---

### MA.1 · Campo `profession` en KV profile

**Problema:** no existe actualmente. Es el primer filtro de eligibilidad del audit.

**Para usuarios nuevos:** campo opcional en onboarding — "What's your role?"
Opciones: `product_designer` / `software_engineer` / `sales` / `marketing` / `other`

**Para usuarios existentes:** derivar provisionalmente del `cvSummary` del JD
usando heurística simple (buscar títulos de cargo) o llamada a Gemini Flash.
Si no se puede derivar: `profession = null` → usuario no ve el botón hasta completar el campo.

**Archivos a modificar:**
- `supabase/functions/make-server-08b8658d/routes/profile.ts` — agregar `profession` al whitelist de PUT
- `src/features/practice-session/ui/ExperienceScreen.tsx` (o equivalente de onboarding) — campo opcional

---

### MA.2 · Campo `audit_booked_at` en KV profile

**Propósito:** evitar que el botón reaparezca inmediatamente después de una reserva.
Cooldown: 30 días.

**Se setea:** cuando el usuario hace clic en el CTA del `MasteryAuditCard` (client-side).
No requiere webhook de Calendly en Fase 1 — el clic es suficiente como señal de intención.

**Archivos a modificar:** mismo que MA.1.

---

### MA.3 · Lógica de eligibilidad (función pura, frontend)

```typescript
function isEligibleForAudit(profile: KVProfile, sessions: Session[]): boolean {
  const last14Days = sessions.filter(s =>
    s.scenarioType === 'interview' &&
    new Date(s.createdAt) > subDays(new Date(), 14)
  );
  return (
    profile.profession === 'product_designer' &&
    last14Days.length >= 3 &&
    (!profile.audit_booked_at || daysSince(profile.audit_booked_at) > 30)
  );
}
```

`sessions` ya disponible en el frontend desde el historial del usuario.

**Archivos a modificar:**
- Nueva función en `src/features/dashboard/model/` o inline en FeedbackScreen

---

### MA.4 · Componente `MasteryAuditCard`

**Posición:** al final de FeedbackScreen, después de `WhatsAppActivationCard`.
Solo visible si `isEligibleForAudit() === true`.

**Copy (Fase 1 — product_designer only):**
```
"Ready for a real challenge?
Book a 30-min live audit with the product lead."
[ Book my session → ]   (link a Calendly, nueva pestaña)
```

**Al hacer clic:** setear `audit_booked_at = now()` en KV vía `PUT /profile`.

**Diseño:** card inline estándar — `rounded-2xl border-[#e2e8f0] shadow-sm p-6`.
No usar AppModal. El tono es el mismo que la WhatsAppActivationCard: contextual, no intrusivo.

**Archivos a modificar:**
- Crear `src/features/practice-session/ui/MasteryAuditCard.tsx`
- `src/features/practice-session/ui/FeedbackScreen.tsx` — agregar card al final

---

### Métricas Mastery Audit — Fase 1 (semanas 1-4)

> Evaluar al completar 5 audits.

| Métrica | Hipótesis | Mínimo viable |
|---------|-----------|---------------|
| Conversión del botón (elegibles que reservan) | 15-20% | >8% |
| Distribución entre modalidades (30 min vs. 90 min) | 30% post-nivel / 70% evento real | Solo informativo |
| NPS post-sesión | >9 | >8 |
| Notas post-sesión completadas | 100% | 100% (disciplina, no métrica) |

> **Nota:** Los primeros 5 audits validan formato y precio, no miden retención.
> La muestra es demasiado chica para conclusiones causales. Fase 2 (10-15 audits)
> es cuando se puede medir el efecto sobre retención.

---

## Sprint 2 — Reducir fricción en el core loop
> **Objetivo:** Eliminar los dos puntos de abandono más visibles dentro de la sesión.
> La sesión debe sentirse fluida; el shadowing debe sentirse como el paso natural post-feedback.
>
> **Estimado:** 1 semana.

---

### 2.1 · ActiveTurnIndicator en VoicePractice

**Problema:** entre el fin del audio del AI y el inicio de la grabación del usuario
hay un silencio sin indicación visual. El usuario duda si ya puede hablar.
Es el mayor punto de abandono mid-sesión.

**Mecánica:**
- Cuando el audio del AI termina (`isAiTyping = false`, audio completado):
  - Avatar del AI: `scale: 0.92`, `opacity: 0.5` (se "retira")
  - RecordButton: `scale: 1.05` + `ring-4 ring-indigo-500/30` pulse (se "activa")
  - Aparece microcopy bajo el botón: `"Your turn — tap to record"`
- Cuando el usuario empieza a grabar: microcopy desaparece, RecordButton vuelve
  a su estado de grabación normal

**Implementación:** lógica de estado ya existe en `VoicePractice.tsx`.
Agregar estados visuales sobre los componentes existentes con `motion/react`.
No requiere nuevos componentes.

**Archivos a modificar:**
- `src/features/practice-session/ui/VoicePractice.tsx`

**Criterio de aceptación:**
- Indicador visible en el momento exacto en que el AI termina de hablar
- No aparece mientras el AI está hablando
- Desaparece en cuanto el usuario empieza a grabar

---

### 2.2 · ShadowingActionCard como entrada principal del FeedbackScreen

**Problema:** el shadowing es la acción de mayor impacto para la pronunciación
pero aparece en una sección colapsada secundaria. La mayoría de usuarios no lo ven.

**Mecánica:**
- El shadowing sube en el orden visual del FeedbackScreen: aparece **antes** del
  score de proficiencia, no dentro del acordeón de "Content Insights"
- Presentarlo como una tarjeta de acción directa: una frase del Before/After
  con botón de reproducir (ElevenLabs) + botón de grabar (Azure STT)
- El score completo (5 pillars) aparece después de esta interacción o en paralelo

**Diseño:**
```
[ShadowingActionCard]
  "Repeat after the model — this was your hardest phrase:"
  [ ▶ Play model ]  [ ⏺ Record yours ]
  
[Score + Pillars]  ← después del shadowing
```

**Nota técnica:** verificar que el shadowing ya tiene lógica implementada en
`ShadowingModal.tsx` — reutilizarla, no reimplementarla.

**Instrumentación obligatoria (punto ciego crítico):**
Agregar evento de analytics en este mismo sprint:
```typescript
trackEvent('shadowing_started_from_feedback', {
  scenarioType,
  sessionId,
  pillarScore_pronunciation: scores.pronunciation,
  source: 'feedback_screen_primary' // diferencia de si viene del acordeón
});
```
Sin este evento el umbral del >30% del Roadmap v4.0 es inmedible.

**Archivos a modificar:**
- `src/features/practice-session/ui/FeedbackScreen.tsx` — reordenar secciones
- Verificar `src/features/practice-session/ui/ShadowingModal.tsx` para reutilización

**Criterio de aceptación:**
- Shadowing aparece como primer elemento de acción post-conversación
- Evento `shadowing_started_from_feedback` se dispara al iniciar
- El score y pillars siguen siendo accesibles (no se eliminan, se reordenan)

---

### Métricas de éxito Sprint 2

> Evaluar a **14 días** post-shipping.

| Métrica | Hipótesis | Umbral mínimo viable |
|---------|-----------|---------------------|
| Drop-off intra-sesión (abandono antes de completar turnos) | Reducción del 30% vs. baseline | <10% de abandono mid-sesión |
| `shadowing_started_from_feedback` rate | 35% de sesiones con feedback | >20% |
| `shadowing_completed` rate (de los que empiezan) | 70% | >50% |

---

## Sprint 3 — Hacer la inversión visible
> **Objetivo:** El usuario que entra al dashboard ve lo que ya construyó antes de decidir
> si practica hoy. La inversión acumulada actúa como costo de cambio percibido.
>
> **Estimado:** 1.5 semanas. Backend (2.3) y Frontend (3.1, 3.2, 3.3) pueden correr en paralelo.

---

### 3.1 · ProgressSummaryCard — Vista acumulada de inversión

**Mecánica:** nueva tarjeta en el Dashboard que muestra lo que el usuario construyó
en total (no solo esta semana). Es la pieza que cierra la Rotura #1 completamente.

**Datos a mostrar (todos ya en KV):**
- Total de sesiones completadas (`stats.sessions_count`)
- Frases WA dominadas en total (`wa_phrases_mastered`)
- Escenario más practicado (derivado del historial de sesiones)
- Pilar con mayor mejora acumulada (delta entre primera y última sesión en `pillarScores`)

**Diseño:**
```
[ProgressSummaryCard — bg-white rounded-2xl border-[#e2e8f0] shadow-sm]

  "What you've built"            [ver todo →]
  
  12 sessions        24 WA phrases     Interview  (most practiced)
  Pronunciation ↑8pts (since day 1)
```

**Posición en Dashboard:** entre `StreakCard` y `RecommendedNextCard`.

**No es una nueva página.** No requiere nueva ruta. Es una card del Dashboard.

**Archivos a modificar:**
- `src/features/dashboard/ui/DashboardPage.tsx` — agregar ProgressSummaryCard
- Crear `src/features/dashboard/ui/ProgressSummaryCard.tsx` — componente nuevo
- `src/features/dashboard/model/` — agregar selector/derivación de datos acumulados

**Criterio de aceptación:**
- Card visible en Dashboard para usuarios con ≥1 sesión completada
- Datos reales del KV (no mock)
- Oculta para usuarios con 0 sesiones

---

### 3.2 · StreakCard: expansión + StreakVisibility Neutra

**Expansión de datos:**
- Mantener el grid de 7 días actual
- Agregar bajo el grid: contador de frases WA dominadas este mes (`wa_phrases_mastered_this_month`)
- Agregar: delta del pilar más débil en las últimas 3 sesiones (`pillar_delta_last_3`)

**StreakVisibility Neutra:**
- El cuadro del día actual (si no practicó hoy): color gris translúcido `bg-[#f1f5f9]` con borde `border-[#e2e8f0] border-dashed`
- Microcopy bajo el cuadro vacío de hoy: `"Day closes at 11:59 PM"` en `text-xs text-[#94a3b8]`
- **Sin animaciones de pérdida, sin colores de alarma, sin shake.** El tono es informativo, no ansioso.

**Archivos a modificar:**
- `src/features/dashboard/ui/StreakCard.tsx`

**Criterio de aceptación:**
- Cuadro del día vacío tiene estilo distinto al de días pasados vacíos
- Microcopy de cierre visible solo si el cuadro de hoy está vacío
- Datos de frases WA visibles (aunque sean 0)

---

### 3.3 · HeroNextStep — RecommendedNextCard como elemento dominante

**Mecánica:** en la primera vista del usuario que regresa (con ≥1 sesión previa),
`RecommendedNextCard` debe ser visualmente el elemento más prominente del Dashboard.
No debe competir visualmente con el árbol de progresión completo.

**Lógica de visibilidad por estado:**
```
0 sesiones → Banner "START HERE" (ya existe)
1-2 sesiones → RecommendedNextCard ocupa ancho completo, columna izquierda
3+ sesiones → RecommendedNextCard en posición normal, ProgressSummaryCard visible
```

**Copy del HeroNextStep (1-2 sesiones):**
```
"Your last session showed [weakest_pillar] needs work.
Today's session is ready — [scenario] Level [n]."
[ Start now → ]
```

El `weakest_pillar` viene de `stats.pillarScores` — ya existe en el KV.

**Archivos a modificar:**
- `src/features/dashboard/ui/DashboardPage.tsx` — lógica condicional de layout
- `src/features/dashboard/ui/RecommendedNextCard.tsx` — variante de ancho completo

**Criterio de aceptación:**
- Usuario con 1-2 sesiones ve la RecommendedNextCard como primer elemento visual
- El copy incluye referencia al pilar más débil de la última sesión
- CTA lleva directamente al inicio de sesión (sin pasos intermedios)

---

### 3.4 · Backend: `wa_phrases_mastered` en webhook Twilio

**Problema:** la ProgressSummaryCard y la StreakCard expandida muestran frases WA dominadas,
pero esa actividad ocurre fuera de la app (en WhatsApp). El Dashboard no tiene esa
información a menos que el webhook de Twilio actualice el KV.

**Mecánica:** cuando el webhook recibe un score de pronunciación satisfactorio (≥80),
incrementar `wa_phrases_mastered` en `profile:{userId}` del KV store.

**Lógica:**
```typescript
if (pronunciationScore >= 80) {
  await kv.set(`profile:${userId}`, {
    ...profile,
    wa_phrases_mastered: (profile.wa_phrases_mastered ?? 0) + 1,
    wa_phrases_mastered_this_month: (profile.wa_phrases_mastered_this_month ?? 0) + 1,
  });
}
```

**Campos nuevos en KV profile:**
- `wa_phrases_mastered`: número total acumulado
- `wa_phrases_mastered_this_month`: se resetea el 1° de cada mes en el cron

**Verificación previa:** revisar `supabase/functions/make-server-08b8658d/routes/webhook.ts`
para confirmar que el score de pronunciación ya está disponible en el handler de Twilio
antes de implementar el incremento.

**Archivos a modificar:**
- `supabase/functions/make-server-08b8658d/routes/webhook.ts` — lógica de incremento
- `supabase/functions/make-server-08b8658d/routes/profile.ts` — nuevos campos en tipo

---

### Métricas de éxito Sprint 3

> Evaluar a **30 días** post-shipping (el impacto en retención tarda más en ser visible).

| Métrica | Hipótesis | Umbral mínimo viable |
|---------|-----------|---------------------|
| % de sesiones recurrentes iniciadas desde RecommendedNextCard | 50% | >35% |
| Retención D7 de usuarios que vieron ProgressSummaryCard | +15% vs. los que no | +5% |
| Retención D30 (primer ciclo de renovación) | +10% vs. cohorte anterior | measurable improvement |

---

## Sprint 4 — ROI y prevención de churn
> **Objetivo:** El email de renovación deja de ser una factura y se convierte en
> evidencia de ROI. El momento de mayor riesgo de churn se convierte en momento de orgullo.
>
> **Estimado:** 0.5 semanas.

---

### 4.1 · Monthly Mastery Wrapped — Reescritura del renewal email

**Mecánica:** el `renewalConfirmationEmailHtml()` en Resend se reescribe para abrir
con el resumen del mes antes de mostrar el detalle de facturación.

**Estructura del email reescrito:**
```
Asunto: "Your month 2 at MasteryTalk PRO — here's what changed."

[Bloque 1 — ROI visible]
You practiced X sessions this month.
Your biggest improvement: Pronunciation +Y points.
Power phrase you've used most: "[frase]"

[Bloque 2 — Factura estándar]
Your subscription renewed: $[amount] on [date]
Next billing: [date]
[Manage subscription →]
```

**Lógica condicional para usuarios con 0 sesiones (punto ciego crítico):**

```
SI monthly_sessions_used === 0:
  → El email muta a formato de "Reactivación"
  → NO mostrar estadísticas en cero
  → Copy: "Your subscription renewed — but we haven't seen you this month.
           Your [pilar más débil histórico] is ready to work on.
           [Start a session →]"
  → CTA lleva directamente a la sesión recomendada
```

**Datos disponibles en KV** (no requieren nuevas queries):
- `monthly_sessions_used` → número de sesiones del mes
- `stats.pillarScores` → scores por pilar
- `stats.sessions_count` → total acumulado

**Lo que falta y debe agregarse antes de Sprint 4:**
- Power phrase más usada/dominada del mes → derivar de SR data en `wa_phrases_mastered_this_month`
- Si no hay dato de WA: omitir esa línea del email (no mostrar "0 phrases")

**Archivos a modificar:**
- `supabase/functions/make-server-08b8658d/routes/emails.ts` o equivalente
- Template `renewalConfirmationEmailHtml()` — reescritura completa

**Criterio de aceptación:**
- Email con ≥1 sesión: abre con ROI del mes, factura al final
- Email con 0 sesiones: abre con reactivación + CTA de sesión, NO con estadísticas
- Ambos pasan el test de preview en Resend antes de ir a producción

---

### Métricas de éxito Sprint 4

> Evaluar comparando **cohorte pre-cambio vs. post-cambio** al segundo ciclo de renovación.

| Métrica | Hipótesis | Umbral mínimo viable |
|---------|-----------|---------------------|
| Churn rate en primer ciclo de renovación | Reducción del 10% | Reducción del 5% |
| Open rate del renewal email | +5% vs. versión anterior | Igual o mejor |
| Tasa de inicio de sesión desde el email (usuarios con 0 sesiones) | 15% | >8% |

> **Nota:** 15% de reducción de churn para una sola intervención de email es ambicioso.
> 5-8% ya sería un éxito notable. Los umbrales son hipótesis, no compromisos.

---

## Sprint 5 — Contexto y presencia
> **Objetivo:** Elevar la percepción de realismo de las sesiones (War Room para urgencia
> real) y la conexión emocional con los interlocutores (Board of Mentors).
>
> **Estimado:** 1-1.5 semanas. War Room y Board of Mentors pueden correr en paralelo
> si hay diseñador disponible para los avatares.

---

### 5.1 · War Room — entry point de emergencia

**Contexto:** el ContextScreen ya acepta 5,000 chars de texto libre con paste hints
para slides, agendas y contexto de reunión. El concepto existe funcionalmente —
lo que falta es un entry point dedicado.

**Mecánica:** nueva CTA en el Dashboard para sesiones de alta presión inmediata.

**Copy del entry point:**
```
"Meeting in 30 minutes?"
[ Emergency Prep — start now → ]
```

**Comportamiento:**
- Navega directamente al ContextScreen pre-configurado para el escenario más
  relevante del usuario (basado en `scenarioType` de las últimas sesiones)
- **Omite IntroductionScreen** — el usuario está en modo urgencia, no en modo aprendizaje
- El textarea se abre con focus activo y placeholder:
  `"Paste your meeting invite, agenda, or slides — I'll tailor the session."`

**Archivos a modificar:**
- `src/features/dashboard/ui/DashboardPage.tsx` — agregar CTA de War Room
- `src/pages/PracticeSessionPage.tsx` — prop para saltar `introduction` step
- `src/features/practice-session/ui/ContextScreen.tsx` — placeholder adaptado

**Criterio de aceptación:**
- CTA visible en Dashboard para usuarios con ≥1 sesión completada
- Flujo: Dashboard → ContextScreen (sin IntroductionScreen)
- El campo de texto tiene focus automático al cargar

---

### 5.2 · Board of Mentors — identidad visual de interlocutores

**Contexto:** 11 interlocutores con voces ElevenLabs asignadas y perfiles
psicológicos ricos (personas.ts). Solo falta la capa visual: hoy son
CSS circles con iniciales ("RC", "HM"). Agregar nombre e identidad visual
transforma "una voz anónima" en "un mentor con personalidad".

**Mecánica:**
- Nombres propios para cada interlocutor (ej. "The Recruiter → Sarah Chen",
  "The Hiring Manager → Marcus Rivera") — definidos en `INTERLOCUTOR_META`
- Avatar: ilustración o imagen por interlocutor — mostrada en `InterlocutorIntroScreen`
  reemplazando el CSS circle de iniciales
- Tagline de estilo de coaching en `IntroductionScreen` (una línea):
  ej. "Sarah is fast, evaluative, and remembers everything."

**Nota sobre assets:** si no hay ilustraciones disponibles, una alternativa inmediata
es usar el mismo CSS circle pero con colores únicos por interlocutor + nombre propio.
Esto ya eleva la percepción sin esperar activos de diseño.

**Archivos a modificar:**
- `src/features/practice-session/ui/InterlocutorIntroScreen.tsx` — nombres + avatares
- `src/services/prompts/personas.ts` — agregar nombres propios a `INTERLOCUTOR_META`

**Criterio de aceptación:**
- Cada interlocutor tiene nombre propio visible en la pantalla de intro
- CSS circle tiene color único por interlocutor (o imagen, si hay assets)
- Tagline de coaching style visible bajo el nombre

---

### Métricas de éxito Sprint 5

> Evaluar a **14 días** post-shipping. Sprint 5 es de calidad percibida —
> las métricas son más cualitativas que cuantitativas.

| Métrica | Hipótesis | Mínimo viable |
|---------|-----------|---------------|
| % de sesiones iniciadas desde War Room CTA | 15% de sesiones recurrentes | >8% |
| Tiempo promedio en InterlocutorIntroScreen antes de continuar | Aumenta 5s+ (más engagement con el personaje) | Informativo |

---

## Backlog diferido

### DiffHighlighter Interactivo con Audio
**Bloqueante:** resultado del Spike 1.5 (literalidad de `beforeAfterComparisons`).

**Si el spike concluye que es literal:** entrar en Sprint 5.
- Mecánica: el usuario ve su frase exacta con palabras subóptimas resaltadas.
  Al tocar una palabra: se tacha animadamente y aparece la Power Phrase sugerida por Gemini.
  Botón de reproducir (ElevenLabs) al lado de cada corrección.
- Métrica: tasa de conversión a Shadowing desde el DiffHighlighter vs. desde la card directa.

**Si el spike concluye que es paráfrasis:** requiere modificación del prompt de Gemini
para que cite literalmente + evaluación de calidad del nuevo output antes de diseñar
la interacción. Estimar Sprint 6+.

---

### MicroScoreToast Informativo post-turno
**Bloqueante:** resultado del Spike 1.6 (latencia p95 de Azure).

**Si latencia p95 < 2s:** entrar en Sprint 5.
- Mecánica: toast flotante post-grabación con score numérico ("Pronunciation: 88/100").
  Sin emojis. Estilo Lucide icon + número. Se desvanece en 2s.
  Color: verde si supera el promedio de los últimos 3 turnos; neutro si no.
- Métrica complementaria: delta de pillar scores entre sesión N y N+1 para usuarios
  con toast activado vs. sin él. Si el toast solo aumenta engagement sin aumentar
  mejora real, es vanity metric.

**Si latencia p95 > 3s:** descartar por disrupción de inmersión. No implementar.

---

### Botones nativos de interacción WhatsApp [Grabar respuesta] / [Escuchar ejemplo]
**Bloqueante:** aprobación de Meta Business Verification (ROADMAP 1.6.1 — en revisión
desde 2026-04-29, ~2 días hábiles). Requiere número de producción activo (ROADMAP 1.6.1
Paso 2) y plantillas aprobadas (Paso 3).

**Entra en backlog activo:** cuando Meta apruebe el número de producción y las plantillas.
- Métrica: tasa de retención D+7 en canal WA (objetivo hipótesis: >50% respuesta continua).

---

### Voice Memos Sorpresa en WhatsApp
**Concepto:** el SR Coach envía una nota de voz espontánea simulando un colega que pide
una actualización urgente. El usuario responde en 30 segundos. Activa el trigger interno
de presión real en el canal nativo del usuario.

**Bloqueantes:**
1. **Técnico:** el webhook Twilio acepta audio inbound SOLO si hay un `wa_pending_reviews`
   activo. Mensajes espontáneos requieren nuevo routing en el handler.
2. **Externo:** número de producción WhatsApp pendiente (Meta Business Verification —
   ROADMAP 1.6.1, en revisión desde 2026-04-29).

**Condición de entrada:** número de producción aprobado + Sprint 1 live.
**Esfuerzo estimado al desbloquear:** ~3-4 días de backend (nuevo routing en webhook Twilio).

**Métrica objetivo:** tasa de respuesta D+3 al primer Voice Memo espontáneo > 35%.

---

### Vista de progreso extendida (futuro)
Si los datos de ProgressSummaryCard (Sprint 3) generan engagement medible,
considerar una vista `/history` con gráfico de evolución por pilar a lo largo del tiempo.
No es una página nueva urgente — es una expansión del historial existente en PracticeHistoryPage.

---

## Iniciativas evaluadas y descartadas

Documentadas para evitar que reaparezcan en futuras sesiones sin contexto.
Cada una tiene una condición de reevaluación explícita.

---

### Presencia Social y Comunidad
**Concepto:** "Efecto coworking" (usuarios activos ahora), Hall of Fame de power phrases,
Live Warm-Up Sprints grupales.

**Por qué no ahora:** agregar capas sociales sobre un loop de hábito que todavía no
está cerrado (ese es el trabajo de Sprint 1-4) es construir sobre arena. El coworking
requiere presencia en tiempo real, privacidad explícita y consent. El Hall of Fame
requiere opt-in, curación y moderación.

**Condición de reevaluación:** D30 retention ≥ 40% post-Sprint 3.

---

### SOS Coach (servicio híbrido on-demand)
**Concepto:** soporte humano de emergencia para preparar entrevistas o presentaciones
críticas de último minuto.

**Por qué descartado:** requiere disponibilidad on-demand — incompatible con el
principio operativo "4 horas semanales máximo, día fijo". A diferencia del Mastery
Audit (scheduled, predecible), el SOS Coach requiere reactividad inmediata que
no es sostenible como side operation de un producto.

**Condición de reevaluación:** si la demanda del Mastery Audit (Fase 2-3) supera
consistentemente la oferta y hay un candidato coach que pueda cubrir on-demand.

---

### Venting Lounge (modo libre sin scoring)
**Concepto:** sesión de voz libre sin puntuaciones donde el coach IA ofrece
validación emocional y consejos tácticos en lugar de correcciones.

**Por qué descartado:**
1. **Arquitectónico:** el scoring de Azure Speech es obligatorio en todas las sesiones.
   Desactivarlo requeriría un nuevo tipo de sesión completo con lógica separada.
2. **Brand conflict:** el brand voice es "executive coach exigente, no soporte emocional."
   Un espacio de desahogo contradice directamente la identidad del producto.

**Condición de reevaluación:** si aparece como necesidad explícita en churn interviews
(usuarios que cancelaron porque el producto "se siente demasiado intimidante").

---

## Apéndice: decisiones de producto pendientes

Antes de implementar Sprint 1, el equipo debe tomar estas decisiones explícitamente:

| Decisión | Opciones | Recomendación |
|----------|---------|---------------|
| ¿WA opt-in para usuarios free? | Solo pagos / Todos | **Todos.** Costo bajo, conversión mayor post-activación. |
| ¿Umbral de score WA para `wa_phrases_mastered`? | 70 / 80 / 85 | **80.** Suficientemente exigente para ser significativo. |
| ¿Qué pasa si el usuario cambia de número de WA? | Bloquear / Permitir re-verificación | Permitir re-verificación desde Account page (ya existe el flujo). |
| ¿El renewal email con 0 sesiones incluye CTA a sesión específica? | Genérico / Personalizado | **Personalizado** (usar `weakest_pillar` histórico del KV). |

---

## Checklist por sprint antes de cerrar

Cada sprint se cierra cuando:

- [ ] Todos los criterios de aceptación verificados en staging
- [ ] Eventos de analytics instrumentados y verificados en logs
- [ ] Baseline de la métrica principal registrado (si no se hizo en pre-trabajo)
- [ ] Preview de emails aprobado en Resend (Sprint 4)
- [ ] No hay regresiones en flujos existentes (run de tests vitest)
- [ ] ROADMAP.md actualizado con el estado del sprint

---

*v1.1 — 2026-04-29*
*Origen: Journey Map + Diagnóstico Hooked v1.0 + Roadmap de Ejecución v4.0 + revisión técnica + clasificación de iniciativas estratégicas*
*Cambios v1.1: Mastery Audit (feature de retención, Sprint 2), Sprint 5 (War Room + Board of Mentors), Voice Memos Sorpresa en backlog, sección de iniciativas descartadas*
*Próxima revisión: después de Sprint 1 (evaluar métricas y ajustar Sprint 2 si necesario)*
