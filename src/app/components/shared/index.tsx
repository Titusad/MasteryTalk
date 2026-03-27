/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Shared Components (Barrel Export)
 *
 *  Sprint 1 FSD: all components moved to src/shared/ui/.
 *  This barrel re-exports everything for backward compatibility.
 *  Existing imports of the form:
 *    import { X } from "./shared"
 *    import { X } from "../../../components/shared"
 *  continue to work without changes.
 * ══════════════════════════════════════════════════════════════
 */

export { COLORS } from "@/shared/ui/design-tokens";
export { SmoothHeight } from "@/shared/ui/SmoothHeight";
export { BrandLogo } from "@/shared/ui/BrandLogo";
export { RecordButton, RecordingWaveformBars, RecordingTimer } from "@/shared/ui/RecordButton";
export { HighlightWithTooltip } from "@/shared/ui/HighlightTooltip";
export { AnalyzingScreen } from "@/shared/ui/AnalyzingScreen";
export { SectionHeading } from "@/shared/ui/SectionHeading";
export { CheckIcon, XIcon } from "@/shared/ui/Icons";
export { DotPattern } from "@/shared/ui/DotPattern";
export { PastelBlobs } from "@/shared/ui/PastelBlobs";
export { MiniFooter } from "@/shared/ui/MiniFooter";
export { PageTitleBlock } from "@/shared/ui/PageTitleBlock";
export { AccuracyRing } from "@/shared/ui/AccuracyRing";
export { StageBadge } from "@/shared/ui/StageBadge";
export { SubtleTextLink } from "@/shared/ui/SubtleTextLink";
export { highlightEnglish, renderStressedPhrase, stripStressMarkers } from "@/shared/ui/TextHelpers";
export { PricingCard } from "@/shared/ui/PricingCard";
export { ServiceErrorBanner, PaymentPendingBanner } from "@/shared/ui/ServiceErrorBanner";
