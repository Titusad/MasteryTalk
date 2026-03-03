/**
 * IPaymentService — Checkout and credit management (pay-per-session MVP)
 *
 * Production: Supabase Edge Functions (create-checkout, webhook-payment)
 *             + Mercado Pago (LATAM)
 *             + Stripe (global)
 * Mock: Simulates checkout flow and returns fake credit info
 */
import type { CreditPack, CheckoutResult, SubscriptionInfo } from "../types";

export interface IPaymentService {
  /** Create a checkout session for a given credit pack */
  createCheckout(
    uid: string,
    pack: CreditPack
  ): Promise<CheckoutResult>;

  /** Get current subscription / credit info */
  getSubscription(uid: string): Promise<SubscriptionInfo>;

  /** Get remaining session credits */
  getCredits(uid: string): Promise<number>;

  /**
   * Consume one session credit (called when session starts).
   * Returns false if no credits remaining.
   */
  consumeCredit(uid: string): Promise<boolean>;
}
