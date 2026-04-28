/**
 * webhook.ts — Stripe subscription webhook handler
 *
 * Event responsibilities:
 *  • checkout.session.completed  → PRIMARY activation for new subscriptions
 *                                  (guaranteed: payment_status=paid + full metadata)
 *  • invoice.payment_succeeded   → Renewal activation (recurring billing)
 *                                  userId resolved from subscription if not in invoice
 *  • customer.subscription.created  → Save stripe IDs + tier only (no activation,
 *                                     status may be "incomplete" before payment)
 *  • customer.subscription.updated  → Sync status changes (active/past_due/canceled)
 *  • customer.subscription.deleted  → Revoke access (respect grace period)
 *  • invoice.payment_failed         → Set 2-day grace period
 *
 * ⚠️ This endpoint MUST NOT require auth — Stripe calls it directly.
 */
import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import {
  verifyStripeWebhook,
  TIER_INFO,
  UNLOCKED_PATHS,
  getTierFromPriceId,
  getStripe,
  incrementEarlyBirdCount,
  decrementEarlyBirdCount,
} from "../stripe.ts";
import { sendEmail } from "../email.ts";
import { subscriptionConfirmationEmailHtml } from "../email-templates.ts";
import { getAdminClient } from "../_shared.ts";

const app = new Hono();

const GRACE_PERIOD_DAYS = 2;

/* ─────────────────────────────────────────────────────────
   Profile helpers
───────────────────────────────────────────────────────── */

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
  try {
    const supabase = getAdminClient();
    await supabase.from("profiles").update({
      subscription_active: profile.subscription_active ?? false,
    }).eq("id", userId);
  } catch (e) {
    console.warn("[Webhook] DB sync failed (non-blocking):", e);
  }
}

/**
 * Resolve userId from an invoice object.
 * Tries multiple paths before fetching the subscription from Stripe.
 * This is resilient to Stripe API version changes.
 */
async function resolveUserIdFromInvoice(invoice: any): Promise<string | null> {
  // 1. Direct metadata on the invoice
  const direct = invoice.subscription_details?.metadata?.userId
    || invoice.metadata?.userId
    || invoice.lines?.data?.[0]?.metadata?.userId;
  if (direct) return direct;

  // 2. Fetch the subscription from Stripe and read its metadata
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return null;

  try {
    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    return sub.metadata?.userId || null;
  } catch (err) {
    console.warn("[Webhook] Failed to retrieve subscription for userId:", err);
    return null;
  }
}

/* ─────────────────────────────────────────────────────────
   Main handler
───────────────────────────────────────────────────────── */

