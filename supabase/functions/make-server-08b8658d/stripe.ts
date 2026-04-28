/**
 * ══════════════════════════════════════════════════════════════
 *  stripe.ts — Stripe SDK + helpers for MasteryTalk payments
 *
 *  Tiers:
 *  - early_bird  → $9.99/mo  (max 20 subscribers, lifetime price)
 *  - monthly     → $16.99/mo
 *  - quarterly   → $39.99 / 3 months
 *
 *  Environment variables:
 *  - STRIPE_SECRET_KEY
 *  - STRIPE_WEBHOOK_SECRET
 *  - STRIPE_PRICE_EARLY_BIRD
 *  - STRIPE_PRICE_MONTHLY
 *  - STRIPE_PRICE_QUARTERLY
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

export type SubscriptionTier = "early_bird" | "monthly" | "quarterly";

export const TIER_INFO: Record<SubscriptionTier, { label: string; price: number; maxSlots?: number }> = {
  early_bird: { label: "Early Bird",  price: 9.99,  maxSlots: 20 },
  monthly:    { label: "Monthly Pro", price: 16.99 },
  quarterly:  { label: "Quarterly Pro", price: 39.99 },
};

export const PRODUCT_INFO = {
  subscription: { label: "MasteryTalk PRO", price: 16.99 },
} as const;

export const UNLOCKED_PATHS = ["interview", "meeting", "presentation", "self-intro"];

/* ── Early Bird counter (global KV) ── */

const EARLY_BIRD_KEY = "global:early_bird_count";
const EARLY_BIRD_MAX = 20;

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

/* ── Price ID → Tier mapping ── */

export function getPriceId(tier: SubscriptionTier): string {
  const map: Record<SubscriptionTier, string> = {
    early_bird: Deno.env.get("STRIPE_PRICE_EARLY_BIRD") || "",
    monthly:    Deno.env.get("STRIPE_PRICE_MONTHLY")    || "",
    quarterly:  Deno.env.get("STRIPE_PRICE_QUARTERLY")  || "",
  };
  const id = map[tier];
  if (!id) throw new Error(`[Stripe] Price ID not configured for tier: ${tier}`);
  return id;
}

export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  if (priceId === Deno.env.get("STRIPE_PRICE_EARLY_BIRD")) return "early_bird";
  if (priceId === Deno.env.get("STRIPE_PRICE_MONTHLY"))    return "monthly";
  if (priceId === Deno.env.get("STRIPE_PRICE_QUARTERLY"))  return "quarterly";
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

  // Guard: Early Bird availability
  if (tier === "early_bird") {
    const available = await isEarlyBirdAvailable();
    if (!available) throw new Error("[Stripe] Early Bird slots are full (20/20)");
  }

  const priceId = getPriceId(tier);

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
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}
