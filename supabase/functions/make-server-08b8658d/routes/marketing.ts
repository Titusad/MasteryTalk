/**
 * ══════════════════════════════════════════════════════════════
 *  marketing.ts — Loops.so marketing automation proxy
 *
 *  POST /marketing/track          — Fire a business event to Loops
 *  POST /marketing/contact/update — Enrich contact properties in Loops
 *
 *  All calls are fire-and-forget. If LOOPS_API_KEY is not set,
 *  calls are silently skipped — safe to deploy before Loops setup.
 * ══════════════════════════════════════════════════════════════
 */
import { Hono } from "npm:hono";
import { getAuthUser } from "../_shared.ts";

const app = new Hono();
const LOOPS_BASE = "https://app.loops.so/api/v1";

/** Loops upserts contacts with PUT; every other endpoint used here is POST. */
function loopsMethod(path: string): "PUT" | "POST" {
  return path === "/contacts/update" ? "PUT" : "POST";
}

async function loopsFetch(path: string, body: unknown): Promise<void> {
  const key = Deno.env.get("LOOPS_API_KEY");
  if (!key) {
    console.warn("[Loops] LOOPS_API_KEY not set — skipping");
    return;
  }
  try {
    const res = await fetch(`${LOOPS_BASE}${path}`, {
      method: loopsMethod(path),
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn("[Loops]", path, res.status, await res.text());
    }
  } catch (err) {
    console.warn("[Loops] fetch failed (non-blocking):", err);
  }
}

/* ── Track business event ── */
app.post("/make-server-08b8658d/marketing/track", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { eventName, eventProperties } = await c.req.json();
    if (!eventName) return c.json({ error: "eventName required" }, 400);

    loopsFetch("/events/send", {
      email: user.email,
      userId: user.id,
      eventName,
      eventProperties: eventProperties ?? {},
    }).catch(() => {});

    return c.json({ status: "queued" });
  } catch (err) {
    console.error("[marketing/track]", err);
    return c.json({ error: "internal" }, 500);
  }
});

/* ── Update contact properties ── */
app.post("/make-server-08b8658d/marketing/contact/update", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json();

    // Identity and segmentation are server-owned (PRODUCT_SPEC §6.5.5): a client
    // must not retarget another contact or move itself out of `waitlist-es`.
    const PROTECTED_KEYS = new Set(["email", "userId", "userGroup", "source"]);
    const props: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body && typeof body === "object" ? body : {})) {
      if (!PROTECTED_KEYS.has(key)) props[key] = value;
    }

    loopsFetch("/contacts/update", {
      ...props,
      email: user.email,
      userId: user.id,
    }).catch((err: unknown) => console.error("[marketing/contact/update] Loops failed:", err));

    return c.json({ status: "queued" });
  } catch (err) {
    console.error("[marketing/contact/update]", err);
    return c.json({ error: "internal" }, 500);
  }
});

export { loopsFetch };
export default app;
