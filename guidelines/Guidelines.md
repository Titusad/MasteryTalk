# MasteryTalk PRO - Design Guidelines

> **Canonical source:** [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md)
>
> This file is a quick reference. For the full design system including
> all color scales, spacing rules, component registry, and strict bans,
> always refer to `DESIGN_SYSTEM.md`.

## Quick Reference

- **Body text:** `text-sm text-[#45556c]`
- **Section headers:** `text-xl font-semibold text-[#0f172b]`
- **Metadata/tags:** `text-xs font-medium uppercase tracking-wider`
- **App button:** `bg-[#0f172b] ... rounded-lg`
- **Landing button:** `bg-[#2d2d2d] ... rounded-full`
- **App card:** `rounded-2xl border-[#e2e8f0] shadow-sm`
- **Landing card:** `rounded-3xl border-gray-200 shadow-sm`

## Canonical Components

Before creating any custom structural component, use:
- `AppModal` → `src/shared/ui/AppModal.tsx`
- `AppHeader` → `src/shared/ui/AppHeader.tsx`
- `SessionProgressBar` → `src/widgets/SessionProgressBar`
- `BrandLogo` → `src/shared/ui/BrandLogo.tsx`

## Strict Bans

1. **NO EMOJIS** in UI text, buttons, alerts, or system prompts
2. **NO AD-HOC COLORS** — use only the palette in DESIGN_SYSTEM.md §1
3. **NO INLINE CSS** — Tailwind classes only
4. **NO MIXING** border radius between app and landing contexts
