# inFluentia PRO

AI-powered executive English coaching for LATAM nearshoring professionals.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS v4 + Vite 6 + Motion
- **Backend:** Supabase (Auth, Edge Functions, KV Store)
- **Architecture:** Service Layer with Adapter Pattern (mock ↔ real swap)

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start dev server
pnpm dev
```

## Environment Setup

### Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the **Project URL** and **Anon Key** from Settings > API
3. Set them in `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
4. In Supabase Dashboard > Authentication > Providers > Google, paste the Client ID and Secret

### Figma Make Compatibility

The file `utils/supabase/info.tsx` contains hardcoded Supabase credentials from Figma Make.
For standalone deployment, credentials are resolved from `.env` first (see `src/services/supabase.ts`).

## Project Structure

```
src/
  app/
    App.tsx                     # Main app component
    components/                 # React components
      arena/                    # Practice arena system
      shared/                   # Shared components (BrandLogo, SmoothHeight, etc.)
      ui/                       # shadcn/ui primitives
      landing-i18n.ts           # i18n copy (ES/PT/EN)
    hooks/                      # Custom hooks (useUsageGating, useServiceCall)
  services/
    index.ts                    # Service registry (auto-detect mock ↔ Supabase)
    types.ts                    # Shared TypeScript types
    errors.ts                   # Error types (AuthError, ServiceError)
    supabase.ts                 # Supabase client singleton + DB row types
    interfaces/                 # Service interfaces (IAuthService, etc.)
    adapters/
      mock/                     # Mock implementations + test data
      supabase/                 # Real Supabase implementations
    prompts/                    # AI prompt templates
  styles/                       # CSS (Tailwind v4, fonts, theme tokens)
supabase/
  functions/server/             # Hono Edge Functions (auth, profile, sessions)
docs/                           # Architecture docs (Blueprint, QA, Workplan)
```

## Architecture: Adapter Pattern

`services/index.ts` auto-detects whether Supabase is configured:

- **Supabase available** → `SupabaseAuthService` (real Google OAuth)
- **No Supabase** → `MockAuthService` (instant fake auth for demos)

All other services (conversation, feedback, speech, user, payment) currently use mock adapters regardless. Swap them one by one as you build real implementations.

## Server Endpoints

Base URL: `https://{project-id}.supabase.co/functions/v1/make-server-4e8a5b39`

| Method | Route                  | Auth | Description                     |
|--------|------------------------|------|---------------------------------|
| GET    | /health                | No   | Health check                    |
| GET    | /auth/status           | Yes  | Verify auth session             |
| POST   | /auth/ensure-profile   | Yes  | Create profile if not exists    |
| POST   | /auth/signup           | No   | Email/password signup (testing) |
| GET    | /profile               | Yes  | Fetch user profile from KV      |
| PUT    | /profile               | Yes  | Update user profile in KV       |
| POST   | /profile/mark-free-used| Yes  | Mark free session as used       |
| GET    | /sessions              | Yes  | List practice sessions          |
| POST   | /sessions              | Yes  | Save a practice session         |

## Monetization (Freemium)

- 1 free session per month
- 3 paywall triggers (mid-session, pre-report, dashboard)
- Credit packs: 1/3/5 sessions
- Gating logic: `useUsageGating` hook + `CreditUpsellModal`

## i18n

Landing page supports 3 languages (Spanish default, Portuguese, English).
Copy is in `src/app/components/landing-i18n.ts`.
For English users, the `LanguageTransitionModal` is skipped and positioning emphasizes "communication training" over language learning.

## Docs

See `/docs/` for detailed architecture documentation:
- `MASTER_BLUEPRINT.md` — Full system architecture
- `WORKPLAN_v3.md` — Implementation phases
- `QA_ACCEPTANCE_CRITERIA.md` — Test cases
- `BACKEND_HANDOFF.md` — Server setup guide
- `FASE1_MIGRATION.sql` — Database schema
