/**
 * ══════════════════════════════════════════════════════════════
 *  wa-practice.ts — WhatsApp practice activity endpoints
 *
 *  GET /wa/practice-dates — Unique dates of completed WA SR reviews
 *    Used by the dashboard streak card to count WA sessions as practice days.
 * ══════════════════════════════════════════════════════════════
 */
import { Hono } from "npm:hono";
import { getAuthUser, getAdminClient } from "../_shared.ts";

const app = new Hono();

app.get("/make-server-08b8658d/wa/practice-dates", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("wa_pending_reviews")
      .select("sent_at")
      .eq("user_id", user.id)
      .eq("status", "completed");

    if (error) throw error;

    const dates = [
      ...new Set(
        (data ?? []).map((r: { sent_at: string }) =>
          r.sent_at.slice(0, 10)
        )
      ),
    ];

    return c.json({ dates });
  } catch (err) {
    console.error("[WA Practice Dates] Error:", err);
    return c.json({ dates: [] });
  }
});

export default app;
