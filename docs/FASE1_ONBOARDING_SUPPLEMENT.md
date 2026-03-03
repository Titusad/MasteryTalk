# Suplemento Tecnico — Fase 1 Onboarding

> Este documento complementa BACKEND_HANDOFF.md y WORKPLAN_v3.md.
> Contiene los artefactos ejecutables y las instrucciones de wiring
> que el desarrollador necesita para completar Fase 1 en 5 dias.
> **Prerequisito:** El prototipo (Fase 0) debe estar compilando y corriendo con mocks.
> Actualizado: 26 febrero 2026

---

## Artefactos Generados

| Archivo | Que es | Cuando usarlo |
|---|---|---|
| `/docs/FASE1_MIGRATION.sql` | SQL completo: 5 tablas + trigger + RLS + indexes | Dia 2: ejecutar en Supabase SQL Editor |
| `/src/services/supabase.ts` | Supabase client singleton + tipos de filas DB | Dia 1: configurar env vars |
| `/src/services/adapters/supabase/auth.supabase.ts` | SupabaseAuthService implementado | Dia 1: ya funcional |
| `/src/services/index.ts` | Per-service toggle (modo hibrido) | Dia 1: cambiar `USE_MOCK = false` |
| `/src/app/components/AuthModal.tsx` | Wired a `authService.signIn()` con error handling | Ya wired |
| `/src/app/components/PracticeWidget.tsx` | SignupModal wired a authService | Ya wired |
| `/.env.example` | Template de variables de entorno | Dia 1: copiar a .env |

---

## Dia 1: Setup + Auth Wiring (4 horas)

### 1.1 Configurar credenciales

```bash
cp .env.example .env
```

Llenar en `.env`:
- `VITE_SUPABASE_URL` — Dashboard > Settings > API > Project URL
- `VITE_SUPABASE_ANON_KEY` — Dashboard > Settings > API > anon/public key

### 1.2 Configurar OAuth providers en Supabase Dashboard

**Google:**
1. Dashboard > Authentication > Providers > Google
2. Crear OAuth credentials en Google Cloud Console
3. Redirect URL: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Scopes: `email`, `profile`, `openid`

**LinkedIn (opcional F1-04):**
1. Dashboard > Authentication > Providers > LinkedIn (OIDC)
2. Crear app en LinkedIn Developer Portal
3. Scopes: `openid`, `profile`, `email`

### 1.3 Activar modo hibrido

En `/src/services/index.ts`, cambiar:

```typescript
const USE_MOCK = false;  // Era true
```

Esto activa:
- `authService` → SupabaseAuthService (real)
- Los otros 6 servicios → Mock (sin cambios)

El fallback es automatico: si las env vars no estan, `shouldUseMock()` detecta y usa mock con un warning en console.

### 1.4 Verificar wiring

Los siguientes componentes YA estan wired a `authService`:

| Componente | Que hace | Error handling |
|---|---|---|
| `AuthModal` | Llama `authService.signIn(provider)` por boton | Muestra `AuthError.userMessage` inline + bubble a parent |
| `PracticeWidget > SignupModal` | Llama `authService.signIn(provider)` por boton | Muestra error inline |
| `DashboardPage` | Llama `authService.signOut()` en logout | Fire-and-forget + navega |

**NO necesita cambios el desarrollador.** Solo configurar env vars y cambiar `USE_MOCK`.

---

## Dia 2: Schema SQL (2 horas)

### 2.1 Ejecutar migracion

1. Abrir Supabase Dashboard > SQL Editor
2. Pegar el contenido COMPLETO de `/docs/FASE1_MIGRATION.sql`
3. Click "Run"

### 2.2 Verificar

Ejecutar estas queries despues de la migracion:

