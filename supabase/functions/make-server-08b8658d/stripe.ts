/**
 * ══════════════════════════════════════════════════════════════
 *  stripe.ts — Stripe SDK + helpers for MasteryTalk payments
 *
 *  Tiers (user-selectable):
 *  - monthly   → $12.99/mo launch price (auto) → $19.99/mo regular
 *  - quarterly → $29.99/3mo launch price (auto) → $47.99/3mo regular
 *
 *  Launch pricing: first 25 subscriptions (shared across tiers) get
 *  the early bird price automatically. No user action required —
 *  the backend picks the right Stripe price based on slot count.
 *
 *  Backward compat: "early_bird" tier kept for existing subscribers.
 *
 *  Environment variables:
 *  - STRIPE_SECRET_KEY
 *  - STRIPE_WEBHOOK_SECRET
 *  - STRIPE_PRICE_MONTHLY_EARLY   ($12.99/mo)
 *  - STRIPE_PRICE_QUARTERLY_EARLY ($29.99/3mo)
 *  - STRIPE_PRICE_MONTHLY         ($19.99/mo)
 *  - STRIPE_PRICE_QUARTERLY       ($47.99/3mo)
 * ══════════════════════════════════════════════════════════════
 */
import Stripe from "npm:stripe@17";
import * as kv from "./kv_store.ts";

/* ── Lazy singleton ── */

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("[Stripe] STRIPE_SECRET_KEY not configured");
  _stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" });
  return _stripe;
}

/* ── Tier definitions ── */

// "early_bird" kept for backward compat with existing KV profiles
export type SubscriptionTier = "early_bird" | "monthly" | "quarterly";

export const TIER_INFO: Record<SubscriptionTier, { label: string; regularPrice: number; earlyPrice?: number; maxSlots?: number }> = {
  early_bird: { label: "Early Bird",     regularPrice: 9.99 },           // legacy
  monthly:    { label: "Monthly Pro",    regularPrice: 19.99, earlyPrice: 12.99 },
  quarterly:  { label: "Quarterly Pro",  regularPrice: 47.99, earlyPrice: 29.99, maxSlots: 25 },
};

export const PRODUCT_INFO = {
  subscription: { label: "MasteryTalk PRO", price: 19.99 },
} as const;

export const UNLOCKED_PATHS = ["interview", "meeting", "presentation", "self-intro"];

/* ── Early Bird counter (global KV, shared across monthly + quarterly) ── */

const EARLY_BIRD_KEY = "global:early_bird_count";
const EARLY_BIRD_MAX = 25;

export async function getEarlyBirdCount(): Promise<number> {
  const val = await kv.get(EARLY_BIRD_KEY);
  return typeof val === "number" ? val : 0;
}

export async function incrementEarlyBirdCount(): Promise<number> {
  const current = await getEarlyBirdCount();
  const next = current + 1;
  await kv.set(EARLY_BIRD_KEY, next);
  return next;
}

export async function decrementEarlyBirdCount(): Promise<number> {
  const current = await getEarlyBirdCount();
  const next = Math.max(0, current - 1);
  await kv.set(EARLY_BIRD_KEY, next);
  return next;
}

export async function isEarlyBirdAvailable(): Promise<boolean> {
  const count = await getEarlyBirdCount();
  return count < EARLY_BIRD_MAX;
}

/* ── Price ID resolution (auto early bird) ── */

/**
 * Returns the correct Stripe price ID for a tier.
 * For monthly/quarterly: automatically uses the early bird price if slots remain.
 */
export async function getPriceIdForTier(tier: SubscriptionTier): Promise<{ priceId: string; isEarlyBird: boolean }> {
  const ebAvailable = await isEarlyBirdAvailable();

  if (tier === "monthly") {
    const earlyId   = Deno.env.get("STRIPE_PRICE_MONTHLY_EARLY") || "";
    const regularId = Deno.env.get("STRIPE_PRICE_MONTHLY") || "";
    if (!regularId) throw new Error("[Stripe] STRIPE_PRICE_MONTHLY not configured");
    const useEarly = ebAvailable && !!earlyId;
    return { priceId: useEarly ? earlyId : regularId, isEarlyBird: useEarly };
  }

  if (tier === "quarterly") {
    const earlyId   = Deno.env.get("STRIPE_PRICE_QUARTERLY_EARLY") || "";
    const regularId = Deno.env.get("STRIPE_PRICE_QUARTERLY") || "";
    if (!regularId) throw new Error("[Stripe] STRIPE_PRICE_QUARTERLY not configured");
    const useEarly = ebAvailable && !!earlyId;
    return { priceId: useEarly ? earlyId : regularId, isEarlyBird: useEarly };
  }

  // Legacy early_bird tier
  const legacyId = Deno.env.get("STRIPE_PRICE_MONTHLY_EARLY") || Deno.env.get("STRIPE_PRICE_MONTHLY") || "";
  if (!legacyId) throw new Error("[Stripe] No price configured for legacy early_bird tier");
  return { priceId: legacyId, isEarlyBird: false };
}

/** Maps any Stripe price ID back to a canonical tier (for webhook processing) */
export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  const monthlyEarly   = Deno.env.get("STRIPE_PRICE_MONTHLY_EARLY");
  const quarterlyEarly = Deno.env.get("STRIPE_PRICE_QUARTERLY_EARLY");
  const monthly        = Deno.env.get("STRIPE_PRICE_MONTHLY");
  const quarterly      = Deno.env.get("STRIPE_PRICE_QUARTERLY");

  if (priceId === monthlyEarly || priceId === monthly)        return "monthly";
  if (priceId === quarterlyEarly || priceId === quarterly)    return "quarterly";
  return null;
}

/* ── Create Checkout Session ── */

export interface CreateCheckoutParams {
  userId: string;
  userEmail?: string;
  tier: SubscriptionTier;
  successUrl: string;
  cancelUrl: string;
}

export async function createStripeCheckout(params: CreateCheckoutParams) {
  const { userId, userEmail, tier, successUrl, cancelUrl } = params;
  const stripe = getStripe();

  const { priceId, isEarlyBird } = await getPriceIdForTier(tier);

  // Increment shared counter when using early bird pricing
  if (isEarlyBird) await incrementEarlyBirdCount();

  const slotsLeft = EARLY_BIRD_MAX - (await getEarlyBirdCount());
  console.log(`[Checkout] tier=${tier} earlyBird=${isEarlyBird} slotsLeft=${slotsLeft} price=${priceId}`);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId, tier },
    subscription_data: { metadata: { userId, tier } },
    customer_email: userEmail || undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    expires_at: Math.floor(Date.now() / 1000) + 1800,
  });

  return { checkoutUrl: session.url!, checkoutId: session.id };
}

/* ── Webhook Signature Verification ── */

export async function verifyStripeWebhook(rawBody: string, signature: string): Promise<Stripe.Event> {
  const stripe = getStripe();
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) throw new Error("[Stripe] STRIPE_WEBHOOK_SECRET not configured");
  return stripe.webhooks.constructEventAsync(rawBody, signature, secret);
}
