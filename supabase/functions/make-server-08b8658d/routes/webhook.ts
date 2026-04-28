/**
 * ══════════════════════════════════════════════════════════════
 *  webhook.ts — Stripe subscription webhook handler
 *
 *  Handles:
 *  • checkout.session.completed      → log only (subscription.created fires next)
 *  • customer.subscription.created   → activate tier, unlock paths, Early Bird counter
 *  • customer.subscription.updated   → update tier/status, handle past_due
 *  • customer.subscription.deleted   → revoke access (respect grace period)
 *  • invoice.payment_succeeded       → renew access, clear grace period
 *  • invoice.payment_failed          → set 2-day grace period
 *
 *  ⚠️ This endpoint MUST NOT require auth — Stripe calls it directly.
 * ══════════════════════════════════════════════════════════════
 */
import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import {
  verifyStripeWebhook,
  TIER_INFO,
  UNLOCKED_PATHS,
  getTierFromPriceId,
  incrementEarlyBirdCount,
  decrementEarlyBirdCount,
} from "../stripe.ts";
import { sendEmail } from "../email.ts";
import { subscriptionConfirmationEmailHtml } from "../email-templates.ts";
import { getAdminClient } from "../_shared.ts";

const app = new Hono();

const GRACE_PERIOD_DAYS = 2;

/* ── Profile helpers ── */

async function getProfile(userId: string): Promise<Record<string, unknown>> {
  const raw = await kv.get(`profile:${userId}`);
  return (raw as Record<string, unknown>) || {
    id: userId,
    plan: "free",
    plan_status: "active",
    tier: null,
    free_sessions_used: [],
    paths_purchased: [],
    monthly_sessions_used: 0,
    stats: {},
    created_at: new Date().toISOString(),
  };
}

async function saveProfile(userId: string, profile: Record<string, unknown>) {
  await kv.set(`profile:${userId}`, profile);
  // Sync key fields to Supabase profiles table (non-blocking)
  try {
    const supabase = getAdminClient();
    await supabase.from("profiles").update({
      subscription_active: profile.subscription_active ?? false,
    }).eq("id", userId);
  } catch (e) {
    console.warn("[Webhook] DB sync failed (non-blocking):", e);
  }
}

/* ── Main handler ── */

