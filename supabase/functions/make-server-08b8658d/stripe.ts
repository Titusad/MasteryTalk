/**
 * ══════════════════════════════════════════════════════════════
 *  stripe.ts — Stripe SDK + helpers for MasteryTalk payments
 *
 *  Handles:
 *  - Stripe client initialization (lazy singleton)
 *  - Subscription Checkout Session creation ($14.99/mo)
 *  - Webhook signature verification
 *
 *  Environment variables (set via `supabase secrets set`):
 *  - STRIPE_SECRET_KEY           → sk_test_... or sk_live_...
 *  - STRIPE_WEBHOOK_SECRET       → whsec_...
 *  - STRIPE_PRICE_PRO_MONTHLY    → price_... (Pro Plan $14.99/mo)
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

/* ── Product metadata ── */

export const PRODUCT_INFO = {
  subscription: { label: "MasteryTalk PRO", price: 14.99 },
} as const;

/* ── Create Subscription Checkout Session ── */

export interface CreateCheckoutParams {
  userId: string;
  userEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createStripeCheckout(params: CreateCheckoutParams) {
  const { userId, userEmail, successUrl, cancelUrl } = params;
  const stripe = getStripe();

  const priceId = Deno.env.get("STRIPE_PRICE_PRO_MONTHLY");
  if (!priceId) throw new Error("[Stripe] STRIPE_PRICE_PRO_MONTHLY not configured");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
    customer_email: userEmail || undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
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
