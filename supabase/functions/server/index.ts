import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

// Set the basePath so Hono can match the full URL path from Supabase Edge Runtime
const app = new Hono().basePath("/functions/v1/server");

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "x-client-info", "apikey", "x-invoke-path"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.all("/debug-catchall/*", (c) => {
  return c.json({
    url: c.req.url,
    path: c.req.path,
    method: c.req.method,
  });
});

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

// ═══════════════════════════════════════════════════════════════
// GET /profile — Fetch user profile from KV
// ═══════════════════════════════════════════════════════════════
app.get("/make-server-4e8a5b39/profile", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — no valid session for profile fetch" }, 401);
    }

    const raw = await kv.get(`profile:${user.id}`);
    if (!raw) {
      // No profile in KV — return defaults
      return c.json({
        id: user.id,
        market_focus: null,
        plan: "free",
        plan_status: "active",
        free_session_used: false,
        stats: {},
        achievements: [],
        created_at: new Date().toISOString(),
      });
    }

    return c.json(JSON.parse(raw));
  } catch (err) {
    console.log("[Get Profile Error]", err);
    return c.json({ error: `Failed to get profile: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// PUT /profile — Update user profile in KV
// ═══════════════════════════════════════════════════════════════
app.put("/make-server-4e8a5b39/profile", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — no valid session for profile update" }, 401);
    }

    const updates = await c.req.json();
    const raw = await kv.get(`profile:${user.id}`);
    const current = raw
      ? JSON.parse(raw)
      : {
        id: user.id,
        market_focus: null,
        plan: "free",
        plan_status: "active",
        free_session_used: false,
        stats: {},
        achievements: [],
        created_at: new Date().toISOString(),
      };

    const merged = { ...current, ...updates, id: user.id };
    await kv.set(`profile:${user.id}`, JSON.stringify(merged));

    return c.json({ status: "updated", profile: merged });
  } catch (err) {
    console.log("[Update Profile Error]", err);
    return c.json({ error: `Failed to update profile: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /sessions — Save a practice session
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-4e8a5b39/sessions", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — no valid session for saving practice" }, 401);
    }

    const sessionData = await c.req.json();
    const sessionId = sessionData.id || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      ...sessionData,
      id: sessionId,
      user_id: user.id,
      created_at: sessionData.created_at || new Date().toISOString(),
    };

    // Store individual session
    await kv.set(`session:${user.id}:${sessionId}`, JSON.stringify(record));

    // Update session index (list of session IDs for this user)
    const indexRaw = await kv.get(`session_index:${user.id}`);
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    if (!index.includes(sessionId)) {
      index.unshift(sessionId); // newest first
    }
    await kv.set(`session_index:${user.id}`, JSON.stringify(index));

    // Update profile stats
    const profileRaw = await kv.get(`profile:${user.id}`);
    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      const stats = profile.stats || {};
      stats.sessions_count = (stats.sessions_count || 0) + 1;
      profile.stats = stats;
      await kv.set(`profile:${user.id}`, JSON.stringify(profile));
    }

    console.log(`[Sessions] Saved session ${sessionId} for user ${user.id}`);
    return c.json({ status: "saved", sessionId });
  } catch (err) {
    console.log("[Save Session Error]", err);
    return c.json({ error: `Failed to save session: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /sessions — List user's practice sessions
// ═══════════════════════════════════════════════════════════════
app.get("/make-server-4e8a5b39/sessions", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — no valid session for listing practices" }, 401);
    }

    const indexRaw = await kv.get(`session_index:${user.id}`);
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];

    if (index.length === 0) {
      return c.json({ sessions: [] });
    }

    // Fetch all sessions by their keys
    const keys = index.map((id) => `session:${user.id}:${id}`);
    const rawSessions = await kv.mget(keys);
    const sessions = rawSessions
      .filter((s): s is string => s !== null && s !== undefined)
      .map((s) => JSON.parse(s));

    return c.json({ sessions });
  } catch (err) {
    console.log("[List Sessions Error]", err);
    return c.json({ error: `Failed to list sessions: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /profile/mark-free-used — Mark free session as used
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-4e8a5b39/profile/mark-free-used", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — no valid session for marking free session" }, 401);
    }

    const raw = await kv.get(`profile:${user.id}`);
    const profile = raw
      ? JSON.parse(raw)
      : {
        id: user.id,
        market_focus: null,
        plan: "free",
        plan_status: "active",
        free_session_used: false,
        stats: {},
        achievements: [],
        created_at: new Date().toISOString(),
      };

    profile.free_session_used = true;
    await kv.set(`profile:${user.id}`, JSON.stringify(profile));

    console.log(`[Profile] Marked free session used for user ${user.id}`);
    return c.json({ status: "updated", free_session_used: true });
  } catch (err) {
    console.log("[Mark Free Used Error]", err);
    return c.json({ error: `Failed to mark free session used: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /generate-script — Generate a pre-briefing conversation script via GPT-4o
// Takes scenario context and produces a structured script with highlights
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-4e8a5b39/generate-script", async (c) => {
  try {
    const body = await c.req.json();
    const { scenario, interlocutor, scenarioType, guidedFields, marketFocus } = body;

    if (!scenario && !interlocutor) {
      return c.json({ error: "Missing required fields: scenario or interlocutor" }, 400);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.log("[Generate Script] OPENAI_API_KEY not configured");
      return c.json({ error: "OpenAI API key not configured on server" }, 500);
    }

    // Build context from guided fields
    const guidedContext = guidedFields
      ? Object.entries(guidedFields)
        .filter(([_, v]) => v && String(v).trim())
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n")
      : "";

    const scenarioLabel = scenarioType === "interview" ? "Job Interview" : "Sales Pitch";

    // Build the system prompt for pre-briefing script generation
    const systemPrompt = `You are an expert executive communication coach and speechwriter specializing in helping Latin American professionals prepare for high-stakes business conversations in English.

Your task: Generate a PREPARATION SCRIPT — a structured conversation strategy the user will study BEFORE their practice session. This is NOT a post-session improvement; it's a PRE-SESSION game plan.

=== SCENARIO TYPE ===
${scenarioLabel}

=== INTERLOCUTOR ===
The user will be speaking with: ${interlocutor}

=== USER'S CONTEXT ===
${guidedContext || "No additional context provided."}

${marketFocus ? `=== REGIONAL CONTEXT ===\nThe user is based in ${marketFocus === "brazil" ? "Brazil" : marketFocus === "mexico" ? "Mexico" : marketFocus === "colombia" ? "Colombia" : "Latin America"}. Adapt vocabulary and cultural framing accordingly.` : ""}

=== OUTPUT FORMAT (MANDATORY JSON) ===
Respond with ONLY a valid JSON object. No markdown, no code fences, no commentary.

{
  "sections": [
    {
      "num": 1,
      "title": "Section Title in English",
      "paragraphs": [
        {
          "text": "The paragraph text before any highlighted phrase. ",
          "highlights": [
            {
              "phrase": "the exact power phrase to highlight",
              "color": "#E1D5F8",
              "tooltip": "Brief explanation in Spanish of WHY this phrase works (max 15 words)"
            }
          ],
          "suffix": " any text that follows the last highlight in this paragraph."
        }
      ]
    }
  ]
}

=== CRITICAL RULES ===

1. STRUCTURE: Create exactly 3 sections for the script:
${scenarioType === "interview" ? `   - Section 1: "Personal Pitch — Your Value Story" (who you are, your differentiator)
   - Section 2: "STAR Story — Prove It With Impact" (a structured achievement narrative)
   - Section 3: "Strategic Close — Your Questions Matter" (thoughtful questions + confident wrap-up)` :
        `   - Section 1: "Opening — Set the Frame" (establish credibility, state your purpose)
   - Section 2: "Value Proposition — Lead with Impact" (core argument with data points)
   - Section 3: "Close — Secure the Next Step" (handle objections, propose concrete next step)`}

2. PARAGRAPH FORMAT: Each paragraph has:
   - "text": Text BEFORE the first highlight (can be empty string "")
   - "highlights": Array of 1-2 highlighted phrases with color and tooltip
   - "suffix": Text AFTER the last highlight (can be empty string "")
   - The full readable paragraph = text + highlights[0].phrase + middle_text + highlights[1].phrase + suffix

3. HIGHLIGHT COLORS (use the exact hex values):
   - "#E1D5F8" (purple): Structure improvements — frameworks, transitions, signposting
   - "#FFE9C7" (peach): Impact phrases — power phrases, persuasion triggers, data claims
   - "#D9ECF0" (blue): Engagement hooks — questions, callbacks, inclusive language

4. CONTENT GUIDELINES:
   - Write in natural spoken English (this will be read aloud)
   - Each section should have 2-3 paragraphs
   - Include 4-6 total highlights across all sections
   - Distribute colors: mix purple, peach, and blue
   - Tooltips must be in Spanish and explain the communication strategy
   - Total script: 200-350 words (2-3 minute read)
   - If the user provided specific details (company, product, role), weave them in
   - If no specific details, create realistic but generic business content

5. QUALITY CHECKS:
   - Every highlight "phrase" should be a natural substring that flows in the paragraph
   - Tooltips should explain WHY the phrase works, not just translate it
   - The script should feel like advice from a senior mentor, not a template`;

    const userMessage = `Generate a pre-briefing conversation script for this ${scenarioLabel.toLowerCase()} scenario.

Scenario: ${scenario || "General " + scenarioLabel}
Interlocutor: ${interlocutor}
${guidedContext ? `\nUser's preparation notes:\n${guidedContext}` : ""}

Remember: Return ONLY valid JSON. No markdown fences.`;

    console.log(`[Generate Script] Calling GPT-4o for ${scenarioType || "default"} scenario, interlocutor: ${interlocutor}`);

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const errBody = await openaiResponse.text();
      console.log(`[Generate Script] OpenAI error ${openaiResponse.status}:`, errBody);
      return c.json({
        error: `OpenAI API error: ${openaiResponse.status}`,
        details: errBody,
      }, 502);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      console.log("[Generate Script] No content in OpenAI response");
      return c.json({ error: "Empty response from OpenAI" }, 502);
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseErr) {
      console.log("[Generate Script] Failed to parse OpenAI JSON:", content.slice(0, 200));
      return c.json({ error: "Invalid JSON from OpenAI", raw: content.slice(0, 500) }, 502);
    }

    const sections = parsed.sections;
    if (!Array.isArray(sections) || sections.length === 0) {
      console.log("[Generate Script] No sections in parsed response");
      return c.json({ error: "No sections in generated script", parsed }, 502);
    }

    console.log(`[Generate Script] Success — ${sections.length} sections generated`);
    return c.json({ sections });
  } catch (err) {
    console.log("[Generate Script Error]", err);
    return c.json({ error: `Script generation failed: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);