```sql
-- 5 tablas existen
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'sessions', 'sr_cards', 'power_phrases', 'audit_logs');

-- RLS habilitado en las 5
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'sessions', 'sr_cards', 'power_phrases', 'audit_logs');

-- Trigger activo
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

---

## Dia 3-4: Testing Manual (QA F1)

### Tests P0 (obligatorios)

| Test | Accion | Resultado esperado |
|---|---|---|
| F1-01 | Click "Registrarse con Google" | OAuth flow completo. Verificar en Supabase: `auth.users` + `profiles` creados |
| F1-03 | Cerrar app > Reabrir > Login | Carga perfil existente, no duplica `profiles` row |
| F1-05 | Abrir popup Google > Cerrar popup | Error inline "Cerraste la ventana..." aparece en AuthModal |
| F1-06 | Click Logout en Dashboard | Sesion destruida. Navega a Landing |
| F1-08 | Verificar en Table Editor | 5 tablas existen con columnas correctas |
| F1-10 | Query `SELECT * FROM sessions` como user A | Solo retorna filas de user A |
| F1-11 | Intentar acceder a session de user B | 0 filas retornadas (RLS) |
| F1-12 | Registrar usuario nuevo | Trigger crea `profiles` row automaticamente |
| F1-15 | Auth real + practice flow | Todo el flujo funciona con auth real + servicios mock |
| F1-16 | Verificar User object | Todos los campos mapeados: uid, email, displayName, photoURL, plan, etc. |

### Tests P1 (recomendados)

| Test | Accion | Resultado esperado |
|---|---|---|
| F1-02 | Verificar `profiles.market_focus` | Tiene valor 'mexico' (default del trigger) |
| F1-04 | Registrarse con LinkedIn | Mismo comportamiento que Google |
| F1-09 | INSERT session con user_id falso | FK violation error |
| F1-13 | UPDATE `profiles SET plan = 'invalid'` | CHECK constraint error |
| F1-14 | UPDATE `sr_cards SET interval_step = 5` | CHECK constraint error |

---

## Dia 5: Hardening + Documentacion

### 5.1 Redirect URL de produccion

Agregar en Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `https://tu-dominio.com`
- Redirect URLs: agregar tu dominio de produccion

### 5.2 Considerar: Session recovery en App.tsx

> **NOTA:** `onAuthStateChanged` ya esta implementado en `App.tsx` (lineas 102-149).
> El listener ya maneja:
> - Auto-navegacion a Dashboard/PracticeSession post-auth
> - Limpieza de estado en logout
> - Pending setup flow via `pendingSetupRef`
>
> **No necesitas implementar esto** — ya esta hecho. Solo verifica que funcione
> correctamente con auth real en lugar de mock.

---

## Composicion del tipo User (sin cambios de schema)

El `SupabaseAuthService` compone el `User` de la app desde DOS fuentes:

```
auth.users (Supabase Auth)          profiles (nuestra tabla)
================================    ==========================
id ──────────────────────────────→  uid
email ───────────────────────────→  email
user_metadata.full_name ─────────→  displayName
user_metadata.avatar_url ────────→  photoURL
                                    plan ←─────────────── plan
                                    free_session_used ←── freeSessionUsed
                                    stats.sessions_count → sessionsCompleted
                                    market_focus ←─────── marketFocus
                                    created_at ←───────── createdAt
```

**No se duplican `displayName` ni `email` en la tabla `profiles`** — se leen de `auth.users` directamente. Esto evita desync si el usuario actualiza su perfil de Google.

---

## Arquitectura del Per-Service Toggle

```
services/index.ts
    │
    ├── USE_MOCK = true  ──→ TODOS los servicios usan mock
    │
    └── USE_MOCK = false ──→ Lee ADAPTER_MODE por servicio:
                              │
                              ├── auth: "supabase" ──→ SupabaseAuthService
                              ├── conversation: "mock" ──→ MockConversationService
                              ├── feedback: "mock" ──→ MockFeedbackService
                              ├── speech: "mock" ──→ MockSpeechService
                              ├── user: "mock" ──→ MockUserService
                              ├── payment: "mock" ──→ MockPaymentService
                              └── spacedRepetition: "mock" ──→ MockSpacedRepetitionService

    Si auth = "supabase" pero env vars faltan:
      → console.warn + fallback automatico a mock
```

Conforme se implementen Fases 2-4, el desarrollador solo cambia el valor en ADAPTER_MODE:

```typescript
// Fase 2 completada:
const ADAPTER_MODE = {
  auth: "supabase",          // ← Fase 1
  conversation: "supabase",  // ← Fase 2 (nuevo)
  feedback: "mock",
  speech: "mock",
  user: "mock",
  payment: "mock",
  spacedRepetition: "mock",
};
```