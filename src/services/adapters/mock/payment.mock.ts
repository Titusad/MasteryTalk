/**
 * MockPaymentService — Simulates Mercado Pago / Stripe (pay-per-session MVP)
 *
 * Credit pack pricing:
 * - session_1:  $4.99 (1 credit)
 * - session_3:  $12.99 (3 credits, 13% off)
 * - session_5:  $19.99 (5 credits, 20% off)
 *
 * Error simulation (when ?simulate_errors=true):
 * - createCheckout → PaymentError("CHECKOUT_CREATION_FAILED") or ("PAYMENT_PENDING")
 */
import type { IPaymentService } from "../../interfaces";
import type { CreditPack, CheckoutResult, SubscriptionInfo } from "../../types";
import { PaymentError } from "../../errors";
import { delay, mockId, shouldSimulateError } from "./utils";

/** In-memory credit store keyed by uid */
const creditStore: Record<string, number> = {};

function getCreditsForUid(uid: string): number {
  return creditStore[uid] ?? 0;
}

export class MockPaymentService implements IPaymentService {
  async createCheckout(
    uid: string,
    pack: CreditPack
  ): Promise<CheckoutResult> {
    await delay(800);

    /* ── Error simulation ── */
    if (shouldSimulateError("payment")) {
      const scenario = Math.random();
      if (scenario < 0.35) {
        throw new PaymentError("CHECKOUT_CREATION_FAILED");
      } else if (scenario < 0.6) {
        throw new PaymentError("PAYMENT_DECLINED");
      } else if (scenario < 0.85) {
        throw new PaymentError("PAYMENT_PENDING", {
          estimatedWait: "24-48 horas",
        });
      } else {
        throw new PaymentError("WEBHOOK_NOT_RECEIVED");
      }
    }

    // In mock, auto-approve and add credits immediately
    const packSessions: Record<CreditPack, number> = {
      session_1: 1,
      session_3: 3,
      session_5: 5,
    };
    creditStore[uid] = getCreditsForUid(uid) + packSessions[pack];

    const checkoutId = mockId("checkout");
    return {
      checkoutUrl: `https://mock-payment.example.com/checkout/${checkoutId}?pack=${pack}`,
      checkoutId,
    };
  }

  async getSubscription(uid: string): Promise<SubscriptionInfo> {
    await delay(300);

    const credits = getCreditsForUid(uid);
    return {
      plan: credits > 0 ? "per-session" : "free",
      status: credits > 0 ? "active" : "none",
      creditsRemaining: credits,
    };
  }

  async getCredits(uid: string): Promise<number> {
    await delay(100);
    return getCreditsForUid(uid);
  }

  async consumeCredit(uid: string): Promise<boolean> {
    await delay(100);
    const current = getCreditsForUid(uid);
    if (current <= 0) return false;
    creditStore[uid] = current - 1;
    return true;
  }
}