app.post("/make-server-08b8658d/webhook/stripe", async (c) => {
  try {
    const rawBody = await c.req.text();
    const signature = c.req.header("stripe-signature") || c.req.header("Stripe-Signature") || "";

    if (!signature) {
      console.warn("[Stripe Webhook] Missing stripe-signature header");
      return c.json({ error: "Missing stripe-signature header" }, 400);
    }

    let event;
    try {
      event = await verifyStripeWebhook(rawBody, signature);
    } catch (err) {
      console.warn("[Stripe Webhook] Signature verification failed:", err);
      return c.json({ error: "Invalid signature" }, 401);
    }

    console.log(`[Stripe Webhook] ${event.type} (${event.id})`);

    switch (event.type) {

      /* ─────────────────────────────────────────────
         SUBSCRIPTION CREATED — activate access
      ───────────────────────────────────────────── */
      case "customer.subscription.created": {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;
        const tier = sub.metadata?.tier ||
          getTierFromPriceId(sub.items?.data?.[0]?.price?.id) ||
          "monthly";

        if (!userId) {
          console.warn("[Webhook] subscription.created — no userId in metadata");
          return c.json({ status: "ok", warning: "no userId" }, 200);
        }

        const isActive = sub.status === "active" || sub.status === "trialing";
        const profile = await getProfile(userId);

        profile.tier = tier;
        profile.plan = "path";
        profile.plan_status = isActive ? "active" : sub.status;
        profile.subscription_active = isActive;
        profile.stripe_subscription_id = sub.id;
        profile.stripe_customer_id = sub.customer;
        profile.paths_purchased = isActive ? UNLOCKED_PATHS : [];
        profile.subscription_start_date = new Date(sub.start_date * 1000).toISOString();
        profile.next_billing_date = new Date(sub.current_period_end * 1000).toISOString();
        profile.grace_period_until = null;
        profile._last_period_start = sub.current_period_start;

        await saveProfile(userId, profile);

        // Increment Early Bird counter
        if (tier === "early_bird" && isActive) {
          const count = await incrementEarlyBirdCount();
          console.log(`[Webhook] Early Bird slots used: ${count}/20`);
        }

        console.log(`[Webhook] ✅ subscription.created: user=${userId} tier=${tier} status=${sub.status}`);

        // Welcome email
        if (isActive) {
          const email = sub.customer_email || sub.customer_details?.email;
          const tierInfo = TIER_INFO[tier as keyof typeof TIER_INFO];
          if (email && tierInfo) {
            sendEmail({
              to: email,
              subject: `Welcome to MasteryTalk PRO — ${tierInfo.label}!`,
              html: subscriptionConfirmationEmailHtml({
                userName: email.split("@")[0],
                planName: `MasteryTalk PRO (${tierInfo.label})`,
                amountUsd: tierInfo.price,
                nextBillingDate: new Date(sub.current_period_end * 1000).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                }),
              }),
            }).catch(() => {});
          }
        }

        return c.json({ status: "processed", tier, plan: "path" }, 200);
      }

      /* ─────────────────────────────────────────────
         SUBSCRIPTION UPDATED — tier/status change
      ───────────────────────────────────────────── */
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;
        if (!userId) return c.json({ status: "ok", warning: "no userId" }, 200);

        const isActive = sub.status === "active" || sub.status === "trialing";
        const isPastDue = sub.status === "past_due";
        const tier = sub.metadata?.tier ||
          getTierFromPriceId(sub.items?.data?.[0]?.price?.id) ||
          "monthly";

        const profile = await getProfile(userId);

        // Reset monthly sessions on new billing cycle
        if (isActive && sub.current_period_start !== profile._last_period_start) {
          profile.monthly_sessions_used = 0;
          profile._last_period_start = sub.current_period_start;
        }

        profile.tier = tier;
        profile.plan = isActive ? "path" : isPastDue ? "path" : "free"; // keep access during past_due
        profile.plan_status = sub.status;
        profile.subscription_active = isActive;
        profile.paths_purchased = (isActive || isPastDue) ? UNLOCKED_PATHS : [];
        profile.next_billing_date = new Date(sub.current_period_end * 1000).toISOString();

        if (isActive) profile.grace_period_until = null;

        await saveProfile(userId, profile);
        console.log(`[Webhook] ✅ subscription.updated: user=${userId} status=${sub.status}`);
        return c.json({ status: "processed", tier, plan: profile.plan }, 200);
      }

      /* ─────────────────────────────────────────────
         SUBSCRIPTION DELETED — revoke access
      ───────────────────────────────────────────── */
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;
        if (!userId) return c.json({ status: "ok", warning: "no userId" }, 200);

        const tier = sub.metadata?.tier;
        const profile = await getProfile(userId);

        // Check if still within grace period
        const gracePeriodUntil = profile.grace_period_until
          ? new Date(profile.grace_period_until as string)
          : null;

        if (gracePeriodUntil && gracePeriodUntil > new Date()) {
          console.log(`[Webhook] subscription.deleted but in grace period until ${gracePeriodUntil.toISOString()}`);
          return c.json({ status: "ok", note: "in grace period" }, 200);
        }

        // Revoke access
        profile.plan = "free";
        profile.plan_status = "canceled";
        profile.subscription_active = false;
        profile.paths_purchased = [];
        profile.stripe_subscription_id = null;
        profile.grace_period_until = null;

        await saveProfile(userId, profile);

        // Decrement Early Bird counter
        if (tier === "early_bird") {
          const count = await decrementEarlyBirdCount();
          console.log(`[Webhook] Early Bird slot freed: ${count}/20`);
        }

        console.log(`[Webhook] ✅ subscription.deleted: user=${userId} downgraded to free`);
        return c.json({ status: "processed", plan: "free" }, 200);
      }

      /* ─────────────────────────────────────────────
         INVOICE PAID — renew access, clear grace period
      ───────────────────────────────────────────── */
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const userId = invoice.subscription_details?.metadata?.userId ||
                       invoice.metadata?.userId;
        if (!userId) return c.json({ status: "ok", warning: "no userId" }, 200);

        const profile = await getProfile(userId);
        profile.subscription_active = true;
        profile.plan = "path";
        profile.plan_status = "active";
        profile.paths_purchased = UNLOCKED_PATHS;
        profile.grace_period_until = null;

        if (invoice.period_end) {
          profile.next_billing_date = new Date(invoice.period_end * 1000).toISOString();
        }

        await saveProfile(userId, profile);
        console.log(`[Webhook] ✅ invoice.payment_succeeded: user=${userId} access renewed`);
        return c.json({ status: "processed" }, 200);
      }

      /* ─────────────────────────────────────────────
         INVOICE FAILED — set 2-day grace period
      ───────────────────────────────────────────── */
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const userId = invoice.subscription_details?.metadata?.userId ||
                       invoice.metadata?.userId;
        if (!userId) return c.json({ status: "ok", warning: "no userId" }, 200);

        const gracePeriodUntil = new Date();
        gracePeriodUntil.setDate(gracePeriodUntil.getDate() + GRACE_PERIOD_DAYS);

        const profile = await getProfile(userId);
        profile.plan_status = "past_due";
        profile.grace_period_until = gracePeriodUntil.toISOString();
        // Keep access during grace period — paths_purchased unchanged

        await saveProfile(userId, profile);
        console.log(`[Webhook] ⚠️ invoice.payment_failed: user=${userId} grace until ${gracePeriodUntil.toISOString()}`);
        return c.json({ status: "processed", gracePeriodUntil: gracePeriodUntil.toISOString() }, 200);
      }

      /* ─────────────────────────────────────────────
         CHECKOUT COMPLETED — log only
      ───────────────────────────────────────────── */
      case "checkout.session.completed": {
        const session = event.data.object as any;
        console.log(`[Webhook] checkout.session.completed: ${session.id} — subscription lifecycle handled separately`);
        return c.json({ status: "received" }, 200);
      }

      default:
        console.log(`[Webhook] Unhandled event: ${event.type}`);
        return c.json({ status: "received" }, 200);
    }
  } catch (err) {
    console.error("[Stripe Webhook] Error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
