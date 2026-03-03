import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

/* ── Supabase admin client (service role) ── */
function getAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/* ── Helper: extract user from Authorization header ── */
async function getAuthUser(authHeader: string | undefined) {
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const supabase = getAdminClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ═══════════════════════════════════════════════════════════════
// Health check endpoint
// ═══════════════════════════════════════════════════════════════
app.get("/make-server-4e8a5b39/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════
// Auth status — verify Supabase auth is working
// ═══════════════════════════════════════════════════════════════
app.get("/make-server-4e8a5b39/auth/status", async (c) => {
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

// ═══════════════════════════════════════════════════════════════
// Ensure profile — creates a profile row if it doesn't exist
// Called by the frontend after OAuth login as a safety net
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-4e8a5b39/auth/ensure-profile", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — no valid session" }, 401);
    }

    const supabase = getAdminClient();

    // Check if profile exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existing) {
      return c.json({ status: "exists", userId: user.id });
    }

    // Create profile
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      market_focus: null,
      plan: "free",
      plan_status: "active",
      free_session_used: false,
      stats: {},
      achievements: [],
    });

    if (insertError) {
      console.log("[Ensure Profile] Insert error:", insertError);
      // Table might not exist — store in KV as fallback
      await kv.set(`profile:${user.id}`, JSON.stringify({
        id: user.id,
        market_focus: null,
        plan: "free",
        plan_status: "active",
        free_session_used: false,
        stats: {},
        achievements: [],
        created_at: new Date().toISOString(),
      }));
      return c.json({ status: "created_kv", userId: user.id, note: "Stored in KV (profiles table not available)" });
    }

    return c.json({ status: "created", userId: user.id });
  } catch (err) {
    console.log("[Ensure Profile Error]", err);
    return c.json({ error: `Failed to ensure profile: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// Email Signup — creates user with auto-confirmed email
// Used for testing auth flow without configuring OAuth providers
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-4e8a5b39/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabase = getAdminClient();

    // Create user with auto-confirmed email (no email server configured)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: name || email.split("@")[0] },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log("[Signup Error]", error.message);

      // Handle "user already exists" gracefully
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

Deno.serve(app.fetch);