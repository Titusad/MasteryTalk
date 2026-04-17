# FSD Architecture Alignment (Full Migration)

## Overview
This plan outlines the full transition to a strict Feature-Sliced Design (FSD) architecture for MasteryTalk PRO, aligning the codebase with the `app → pages → widgets → features → entities → shared` dependency flow.

**Goal:** Provide zero-warning component orchestration, decouple shared utilities from business logic, and clear technical debt ahead of the Beta launch.

## Project Type
WEB

## Success Criteria
1. `shared` has exactly 0 imports from `entities`, `features`, `widgets`, `pages`, or `app`.
2. `features` are fully situated at `src/features/` instead of `src/app/features/`.
3. All feature business logic imports come from `entities` or `shared`.
4. The application builds successfully without circular dependency warnings.

## Tech Stack
- **React + TypeScript + Vite**
- **Architecture:** Feature-Sliced Design (FSD)

## File Structure (Desired)
```text
src/
├── app/          # App.tsx, global providers, routing (imports all below)
├── pages/        # Fully assembled pages
├── widgets/      # PathPurchaseModal, SessionReport, InterviewBriefingScreen
├── features/     # Component business logic (arena, shadowing, dashboard, etc.)
├── entities/     # Models (User, Session, Step) and global stores
├── shared/       # Primitives, hooks, constants (no domain knowledge)
└── services/     # Third-party APIs (Supabase, Stripe)
```

## Task Breakdown

### Sprint 1: `shared` Refactor
- **Task ID:** `FSD-01`
- **Agent:** `frontend-specialist` | **Skill:** `clean-code`
- **Description:** Clean up `shared` layer dependencies.
  1. Move `SessionProgressBar.tsx` out of `shared` to `widgets`.
  2. Remove domain exports from `src/shared/ui/index.ts` (e.g. `Step` type, `ProgressionProvider`).
  3. Change `entities/session` or `app/components/shared` dependencies currently scattered in `shared/ui`.
- **Verify:** `npx madge src/shared --circular` -> no dependencies on higher layers. 

### Sprint 2: `entities` Extraction
- **Task ID:** `FSD-02`
- **Agent:** `frontend-specialist` | **Skill:** `architecture`
- **Description:** Define universal `entities`.
  1. Move types from `src/services/types.ts` into a proper `src/entities/` structure (e.g., `src/entities/user`, `src/entities/practice`).
  2. Map the domain types centrally to limit leakage.
- **Verify:** App compiles. Types load from `@/entities/`.

### Sprint 3: `features` Migration 
- **Task ID:** `FSD-03`
- **Agent:** `orchestrator` | **Skill:** `clean-code`
- **Description:** Shift features out of the `app` namespace.
  1. Move `src/app/features/*` to `src/features/*`.
  2. Update all absolute and relative import paths referencing these features.
- **Verify:** `npm run build` succeeds without path issues.

### Sprint 4: `widgets` Alignment
- **Task ID:** `FSD-04`
- **Agent:** `frontend-specialist` | **Skill:** `clean-code`
- **Description:** Clean up macro-components mapping multiple features. 
  1. Refactor `src/widgets/SessionReport.tsx`, `PathPurchaseModal.tsx`, and `InterviewBriefingScreen.tsx` to depend strictly on the newly moved `features` and `entities`.
- **Verify:** Widgets do not contain raw domain mutations; they only orchestrate features.

### Sprint 5: `pages` & `app` Completion
- **Task ID:** `FSD-05`
- **Agent:** `frontend-specialist` | **Skill:** `architecture`
- **Description:** Finish FSD layer implementation.
  1. Relocate any rogue pages from `src/app/pages` (or components pretending to be pages) to `src/pages/`.
  2. Refactor `src/app/App.tsx` imports to target the finalized paths.
- **Verify:** `npm run dev` and perform a manual sanity click-through over navigation. 

## Phase X: Verification
- [ ] No purple/violet hex codes
- [ ] No standard template layouts
- [ ] Socratic Gate was respected
- [ ] Lint & Type Check: `npm run lint && npx tsc --noEmit`
- [ ] Security Scan: `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
- [ ] UX Audit: `python .agent/skills/frontend-design/scripts/ux_audit.py .`
- [ ] Build Check: `npm run build`
