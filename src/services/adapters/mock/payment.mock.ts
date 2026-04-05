/**
 * MockPaymentService — v9.0 Learning Path purchases
 *
 * Products:
 * - single_path:  $24.99 (1 Learning Path — 4 levels × 3 sessions)
 * - all_access:   $59.99 (All 5 Learning Paths)
 * - booster:      $4.99 (+3 fresh sessions for any level)
 *
 * Error simulation (when ?simulate_errors=true):
 * - createCheckout → PaymentError("CHECKOUT_CREATION_FAILED") or ("PAYMENT_PENDING")
 */
import type { IPaymentService } from "../../interfaces";
import type {
  PurchaseDetails,
  CheckoutResult,
  PathAccessInfo,
  PathLevelProgress,
  // Legacy compat
  CreditPack,
  SubscriptionInfo,
} from "../../types";
import { PaymentError } from "../../errors";
import { delay, mockId, shouldSimulateError } from "./utils";

const ALL_SCENARIOS = ["interview", "sales", "networking", "negotiation", "csuite"];

/** In-memory path purchase store keyed by uid */
const pathStore: Record<string, Set<string>> = {};
const allAccessStore = new Set<string>();

function getPurchasedPaths(uid: string): string[] {
  if (allAccessStore.has(uid)) return [...ALL_SCENARIOS];
  return [...(pathStore[uid] || [])];
}

export class MockPaymentService implements IPaymentService {
  async createCheckout(
    uid: string,
    purchase: PurchaseDetails
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

    // Mock: auto-approve and grant access immediately
    if (purchase.type === "all_access") {
      allAccessStore.add(uid);
    } else if (purchase.type === "single_path" && purchase.scenarioType) {
      if (!pathStore[uid]) pathStore[uid] = new Set();
      pathStore[uid].add(purchase.scenarioType);
    }
    // booster: no-op for now (tracked in path_level_progress)

    const checkoutId = mockId("checkout");
    return {
      checkoutUrl: `https://mock-payment.example.com/checkout/${checkoutId}?type=${purchase.type}`,
      checkoutId,
    };
  }

  async getPathAccess(uid: string): Promise<PathAccessInfo> {
    await delay(300);
    const paths = getPurchasedPaths(uid);
    return {
      plan: paths.length > 0 ? "path" : "free",
      pathsPurchased: paths,
      hasAllAccess: allAccessStore.has(uid),
    };
  }

  async getPathProgress(
    _uid: string,
    scenarioType: string
  ): Promise<PathLevelProgress[]> {
    await delay(200);
    const prefix = scenarioType.slice(0, 3);
    // Return default unlocked Level 1, locked 2-4
    return [1, 2, 3, 4].map((n) => ({
      scenarioType,
      levelId: `${prefix}-${n}`,
      freshAttempts: 0,
      bestSessionId: null,
      status: n === 1 ? "unlocked" : "locked",
      completedAt: null,
    }));
  }

  async recordFreshAttempt(
    _uid: string,
    scenarioType: string,
    levelId: string,
    sessionId: string
  ): Promise<PathLevelProgress> {
    await delay(200);
    return {
      scenarioType,
      levelId,
      freshAttempts: 1,
      bestSessionId: sessionId,
      status: "unlocked",
      completedAt: null,
    };
  }

  // ── Deprecated legacy methods (kept for backward compat) ──

  async createLegacyCheckout(_uid: string, _pack: CreditPack): Promise<CheckoutResult> {
    console.warn("[MockPaymentService] createLegacyCheckout is deprecated — use createCheckout with PurchaseDetails");
    return { checkoutUrl: "#deprecated", checkoutId: "deprecated" };
  }

  async getSubscription(_uid: string): Promise<SubscriptionInfo> {
    console.warn("[MockPaymentService] getSubscription is deprecated — use getPathAccess");
    return { plan: "free", status: "none", creditsRemaining: 0 };
  }

  async getCredits(_uid: string): Promise<number> {
    console.warn("[MockPaymentService] getCredits is deprecated — no credits in Learning Path model");
    return 0;
  }

  async consumeCredit(_uid: string): Promise<boolean> {
    console.warn("[MockPaymentService] consumeCredit is deprecated — no credits in Learning Path model");
    return false;
  }
}