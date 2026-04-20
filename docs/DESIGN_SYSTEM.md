# MasteryTalk PRO — Design System v1.0

> **Source of Truth** for all visual and UI decisions.
> Any new component or UI change MUST comply with this document.
> If the design system needs to change, update THIS FILE FIRST → get approval → then code.
>
> Last updated: 2026-04-20

---

## §1 — Color Palette

### §1.1 Primary Colors

| Context | Color | Hex | Usage |
|---------|-------|-----|-------|
| App Internal | Navy | `#0f172b` | Buttons, navbar, active tabs, primary text |
| Landing/Marketing | Charcoal | `#2d2d2d` | CTAs, public header |

### §1.2 Text Colors

| Role | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Primary | `#0f172b` | `text-[#0f172b]` | Headings, important labels |
| Secondary | `#45556c` | `text-[#45556c]` | Body text, descriptions |
| Tertiary | `#62748e` | `text-[#62748e]` | Supporting info |
| Muted | `#94a3b8` | `text-[#94a3b8]` | Placeholders, timestamps |

### §1.3 Background & Borders

| Role | Hex/Class | Usage |
|------|-----------|-------|
| App background | `#f0f4f8` | Internal pages |
| App card border | `#e2e8f0` / `border-[#e2e8f0]` | Cards, dividers |
| Landing card border | `gray-200` / `border-gray-200` | Marketing cards |

### §1.4 Pastel (Decorative ONLY — never for text or state)

| Name | Hex | Usage |
|------|-----|-------|
| Peach | `#FFE9C7` | Blob accents |
| Blue | `#D9ECF0` | Blob accents |
| Green | `#DBEDDF` | Blob accents |
| Lavender | `#E1D4FF` | Blob accents |

### §1.5 Prohibited

- ❌ Ad-hoc hex codes not listed above
- ❌ Gradients (unless explicitly requested)
- ❌ Generic Tailwind colors (`red-500`, `blue-600`, etc.) for primary elements

---

## §2 — Typography

### §2.1 Scale (Allowed Values ONLY)

| Tailwind Class | Size / Weight | Use |
|---------------|--------------|-----|
| `text-2xl font-semibold` | 24px / 600 | Page titles |
| `text-xl font-semibold` | 20px / 600 | Section titles, card headings |
| `text-base font-semibold` | 16px / 600 | Subtitles, section labels |
| `text-sm` | 14px / 400 | **Standard app body ← most used** |
| `text-sm font-medium` | 14px / 500 | Labels, level names, badges |
| `text-xs font-medium` | 12px / 500 | Uppercase tags, pills |
| `text-xs` | 12px / 400 | Metadata, timestamps |
| `text-5xl font-bold` | 48px / 700 | Score displays (74%, B2) |

### §2.2 Allowed Weights

`400` (normal) · `500` (medium) · `700` (bold)

### §2.3 Prohibited

- ❌ `text-[13px]`, `text-[15px]` or any arbitrary pixel values
- ❌ `style={{ fontWeight: 600 }}` or `style={{ fontSize: '...' }}` inline
- ❌ Font weights: `300` (light), `600` (semibold as inline)
- ❌ Use Tailwind scale only — no inline CSS for typography

---

## §3 — Spacing

### §3.1 Allowed Values

| Class | Pixels | Notes |
|-------|--------|-------|
| `gap-1` / `p-1` | 4px | Tight grouping |
| `gap-2` / `p-2` | 8px | |
| `gap-3` / `p-3` | 12px | |
| `gap-4` / `p-4` | 16px | |
| **`gap-6` / `p-6`** | **24px** | **← Most used** |
| `p-8` | 32px | |
| `p-10` / `p-12` | 40-48px | Landing only |

### §3.2 Prohibited

- ❌ `p-5`, `p-7`, `p-9`, `gap-5`, `gap-7`

---

## §4 — Border Radius

### §4.1 Scale

| Class | Context |
|-------|---------|
| `rounded` / `rounded-sm` | Badges, tags |
| **`rounded-lg`** | **App buttons ← standard** |
| `rounded-xl` | Compact cards |
| **`rounded-2xl`** | **App cards ← standard** |
| `rounded-3xl` | Landing cards, modals |
| `rounded-full` | Landing buttons, avatars |

### §4.2 Rules

- **App buttons** = `rounded-lg`. **Landing buttons** = `rounded-full`. **NEVER mix.**
- **App cards** = `rounded-2xl`. **Landing cards** = `rounded-3xl`. **NEVER mix.**

### §4.3 Prohibited in Buttons

- ❌ `rounded-xl`, `rounded-2xl`, `rounded-3xl`

---

## §5 — Shadows

### §5.1 Scale

| Class | Usage |
|-------|-------|
| None (flat) | Default state for most elements |
| **`shadow-sm`** | **App cards ← most used** |
| `shadow` | Hover state |
| `shadow-lg` | Landing CTAs |
| `shadow-2xl` | Modals ONLY |

