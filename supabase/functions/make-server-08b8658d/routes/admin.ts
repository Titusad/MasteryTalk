import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import { getAuthUser, getAdminClient } from "../_shared.ts";

const app = new Hono();

app.get("/make-server-08b8658d/admin/users", async (c: any) => {
  try {
    const adminSupabase = createClient(
      (globalThis as any).Deno.env.get("SUPABASE_URL"),
      (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );

    const { data: profileRows, error } = await adminSupabase
      .from("kv_store_4e8a5b39")
      .select("key, value")
      .like("key", "profile:%");
    if (error) throw error;

    // Build a map of KV profiles keyed by userId
    const profileMap = new Map();
    for (const row of profileRows || []) {
      const userId = row.key.replace("profile:", "");
      const profile = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
      profileMap.set(userId, profile);
    }

    // Iterate over ALL Auth users (the complete set)
    const { data: { users: authUsers } } = await adminSupabase.auth.admin.listUsers();

    const users = (authUsers || []).map((u: any) => {
      const profile = profileMap.get(u.id) || {};
      const stats = profile.stats || {};
      return {
        id: u.id,
        email: u.email || "",
        displayName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "",
        createdAt: u.created_at || "",
        lastSignIn: u.last_sign_in_at || "",
        sessionsCount: stats.sessions_count || 0,
        pillarScores: stats.pillarScores || null,
        professionalProficiency: stats.professionalProficiency || null,
        completedLessons: (stats.completedLessons || []).length,
        cvSummary: profile.cvSummary ? profile.cvSummary.slice(0, 200) + "..." : null,
        cvFileName: profile.cvFileName || null,
        cvConsentGiven: profile.cvConsentGiven || false,
        lastFeedbackAt: stats.lastFeedbackAt || null,
      };
    });

    users.sort((a: any, b: any) => b.sessionsCount - a.sessionsCount);
    return c.json({ users, total: users.length });
  } catch (err: any) {
    console.log("[Admin /users error]", err);
    return c.json({ error: `Failed to list users: ${err}` }, 500);
  }
});

/** GET /admin/users/:id — Full user detail with sessions & SR cards */
app.get("/make-server-08b8658d/admin/users/:id", async (c: any) => {
  try {
    const userId = c.req.param("id");
    const profileRaw = await kv.get(`profile:${userId}`);
    const profile = profileRaw
      ? (typeof profileRaw === "string" ? JSON.parse(profileRaw) : profileRaw)
      : null;
    if (!profile) return c.json({ error: "User not found" }, 404);

    const sessions = await kv.getByPrefix(`session:${userId}:`);
    const parsedSessions = sessions.map((s: any) =>
      typeof s === "string" ? JSON.parse(s) : s
    );

    const srCards = await kv.getByPrefix(`sr:${userId}:`);
    const parsedCards = srCards.map((card: any) =>
      typeof card === "string" ? JSON.parse(card) : card
    );

    const adminSupabase = createClient(
      (globalThis as any).Deno.env.get("SUPABASE_URL"),
      (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );
    let authInfo: any = null;
    try {
      const { data: { user } } = await adminSupabase.auth.admin.getUserById(userId);
      authInfo = {
        email: user?.email || "",
        displayName: user?.user_metadata?.full_name || user?.user_metadata?.name || "",
        photoURL: user?.user_metadata?.avatar_url || "",
        createdAt: user?.created_at || "",
        lastSignIn: user?.last_sign_in_at || "",
      };
    } catch { /* user may not exist in auth */ }

    return c.json({
      user: {
        id: userId,
        ...authInfo,
        stats: profile.stats || {},
        cvSummary: profile.cvSummary || null,
        cvFileName: profile.cvFileName || null,
        cvConsentGiven: profile.cvConsentGiven || false,
        plan: profile.plan || "free",
      },
      sessions: parsedSessions.sort((a: any, b: any) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      ),
      srCards: parsedCards,
    });
  } catch (err: any) {
    console.log("[Admin /users/:id error]", err);
    return c.json({ error: `Failed to get user: ${err}` }, 500);
  }
});

/** GET /admin/kpis — Platform-wide aggregated metrics */
app.get("/make-server-08b8658d/admin/kpis", async (c: any) => {
  try {
    const adminSupabase = createClient(
      (globalThis as any).Deno.env.get("SUPABASE_URL"),
      (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );

    const { data: profileRows } = await adminSupabase
      .from("kv_store_4e8a5b39")
      .select("key, value")
      .like("key", "profile:%");

    const { data: sessionRows } = await adminSupabase
      .from("kv_store_4e8a5b39")
      .select("key, value")
      .like("key", "session:%");

    const { data: { users: authUsers } } = await adminSupabase.auth.admin.listUsers();

    const profiles = (profileRows || []).map((r: any) =>
      typeof r.value === "string" ? JSON.parse(r.value) : r.value
    );
    const sessions = (sessionRows || []).map((r: any) => {
      const val = typeof r.value === "string" ? JSON.parse(r.value) : r.value;
      return { ...val, _key: r.key };
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalUsers = (authUsers || []).length;
    const totalSessions = sessions.length;

    const recentSessions = sessions.filter((s: any) =>
      s.created_at && new Date(s.created_at) > sevenDaysAgo
    );
    const activeUserIds = new Set(
      recentSessions.map((s: any) => s._key?.split(":")[1] || "").filter(Boolean)
    );

    const proficiencies = profiles
      .map((p: any) => p.stats?.professionalProficiency)
      .filter((p: any) => typeof p === "number");
    const avgProficiency = proficiencies.length
      ? Math.round(proficiencies.reduce((a: number, b: number) => a + b, 0) / proficiencies.length)
      : 0;

    const cvUploads = profiles.filter((p: any) => p.cvSummary).length;
    const cvConsented = profiles.filter((p: any) => p.cvConsentGiven).length;

    // Sessions per day (last 14 days)
    const dailySessions: Record<string, number> = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dailySessions[d.toISOString().slice(0, 10)] = 0;
    }
    for (const s of sessions) {
      if (s.created_at) {
        const day = new Date(s.created_at).toISOString().slice(0, 10);
        if (dailySessions[day] !== undefined) dailySessions[day]++;
      }
    }

    // Avg pillar scores
    const pillarAgg: Record<string, { sum: number; count: number }> = {};
    for (const p of profiles) {
      const scores = p.stats?.pillarScores;
      if (scores) {
        for (const [pillar, score] of Object.entries(scores)) {
          if (!pillarAgg[pillar]) pillarAgg[pillar] = { sum: 0, count: 0 };
          pillarAgg[pillar].sum += score as number;
          pillarAgg[pillar].count++;
        }
      }
    }
    const avgPillarScores: Record<string, number> = {};
    for (const [pillar, agg] of Object.entries(pillarAgg)) {
      avgPillarScores[pillar] = Math.round(agg.sum / agg.count);
    }

    return c.json({
      totalUsers,
      totalSessions,
      activeUsers7d: activeUserIds.size,
      avgProficiency,
      cvUploads,
      cvConsented,
      avgPillarScores,
      sessionsPerDay: Object.entries(dailySessions)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
    });
  } catch (err: any) {
    console.log("[Admin /kpis error]", err);
    return c.json({ error: `Failed to compute KPIs: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /admin/api-usage — API cost tracking (30d)
// ═══════════════════════════════════════════════════════════════
app.get("/make-server-08b8658d/admin/api-usage", async (c: any) => {
  try {
    const adminSupabase = createClient(
      (globalThis as any).Deno.env.get("SUPABASE_URL"),
      (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );

    // Fetch last 30 days of usage logs from KV
    const { data: rows, error } = await adminSupabase
      .from("kv_store_4e8a5b39")
      .select("key, value")
      .like("key", "api_usage:%")
      .order("key", { ascending: false })
      .limit(30);

    if (error) throw error;

    const days = (rows || []).map((r: any) => typeof r.value === "string" ? JSON.parse(r.value) : r.value);

    // Aggregate totals
    let totalCost = 0, totalCalls = 0, totalTokens = 0;
    const byService: Record<string, { calls: number; tokens: number; cost: number; chars: number }> = {};
    const byUser: Record<string, { calls: number; tokens: number; cost: number }> = {};

    for (const day of days) {
      // Service totals
      for (const [svc, data] of Object.entries(day.totals || {}) as any[]) {
        if (!byService[svc]) byService[svc] = { calls: 0, tokens: 0, cost: 0, chars: 0 };
        byService[svc].calls += data.calls || 0;
        byService[svc].tokens += data.tokens || 0;
        byService[svc].cost += data.cost || 0;
        byService[svc].chars += data.chars || 0;
        totalCost += data.cost || 0;
        totalCalls += data.calls || 0;
        totalTokens += data.tokens || 0;
      }
      // Per-user totals
      for (const [uid, data] of Object.entries(day.byUser || {}) as any[]) {
        if (!byUser[uid]) byUser[uid] = { calls: 0, tokens: 0, cost: 0 };
        byUser[uid].calls += data.calls || 0;
        byUser[uid].tokens += data.tokens || 0;
        byUser[uid].cost += data.cost || 0;
      }
    }

    // Resolve user emails for byUser
    const userIds = Object.keys(byUser).filter(id => id !== "anonymous");
    let userEmails: Record<string, string> = {};
    if (userIds.length > 0) {
      try {
        const profileRows = await adminSupabase
          .from("kv_store_4e8a5b39")
          .select("key, value")
          .in("key", userIds.map(id => `profile:${id}`));
        for (const row of profileRows.data || []) {
          const uid = row.key.replace("profile:", "");
          const profile = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
          userEmails[uid] = profile.email || uid.slice(0, 8);
        }
      } catch { /* skip email resolution on error */ }
    }

    // Daily costs for chart
    const dailyCosts = days.map((d: any) => {
      const dayCost = Object.values(d.totals || {}).reduce((s: number, v: any) => s + (v.cost || 0), 0);
      const dayCalls = Object.values(d.totals || {}).reduce((s: number, v: any) => s + (v.calls || 0), 0);
      return { date: d.date, cost: +dayCost.toFixed(4), calls: dayCalls };
    }).reverse();

    // Budget alert: check if today's cost exceeds $5
    const DAILY_BUDGET = 5.0;
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayData = days.find((d: any) => d.date === todayStr);
    const todayCost = todayData
      ? Object.values(todayData.totals || {}).reduce((s: number, v: any) => s + (v.cost || 0), 0)
      : 0;

    return c.json({
      totalCost: +totalCost.toFixed(4),
      totalCalls,
      totalTokens,
      byService,
      byUser: Object.entries(byUser).map(([uid, data]) => ({
        userId: uid,
        email: userEmails[uid] || uid.slice(0, 8),
        ...data,
        cost: +data.cost.toFixed(4),
      })).sort((a: any, b: any) => b.cost - a.cost),
      dailyCosts,
      budgetAlert: todayCost > DAILY_BUDGET ? {
        message: `⚠️ Today's cost ($${(todayCost as number).toFixed(2)}) exceeds the $${DAILY_BUDGET} daily budget!`,
        todayCost: +(todayCost as number).toFixed(4),
        budget: DAILY_BUDGET,
      } : null,
    });
  } catch (err: any) {
    console.log("[Admin /api-usage error]", err);
    return c.json({ error: `Failed to load API usage: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// Progression Tree — GET /progression
// Fetch user's progression state from KV
// ═══════════════════════════════════════════════════════════════

export default app;
