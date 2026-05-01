/**
 * entities/payment — Payment and access domain types
 *
 * Sprint 2 FSD: extracted from services/types.ts.
 * services/types.ts re-exports from here for backward compat.
 */

import type { UserPlan } from "@/entities/user";

/* ── Purchase types ── */

export type PurchaseType = "first_path" | "path";
// "early_bird" kept for backward compat with existing KV profiles
export type SubscriptionTier = "early_bird" | "monthly" | "quarterly";

export const SUBSCRIPTION_TIERS = {
  monthly: {
    tier: "monthly" as SubscriptionTier,
    label: "Monthly",
    regularPrice: 19.99,
    earlyPrice:   12.99,
  },
  quarterly: {
    tier: "quarterly" as SubscriptionTier,
    label: "Quarterly",
    regularPrice:        47.99,
    earlyPrice:          29.99,
    regularPerMonth:     15.99,
    earlyPerMonth:        9.99,
  },
  // Legacy — existing subscribers only
  early_bird: {
    tier: "early_bird" as SubscriptionTier,
    label: "Early Bird",
    regularPrice: 9.99,
    earlyPrice:   9.99,
  },
} as const;

export const PATH_PRODUCTS = {
  first_path: {
    type: "first_path" as PurchaseType,
    price: 4.99,
    label: "First Path (Beta)",
    description: "Full permanent access to 1 Learning Path — beta price",
  },
  path: {
    type: "path" as PurchaseType,
    price: 16.99,
    label: "Learning Path",
    description: "Permanent access to 1 additional Learning Path",
  },
} as const;

export interface PurchaseDetails {
  type: PurchaseType;
  scenarioType?: string;
  tier?: SubscriptionTier;
}

export interface CheckoutResult {
  checkoutUrl: string;
  checkoutId: string;
}

/* ── Path access ── */

export interface PathAccessInfo {
  plan: UserPlan;
  pathsPurchased: string[];
  hasAllAccess: boolean;
}

/* ── Deprecated v9.0 types (kept for backward compat) ── */

/** @deprecated v9.0 — use PurchaseType instead */
export type CreditPack = "session_1" | "session_3" | "session_5";

/** @deprecated v9.0 — use PATH_PRODUCTS instead */
export const CREDIT_PACK_DETAILS: Record<CreditPack, { sessions: number; price: number; perSession: number; discount: number }> = {
  session_1: { sessions: 1, price: 4.99, perSession: 4.99, discount: 0 },
  session_3: { sessions: 3, price: 12.99, perSession: 4.33, discount: 13 },
  session_5: { sessions: 5, price: 19.99, perSession: 4.00, discount: 20 },
};

/** @deprecated v9.0 — use PathAccessInfo instead */
export interface SubscriptionInfo {
  plan: UserPlan;
  status: "active" | "cancelled" | "past_due" | "none";
  currentPeriodEnd?: string;
  creditsRemaining: number;
}