### §5.2 Prohibited in Cards

- ❌ `shadow-md`, `shadow-xl`, `shadow-2xl`

---

## §6 — Component Registry

> **RULE:** Before creating ANY UI element, check if a canonical version exists here.

### §6.1 AppHeader

**Location:** `src/shared/ui/AppHeader.tsx`

One polymorphic component for **all** app headers. Three variants:

```typescript
interface AppHeaderProps {
  variant: 'public' | 'dashboard' | 'session';

  // public variant: back navigation for legal/static pages
  showBackButton?: boolean;
  backLabel?: string;
  onBack?: () => void;

  // dashboard variant: persistent across Dashboard/Account/History/Library
  onNavigateToDashboard?: () => void;  // Shows "← Dashboard" link (only on sub-pages)
  onLogoClick?: () => void;            // Logo → landing page
  userName?: string;                   // Avatar initials derived automatically
  onLogout?: () => void;
  onNavigateToAccount?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToLibrary?: () => void;
  rightSlot?: React.ReactNode;

  // session variant: minimal header during practice
  leftSlot?: React.ReactNode;          // e.g. mobile menu toggle
  onGoToDashboard?: () => void;        // Caller handles exit confirmation
}
```

**Architecture rules:**
- **Dashboard header is persistent** — rendered ONCE in `App.tsx`, wrapping Dashboard/Account/History/Library pages. Never re-mounts during navigation.
- **`← Dashboard` link** only appears on sub-pages (Account, History, Library), not on Dashboard itself.
- **Logo click** always navigates to the landing page (where logged-in state is shown).
- **Session exit** requires caller-side confirmation dialog ("Leave session? Progress will be lost.").
- **Full-width** — no `max-w` constraints on dashboard or landing headers.

Landing page header is a special marketing case — lives in `LandingPage.tsx`.

### §6.2 AppModal

**Location:** `src/shared/ui/AppModal.tsx`

One wrapper for all modals.

```typescript
interface AppModalProps {
  open: boolean;
  onClose: () => void;
  size: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  accentBar?: boolean;
}
```

Fixed specs (never override):
- Backdrop: `bg-[#0f172b]/60 backdrop-blur-sm`
- Card: `bg-white rounded-3xl shadow-2xl overflow-hidden`
- Animation: `scale 0.92→1, y 24→0, opacity 0→1, 0.5s`

### §6.3 Buttons — Canonical Variants

```tsx
// App internal (primary)
className="bg-[#0f172b] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1d293d] transition-colors"

// Landing/marketing (primary)
className="bg-[#2d2d2d] text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-[#1a1a1a] transition-colors shadow-lg"

// Secondary app
className="border border-[#e2e8f0] text-[#0f172b] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#f8fafc] transition-colors"

// Ghost
className="text-[#45556c] hover:text-[#0f172b] text-sm transition-colors"
```

### §6.4 Cards — Canonical Variants

```tsx
// App card (most common)
className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6"

// Landing/marketing card
className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6"

// Compact card (list items, levels)
className="bg-white rounded-xl border border-[#e2e8f0] p-4"

// Dark card (offer blocks, report hero)
className="bg-[#0f172b] rounded-2xl p-6"
```

### §6.5 Shared Components (never reimplement)

`BrandLogo` · `PastelBlobs` · `MiniFooter` · `AppHeader` · `AnalyzingScreen` · `RecordButton` · `RecordingWaveformBars` · `RecordingTimer` · `SessionProgressBar` · `ServiceErrorBanner` · `SmoothHeight` · `DotPattern`

---

## §7 — Strict Bans

### §7.1 No Emojis

Emojis (`🚀`, `✨`, `🔥`, `💡`, etc.) are **strictly forbidden** in:
- UI text
- Buttons
- Alerts
- System prompts

### §7.2 No Arbitrary Icons

- Only `lucide-react` is allowed
- Do NOT import random SVGs or font-awesome
- Do NOT add an icon to a button unless explicitly requested

### §7.3 No Inline CSS

- Do NOT use `style={{ fontSize: '13px', fontWeight: 600 }}`
- Stick to Tailwind classes exclusively

---

## §8 — Quick Reference Card

```
TEXT:       text-sm text-[#45556c]           (standard body)
HEADING:    text-xl font-semibold text-[#0f172b]  (section title)
METADATA:   text-xs font-medium uppercase tracking-wider

BUTTON:     bg-[#0f172b] ... rounded-lg     (app)
            bg-[#2d2d2d] ... rounded-full   (landing)

CARD:       rounded-2xl border-[#e2e8f0]    (app)
            rounded-3xl border-gray-200     (landing)

MODAL:      AppModal from shared/ui
HEADER:     AppHeader from shared/ui
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.1 | 2026-04-20 | §6.1 AppHeader rewritten — 3 polymorphic variants (public/dashboard/session), persistent layout, full-width headers, exit confirmation |
| v1.0 | 2026-04-17 | Initial — consolidated from SKILL.md + Guidelines.md |
