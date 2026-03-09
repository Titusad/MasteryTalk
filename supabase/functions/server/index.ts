import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { buildPreBriefingPrompt } from "./prebriefing-prompt.ts";

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

// ═════════════════════════════════════════════════════════════
// Health check endpoint
// ═════════════════════════════════════════════════════════════
app.get("/make-server-08b8658d/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════
// Auth status — verify Supabase auth is working
// ═══════════════════════════════════════════════════════════════
app.get("/make-server-08b8658d/auth/status", async (c) => {
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
app.post("/make-server-08b8658d/auth/ensure-profile", async (c) => {
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
app.post("/make-server-08b8658d/auth/signup", async (c) => {
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
app.get("/make-server-08b8658d/profile", async (c) => {
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
app.put("/make-server-08b8658d/profile", async (c) => {
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
app.post("/make-server-08b8658d/sessions", async (c) => {
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
app.get("/make-server-08b8658d/sessions", async (c) => {
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
app.post("/make-server-08b8658d/profile/mark-free-used", async (c) => {
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
// Uses the strategic prompt builder from prebriefing-prompt.ts
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/generate-script", async (c) => {
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

    // Build strategic prompt using the dedicated builder
    const { systemPrompt, fewShotUser, fewShotAssistant, userMessage } = buildPreBriefingPrompt({
      scenario: scenario || "",
      interlocutor: interlocutor || "recruiter",
      scenarioType: scenarioType || "interview",
      guidedFields,
      marketFocus,
    });

    console.log(`[Generate Script v3] Calling GPT-4o with 4-message few-shot pattern for ${scenarioType || "default"}, interlocutor: ${interlocutor}, fields: ${guidedFields ? Object.keys(guidedFields).length : 0}`);

    // ── Helper: call OpenAI ──
    async function callOpenAI(messages: Array<{ role: string; content: string }>, temp: number, maxTok: number) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages,
          temperature: temp,
          max_tokens: maxTok,
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`OpenAI ${res.status}: ${errBody.slice(0, 300)}`);
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    }

    // ── Helper: count words in all sections ──
    function countWords(sections: any[]): number {
      let total = 0;
      for (const s of sections) {
        for (const p of s.paragraphs || []) {
          total += (p.text || "").split(/\s+/).filter(Boolean).length;
          for (const h of p.highlights || []) {
            total += (h.phrase || "").split(/\s+/).filter(Boolean).length;
          }
          total += (p.suffix || "").split(/\s+/).filter(Boolean).length;
        }
      }
      return total;
    }

    // ── Helper: detect first-person voice ──
    // ONLY checks body text (text + suffix), NOT highlight phrases.
    // Highlights are suggested phrases the user should SAY → first person is correct there.
    function hasFirstPersonVoice(sections: any[]): boolean {
      const firstPersonPatterns = /\b(I am|I'm a|I have|I was|I led|I've been|My expertise|My experience|My background)\b/i;
      for (const s of sections) {
        for (const p of s.paragraphs || []) {
          // Only check coaching body text, NOT highlight phrases
          const bodyText = `${p.text || ""} ${p.suffix || ""}`;
          if (firstPersonPatterns.test(bodyText)) return true;
        }
      }
      return false;
    }

    // ── Helper: check contingency paragraphs ──
    function hasContingencyInEachSection(sections: any[]): boolean {
      for (const s of sections) {
        const paras = s.paragraphs || [];
        if (paras.length === 0) return false;
        const lastPara = paras[paras.length - 1];
        const lastText = `${lastPara.text || ""} ${lastPara.suffix || ""}`;
        if (!/\b(if they|when they)\b/i.test(lastText)) return false;
      }
      return true;
    }

    // ═══ CALL 1: Generate with few-shot ═══
    const content1 = await callOpenAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: fewShotUser },
      { role: "assistant", content: fewShotAssistant },
      { role: "user", content: userMessage },
    ], 0.85, 2500);

    let parsed;
    try {
      parsed = JSON.parse(content1);
    } catch {
      console.log("[Generate Script v3] Failed to parse initial JSON:", content1.slice(0, 200));
      return c.json({ error: "Invalid JSON from OpenAI", raw: content1.slice(0, 500) }, 502);
    }

    let sections = parsed.sections;
    if (!Array.isArray(sections) || sections.length === 0) {
      return c.json({ error: "No sections in generated script" }, 502);
    }

    const wordCount = countWords(sections);
    const isFirstPerson = hasFirstPersonVoice(sections);
    const hasContingency = hasContingencyInEachSection(sections);

    console.log(`[Generate Script v3] Call 1 result — words: ${wordCount}, firstPerson: ${isFirstPerson}, contingencies: ${hasContingency}`);

    // ═══ CALL 2 (conditional): Rewrite if quality gates fail ═══
    const needsRewrite = wordCount < 150 || isFirstPerson || !hasContingency;

    if (needsRewrite) {
      console.log(`[Generate Script v3] Quality gates FAILED — triggering rewrite call. Reasons: ${wordCount < 150 ? "TOO_SHORT " : ""}${isFirstPerson ? "FIRST_PERSON " : ""}${!hasContingency ? "NO_CONTINGENCY" : ""}`);

      const rewritePrompt = `You are an elite executive communication coach. You must REWRITE the following pre-briefing script JSON to fix these problems:

${wordCount < 150 ? `❌ TOO SHORT: Currently ${wordCount} words. EXPAND every paragraph to 2-3 sentences. Target: 200-280 words total.` : ""}
${isFirstPerson ? `❌ WRONG VOICE: The coaching body text (text and suffix fields) uses first person ("I am a...", "I have..."). REWRITE the body text in second-person coaching voice ("Here's how you open...", "You'll want to lead with...", "When they ask about X, pivot to..."). HOWEVER, highlighted phrases (inside "highlights[].phrase") that represent what the user should SAY must stay in FIRST PERSON ("I've spent 8 years...", "I led a team of..."). The pattern is: coaching text in second person, suggested phrases in first person.` : ""}
${!hasContingency ? `❌ MISSING CONTINGENCY: The last paragraph of EACH section must start with "If they..." or "When they..." and provide a specific pivot strategy with exact language the user can memorize.` : ""}

REWRITE RULES:
- Keep the same JSON structure: { "sections": [...] } with the same highlight format
- Keep all existing highlights but you may add more (6-10 total)
- Every paragraph must be 2-3 sentences
- Body text (text + suffix) must be second-person coaching: "Here's what you do..." / "You want to say something like: '...'"
- Highlighted phrases that are lines the user should practice MUST remain in FIRST PERSON ("I built...", "I led...", "I'm confident...")
- The last paragraph of each section MUST be a contingency starting with "If they..." or "When they..."
- Preserve all specific details from the original (company names, metrics, role details)
- Target 200-280 words total

HERE IS THE SCRIPT TO REWRITE:
${content1}

Return ONLY the rewritten JSON. No markdown, no explanation.`;

      try {
        const content2 = await callOpenAI([
          { role: "user", content: rewritePrompt },
        ], 0.9, 2500);

        const parsed2 = JSON.parse(content2);
        if (Array.isArray(parsed2.sections) && parsed2.sections.length > 0) {
          const newWordCount = countWords(parsed2.sections);
          const stillFirstPerson = hasFirstPersonVoice(parsed2.sections);
          console.log(`[Generate Script v3] Rewrite result — words: ${newWordCount}, firstPerson: ${stillFirstPerson}`);

          // Use rewrite if it's an improvement
          if (newWordCount > wordCount || (!stillFirstPerson && isFirstPerson)) {
            sections = parsed2.sections;
            console.log("[Generate Script v3] ✅ Using rewritten version");
          } else {
            console.log("[Generate Script v3] ⚠️ Rewrite wasn't better, keeping original");
          }
        }
      } catch (rewriteErr) {
        console.log("[Generate Script v3] Rewrite call failed, keeping original:", String(rewriteErr));
      }
    } else {
      console.log("[Generate Script v3] ✅ All quality gates passed on first call");
    }

    const finalWordCount = countWords(sections);
    console.log(`[Generate Script v3] Final output — ${sections.length} sections, ${finalWordCount} words`);
    return c.json({ sections, _debug: { version: "v3-validate-rewrite", wordCount: finalWordCount, wasRewritten: needsRewrite } });
  } catch (err) {
    console.log("[Generate Script Error]", err);
    return c.json({ error: `Script generation failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// TTS — Text-to-Speech via ElevenLabs for pre-briefing narration
// Accepts { text, role } where role controls voice tonality:
//   "coach"     → warm, supportive narration (default)
//   "user_line" → confident, assertive delivery for suggested phrases
// Returns audio/mpeg stream
// ═══════════════════════════════════════════════════════════════

/* ElevenLabs voice settings per role */
const ELEVEN_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Bella — warm, natural, expressive female
const ELEVEN_MODEL = "eleven_multilingual_v2";

const VOICE_PROFILES: Record<string, { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean }> = {
  coach: {
    stability: 0.50,          // moderate variation → natural warmth
    similarity_boost: 0.75,
    style: 0.35,              // subtle expressiveness
    use_speaker_boost: true,
  },
  user_line: {
    stability: 0.30,          // more dynamic → confident energy
    similarity_boost: 0.80,
    style: 0.65,              // stronger expressiveness → assertive
    use_speaker_boost: true,
  },
};

app.post("/make-server-08b8658d/tts", async (c) => {
  try {
    const { text, role } = await c.req.json();
    if (!text || typeof text !== "string") {
      return c.json({ error: "Missing 'text' field for TTS" }, 400);
    }

    const elevenKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!elevenKey) {
      return c.json({ error: "ELEVENLABS_API_KEY not configured on server" }, 500);
    }

    const effectiveRole = role === "user_line" ? "user_line" : "coach";
    const voiceSettings = VOICE_PROFILES[effectiveRole];

    console.log(`[TTS ElevenLabs] role=${effectiveRole}, chars=${text.length}`);

    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: ELEVEN_MODEL,
          voice_settings: voiceSettings,
        }),
      },
    );

    if (!ttsResponse.ok) {
      const errBody = await ttsResponse.text();
      console.log(`[TTS ElevenLabs] Error ${ttsResponse.status}: ${errBody}`);
      return c.json({ error: `ElevenLabs TTS failed (${ttsResponse.status}): ${errBody}` }, 502);
    }

    console.log(`[TTS ElevenLabs] ✅ Audio generated — role=${effectiveRole}`);

    return new Response(ttsResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.log("[TTS ElevenLabs Error]", err);
    return c.json({ error: `TTS failed: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);