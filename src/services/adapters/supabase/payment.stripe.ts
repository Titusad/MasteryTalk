/**
 * StripePaymentService — Real payment via Stripe Checkout
 *
 * Creates checkout sessions via the Edge Function /create-checkout.
 * Path access is read from the user profile (populated by webhook).
 */
import { SUPABASE_URL } from "@/services/supabase";
import { getAuthToken } from "@/services/supabase";
import type { IPaymentService } from "../../interfaces";
import type {
  PurchaseDetails,
  CheckoutResult,
  PathAccessInfo,
  PathLevelProgress,
  CreditPack,
  SubscriptionInfo,
} from "../../types";
import { PaymentError } from "../../errors";

const BASE = `${SUPABASE_URL}/functions/v1/make-server-08b8658d`;

async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getAuthToken();
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
}

export class StripePaymentService implements IPaymentService {
  async createCheckout(
    _uid: string,
    purchase: PurchaseDetails,
  ): Promise<CheckoutResult> {
    try {
      const res = await apiFetch("/create-checkout", {
        method: "POST",
        body: JSON.stringify({
          purchaseType: purchase.type,
          scenarioType: purchase.scenarioType,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        console.error("[StripePayment] Checkout failed:", body);

        if (res.status === 500 && body.error?.includes("not configured")) {
          throw new PaymentError("CHECKOUT_CREATION_FAILED", {
            cause: new Error(body.error),
          });
        }
        throw new PaymentError("CHECKOUT_CREATION_FAILED");
      }

      const data = await res.json();
      return {
        checkoutUrl: data.checkoutUrl,
        checkoutId: data.checkoutId,
      };
    } catch (err) {
      if (err instanceof PaymentError) throw err;
      throw new PaymentError("CHECKOUT_CREATION_FAILED", {
        cause: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  async getPathAccess(_uid: string): Promise<PathAccessInfo> {
    try {
      const res = await apiFetch("/profile");
      if (!res.ok) throw new Error(`${res.status}`);
      const profile = await res.json();

      const pathsPurchased: string[] = profile.paths_purchased || [];
      return {
        plan: pathsPurchased.length > 0 ? "path" : "free",
        pathsPurchased,
        hasAllAccess: pathsPurchased.length >= 5,
      };
    } catch {
      return { plan: "free", pathsPurchased: [], hasAllAccess: false };
    }
  }

  async getPathProgress(
    _uid: string,
    scenarioType: string,
  ): Promise<PathLevelProgress[]> {
    // Delegate to progression endpoint (existing)
    try {
      const res = await apiFetch(
        `/progression/${scenarioType}/levels`,
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      return data.levels || [];
    } catch {
      // Return default progression
      const prefix = scenarioType.slice(0, 3);
      return [1, 2, 3, 4].map((n) => ({
        scenarioType,
        levelId: `${prefix}-${n}`,
        freshAttempts: 0,
        bestSessionId: null,
        status: n === 1 ? ("unlocked" as const) : ("locked" as const),
        completedAt: null,
      }));
    }
  }

  async recordFreshAttempt(
    _uid: string,
    scenarioType: string,
    levelId: string,
    sessionId: string,
  ): Promise<PathLevelProgress> {
    return {
      scenarioType,
      levelId,
      freshAttempts: 1,
      bestSessionId: sessionId,
      status: "unlocked",
      completedAt: null,
    };
  }

  // ── Deprecated legacy methods ──

  async createLegacyCheckout(
    _uid: string,
    _pack: CreditPack,
  ): Promise<CheckoutResult> {
    console.warn(
      "[StripePaymentService] createLegacyCheckout is deprecated",
    );
    return { checkoutUrl: "#deprecated", checkoutId: "deprecated" };
  }

  async getSubscription(_uid: string): Promise<SubscriptionInfo> {
    console.warn(
      "[StripePaymentService] getSubscription is deprecated",
    );
    return { plan: "free", status: "none", creditsRemaining: 0 };
  }

  async getCredits(_uid: string): Promise<number> {
    return 0;
  }

  async consumeCredit(_uid: string): Promise<boolean> {
    return false;
  }
}
