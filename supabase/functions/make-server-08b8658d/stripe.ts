/**
 * ══════════════════════════════════════════════════════════════
 *  stripe.ts — Stripe SDK + helpers for MasteryTalk payments
 *
 *  Handles:
 *  - Stripe client initialization (lazy singleton)
 *  - Checkout Session creation
 *  - Webhook signature verification
 *
 *  Environment variables (set via `supabase secrets set`):
 *  - STRIPE_SECRET_KEY        → sk_test_... or sk_live_...
 *  - STRIPE_WEBHOOK_SECRET    → whsec_...
 *  - STRIPE_PRICE_TRIAL       → price_... (Trial $3.99)
 *  - STRIPE_PRICE_PATH        → price_... (Path $16.99)
 * ══════════════════════════════════════════════════════════════
 */
import Stripe from "npm:stripe@17";

/* ── Lazy singleton ── */

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("[Stripe] STRIPE_SECRET_KEY not configured");

  _stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" });
  return _stripe;
}

/* ── Price ID helpers ── */

export type StripePurchaseType = "first_path" | "path";

export function getStripePriceId(purchaseType: StripePurchaseType): string {
  const envKey = purchaseType === "first_path" ? "STRIPE_PRICE_FIRST_PATH" : "STRIPE_PRICE_PATH";
  const priceId = Deno.env.get(envKey);
  if (!priceId) throw new Error(`[Stripe] ${envKey} not configured`);
  return priceId;
}

/* ── Product metadata ── */

export const PRODUCT_INFO: Record<StripePurchaseType, { label: string; price: number }> = {
  first_path: { label: "First Path (Beta)", price: 4.99 },
  path:       { label: "Learning Path", price: 16.99 },
};

/* ── Create Checkout Session ── */

export interface CreateCheckoutParams {
  userId: string;
  userEmail?: string;
  purchaseType: StripePurchaseType;
  scenarioType: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createStripeCheckout(params: CreateCheckoutParams) {
  const { userId, userEmail, purchaseType, scenarioType, successUrl, cancelUrl } = params;
  const stripe = getStripe();
  const priceId = getStripePriceId(purchaseType);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      userId,
      purchaseType,
      scenarioType,
    },
    customer_email: userEmail || undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes from now
  });

  return {
    checkoutUrl: session.url!,
    checkoutId: session.id,
  };
}

/* ── Webhook Signature Verification ── */

export async function verifyStripeWebhook(
  rawBody: string,
  signature: string,
): Promise<Stripe.Event> {
  const stripe = getStripe();
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) throw new Error("[Stripe] STRIPE_WEBHOOK_SECRET not configured");

  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}
