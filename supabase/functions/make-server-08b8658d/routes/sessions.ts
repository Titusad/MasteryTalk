import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import { getAuthUser } from "../_shared.ts";
import { loopsFetch } from "./marketing.ts";

const app = new Hono();

// POST /sessions — Save a practice session
app.post("/make-server-08b8658d/sessions", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;

    const sessionData = await c.req.json();
    const sessionId = sessionData.id || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      ...sessionData,
      id: sessionId,
      user_id: userId,
      created_at: sessionData.created_at || new Date().toISOString(),
    };

    await kv.set(`session:${userId}:${sessionId}`, record);

    const indexRaw = await kv.get(`session_index:${userId}`);
    const index: string[] = indexRaw ? indexRaw : [];
    if (!index.includes(sessionId)) {
      index.unshift(sessionId);
    }
    await kv.set(`session_index:${userId}`, index);

    const profileRaw = await kv.get(`profile:${userId}`);
    if (profileRaw) {
      const profile = profileRaw;
      const stats = profile.stats || {};
      stats.sessions_count = (stats.sessions_count || 0) + 1;
      profile.stats = stats;
      await kv.set(`profile:${userId}`, profile);
    }

    // Fire Loops events for session milestones (fire-and-forget)
    const sessionCount = index.length;
    const email = user.email;
    if (email) {
      if (sessionCount === 1) {
        loopsFetch("/events/send", { email, userId, eventName: "first_session_completed" }).catch(() => {});
      } else if (sessionCount === 3) {
        loopsFetch("/events/send", { email, userId, eventName: "session_milestone_3" }).catch(() => {});
      } else if (sessionCount === 10) {
        loopsFetch("/events/send", { email, userId, eventName: "session_milestone_10" }).catch(() => {});
      }
    }

    console.log(`[Sessions] Saved session ${sessionId} for user ${userId}`);
    return c.json({ status: "saved", sessionId });
  } catch (err) {
    console.log("[Save Session Error]", err);
    return c.json({ error: `Failed to save session: ${err}` }, 500);
  }
});

// GET /sessions — List user's practice sessions
app.get("/make-server-08b8658d/sessions", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;

    const indexRaw = await kv.get(`session_index:${userId}`);
    const index: string[] = indexRaw ? indexRaw : [];

    if (index.length === 0) {
      return c.json({ sessions: [] });
    }

    const keys = index.map((id) => `session:${userId}:${id}`);
    const rawSessions = await kv.mget(keys);
    const sessions = rawSessions
      .filter((s): s is string => s !== null && s !== undefined)
      .map((s) => s);

    return c.json({ sessions });
  } catch (err) {
    console.log("[List Sessions Error]", err);
    return c.json({ error: `Failed to list sessions: ${err}` }, 500);
  }
});

export default app;
