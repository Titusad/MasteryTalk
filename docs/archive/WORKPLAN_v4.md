# inFluentia PRO — Plan de Trabajo v4.0

> **Fecha:** 27 marzo 2026
> **Reemplaza:** WORKPLAN_v3.2 y anteriores
> **Contexto:** El proyecto ha migrado exitosamente a arquitectura Feature-Sliced Design (FSD). Se han completado las Fases 0, 1 y gran parte de la 2 y 3. El sistema cuenta con 7 adapters reales de Supabase conectados, un nuevo sistema de lecciones estructuradas (GPT-4o), un Admin Dashboard, y seguridad reforzada mediante el patrón `getAuthToken`.

---

## Estado Actual — Qué ya está construido

### Arquitectura y Seguridad
- **Feature-Sliced Design (FSD):** Migración completa a `/app`, `/pages`, `/widgets`, `/entities`, `/shared`. Monolitos eliminados.
- **Security Hardening:** Patrón `getAuthToken` implementado. Vulnerabilidades de `publicAnonKey` resueltas.
- **Foundational Tests:** Suite de pruebas base usando Vitest y happy-dom (~40 pruebas para SR, supabase, auth, feedback).
- **Service Layer Híbrida:** 7 adaptadores Supabase reales operativos (auth, conversation, feedback, speech, user, spaced-repetition, dashboard).

### Features Principales Implementadas
- **Conversation Engine (Voice Practice):** Flujo completo (Support → Guidance → Challenge) con Edge Functions (`prepare-session`, `process-turn`).
- **Structured Lesson System:** Evaluador `GET /progression/lesson`. UI de 5 pasos en `LessonModal.tsx` con generación dinámica vía GPT-4o e inline shadowing.
- **Admin Dashboard & Progression:** Árbol de progresión, seguimiento de rachas (streaks), y dashboard de administrador.
- **Azure Speech & Feedback:** Integración de pronunciación STT/TTS de Azure y análisis de feedback con Gemini resueltos.
- **Nuevas Páginas:** `AccountPage`, `LibraryPage`, `AdminDashboardPage`.

---

## Roadmap Inmediato — Próximos Pasos (Marzo-Abril 2026)

### SPRINT 1: Skill Drill & CP Desbloqueo (Prioridad Máxima)
> **Objetivo:** Completar la experiencia post-sesión introducida en la v7.0 del Blueprint. El Skill Drill es el puente entre la sesión gratuita y el Conversational Path de pago.

1. **Schema de Pagos (Setup):**
   - Ejecutar el schema SQL para las tablas `subscriptions` y `session_purchases` en Supabase de producción.

2. **Backend Evaluador (Skill Drill):**
   - Crear el prompt `drill-evaluator-prompt.ts` con criterios específicos por pillar (Vocabulary, Grammar, Tone, etc).
   - Implementar y desplegar la Edge Function `POST /evaluate-drill`.

3. **Frontend Skill Drill UI:**
   - Construir `SkillDrillScreen.tsx` dentro de `src/pages/PracticeSessionPage` (o su entidad correspondiente en FSD).
   - Modo dual: texto o voz dependiendo del pilar. Máximo 2 intentos.
   - Conectar lógica de creación automática de SR Card si el score es bajo (< 45).

4. **Conversational Path Unlock UI:**
   - Construir `ConversationalPathUnlockScreen.tsx` (celebración, confetti, y CTA).
   - Intercalar esta pantalla entre `conversation-feedback` y `session-recap` en el flujo principal.

### SPRINT 2: Monetización y Pagos (Fase 4 Restante)
> **Objetivo:** Habilitar suscripciones mensuales y pay-per-session.

1. **Payment Adapter Real:**
   - Implementar `SupabasePaymentService` contra las APIs de MercadoPago / Stripe.
2. **Subscription UI:**
   - Construir `SubscriptionModal.tsx`.
   - Reemplazar y eliminar definitivamente porciones de `CreditUpsellModal` (Deprecado).
3. **Control de Acceso (Gating):**
   - Ajustar `useUsageGating` y las funciones de acceso `canStartSession()` para respetar los escenarios gratuitos vs CP activo.

### SPRINT 3: Deuda Técnica y Estabilización
> **Objetivo:** Preparación para QA intensivo.

1. **Ejecutar Test Suite:** Validar y resolver problemas de permisos (`npm install` macOS EPERM) para correr Vitest en CI/CD.
2. **Limpieza MVP Legacy:** Borrar componentes de pantallas obsoletas pre-FSD.
3. **WCAG Accessibility Audit:** Garantizar contrastes, ARIA labels y navegación por teclado en todo el nuevo layout.

---

## Resumen de Fases del Blueprint (Estado Real)

- **Fase 0 (Prototipo Mock):** ✅ Superada (Migrado a FSD).
- **Fase 1 (Auth + Schema):** ✅ Completada (Seguridad getAuthToken).
- **Fase 2 (Conversation Engine):** ✅ Completada (Speech + Lecciones GPT-4o).
- **Fase 3 (Feedback + Pronunciation):** 🟡 **ACTIVA** (Pendiente: Skill Drill `/evaluate-drill`).
- **Fase 4 (Retention & Payments):** 🟡 **ACTIVA** (Pendiente: Stripe/MercadoPago, Schema tablas `subscriptions`).