app.post("/make-server-08b8658d/webhook/stripe", async (c) => {
  try {
    const rawBody = await c.req.text();
    const signature = c.req.header("stripe-signature") || c.req.header("Stripe-Signature") || "";

    if (!signature) {
      console.warn("[Stripe Webhook] Missing stripe-signature header");
      return c.json({ error: "Missing stripe-signature header" }, 400);
    }

    let event: any;
    try {
      event = await verifyStripeWebhook(rawBody, signature);
    } catch (err) {
      console.warn("[Stripe Webhook] Signature verification failed:", err);
      return c.json({ error: "Invalid signature" }, 401);
    }

    console.log(`[Stripe Webhook] ${event.type} (${event.id})`);

    switch (event.type) {

      /* ─────────────────────────────────────────────
         CHECKOUT COMPLETED — primary activation
         This is the authoritative "new subscription paid" event.
         payment_status=paid guarantees money was collected.
      ───────────────────────────────────────────── */
      case "checkout.session.completed": {
        const session = event.data.object as any;

        // Only activate for paid subscription checkouts
        if (session.payment_status !== "paid" || session.mode !== "subscription") {
          console.log(`[Webhook] checkout.session.completed skipped — mode=${session.mode} payment_status=${session.payment_status}`);
          return c.json({ status: "received" }, 200);
        }

        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier || "monthly";

        if (!userId) {
          console.warn("[Webhook] checkout.session.completed — no userId in session metadata");
          return c.json({ status: "ok", warning: "no userId" }, 200);
        }

        const profile = await getProfile(userId);
        profile.tier = tier;
        profile.plan = "path";
        profile.plan_status = "active";
        profile.subscription_active = true;
        profile.paths_purchased = UNLOCKED_PATHS;
        profile.grace_period_until = null;
        profile.stripe_customer_id = session.customer;
        profile.stripe_subscription_id = session.subscription;
        profile.subscription_start_date = new Date().toISOString();

        await saveProfile(userId, profile);

        // Increment Early Bird counter
        if (tier === "early_bird") {
          const count = await incrementEarlyBirdCount();
          console.log(`[Webhook] Early Bird slots used: ${count}/20`);
        }

        // Welcome email
        const email = session.customer_details?.email || session.customer_email;
        const tierInfo = TIER_INFO[tier as keyof typeof TIER_INFO];
        if (email && tierInfo) {
          sendEmail({
            to: email,
            subject: `Welcome to MasteryTalk PRO — ${tierInfo.label}!`,
            html: subscriptionConfirmationEmailHtml({
              userName: (session.customer_details?.name || email).split(" ")[0],
              planName: `MasteryTalk PRO (${tierInfo.label})`,
              amountUsd: tierInfo.price,
              nextBillingDate: "—",
            }),
          }).catch(() => {});
        }

        console.log(`[Webhook] ✅ checkout.session.completed: user=${userId} tier=${tier} — subscription activated`);
        return c.json({ status: "processed", tier, activated: true }, 200);
      }

      /* ─────────────────────────────────────────────
         SUBSCRIPTION CREATED — save IDs only
         Status is often "incomplete" here (before payment).
         Do NOT activate — checkout.session.completed handles that.
      ───────────────────────────────────────────── */
      case "customer.subscription.created": {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;

        if (!userId) {
          console.warn("[Webhook] subscription.created — no userId in metadata");
          return c.json({ status: "ok", warning: "no userId" }, 200);
        }

        const tier = sub.metadata?.tier
          || getTierFromPriceId(sub.items?.data?.[0]?.price?.id)
          || "monthly";

        const profile = await getProfile(userId);
        // Only save IDs and tier — don't override activation done by checkout.session.completed
        profile.stripe_subscription_id = sub.id;
        profile.stripe_customer_id = sub.customer;
        if (!profile.tier) profile.tier = tier;

        await kv.set(`profile:${userId}`, profile);
        console.log(`[Webhook] subscription.created: user=${userId} tier=${tier} status=${sub.status} (activation via checkout.session.completed)`);
        return c.json({ status: "received" }, 200);
      }

      /* ─────────────────────────────────────────────
         SUBSCRIPTION UPDATED — sync status
      ───────────────────────────────────────────── */
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;
        if (!userId) return c.json({ status: "ok", warning: "no userId" }, 200);

        const isActive = sub.status === "active" || sub.status === "trialing";
        const isPastDue = sub.status === "past_due";
        const tier = sub.metadata?.tier
          || getTierFromPriceId(sub.items?.data?.[0]?.price?.id)
          || "monthly";

        const profile = await getProfile(userId);

        // Reset monthly sessions on new billing cycle
        if (isActive && sub.current_period_start !== profile._last_period_start) {
          profile.monthly_sessions_used = 0;
          profile._last_period_start = sub.current_period_start;
        }

        profile.tier = tier;
        profile.plan = (isActive || isPastDue) ? "path" : "free";
        profile.plan_status = sub.status;
        profile.subscription_active = isActive;
        profile.paths_purchased = (isActive || isPastDue) ? UNLOCKED_PATHS : [];
        profile.next_billing_date = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        if (isActive) profile.grace_period_until = null;

        await saveProfile(userId, profile);
        console.log(`[Webhook] ✅ subscription.updated: user=${userId} status=${sub.status}`);
        return c.json({ status: "processed" }, 200);
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

        const gracePeriodUntil = profile.grace_period_until
          ? new Date(profile.grace_period_until as string)
          : null;

        if (gracePeriodUntil && gracePeriodUntil > new Date()) {
          console.log(`[Webhook] subscription.deleted — in grace period until ${gracePeriodUntil.toISOString()}`);
          return c.json({ status: "ok", note: "in grace period" }, 200);
        }

        profile.plan = "free";
        profile.plan_status = "canceled";
        profile.subscription_active = false;
        profile.paths_purchased = [];
        profile.stripe_subscription_id = null;
        profile.grace_period_until = null;

        await saveProfile(userId, profile);

        if (tier === "early_bird") {
          const count = await decrementEarlyBirdCount();
          console.log(`[Webhook] Early Bird slot freed: ${count}/20`);
        }

        console.log(`[Webhook] ✅ subscription.deleted: user=${userId} downgraded to free`);
        return c.json({ status: "processed", plan: "free" }, 200);
      }

      /* ─────────────────────────────────────────────
         INVOICE PAID — renewal activation
         Handles recurring billing where no checkout session exists.
         Resolves userId from subscription metadata if not on invoice.
      ───────────────────────────────────────────── */
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;

        const userId = await resolveUserIdFromInvoice(invoice);
        if (!userId) {
          console.warn("[Webhook] invoice.payment_succeeded — could not resolve userId");
          return c.json({ status: "ok", warning: "no userId" }, 200);
        }

        const profile = await getProfile(userId);

        // Resolve tier from subscription if not already in profile
        let tier = profile.tier as string;
        if (!tier && invoice.subscription) {
          try {
            const stripe = getStripe();
            const sub = await stripe.subscriptions.retrieve(invoice.subscription);
            tier = sub.metadata?.tier
              || getTierFromPriceId(sub.items?.data?.[0]?.price?.id)
              || "monthly";
          } catch {}
        }

        profile.subscription_active = true;
        profile.plan = "path";
        profile.plan_status = "active";
        profile.paths_purchased = UNLOCKED_PATHS;
        profile.grace_period_until = null;
        if (tier) profile.tier = tier;
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

        const userId = await resolveUserIdFromInvoice(invoice);
        if (!userId) {
          console.warn("[Webhook] invoice.payment_failed — could not resolve userId");
          return c.json({ status: "ok", warning: "no userId" }, 200);
        }

        const gracePeriodUntil = new Date();
        gracePeriodUntil.setDate(gracePeriodUntil.getDate() + GRACE_PERIOD_DAYS);

        const profile = await getProfile(userId);
        profile.plan_status = "past_due";
        profile.grace_period_until = gracePeriodUntil.toISOString();

        await saveProfile(userId, profile);
        console.log(`[Webhook] ⚠️ invoice.payment_failed: user=${userId} grace until ${gracePeriodUntil.toISOString()}`);
        return c.json({ status: "processed", gracePeriodUntil: gracePeriodUntil.toISOString() }, 200);
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
