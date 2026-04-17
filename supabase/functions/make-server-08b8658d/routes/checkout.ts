/**
 * ══════════════════════════════════════════════════════════════
 *  checkout.ts — Stripe Checkout session creation
 *
 *  POST /create-checkout
 *  - Requires auth
 *  - Creates a Stripe Checkout Session for Trial or Path
 *  - Returns { checkoutUrl, checkoutId }
 * ══════════════════════════════════════════════════════════════
 */
import { Hono } from "npm:hono";
import { getAuthUser } from "../_shared.ts";
import { createStripeCheckout } from "../stripe.ts";
import type { StripePurchaseType } from "../stripe.ts";

const app = new Hono();

app.post("/make-server-08b8658d/create-checkout", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required" }, 401);
    }

    const body = await c.req.json();
    const { purchaseType, scenarioType } = body;

    // Validate purchase type
    if (!purchaseType || !["first_path", "path"].includes(purchaseType)) {
      return c.json(
        { error: "Invalid purchaseType — must be 'first_path' or 'path'" },
        400,
      );
    }

    // Validate scenario type — only 3 active paths in beta
    const ACTIVE_SCENARIOS = ["interview", "meeting", "presentation"];
    if (!scenarioType || !ACTIVE_SCENARIOS.includes(scenarioType)) {
      return c.json({ error: `Invalid scenarioType — must be one of: ${ACTIVE_SCENARIOS.join(", ")}` }, 400);
    }

    console.log(
      `[Checkout] Creating ${purchaseType} checkout for user ${user.id} | scenario=${scenarioType}`,
    );

    // Build success/cancel URLs from the Origin header or fallback
    const origin =
      c.req.header("Origin") ||
      c.req.header("Referer")?.replace(/\/[^/]*$/, "") ||
      "https://masterytalk.pro";

    const successUrl = `${origin}/#/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&type=${purchaseType}&scenario=${scenarioType}`;
    const cancelUrl = `${origin}/#/dashboard?payment=cancelled`;

    const result = await createStripeCheckout({
      userId: user.id,
      userEmail: user.email || undefined,
      purchaseType: purchaseType as StripePurchaseType,
      scenarioType,
      successUrl,
      cancelUrl,
    });

    console.log(
      `[Checkout] ✅ Session created: ${result.checkoutId} → ${result.checkoutUrl.slice(0, 60)}...`,
    );

    return c.json(result);
  } catch (err) {
    console.error("[Checkout] Error:", err);

    const message = err instanceof Error ? err.message : String(err);

    // Surface Stripe config errors clearly
    if (message.includes("not configured")) {
      return c.json(
        { error: `Stripe configuration error: ${message}` },
        500,
      );
    }

    return c.json({ error: "Failed to create checkout session" }, 500);
  }
});

export default app;
