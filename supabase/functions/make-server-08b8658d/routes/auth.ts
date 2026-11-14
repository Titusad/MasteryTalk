import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import { getAdminClient, getAuthUser } from "../_shared.ts";
import { sendEmail } from "../email.ts";
import { welcomeEmailHtml } from "../email-templates.ts";
import { loopsFetch } from "./marketing.ts";

/** Stage 1 library accounts (PRODUCT_SPEC §6.5.5). Closed set. */
const WAITLIST_ORIGIN = "waitlist-es";
/** A profile counts as "just created" for origin tagging within this window. */
const NEW_ACCOUNT_WINDOW_MS = 10 * 60 * 1000;

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
    const body = await c.req.json().catch(() => ({}));

    // select("*") on purpose: keeps working even if the `origin` column
    // migration has not been applied yet (field is then simply undefined).
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // ── Stage 1 origin (§6.5.5) ──
    // Tag ONLY accounts created in the last minutes and only when they come
    // from the library (waitlist KV entry, or the client's closed-set flag for
    // Google). Anyone else — beta users, admin, returning users — is untouched.
    const createdMs = user.created_at ? Date.parse(user.created_at) : NaN;
    const isNewAccount = Number.isFinite(createdMs) && Date.now() - createdMs < NEW_ACCOUNT_WINDOW_MS;
    let comesFromLibrary = body?.origin === WAITLIST_ORIGIN;
    if (!comesFromLibrary && isNewAccount && user.email) {
      try {
        comesFromLibrary = !!(await kv.get(`waitlist:${user.email.toLowerCase()}`));
      } catch (err) {
        console.error("[Ensure Profile] waitlist lookup failed:", err);
      }
    }

    if (existing) {
      let origin: string | null = existing.origin ?? null;
      if (!origin && isNewAccount && comesFromLibrary) {
        const { error: originError } = await supabase
          .from("profiles")
          .update({ origin: WAITLIST_ORIGIN })
          .eq("id", user.id);
        if (originError) {
          console.error("[Ensure Profile] Failed to set origin:", originError);
        } else {
          origin = WAITLIST_ORIGIN;
        }
      }
      return c.json({
        status: "exists",
        userId: user.id,
        origin,
        termsAcceptedAt: existing.terms_accepted_at || null,
      });
    }

    const origin: string | null = isNewAccount && comesFromLibrary ? WAITLIST_ORIGIN : null;

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
      ...(origin ? { origin } : {}),
    });

    if (insertError) {
      console.log("[Ensure Profile] Insert error:", insertError);

      // Guard: never overwrite an existing KV profile that already has user data.
      // Without this check, every login destroys profile_completed, position, industry, etc.
      const existingKv = await kv.get(`profile:${user.id}`);
      const hasExistingData = existingKv &&
        (existingKv.profile_completed || existingKv.position || existingKv.industry ||
          existingKv.cvSummary || existingKv.keyExperience || existingKv.subscription_active);

      if (hasExistingData) {
        console.log("[Ensure Profile] KV profile already exists with user data — skipping overwrite");
        return c.json({ status: "exists_kv", userId: user.id });
      }

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
        ...(origin ? { origin } : {}),
      });

      // Welcome email (fire-and-forget) — even if DB insert failed, user was created.
      // Stage 1 library accounts never get the English welcome (§6.5.5).
      if (!origin) {
        const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
        sendEmail({
          to: user.email!,
          subject: "Welcome to MasteryTalk! 🎯",
          html: welcomeEmailHtml(userName),
        }).catch((err) => console.error("[Ensure Profile] Welcome email failed:", err));
      }

      return c.json({ status: "created_kv", userId: user.id, origin, note: "Stored in KV (profiles table not available)" });
    }

    // Welcome email (fire-and-forget) — new user profile created successfully.
    // Stage 1 library accounts never get the English welcome (§6.5.5).
    if (!origin) {
      const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
      sendEmail({
        to: user.email!,
        subject: "Welcome to MasteryTalk! 🎯",
        html: welcomeEmailHtml(userName),
      }).catch((err) => console.error("[Ensure Profile] Welcome email failed:", err));
    }

    return c.json({ status: "created", userId: user.id, origin });
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

    // `origin` lives in the profiles table (§6.5.5), not in KV: the client needs it
    // on every load to route Stage 1 library accounts.
    const { data: row } = await getAdminClient()
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    const origin: string | null = row?.origin ?? null;

    const raw = await kv.get(`profile:${user.id}`);
    if (!raw) {
      return c.json({
        id: user.id,
        origin,
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

    return c.json({ ...profile, origin });
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
      "narrationCompleted", "sessionMode", "activeGoal", "english_goal",
      "market_focus", "whatsapp_number",
      "wa_preferred_hour", "wa_timezone",
      "wa_dismissed_at_session_count", "wa_card_permanently_dismissed",
      "profile_completed",
      "last_pre_session_lesson_id",
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

    // Invalidate script cache if content-affecting fields changed
    const SCRIPT_CACHE_FIELDS = ["position", "industry", "seniority", "cvSummary", "keyExperience", "lastJobDescription"];
    const contentChanged = SCRIPT_CACHE_FIELDS.some(
      (f) => f in safeUpdates && safeUpdates[f] !== (current as Record<string, unknown>)[f]
    );
    if (contentChanged) {
      merged.scriptCacheVersion = ((current as Record<string, unknown>).scriptCacheVersion as number ?? 0) + 1;
      console.log(`[Profile] Content fields changed — scriptCacheVersion bumped to ${merged.scriptCacheVersion}`);
    }

    await kv.set(`profile:${user.id}`, merged);

    // Enrich Loops contact when onboarding fields arrive (fire-and-forget)
    if (user.email && (safeUpdates.industry || safeUpdates.position || safeUpdates.market_focus)) {
      loopsFetch("/contacts/update", {
        email: user.email,
        userId: user.id,
        ...(merged.market_focus ? { language: merged.market_focus === "brazil" ? "pt" : "es" } : {}),
        ...(merged.market_focus ? { marketFocus: merged.market_focus } : {}),
        ...(merged.industry ? { industry: merged.industry } : {}),
        ...(merged.position ? { jobTitle: merged.position } : {}),
        ...(merged.plan ? { plan: merged.plan } : {}),
      }).catch(() => {});
    }

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
