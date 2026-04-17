/**
 * ══════════════════════════════════════════════════════════════
 *  webhook.ts — Stripe payment webhook handler
 *
 *  POST /webhook/stripe
 *  - Validates Stripe signature (HMAC)
 *  - Handles checkout.session.completed events
 *  - Updates user profile: paths_purchased, plan, trial_expires_at
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
      case "checkout.session.completed": {
        const session = event.data.object;
        const metadata = session.metadata || {};
        const userId = metadata.userId;
        const purchaseType = metadata.purchaseType as "first_path" | "path";
        const scenarioType = metadata.scenarioType;

        if (!userId || !purchaseType || !scenarioType) {
          console.warn(
            "[Stripe Webhook] Missing metadata in checkout session:",
            metadata,
          );
          return c.json({ status: "received", warning: "incomplete metadata" }, 200);
        }

        console.log(
          `[Stripe Webhook] Payment completed: user=${userId} type=${purchaseType} scenario=${scenarioType} amount=${session.amount_total}`,
        );

        // 4. Update user profile
        const profileKey = `profile:${userId}`;
        const raw = await kv.get(profileKey);
        const profile: Record<string, unknown> = (raw as Record<string, unknown>) || {
          id: userId,
          plan: "free",
          plan_status: "active",
          free_sessions_used: [],
          paths_purchased: [],
          stats: {},
          achievements: [],
          created_at: new Date().toISOString(),
        };

        // Add scenarioType to paths_purchased (if not already there)
        const pathsPurchased: string[] = (profile.paths_purchased as string[]) || [];
        if (!pathsPurchased.includes(scenarioType)) {
          pathsPurchased.push(scenarioType);
        }
        profile.paths_purchased = pathsPurchased;
        profile.plan = "path";
        profile.plan_status = "active";

        // 5. Record purchase
        const purchaseRecord = {
          id: session.id,
          userId,
          purchaseType,
          scenarioType,
          amountCents: session.amount_total,
          currency: session.currency,
          stripeSessionId: session.id,
          stripePaymentIntent: session.payment_intent,
          customerEmail: session.customer_email || session.customer_details?.email,
          createdAt: new Date().toISOString(),
        };

        await kv.set(profileKey, profile);
        await kv.set(`purchase:${session.id}`, purchaseRecord);

        // Also update Supabase profiles table if available
        try {
          const supabase = getAdminClient();
          await supabase
            .from("profiles")
            .update({
              plan: "path",
              plan_status: "active",
              paths_purchased: pathsPurchased,
            })
            .eq("id", userId);
        } catch (dbErr) {
          console.warn("[Stripe Webhook] DB update failed (non-blocking):", dbErr);
        }

        console.log(
          `[Stripe Webhook] ✅ Profile updated: ${userId} → paths=[${pathsPurchased.join(",")}]`,
        );

        // 6. Send confirmation email (fire-and-forget)
        const customerEmail =
          session.customer_email ||
          session.customer_details?.email;
        if (customerEmail) {
          const productLabel =
            PRODUCT_INFO[purchaseType]?.label || purchaseType;
          const amount = (session.amount_total || 0) / 100;

          sendEmail({
            to: customerEmail,
            subject: `Your MasteryTalk ${productLabel} is active! 🚀`,
            html: subscriptionConfirmationEmailHtml({
              userName: customerEmail.split("@")[0],
              planName: `${productLabel} — ${scenarioType}`,
              amountUsd: amount,
              nextBillingDate: "Permanent access — no recurring charges",
            }),
          }).catch(() => {});
        }

        return c.json({ status: "processed", purchaseType, scenarioType }, 200);
      }

      case "checkout.session.expired": {
        console.log(
          `[Stripe Webhook] Checkout expired: ${event.data.object.id}`,
        );
        return c.json({ status: "received" }, 200);
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
