/**
 * Practice Session — Constants (Shared Layer)
 * No React, no DOM — 100% reusable in React Native.
 */
import type { UserPlan } from "@/services/types";

export const MAX_REPEATS: Record<UserPlan, number> = {
  free: 1,
  path: 3,
};

export const SCENARIO_LABELS_MAP: Record<string, string> = {
  sales: "Sales Pitch",
  interview: "Job Interview",
  csuite: "Executive Presentation",
  negotiation: "Negotiation",
  networking: "Networking",
};
