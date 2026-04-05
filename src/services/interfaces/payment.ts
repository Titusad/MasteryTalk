/**
 * IPaymentService — Learning Path purchases (v9.0)
 *
 * Production: Supabase Edge Functions (create-checkout, webhook-payment)
 *             + Mercado Pago (LATAM)
 *             + Stripe (global)
 * Mock: Simulates checkout flow and returns fake purchase info
 */
import type {
  PurchaseDetails,
  CheckoutResult,
  PathAccessInfo,
  PathLevelProgress,
  // Deprecated — kept for backward compat during migration
  CreditPack,
  SubscriptionInfo,
} from "../types";

export interface IPaymentService {
  /** Create a checkout session for a Learning Path, All-Access, or Booster */
  createCheckout(
    uid: string,
    purchase: PurchaseDetails
  ): Promise<CheckoutResult>;

  /** Get the user's current path access state */
  getPathAccess(uid: string): Promise<PathAccessInfo>;

  /** Get progress for all levels in a purchased path */
  getPathProgress(
    uid: string,
    scenarioType: string
  ): Promise<PathLevelProgress[]>;

  /**
   * Record a fresh attempt for a level.
   * Returns updated progress. Throws if attempts exhausted (>= 3).
   */
  recordFreshAttempt(
    uid: string,
    scenarioType: string,
    levelId: string,
    sessionId: string
  ): Promise<PathLevelProgress>;

  // ── Deprecated (v7.0 compat — remove after full migration) ──

  /** @deprecated v9.0 — use createCheckout with PurchaseDetails */
  createLegacyCheckout?(uid: string, pack: CreditPack): Promise<CheckoutResult>;

  /** @deprecated v9.0 — use getPathAccess */
  getSubscription?(uid: string): Promise<SubscriptionInfo>;

  /** @deprecated v9.0 — no credits in Learning Path model */
  getCredits?(uid: string): Promise<number>;

  /** @deprecated v9.0 — no credits in Learning Path model */
  consumeCredit?(uid: string): Promise<boolean>;
}
