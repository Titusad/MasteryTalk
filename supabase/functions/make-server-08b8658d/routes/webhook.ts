/**
 * ══════════════════════════════════════════════════════════════
 *  webhook.ts — Stripe subscription webhook handler
 *
 *  POST /webhook/stripe
 *  - Validates Stripe signature (HMAC)
 *  - Handles subscription lifecycle events:
 *    • customer.subscription.created  → plan = "pro"
 *    • customer.subscription.updated  → handles past_due/active transitions
 *    • customer.subscription.deleted  → plan = "free"
 *  - Updates user profile in KV + Supabase
 *  - Sends confirmation email
 *
 *  ⚠️ This endpoint MUST NOT require auth — Stripe calls it directly.
 * ══════════════════════════════════════════════════════════════
 */
import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import { verifyStripeWebhook, PRODUCT_INFO } from "../stripe.ts";
import { sendEmail } from "../email.ts";
import { subscriptionConfirmationEmailHtml } from "../email-templates.ts";
import { getAdminClient } from "../_shared.ts";

const app = new Hono();

app.post("/make-server-08b8658d/webhook/stripe", async (c) => {
  try {
    // 1. Get raw body + signature for verification
    const rawBody = await c.req.text();
    const signature =
      c.req.header("stripe-signature") ||
      c.req.header("Stripe-Signature") ||
      "";

    if (!signature) {
      console.warn("[Stripe Webhook] Missing stripe-signature header");
      return c.json({ error: "Missing stripe-signature header" }, 400);
    }

    // 2. Verify webhook signature
    let event;
    try {
      event = await verifyStripeWebhook(rawBody, signature);
    } catch (err) {
      console.warn("[Stripe Webhook] Signature verification failed:", err);
      return c.json({ error: "Invalid signature" }, 401);
    }

    console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

    // 3. Handle events
    switch (event.type) {
      /* ── New subscription activated ── */
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;
        const status = subscription.status; // active, past_due, canceled, etc.

        if (!userId) {
          console.warn("[Stripe Webhook] Missing userId in subscription metadata:", subscription.id);
          return c.json({ status: "received", warning: "no userId in metadata" }, 200);
        }

        // Map Stripe status to our plan
        const isActive = status === "active" || status === "trialing";
        const plan = isActive ? "pro" : "free";
        const planStatus = status === "past_due" ? "past_due" : isActive ? "active" : "canceled";

        console.log(
          `[Stripe Webhook] Subscription ${event.type}: user=${userId} stripe_status=${status} → plan=${plan} plan_status=${planStatus}`,
        );

        // 4. Update KV profile
        const profileKey = `profile:${userId}`;
        const raw = await kv.get(profileKey);
        const profile: Record<string, unknown> = (raw as Record<string, unknown>) || {
          id: userId,
          plan: "free",
          plan_status: "active",
          free_sessions_used: [],
          monthly_sessions_used: 0,
          stats: {},
          achievements: [],
          created_at: new Date().toISOString(),
        };

        profile.plan = plan;
        profile.plan_status = planStatus;
        profile.stripe_subscription_id = subscription.id;
        profile.stripe_customer_id = subscription.customer;

        // Reset monthly sessions on new billing cycle
        if (event.type === "customer.subscription.updated" && isActive) {
          const currentPeriodStart = subscription.current_period_start;
          const prevPeriodStart = profile._last_period_start;
          if (currentPeriodStart && currentPeriodStart !== prevPeriodStart) {
            profile.monthly_sessions_used = 0;
            profile._last_period_start = currentPeriodStart;
            console.log(`[Stripe Webhook] Reset monthly_sessions_used for ${userId} (new billing cycle)`);
          }
        }

        await kv.set(profileKey, profile);

        // 5. Update Supabase profiles table (non-blocking)
        try {
          const supabase = getAdminClient();
          await supabase
            .from("profiles")
            .update({
              plan,
              plan_status: planStatus,
              monthly_sessions_used: isActive && event.type === "customer.subscription.updated"
                ? 0
                : undefined,
            })
            .eq("id", userId);
        } catch (dbErr) {
          console.warn("[Stripe Webhook] DB update failed (non-blocking):", dbErr);
        }

        console.log(`[Stripe Webhook] ✅ Profile updated: ${userId} → plan=${plan}`);

        // 6. Send confirmation email on new subscription (fire-and-forget)
        if (event.type === "customer.subscription.created" && isActive) {
          const customerEmail = subscription.customer_email || subscription.customer_details?.email;
          if (customerEmail) {
            sendEmail({
              to: customerEmail,
              subject: "Welcome to MasteryTalk PRO!",
              html: subscriptionConfirmationEmailHtml({
                userName: customerEmail.split("@")[0],
                planName: PRODUCT_INFO.subscription.label,
                amountUsd: PRODUCT_INFO.subscription.price,
                nextBillingDate: new Date(subscription.current_period_end * 1000).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                }),
              }),
            }).catch(() => {});
          }
        }

        return c.json({ status: "processed", plan, planStatus }, 200);
      }

      /* ── Subscription canceled ── */
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.warn("[Stripe Webhook] Missing userId on subscription.deleted");
          return c.json({ status: "received", warning: "no userId" }, 200);
        }

        console.log(`[Stripe Webhook] Subscription canceled: user=${userId}`);

        // Downgrade to free
        const profileKey = `profile:${userId}`;
        const raw = await kv.get(profileKey);
        const profile: Record<string, unknown> = (raw as Record<string, unknown>) || {};
        profile.plan = "free";
        profile.plan_status = "canceled";
        profile.stripe_subscription_id = null;
        await kv.set(profileKey, profile);

        try {
          const supabase = getAdminClient();
          await supabase
            .from("profiles")
            .update({ plan: "free", plan_status: "canceled" })
            .eq("id", userId);
        } catch (dbErr) {
          console.warn("[Stripe Webhook] DB update on cancel failed:", dbErr);
        }

        console.log(`[Stripe Webhook] ✅ User ${userId} downgraded to free`);
        return c.json({ status: "processed", plan: "free" }, 200);
      }

      /* ── Checkout completed (initial subscription purchase) ── */
      case "checkout.session.completed": {
        const session = event.data.object as any;
        console.log(`[Stripe Webhook] Checkout completed: ${session.id} (subscription handled by subscription.created)`);
        return c.json({ status: "received", note: "subscription lifecycle handled separately" }, 200);
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        return c.json({ status: "received", note: "event type not handled" }, 200);
    }
  } catch (err) {
    console.error("[Stripe Webhook] Error:", err);
    return c.json({ error: "Internal server error processing webhook" }, 500);
  }
});

export default app;
