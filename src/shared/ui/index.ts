/**
 * src/shared/ui — Component Registry barrel export
 *
 * Sprint 1 FSD: AppHeader + AppModal (canonical) + all shared UI components
 * migrated from src/app/components/shared/.
 */

// ── Canonical components ──────────────────────────────────────
export { AppHeader } from "./AppHeader";
export type { AppHeaderProps } from "./AppHeader";

export { AppModal } from "./AppModal";
export type { AppModalProps } from "./AppModal";

// ── Design tokens ─────────────────────────────────────────────
export { COLORS } from "./design-tokens";

// ── UI primitives ─────────────────────────────────────────────
export { BrandLogo } from "./BrandLogo";
export { SmoothHeight } from "./SmoothHeight";
export { RecordButton, RecordingWaveformBars, RecordingTimer } from "./RecordButton";
export { AnalyzingScreen } from "./AnalyzingScreen";
// SessionProgressBar lives in src/widgets/SessionProgressBar — import directly from there
export { ServiceErrorBanner, PaymentPendingBanner } from "./ServiceErrorBanner";

// ── Layout helpers ────────────────────────────────────────────
export { SectionHeading } from "./SectionHeading";
export { CheckIcon, XIcon } from "./Icons";
export { DotPattern } from "./DotPattern";
export { PastelBlobs } from "./PastelBlobs";
export { MiniFooter } from "./MiniFooter";
export { TermsCheckbox } from "./TermsCheckbox";
export { PageTitleBlock } from "./PageTitleBlock";
export { PricingCard } from "./PricingCard";

// ── Session utilities — consumed directly from @/shared/lib/ProgressionContext and @/entities/session

// ── Feedback components ───────────────────────────────────────
export { FeedbackAccordion } from "./FeedbackAccordion";
