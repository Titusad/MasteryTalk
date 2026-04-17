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
export { HighlightWithTooltip } from "./HighlightTooltip";
export { RecordButton, RecordingWaveformBars, RecordingTimer } from "./RecordButton";
export { AnalyzingScreen } from "./AnalyzingScreen";
export { SessionProgressBar } from "./SessionProgressBar";
export { ServiceErrorBanner, PaymentPendingBanner } from "./ServiceErrorBanner";

// ── Layout helpers ────────────────────────────────────────────
export { SectionHeading } from "./SectionHeading";
export { CheckIcon, XIcon } from "./Icons";
export { DotPattern } from "./DotPattern";
export { PastelBlobs } from "./PastelBlobs";
export { MiniFooter } from "./MiniFooter";
export { TermsCheckbox } from "./TermsCheckbox";
export { PageTitleBlock } from "./PageTitleBlock";
export { AccuracyRing } from "./AccuracyRing";
export { StageBadge } from "./StageBadge";
export { SubtleTextLink } from "./SubtleTextLink";
export { highlightEnglish, renderStressedPhrase, stripStressMarkers } from "./TextHelpers";
export { PricingCard } from "./PricingCard";

// ── Session utilities ─────────────────────────────────────────
export { ProgressionProvider, useProgressionLevel } from "@/app/components/shared/ProgressionContext";
export type { Step } from "@/entities/session";

// ── Feedback components ───────────────────────────────────────
export { ProficiencyGauge } from "./ProficiencyGauge";
export { FeedbackAccordion } from "./FeedbackAccordion";
