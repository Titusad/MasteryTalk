/**
 * ══════════════════════════════════════════════════════════════
 *  stripe.ts — Stripe SDK + helpers for MasteryTalk payments
 *
 *  Tiers (user-selectable):
 *  - monthly   → $49/mo (Monthly access — no commitment)
 *  - quarterly → $49/3mo Founding Member (auto, 25 slots) → $129/3mo Program
 *
 *  Founding Member: first 25 quarterly subscriptions get $49/3mo locked
 *  forever. When slots exhausted, quarterly auto-switches to $129/3mo.
 *  No user action required — backend picks price based on slot count.
 *
 *  Backward compat: "early_bird" tier kept for existing subscribers.
 *
 *  Environment variables:
 *  - STRIPE_SECRET_KEY
 *  - STRIPE_WEBHOOK_SECRET
 *  - STRIPE_PRICE_MONTHLY          ($49/mo)
 *  - STRIPE_PRICE_FOUNDING_MEMBER  ($49/3mo — Founding Member)
 *  - STRIPE_PRICE_PROGRAM          ($129/3mo — regular Program)
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

export const TIER_INFO: Record<SubscriptionTier, { label: string; regularPrice: number; foundingPrice?: number; maxSlots?: number }> = {
  early_bird: { label: "Early Bird",        regularPrice: 9.99 },              // legacy — existing subscribers only
  monthly:    { label: "Monthly access",    regularPrice: 49.00 },
  quarterly:  { label: "Program",           regularPrice: 129.00, foundingPrice: 49.00, maxSlots: 25 },
};

export const PRODUCT_INFO = {
  subscription: { label: "MasteryTalk PRO", price: 49.00 },
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
export async function getPriceIdForTier(tier: SubscriptionTier): Promise<{ priceId: string; isFoundingMember: boolean }> {
  if (tier === "monthly") {
    const priceId = Deno.env.get("STRIPE_PRICE_MONTHLY") || "";
    if (!priceId) throw new Error("[Stripe] STRIPE_PRICE_MONTHLY not configured");
    return { priceId, isFoundingMember: false };
  }

  if (tier === "quarterly") {
    const foundingId = Deno.env.get("STRIPE_PRICE_FOUNDING_MEMBER") || "";
    const programId  = Deno.env.get("STRIPE_PRICE_PROGRAM") || "";
    if (!programId) throw new Error("[Stripe] STRIPE_PRICE_PROGRAM not configured");
    const useFoundingMember = (await isEarlyBirdAvailable()) && !!foundingId;
    return { priceId: useFoundingMember ? foundingId : programId, isFoundingMember: useFoundingMember };
  }

  // Legacy early_bird tier — existing subscribers only
  const legacyId = Deno.env.get("STRIPE_PRICE_MONTHLY") || "";
  if (!legacyId) throw new Error("[Stripe] No price configured for legacy early_bird tier");
  return { priceId: legacyId, isFoundingMember: false };
}

/** Maps any Stripe price ID back to a canonical tier (for webhook processing) */
export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  const monthly        = Deno.env.get("STRIPE_PRICE_MONTHLY");
  const foundingMember = Deno.env.get("STRIPE_PRICE_FOUNDING_MEMBER");
  const program        = Deno.env.get("STRIPE_PRICE_PROGRAM");

  if (priceId === monthly)                              return "monthly";
  if (priceId === foundingMember || priceId === program) return "quarterly";
  return null;
}

/* ── Create Checkout Session ── */

export interface CreateCheckoutParams {
  userId: string;
  userEmail?: string;
  tier: SubscriptionTier;
  primaryPath?: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createStripeCheckout(params: CreateCheckoutParams) {
  const { userId, userEmail, tier, primaryPath, successUrl, cancelUrl } = params;
  const stripe = getStripe();

  const { priceId, isFoundingMember } = await getPriceIdForTier(tier);

  // Increment FM slot counter when Founding Member price is used
  if (isFoundingMember) await incrementEarlyBirdCount();

  const slotsLeft = EARLY_BIRD_MAX - (await getEarlyBirdCount());
  console.log(`[Checkout] tier=${tier} foundingMember=${isFoundingMember} slotsLeft=${slotsLeft} price=${priceId}`);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId, tier, ...(primaryPath ? { primary_path: primaryPath } : {}) },
    subscription_data: { metadata: { userId, tier, ...(primaryPath ? { primary_path: primaryPath } : {}) } },
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
