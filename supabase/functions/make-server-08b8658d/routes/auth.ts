import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import { getAdminClient, getAuthUser } from "../_shared.ts";
import { sendEmail } from "../email.ts";
import { welcomeEmailHtml } from "../email-templates.ts";

const app = new Hono();

// Health check
app.get("/make-server-08b8658d/health", (c: any) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth status
app.get("/make-server-08b8658d/auth/status", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ authenticated: false, message: "No valid session" }, 200);
    }
    return c.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split("@")[0],
        provider: user.app_metadata?.provider,
      },
    });
  } catch (err) {
    console.log("[Auth Status Error]", err);
    return c.json({ authenticated: false, error: String(err) }, 500);
  }
});

// Ensure profile
app.post("/make-server-08b8658d/auth/ensure-profile", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — no valid session" }, 401);
    }

    const supabase = getAdminClient();

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existing) {
      return c.json({ status: "exists", userId: user.id, termsAcceptedAt: existing.terms_accepted_at || null });
    }

    const now = new Date().toISOString();
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      plan: "free",
      plan_status: "active",
      free_sessions_used: [],
      paths_purchased: [],
      stats: {},
      achievements: [],
      terms_accepted_at: now,
    });

    if (insertError) {
      console.log("[Ensure Profile] Insert error:", insertError);
      await kv.set(`profile:${user.id}`, {
        id: user.id,
        plan: "free",
        plan_status: "active",
        free_sessions_used: [],
        paths_purchased: [],
        stats: {},
        achievements: [],
        terms_accepted_at: now,
        created_at: now,
      });

      // Welcome email (fire-and-forget) — even if DB insert failed, user was created
      const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
      sendEmail({
        to: user.email!,
        subject: "Welcome to MasteryTalk! 🎯",
        html: welcomeEmailHtml(userName),
      }).catch(() => {});

      return c.json({ status: "created_kv", userId: user.id, note: "Stored in KV (profiles table not available)" });
    }

    // Welcome email (fire-and-forget) — new user profile created successfully
    const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
    sendEmail({
      to: user.email!,
      subject: "Welcome to MasteryTalk! 🎯",
      html: welcomeEmailHtml(userName),
    }).catch(() => {});

    return c.json({ status: "created", userId: user.id });
  } catch (err) {
    console.log("[Ensure Profile Error]", err);
    return c.json({ error: `Failed to ensure profile: ${err}` }, 500);
  }
});

// Email Signup
app.post("/make-server-08b8658d/auth/signup", async (c: any) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: name || email.split("@")[0] },
      email_confirm: true,
    });

    if (error) {
      console.log("[Signup Error]", error.message);
      if (error.message.includes("already") || error.message.includes("exists")) {
        return c.json({
          error: "Este email ya está registrado. Usa 'Iniciar sesión' en vez de 'Registrarse'.",
          code: "USER_EXISTS",
        }, 409);
      }
      return c.json({ error: `Signup failed: ${error.message}` }, 400);
    }

    console.log(`[Signup] User created: ${data.user?.email} (${data.user?.id})`);

    return c.json({
      status: "created",
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.full_name,
      },
    });
  } catch (err) {
    console.log("[Signup Error]", err);
    return c.json({ error: `Signup failed: ${err}` }, 500);
  }
});

// GET /profile
app.get("/make-server-08b8658d/profile", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — no valid session for profile fetch" }, 401);
    }

    const raw = await kv.get(`profile:${user.id}`);
    if (!raw) {
      return c.json({
        id: user.id,
        plan: "free",
        plan_status: "active",
        free_sessions_used: [],
        paths_purchased: [],
        stats: {},
        achievements: [],
        created_at: new Date().toISOString(),
      });
    }

    const profile = raw as Record<string, unknown>;

    return c.json(profile);
  } catch (err) {
    console.log("[Get Profile Error]", err);
    return c.json({ error: `Failed to get profile: ${err}` }, 500);
  }
});

// PUT /profile
app.put("/make-server-08b8658d/profile", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — no valid session for profile update" }, 401);
    }

    const updates = await c.req.json();

    // Whitelist: only allow non-sensitive profile fields to be updated by the user
    const ALLOWED_FIELDS = new Set([
      "industry", "position", "seniority", "role", "company",
      "keyExperience", "cvSummary", "cvFileName", "cvConsentGiven",
      "deckSummary", "deckFileName", "lastJobDescription",
      "narrationCompleted", "sessionMode", "activeGoal",
      "market_focus", "whatsapp_number", "whatsapp_verified",
    ]);
    const safeUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (ALLOWED_FIELDS.has(key)) safeUpdates[key] = value;
    }

    const raw = await kv.get(`profile:${user.id}`);
    const current = raw
      ? raw
      : {
        id: user.id,
        plan: "free",
        plan_status: "active",
        free_sessions_used: [],
        paths_purchased: [],
        stats: {},
        achievements: [],
        created_at: new Date().toISOString(),
      };

    const merged = { ...current, ...safeUpdates, id: user.id };
    await kv.set(`profile:${user.id}`, merged);

    return c.json({ status: "updated", profile: merged });
  } catch (err) {
    console.log("[Update Profile Error]", err);
    return c.json({ error: `Failed to update profile: ${err}` }, 500);
  }
});

// POST /profile/mark-free-used
app.post("/make-server-08b8658d/profile/mark-free-used", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — no valid session for marking free session" }, 401);
    }

    const raw = await kv.get(`profile:${user.id}`);
    const profile = raw
      ? raw
      : {
        id: user.id,
        plan: "free",
        plan_status: "active",
        free_sessions_used: [],
        paths_purchased: [],
        stats: {},
        achievements: [],
        created_at: new Date().toISOString(),
      };

    if (!profile.free_sessions_used) profile.free_sessions_used = [];
    // Mark the current scenario as used (backwards-compat with boolean)
    profile.free_session_used = true;
    console.log(`[Profile] Marked free session used for user ${user.id}`);
    await kv.set(`profile:${user.id}`, profile);

    return c.json({ status: "updated", free_session_used: true });
  } catch (err) {
    console.log("[Mark Free Used Error]", err);
    return c.json({ error: `Failed to mark free session used: ${err}` }, 500);
  }
});

export default app;
