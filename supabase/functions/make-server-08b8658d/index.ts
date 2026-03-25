import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.ts";
import { buildPreBriefingPrompt } from "./prebriefing-prompts.ts";
import { buildPreparationToolkitPrompt } from "./preparation-toolkit-prompt.ts";
import { buildFeedbackAnalystPrompt, buildTranscriptForAnalyst } from "./analyst-prompt.ts";
import { buildSessionSummaryPrompt } from "./summary-prompt.ts";
import type { SummaryInput } from "./summary-prompt.ts";
import { buildInterviewBriefingPrompt } from "./interview-briefing-prompt.ts";
import { buildCvMatchPrompt } from "../_shared/prompts/cv-match-prompt.ts";

const app = new Hono();

// Global error handler — prevents "connection closed before message completed" crashes
app.onError((err, c) => {
  const msg = String(err);
  // Client disconnects mid-stream — not a real server error
  if (msg.includes("connection closed") || msg.includes("connection reset") || msg.includes("broken pipe")) {
    console.log(`[Hono] Client disconnected mid-response: ${msg.slice(0, 120)}`);
    return c.json({ error: "Client disconnected" }, 499);
  }
  console.log(`[Hono] Unhandled error: ${msg}`);
  return c.json({ error: `Internal server error: ${msg.slice(0, 200)}` }, 500);
});

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
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
// ══════════════════════════════════════════════════════════════
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
// Interlocutor display names (human-readable labels for UI)
// ═══════════════════════════════════════════════════════════════
const INTERLOCUTOR_DISPLAY: Record<string, string> = {
  recruiter: "Recruiter",
  sme: "SME Expert",
  hiring_manager: "Hiring Manager",
  hr: "HR",
  gatekeeper: "Gatekeeper",
  technical_buyer: "Technical Buyer",
  champion: "Champion",
  decision_maker: "Decision Maker",
};
function displayLabel(interlocutor: string | null | undefined): string {
  if (!interlocutor) return "AI";
  return INTERLOCUTOR_DISPLAY[interlocutor] || interlocutor.charAt(0).toUpperCase() + interlocutor.slice(1).replace(/_/g, " ");
}

// ═══════════════════════════════════════════════════════════════
// POST /sessions — Save a practice session
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/sessions", async (c) => {
  try {
    // Auth optional in prototype mode — fallback to "anon" user
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";

    const sessionData = await c.req.json();
    const sessionId = sessionData.id || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      ...sessionData,
      id: sessionId,
      user_id: userId,
      created_at: sessionData.created_at || new Date().toISOString(),
    };

    // Store individual session
    await kv.set(`session:${userId}:${sessionId}`, JSON.stringify(record));

    // Update session index (list of session IDs for this user)
    const indexRaw = await kv.get(`session_index:${userId}`);
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    if (!index.includes(sessionId)) {
      index.unshift(sessionId); // newest first
    }
    await kv.set(`session_index:${userId}`, JSON.stringify(index));

    // Update profile stats
    const profileRaw = await kv.get(`profile:${userId}`);
    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      const stats = profile.stats || {};
      stats.sessions_count = (stats.sessions_count || 0) + 1;
      profile.stats = stats;
      await kv.set(`profile:${userId}`, JSON.stringify(profile));
    }

    console.log(`[Sessions] Saved session ${sessionId} for user ${userId}`);
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
    // Auth optional in prototype mode — fallback to "anon" user
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";

    const indexRaw = await kv.get(`session_index:${userId}`);
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];

    if (index.length === 0) {
      return c.json({ sessions: [] });
    }

    // Fetch all sessions by their keys
    const keys = index.map((id) => `session:${userId}:${id}`);
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
// Helper: Call OpenAI Chat Completions
// ═══════════════════════════════════════════════════════════════
async function callOpenAIChat(
  messages: Array<{ role: string; content: string }>,
  options: { temperature?: number; max_tokens?: number; jsonMode?: boolean } = {},
) {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) throw new Error("OPENAI_API_KEY not configured on server");

  const body: Record<string, unknown> = {
    model: "gpt-4o",
    messages,
    temperature: options.temperature ?? 0.85,
    max_tokens: options.max_tokens ?? 500,
  };
  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errBody.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ═══════════════════════════════════════════════════════════════
// POST /prepare-session — Initialize a voice practice session
// Stores system prompt in KV, calls GPT-4o for first AI message
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/prepare-session", async (c) => {
  try {
    const { systemPrompt, scenario, interlocutor, scenarioType, voiceId, interviewBriefing } = await c.req.json();

    if (!systemPrompt) {
      return c.json({ error: "Missing systemPrompt for session preparation" }, 400);
    }

    const sessionId = `vsession_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    console.log(`[PrepareSession] Creating session ${sessionId} | type=${scenarioType} interlocutor=${interlocutor}`);

    // Call GPT-4o for the first message (in-character opening)
    const firstResponse = await callOpenAIChat(
      [{ role: "system", content: systemPrompt }],
      { temperature: 0.9, max_tokens: 300, jsonMode: true },
    );

    let firstAiText = "";
    let firstInternalAnalysis = "";
    let firstCoachingHint: { starter: string; keywords: string[]; strategy: string } | null = null;
    try {
      const parsed = JSON.parse(firstResponse);
      firstAiText = parsed.aiMessage || parsed.text || firstResponse;
      firstInternalAnalysis = parsed.internalAnalysis || "";
      if (parsed.coachingHint && parsed.coachingHint.starter) {
        firstCoachingHint = {
          starter: parsed.coachingHint.starter,
          keywords: Array.isArray(parsed.coachingHint.keywords) ? parsed.coachingHint.keywords : [],
          strategy: parsed.coachingHint.strategy || "",
        };
      }
    } catch {
      // If not JSON, use raw text
      firstAiText = firstResponse;
    }

    const firstMessage = {
      role: "ai" as const,
      label: displayLabel(interlocutor),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      text: firstAiText,
    };

    // Store session state in KV
    const sessionState = {
      systemPrompt,
      scenario: scenario || "",
      interlocutor: interlocutor || "",
      scenarioType: scenarioType || "interview",
      voiceId: voiceId || "",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "assistant", content: firstResponse },
      ],
      internalAnalysis: firstInternalAnalysis ? [firstInternalAnalysis] : [],
      turnCount: 0,
      isComplete: false,
      createdAt: new Date().toISOString(),
      // Gap C: store briefing data for the feedback analyst
      interviewBriefing: interviewBriefing || null,
      // Arena: server-driven adaptive difficulty
      arenaPhase: "support",
      performanceHistory: [] as number[],
    };

    await kv.set(`practice:${sessionId}`, JSON.stringify(sessionState));
    console.log(`[PrepareSession] ✅ Session ${sessionId} ready — first message: ${firstAiText.length} chars`);

    return c.json({ sessionId, firstMessage, coachingHint: firstCoachingHint });
  } catch (err) {
    console.log("[PrepareSession Error]", err);
    return c.json({ error: `Session preparation failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /process-turn — Process a conversation turn with GPT-4o
// Retrieves session from KV, appends user message, gets AI response
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/process-turn", async (c) => {
  try {
    const { sessionId, userMessage } = await c.req.json();

    if (!sessionId || !userMessage) {
      return c.json({ error: "Missing sessionId or userMessage" }, 400);
    }

    // Retrieve session from KV
    const raw = await kv.get(`practice:${sessionId}`);
    if (!raw) {
      return c.json({ error: `Session ${sessionId} not found` }, 404);
    }

    const session = JSON.parse(raw);

    if (session.isComplete) {
      return c.json({
        aiMessage: { role: "ai", label: displayLabel(session.interlocutor), time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }), text: "This conversation has concluded. Thank you for your time." },
        isComplete: true,
      });
    }

    // Append user message to history
    session.messages.push({ role: "user", content: userMessage });
    session.turnCount += 1;

    // ── Arena: determine current phase directive ──
    const currentPhase = session.arenaPhase || "support";
    const ARENA_DIRECTIVES: Record<string, string> = {
      support: `=== DIFFICULTY LEVEL: SUPPORTIVE ===
The user is warming up. Ask straightforward questions. Give them space to develop arguments before challenging. If they stumble, give a natural opening to recover. Assess foundational skills in internalAnalysis.`,
      guidance: `=== DIFFICULTY LEVEL: GUIDED CHALLENGE ===
The user is performing reasonably. Challenge their claims with follow-ups that require deeper thinking. Introduce mild curveballs. Don't accept surface-level answers — push one level deeper. If they deflect, call it out once. Focus on mid-level skills in internalAnalysis.`,
      challenge: `=== DIFFICULTY LEVEL: HIGH PRESSURE ===
The user is performing well. Push them to their ceiling. Be more skeptical, direct, demanding. Interrupt if they ramble. Create realistic pressure: bring up competitors, question assumptions, impose constraints. Use tactical silence after big claims. Test executive composure. Evaluate peak performance in internalAnalysis.`,
    };

    // Briefing-aware challenge: when in challenge phase with briefing data,
    // push outside the user's prepared comfort zone
    let phaseDirective = ARENA_DIRECTIVES[currentPhase] || ARENA_DIRECTIVES.support;
    if (currentPhase === "challenge" && session.interviewBriefing?.anticipatedQuestions?.length) {
      phaseDirective += `\n\nBRIEFING-AWARE CHALLENGE: The candidate prepared for specific questions. NOW is the time to test adaptability:
- Ask questions that were NOT in their preparation to see how they think on their feet.
- Challenge assumptions from their prepared responses — push back on claims they rehearsed.
- If they give a rehearsed-sounding answer, probe deeper: "That sounds prepared. What happened when it didn't go that smoothly?"`;
    }

    // Inject phase directive as ephemeral system message (not persisted in history)
    const messagesWithPhase = [
      ...session.messages.slice(0, 1), // system prompt
      { role: "system", content: phaseDirective },
      ...session.messages.slice(1),     // conversation history
    ];

    console.log(`[ProcessTurn] Session ${sessionId} | Turn ${session.turnCount} | Phase: ${currentPhase} | User: "${userMessage.slice(0, 80)}..."`);

    // Call GPT-4o with full conversation history + phase directive
    const aiResponse = await callOpenAIChat(
      messagesWithPhase,
      { temperature: 0.85, max_tokens: 400, jsonMode: true },
    );

    let aiText = "";
    let isComplete = false;
    let internalAnalysis = "";
    let performanceSignal = 60; // default if not provided
    let coachingHint: { starter: string; keywords: string[]; strategy: string } | null = null;

    try {
      const parsed = JSON.parse(aiResponse);
      aiText = parsed.aiMessage || parsed.text || aiResponse;
      isComplete = parsed.isComplete === true;
      internalAnalysis = parsed.internalAnalysis || "";
      performanceSignal = typeof parsed.performanceSignal === "number"
        ? Math.max(0, Math.min(100, parsed.performanceSignal))
        : 60;
      if (parsed.coachingHint && parsed.coachingHint.starter) {
        coachingHint = {
          starter: parsed.coachingHint.starter,
          keywords: Array.isArray(parsed.coachingHint.keywords) ? parsed.coachingHint.keywords : [],
          strategy: parsed.coachingHint.strategy || "",
        };
      }
    } catch {
      aiText = aiResponse;
    }

    // ── Arena: update performance history & compute phase transition ──
    const perfHistory: number[] = session.performanceHistory || [];
    perfHistory.push(performanceSignal);

    let nextPhase = currentPhase;
    if (session.turnCount >= 2) { // Turns 1-2 always SUPPORT (warmup)
      // Rolling average of last 2 signals for smoother transitions
      const recentSignals = perfHistory.slice(-2);
      const avg = recentSignals.reduce((a: number, b: number) => a + b, 0) / recentSignals.length;

      if (avg >= 72 && currentPhase === "support") {
        nextPhase = "guidance";
      } else if (avg >= 72 && currentPhase === "guidance") {
        nextPhase = "challenge";
      } else if (avg < 45 && currentPhase === "challenge") {
        nextPhase = "guidance"; // regression under pressure
      } else if (avg < 45 && currentPhase === "guidance") {
        nextPhase = "support"; // regression — back to supportive
      }
    }

    if (nextPhase !== currentPhase) {
      console.log(`[Arena] Phase transition: ${currentPhase} → ${nextPhase} (avg signal: ${perfHistory.slice(-2).reduce((a: number, b: number) => a + b, 0) / Math.min(2, perfHistory.length)})`);
    }

    session.arenaPhase = nextPhase;
    session.performanceHistory = perfHistory;

    // Append assistant response to history (original messages, NOT the ephemeral phase injection)
    session.messages.push({ role: "assistant", content: aiResponse });
    if (internalAnalysis) {
      session.internalAnalysis.push(internalAnalysis);
    }
    session.isComplete = isComplete;

    // Save updated session
    await kv.set(`practice:${sessionId}`, JSON.stringify(session));

    const aiMessage = {
      role: "ai" as const,
      label: displayLabel(session.interlocutor),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      text: aiText,
    };

    console.log(`[ProcessTurn] ✅ Turn ${session.turnCount} complete | Phase: ${nextPhase} | Signal: ${performanceSignal} | AI: ${aiText.length} chars | isComplete: ${isComplete}`);

    return c.json({ aiMessage, isComplete, coachingHint, arenaPhase: nextPhase, _debug: { turnCount: session.turnCount, analysisCount: session.internalAnalysis.length, performanceSignal, arenaPhase: nextPhase } });
  } catch (err) {
    console.log("[ProcessTurn Error]", err);
    return c.json({ error: `Turn processing failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /transcribe — Speech-to-text via OpenAI Whisper
// Receives audio blob (multipart/form-data), returns transcription
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/transcribe", async (c) => {
  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return c.json({ error: "OPENAI_API_KEY not configured on server" }, 500);
    }

    const formData = await c.req.formData();
    const audioFile = formData.get("audio");
    const language = formData.get("language") as string | null;

    if (!audioFile || !(audioFile instanceof File)) {
      return c.json({ error: "Missing 'audio' file in form data" }, 400);
    }

    console.log(`[Transcribe] Received audio: ${audioFile.name}, size=${audioFile.size}, type=${audioFile.type}, lang=${language}`);

    // Forward to OpenAI Whisper API
    const whisperForm = new FormData();
    whisperForm.append("file", audioFile, audioFile.name || "recording.wav");
    whisperForm.append("model", "whisper-1");
    if (language) {
      whisperForm.append("language", language);
    }
    whisperForm.append("response_format", "verbose_json");

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
      },
      body: whisperForm,
    });

    if (!whisperRes.ok) {
      const errBody = await whisperRes.text();
      console.log(`[Transcribe] Whisper error ${whisperRes.status}: ${errBody}`);
      return c.json({ error: `Whisper transcription failed (${whisperRes.status}): ${errBody.slice(0, 200)}` }, 502);
    }

    const result = await whisperRes.json();
    console.log(`[Transcribe] ✅ "${result.text?.slice(0, 80)}..." | duration=${result.duration}s`);

    return c.json({
      text: result.text || "",
      confidence: 0.95, // Whisper doesn't return per-word confidence in this mode
      duration: result.duration,
      language: result.language,
    });
  } catch (err) {
    console.log("[Transcribe Error]", err);
    return c.json({ error: `Transcription failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /generate-script — Generate a pre-briefing conversation script via GPT-4o
// Uses the strategic prompt builder from prebriefing-prompt.ts
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/generate-script", async (c) => {
  try {
    const body = await c.req.json();
    const { scenario, interlocutor, scenarioType, guidedFields } = body;
    const locale = body.locale || null;

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
      locale,
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
// POST /generate-preparation-toolkit — Generate personalized power phrases,
// power questions, and cultural intelligence via GPT-4o
// Called in parallel with /generate-script during preparation
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/generate-preparation-toolkit", async (c) => {
  try {
    const body = await c.req.json();
    const { scenario, interlocutor, scenarioType, guidedFields } = body;
    const toolkitLocale = body.locale || null;

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.log("[Preparation Toolkit] OPENAI_API_KEY not configured");
      return c.json({ error: "OpenAI API key not configured on server" }, 500);
    }

    const { systemPrompt, userMessage } = buildPreparationToolkitPrompt({
      scenario: scenario || "",
      interlocutor: interlocutor || "recruiter",
      scenarioType: scenarioType || "interview",
      guidedFields,
      locale: toolkitLocale,
    });

    console.log(`[Preparation Toolkit] Calling GPT-4o for ${scenarioType || "default"}, interlocutor: ${interlocutor}`);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
        temperature: 0.85,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.log(`[Preparation Toolkit] OpenAI error ${res.status}: ${errBody.slice(0, 300)}`);
      return c.json({ error: `OpenAI ${res.status}: ${errBody.slice(0, 300)}` }, 502);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.log("[Preparation Toolkit] Failed to parse JSON:", content.slice(0, 200));
      return c.json({ error: "Invalid JSON from OpenAI", raw: content.slice(0, 500) }, 502);
    }

    const powerPhrases = Array.isArray(parsed.powerPhrases) ? parsed.powerPhrases : [];
    const powerQuestions = Array.isArray(parsed.powerQuestions) ? parsed.powerQuestions : [];
    const culturalTips = Array.isArray(parsed.culturalTips) ? parsed.culturalTips : [];

    console.log(`[Preparation Toolkit] Generated ${powerPhrases.length} phrases, ${powerQuestions.length} questions, ${culturalTips.length} tips`);

    return c.json({ powerPhrases, powerQuestions, culturalTips });
  } catch (err) {
    console.log("[Preparation Toolkit Error]", err);
    return c.json({ error: `Preparation toolkit generation failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /generate-interview-briefing — Generate card-based interview
// preparation via GPT-4o. Single call replaces both /generate-script
// and /generate-preparation-toolkit for interview scenarios.
// Returns: { anticipatedQuestions[], questionsToAsk[], culturalTips[] }
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/generate-interview-briefing", async (c) => {
  try {
    const body = await c.req.json();
    const { scenario, interlocutor, guidedFields } = body;
    const briefingLocale = body.locale || null;

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.log("[Interview Briefing] OPENAI_API_KEY not configured");
      return c.json({ error: "OpenAI API key not configured on server" }, 500);
    }

    const { systemPrompt, userMessage } = buildInterviewBriefingPrompt({
      scenario: scenario || "",
      interlocutor: interlocutor || "recruiter",
      guidedFields,
      locale: briefingLocale,
    });

    console.log(`[Interview Briefing] Calling GPT-4o for interlocutor: ${interlocutor}, fields: ${guidedFields ? Object.keys(guidedFields).length : 0}`);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.85,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.log(`[Interview Briefing] OpenAI error ${res.status}: ${errBody.slice(0, 300)}`);
      return c.json({ error: `OpenAI ${res.status}: ${errBody.slice(0, 300)}` }, 502);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.log("[Interview Briefing] Failed to parse JSON:", content.slice(0, 200));
      return c.json({ error: "Invalid JSON from OpenAI", raw: content.slice(0, 500) }, 502);
    }

    const anticipatedQuestions = Array.isArray(parsed.anticipatedQuestions) ? parsed.anticipatedQuestions : [];
    const questionsToAsk = Array.isArray(parsed.questionsToAsk) ? parsed.questionsToAsk : [];
    const culturalTips = Array.isArray(parsed.culturalTips) ? parsed.culturalTips : [];

    // Validate minimum quality
    if (anticipatedQuestions.length < 3) {
      console.log(`[Interview Briefing] Warning: only ${anticipatedQuestions.length} questions generated`);
    }

    // Ensure each question has keyPhrases array
    for (const q of anticipatedQuestions) {
      if (!Array.isArray(q.keyPhrases)) q.keyPhrases = [];
    }

    console.log(`[Interview Briefing] Generated ${anticipatedQuestions.length} questions, ${questionsToAsk.length} to-ask, ${culturalTips.length} tips`);

    return c.json({ anticipatedQuestions, questionsToAsk, culturalTips });
  } catch (err) {
    console.log("[Interview Briefing Error]", err);
    return c.json({ error: `Interview briefing generation failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// TTS — Text-to-Speech via ElevenLabs (streaming) with OpenAI fallback
// Accepts { text, role } where role controls voice & style:
//   "coach"     → engaged, energetic professional coach
//   "user_line" → dynamic, confident executive delivery
// Returns audio/mpeg stream (chunked transfer for low latency)
// ══════════════════════════════════════════════════════════════

/* ── ElevenLabs voice mapping ── */
const ELEVENLABS_VOICES: Record<string, { voiceId: string; stability: number; similarity: number; style: number }> = {
  coach: {
    voiceId: "Nhs7eitvQWFTQBsf0yiT", // "Sarah" — warm, professional female
    stability: 0.35,      // lower = more expressive/dynamic
    similarity: 0.80,
    style: 0.45,           // higher = more stylistic variation
  },
  user_line: {
    voiceId: "Nhs7eitvQWFTQBsf0yiT", // Same voice for consistency
    stability: 0.40,
    similarity: 0.85,
    style: 0.35,
  },
};

/* ── OpenAI TTS fallback profiles ── */
const TTS_MODEL = "gpt-4o-mini-tts";
const OPENAI_VOICE_PROFILES: Record<string, { voice: string; instructions: string }> = {
  coach: {
    voice: "coral",
    instructions: "You are an enthusiastic and engaging executive English coach. Speak at a brisk, natural conversational pace — the way a sharp, energetic colleague would talk over coffee. Be warm and encouraging with genuine energy in your voice. Vary your intonation naturally: emphasize key words, use rising tones for questions, and let your voice convey real interest and excitement. Do NOT speak slowly or monotonically. Avoid long pauses. Sound like someone who genuinely loves helping people succeed — lively, articulate, and approachable.",
  },
  user_line: {
    voice: "coral",
    instructions: "You are a confident, high-performing business executive delivering lines in a professional setting. Speak at a natural, dynamic pace — not slow or overly deliberate. Project energy and conviction, like someone who is genuinely engaged in the conversation and passionate about their point. Use natural stress patterns and vocal variety. Avoid sounding robotic, flat, or sleepy. Think of a charismatic leader giving a compelling pitch — articulate, direct, and alive with purpose.",
  },
};

app.post("/make-server-08b8658d/tts", async (c) => {
  try {
    const { text, role } = await c.req.json();
    if (!text || typeof text !== "string") {
      return c.json({ error: "Missing 'text' field for TTS" }, 400);
    }

    const effectiveRole = role === "user_line" ? "user_line" : "coach";
    const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");

    // ━━━ PRIMARY: ElevenLabs Streaming ━━━
    if (elevenLabsKey) {
      const profile = ELEVENLABS_VOICES[effectiveRole];
      console.log(`[TTS ElevenLabs] voice=${profile.voiceId}, role=${effectiveRole}, chars=${text.length}`);

      try {
        const elRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${profile.voiceId}/stream`,
          {
            method: "POST",
            headers: {
              "xi-api-key": elevenLabsKey,
              "Content-Type": "application/json",
              "Accept": "audio/mpeg",
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: profile.stability,
                similarity_boost: profile.similarity,
                style: profile.style,
                use_speaker_boost: true,
              },
            }),
          },
        );

        if (elRes.ok && elRes.body) {
          console.log(`[TTS ElevenLabs] ✅ Streaming started — role=${effectiveRole}`);
          // Stream audio directly to client — no buffering for lowest latency
          return new Response(elRes.body, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Transfer-Encoding": "chunked",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=3600",
            },
          });
        }

        // ElevenLabs error — log and fall through to OpenAI
        const errBody = await elRes.text();
        console.warn(`[TTS ElevenLabs] ⚠️ Error ${elRes.status}: ${errBody.slice(0, 200)} — falling back to OpenAI`);
      } catch (elErr) {
        console.warn(`[TTS ElevenLabs] ⚠️ Fetch error: ${elErr} — falling back to OpenAI`);
      }
    }

    // ━━━ FALLBACK: OpenAI gpt-4o-mini-tts ━━━
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return c.json({ error: "No TTS provider configured (ELEVENLABS_API_KEY and OPENAI_API_KEY both missing)" }, 500);
    }

    const oaiProfile = OPENAI_VOICE_PROFILES[effectiveRole];
    console.log(`[TTS OpenAI Fallback] model=${TTS_MODEL}, voice=${oaiProfile.voice}, role=${effectiveRole}, chars=${text.length}`);

    const ttsResponse = await fetch(
      "https://api.openai.com/v1/audio/speech",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: TTS_MODEL,
          voice: oaiProfile.voice,
          input: text,
          instructions: oaiProfile.instructions,
          response_format: "mp3",
        }),
      },
    );

    if (!ttsResponse.ok) {
      const errBody = await ttsResponse.text();
      console.log(`[TTS OpenAI Fallback] Error ${ttsResponse.status}: ${errBody}`);
      return c.json({ error: `OpenAI TTS failed (${ttsResponse.status}): ${errBody}` }, 502);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    console.log(`[TTS OpenAI Fallback] ✅ Audio generated — voice=${oaiProfile.voice}, size=${audioBuffer.byteLength} bytes`);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.log("[TTS Error]", err);
    return c.json({ error: `TTS failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /analyze-cv-match — Analyze CV vs Job Description
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/analyze-cv-match", async (c) => {
  try {
    const body = await c.req.json();
    const { cv, jobDescription } = body;

    if (!cv || !jobDescription) {
      return c.json({ error: "Missing cv or jobDescription" }, 400);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return c.json({ error: "OPENAI_API_KEY not configured on server" }, 500);
    }

    const systemPrompt = buildCvMatchPrompt();
    const userMessage = `=== CV ===\n${cv}\n\n=== JOB DESCRIPTION ===\n${jobDescription}`;

    console.log(`[AnalyzeCVMatch] Calling GPT-4o with prompt (${systemPrompt.length} chars)`);

    const response = await callOpenAIChat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      { temperature: 0.7, max_tokens: 1500, jsonMode: true },
    );

    let feedback;
    try {
      feedback = JSON.parse(response);
    } catch (e) {
      console.log("[AnalyzeCVMatch] Failed to parse JSON response:", response.slice(0, 200));
      return c.json({ error: "Invalid JSON from GPT-4o CV match analysis", raw: response.slice(0, 500) }, 502);
    }

    return c.json(feedback);
  } catch (err) {
    console.error("[AnalyzeCVMatch] Error:", err);
    return c.json({ error: "Internal Server Error in /analyze-cv-match" }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /analyze-feedback — Analyze completed practice session
// Retrieves full conversation history + internalAnalysis from KV,
// calls GPT-4o with the feedback analyst prompt to generate
// real coaching feedback (strengths, opportunities, before/after).
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/analyze-feedback", async (c) => {
  try {
    const fbBody = await c.req.json();
    const { sessionId, scenarioType } = fbBody;
    const fbLocale = fbBody.locale || null;

    if (!sessionId) {
      return c.json({ error: "Missing sessionId for feedback analysis" }, 400);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return c.json({ error: "OPENAI_API_KEY not configured on server" }, 500);
    }

    // Retrieve session from KV
    const raw = await kv.get(`practice:${sessionId}`);
    if (!raw) {
      return c.json({ error: `Session ${sessionId} not found for feedback analysis` }, 404);
    }

    const session = JSON.parse(raw);
    const messages = session.messages || [];
    const internalAnalysis = session.internalAnalysis || [];

    // Gap C: extract briefing data stored during prepare-session
    const sessionBriefing = session.interviewBriefing || null;

    console.log(`[AnalyzeFeedback] Session ${sessionId} | ${messages.length} messages | ${internalAnalysis.length} analysis notes | type=${scenarioType || session.scenarioType} | hasBriefing=${!!sessionBriefing}`);

    // Build the transcript with X-ray vision (internalAnalysis included)
    const transcript = buildTranscriptForAnalyst(messages, internalAnalysis);

    // Build the analyst prompt — inject briefing context for Gap C
    const effectiveScenarioType = scenarioType || session.scenarioType || null;
    const analystSystemPrompt = buildFeedbackAnalystPrompt(effectiveScenarioType, fbLocale, sessionBriefing);

    // Call GPT-4o with the analyst prompt + transcript
    const userMessage = `Here is the complete conversation transcript from a ${scenarioType || session.scenarioType || "interview"} practice session. The interlocutor was: ${session.interlocutor || "unknown"}.

Analyze this conversation and provide structured coaching feedback.

=== CONVERSATION TRANSCRIPT ===
${transcript}`;

    console.log(`[AnalyzeFeedback] Calling GPT-4o with analyst prompt (${analystSystemPrompt.length} chars) + transcript (${transcript.length} chars)`);

    const response = await callOpenAIChat(
      [
        { role: "system", content: analystSystemPrompt },
        { role: "user", content: userMessage },
      ],
      { temperature: 0.7, max_tokens: 2000, jsonMode: true },
    );

    // Parse the response
    let feedback;
    try {
      feedback = JSON.parse(response);
    } catch {
      console.log("[AnalyzeFeedback] Failed to parse JSON response:", response.slice(0, 200));
      return c.json({ error: "Invalid JSON from GPT-4o feedback analysis", raw: response.slice(0, 500) }, 502);
    }

    const strengths = feedback.strengths || [];
    const opportunities = feedback.opportunities || [];
    const beforeAfter = feedback.beforeAfter || [];
    const pillarScores = feedback.pillarScores || null;
    const professionalProficiency = typeof feedback.professionalProficiency === "number" ? feedback.professionalProficiency : null;
    const languageInsights = feedback.languageInsights || null;

    // Interview-specific: Content Quality scoring
    const contentScores = feedback.contentScores || null;
    const interviewReadinessScore = typeof feedback.interviewReadinessScore === "number" ? feedback.interviewReadinessScore : null;
    const contentInsights = feedback.contentInsights || null;

    console.log(`[AnalyzeFeedback] ✅ Generated: ${strengths.length} strengths, ${opportunities.length} opportunities, ${beforeAfter.length} before/after | proficiency=${professionalProficiency}${contentScores ? ` | contentScores=${JSON.stringify(contentScores)} | readiness=${interviewReadinessScore}` : ''}`);

    // ── Persist pillarScores to user profile & session record ──
    try {
      const user = await getAuthUser(c.req.header("Authorization"));
      const userId = user?.id || "anon";

      // 1. Update profile stats with latest pillarScores
      if (pillarScores && Object.keys(pillarScores).length > 0) {
        const profileRaw = await kv.get(`profile:${userId}`);
        const profile = profileRaw
          ? (typeof profileRaw === "string" ? JSON.parse(profileRaw) : profileRaw)
          : { id: userId, stats: {} };
        const prevStats = profile.stats || {};

        // Weighted merge: 70% new + 30% previous (if exists) for smoother progression
        const mergedScores: Record<string, number> = {};
        for (const [key, val] of Object.entries(pillarScores as Record<string, number>)) {
          const prev = prevStats.pillarScores?.[key];
          mergedScores[key] = prev != null
            ? Math.round(0.7 * val + 0.3 * prev)
            : val;
        }

        profile.stats = {
          ...prevStats,
          pillarScores: mergedScores,
          professionalProficiency: professionalProficiency ?? prevStats.professionalProficiency,
          lastFeedbackAt: new Date().toISOString(),
        };
        await kv.set(`profile:${userId}`, JSON.stringify(profile));
        console.log(`[AnalyzeFeedback] 📊 Persisted pillarScores to profile:${userId}`);
      }

      // 2. Save feedback to the stored session record (so Dashboard history can read it)
      const indexRaw = await kv.get(`session_index:${userId}`);
      const sessionIndex: string[] = indexRaw
        ? (typeof indexRaw === "string" ? JSON.parse(indexRaw) : indexRaw)
        : [];
      // Find the most recent session to attach feedback to
      if (sessionIndex.length > 0) {
        const latestKey = `session:${userId}:${sessionIndex[0]}`;
        const sessRaw = await kv.get(latestKey);
        if (sessRaw) {
          const sessRecord = typeof sessRaw === "string" ? JSON.parse(sessRaw) : sessRaw;
          sessRecord.feedback = {
            strengths,
            opportunities,
            beforeAfter,
            pillarScores,
            professionalProficiency,
            ...(contentScores && { contentScores }),
            ...(interviewReadinessScore !== null && { interviewReadinessScore }),
          };
          await kv.set(latestKey, JSON.stringify(sessRecord));
          console.log(`[AnalyzeFeedback] 💾 Saved feedback to session ${sessionIndex[0]}`);
        }
      }
    } catch (persistErr) {
      // Non-blocking: feedback still returned even if persistence fails
      console.log(`[AnalyzeFeedback] ⚠️ Failed to persist scores: ${persistErr}`);
    }

    return c.json({
      strengths,
      opportunities,
      beforeAfter,
      pillarScores,
      professionalProficiency,
      ...(languageInsights && { languageInsights }),
      // Interview-specific fields (null for non-interview scenarios)
      ...(contentScores && { contentScores }),
      ...(interviewReadinessScore !== null && { interviewReadinessScore }),
      ...(contentInsights && { contentInsights }),
      _debug: {
        sessionTurns: session.turnCount,
        analysisNotes: internalAnalysis.length,
        transcriptChars: transcript.length,
      },
    });
  } catch (err) {
    console.log("[AnalyzeFeedback Error]", err);
    return c.json({ error: `Feedback analysis failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /generate-summary — Generate a summary of a practice session
// Retrieves full conversation history + internalAnalysis from KV,
// calls GPT-4o with the summary prompt to generate a concise
// summary of the session.
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/generate-summary", async (c) => {
  try {
    const sumBody = await c.req.json();
    const sessionId = sumBody.sessionId;
    const scenarioType = sumBody.scenarioType;
    const sumLocale = sumBody.locale || null;

    if (!sessionId) {
      return c.json({ error: "Missing sessionId for summary generation" }, 400);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return c.json({ error: "OPENAI_API_KEY not configured on server" }, 500);
    }

    // Retrieve session from KV
    const raw = await kv.get(`practice:${sessionId}`);
    if (!raw) {
      return c.json({ error: `Session ${sessionId} not found for summary generation` }, 404);
    }

    const session = JSON.parse(raw);
    const messages = session.messages || [];
    const internalAnalysis = session.internalAnalysis || [];

    console.log(`[GenerateSummary] Session ${sessionId} | ${messages.length} messages | ${internalAnalysis.length} analysis notes | type=${scenarioType || session.scenarioType}`);

    // Build the transcript with X-ray vision (internalAnalysis included)
    const transcript = buildTranscriptForAnalyst(messages, internalAnalysis);

    // Build the summary prompt
    const summarySystemPrompt = buildSessionSummaryPrompt(sumLocale);

    // Call GPT-4o with the summary prompt + transcript
    const summaryUserMessage = `Here is the complete conversation transcript from a ${scenarioType || session.scenarioType || "interview"} practice session. The interlocutor was: ${session.interlocutor || "unknown"}.

Generate a brief motivating session summary based on this conversation.

=== CONVERSATION TRANSCRIPT ===
${transcript}`;

    console.log(`[GenerateSummary] Calling GPT-4o with summary prompt (${summarySystemPrompt.length} chars) + transcript (${transcript.length} chars)`);

    const response = await callOpenAIChat(
      [
        { role: "system", content: summarySystemPrompt },
        { role: "user", content: summaryUserMessage },
      ],
      { temperature: 0.7, max_tokens: 1500, jsonMode: true },
    );

    // Parse the response
    let summary;
    try {
      summary = JSON.parse(response);
    } catch {
      console.log("[GenerateSummary] Failed to parse JSON response:", response.slice(0, 200));
      return c.json({ error: "Invalid JSON from GPT-4o summary generation", raw: response.slice(0, 500) }, 502);
    }

    const overallSentiment = summary.overallSentiment || "";
    const nextSteps = summary.nextSteps || [];
    const sessionHighlight = summary.sessionHighlight || "";
    const pillarScores = summary.pillarScores || null;
    const professionalProficiency = typeof summary.professionalProficiency === "number" ? summary.professionalProficiency : null;
    const cefrApprox = summary.cefrApprox || null;

    console.log(`[GenerateSummary] ✅ Generated: sentiment="${overallSentiment.slice(0, 50)}...", ${nextSteps.length} next steps | proficiency=${professionalProficiency} CEFR=${cefrApprox}`);

    return c.json({
      overallSentiment,
      nextSteps,
      sessionHighlight,
      pillarScores,
      professionalProficiency,
      cefrApprox,
      _debug: {
        sessionTurns: session.turnCount,
        transcriptChars: transcript.length,
      },
    });
  } catch (err) {
    console.log("[GenerateSummary Error]", err);
    return c.json({ error: `Summary generation failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /pronunciation-assess — Azure Speech Pronunciation Assessment
// Receives audio blob (multipart/form-data) + referenceText,
// calls Azure Cognitive Services Pronunciation Assessment API,
// returns detailed word-level and phoneme-level scores.
// Runs in background (parallel to Whisper) — does NOT block conversation.
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/pronunciation-assess", async (c) => {
  try {
    const azureKey = Deno.env.get("AZURE_SPEECH_KEY");
    const azureRegion = Deno.env.get("AZURE_SPEECH_REGION");

    if (!azureKey || !azureRegion) {
      console.log("[PronunciationAssess] Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION");
      return c.json({ error: "Azure Speech credentials not configured" }, 500);
    }

    // Validate region format — must be a short Azure region name like "brazilsouth", "eastus", etc.
    const regionPattern = /^[a-z]{2,20}[0-9]?$/;
    if (!regionPattern.test(azureRegion)) {
      console.log(`[PronunciationAssess] ❌ Invalid AZURE_SPEECH_REGION format: "${azureRegion.slice(0, 40)}..." — expected a short region name like "brazilsouth"`);
      return c.json({ error: `Invalid AZURE_SPEECH_REGION format. Expected a region name like "brazilsouth", got "${azureRegion.slice(0, 20)}..."` }, 500);
    }

    console.log(`[PronunciationAssess] Using Azure region: "${azureRegion}", key length: ${azureKey.length}`);

    const formData = await c.req.formData();
    const audioFile = formData.get("audio");
    const referenceText = formData.get("referenceText") as string | null;

    if (!audioFile || !(audioFile instanceof File)) {
      return c.json({ error: "Missing 'audio' file in form data" }, 400);
    }

    if (!referenceText || referenceText.trim().length === 0) {
      return c.json({ error: "Missing 'referenceText' — needed for pronunciation assessment" }, 400);
    }

    // Validate minimum audio size (< 2KB usually means empty/corrupt recording)
    if (audioFile.size < 2000) {
      console.log(`[PronunciationAssess] Audio too small: ${audioFile.size} bytes — skipping`);
      return c.json({ error: "Audio recording too short or empty" }, 400);
    }

    console.log(`[PronunciationAssess] Received audio: size=${audioFile.size}, type=${audioFile.type} | ref="${referenceText.slice(0, 80)}..."`);

    // Build Pronunciation Assessment config header (base64-encoded JSON)
    // Use TextEncoder to safely handle non-ASCII characters (btoa only supports ASCII)
    const pronConfig = {
      ReferenceText: referenceText.trim(),
      GradingSystem: "HundredMark",
      Granularity: "Phoneme",
      Dimension: "Comprehensive",
      EnableMiscue: "True",
      EnableProsodyAssessment: "True",
    };
    const pronConfigJson = JSON.stringify(pronConfig);
    const pronConfigBytes = new TextEncoder().encode(pronConfigJson);
    let binaryStr = "";
    for (let i = 0; i < pronConfigBytes.length; i++) {
      binaryStr += String.fromCharCode(pronConfigBytes[i]);
    }
    const pronConfigBase64 = btoa(binaryStr);

    // Determine content type for Azure — prioritize WAV since frontend converts to WAV
    const mimeType = audioFile.type || "audio/webm";
    let azureContentType = "audio/webm; codecs=opus";
    if (mimeType.includes("wav")) {
      azureContentType = "audio/wav";
    } else if (mimeType.includes("ogg")) {
      azureContentType = "audio/ogg; codecs=opus";
    } else if (mimeType.includes("mp4") || mimeType.includes("m4a")) {
      azureContentType = "audio/mp4";
    }

    // Read audio bytes
    const audioBytes = await audioFile.arrayBuffer();

    if (audioBytes.byteLength < 1000) {
      console.log(`[PronunciationAssess] Audio ArrayBuffer too small after read: ${audioBytes.byteLength} bytes`);
      return c.json({ error: "Audio data too small after processing" }, 400);
    }

    // Call Azure Speech Pronunciation Assessment REST API
    const azureUrl = `https://${azureRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`;

    console.log(`[PronunciationAssess] Calling Azure: url=${azureUrl.slice(0, 60)}..., contentType=${azureContentType}, audioSize=${audioBytes.byteLength}`);

    // Retry once on transient failures — including Azure 401 (cold-start auth blip)
    // and 5xx errors. 4xx other than 401 are real client errors, don't retry.
    let azureRes: Response | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        azureRes = await fetch(azureUrl, {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": azureKey,
            "Content-Type": azureContentType,
            "Pronunciation-Assessment": pronConfigBase64,
            "Accept": "application/json",
          },
          body: audioBytes,
        });
        if (azureRes.ok) break;
        // Retry on 401 (transient cold-start) and 5xx; break on other 4xx (real errors)
        const shouldRetry = azureRes.status === 401 || azureRes.status >= 500;
        if (!shouldRetry || attempt > 0) break;
        console.log(`[PronunciationAssess] Azure returned ${azureRes.status} on attempt 1, retrying...`);
        await new Promise(r => setTimeout(r, 600));
      } catch (fetchErr) {
        console.log(`[PronunciationAssess] Fetch attempt ${attempt + 1} failed: ${fetchErr}`);
        if (attempt === 0) {
          await new Promise(r => setTimeout(r, 600));
        } else {
          return c.json({ error: `Azure fetch failed after retry: ${fetchErr}` }, 502);
        }
      }
    }

    if (!azureRes) {
      return c.json({ error: "Azure Speech API unreachable after retries" }, 502);
    }

    if (!azureRes.ok) {
      const errBody = await azureRes.text();
      console.log(`[PronunciationAssess] Azure error ${azureRes.status}: ${errBody}`);
      return c.json({
        error: `Azure Pronunciation Assessment failed (${azureRes.status}): ${errBody.slice(0, 300)}`,
      }, 502);
    }

    const azureResult = await azureRes.json();
    // RAW RESPONSE DEBUG — log full Azure response structure to diagnose 0-score issues
    const rawJson = JSON.stringify(azureResult, null, 2);
    console.log(`[PronunciationAssess] RAW Azure response (first 3000 chars):\n${rawJson.slice(0, 3000)}`);
    console.log(`[PronunciationAssess] Azure response status: ${azureResult.RecognitionStatus}`);

    if (azureResult.RecognitionStatus !== "Success") {
      console.log(`[PronunciationAssess] Recognition failed: ${azureResult.RecognitionStatus}`);
      return c.json({
        error: `Azure recognition status: ${azureResult.RecognitionStatus}`,
        recognitionStatus: azureResult.RecognitionStatus,
      }, 422);
    }

    // Extract the best result
    const nBest = azureResult.NBest?.[0];
    if (!nBest) {
      return c.json({ error: "No pronunciation assessment results returned" }, 502);
    }

    // Azure REST API returns scores FLAT on nBest (not nested under PronunciationAssessment)
    // SDK uses nBest.PronunciationAssessment.AccuracyScore, but REST API uses nBest.AccuracyScore
    const pronAssessment = nBest.PronunciationAssessment || {};
    const getScore = (field: string) => pronAssessment[field] ?? nBest[field] ?? 0;

    // ── Strictness Curve ─────────────────────────────────────────
    // Azure Speech is designed for language learners and inflates scores.
    // We apply a power curve to bring scores closer to professional-level
    // expectations: adjustedScore = 100 × (rawScore / 100) ^ STRICTNESS
    // Exponent 1.6 = "strict" — e.g. Azure 78% → 66%, 90% → 83%, 50% → 33%
    const STRICTNESS_EXPONENT = 1.6;
    const adjustScore = (raw: number): number =>
      Math.round(100 * Math.pow(Math.max(0, Math.min(100, raw)) / 100, STRICTNESS_EXPONENT));

    console.log(`[PronunciationAssess] nBest keys: ${Object.keys(nBest).join(', ')}`);
    console.log(`[PronunciationAssess] RAW scores: Acc=${getScore("AccuracyScore")} Flu=${getScore("FluencyScore")} Pros=${getScore("ProsodyScore")} Comp=${getScore("CompletenessScore")} Pron=${getScore("PronScore")}`);
    console.log(`[PronunciationAssess] ADJUSTED (×${STRICTNESS_EXPONENT}): Acc=${adjustScore(getScore("AccuracyScore"))} Flu=${adjustScore(getScore("FluencyScore"))} Pros=${adjustScore(getScore("ProsodyScore"))} Comp=${adjustScore(getScore("CompletenessScore"))} Pron=${adjustScore(getScore("PronScore"))}`);

    // Build word-level results — REST API puts scores flat on word, not nested
    // Apply strictness curve to word-level and phoneme-level scores too
    const words = (nBest.Words || []).map((w: any) => {
      const wa = w.PronunciationAssessment || {};
      const rawWordScore = wa.AccuracyScore ?? w.AccuracyScore ?? 0;
      return {
        word: w.Word || "",
        accuracyScore: adjustScore(rawWordScore),
        errorType: wa.ErrorType ?? w.ErrorType ?? "None",
        phonemes: (w.Phonemes || []).map((p: any) => ({
          phoneme: p.Phoneme || "",
          accuracyScore: adjustScore(p.PronunciationAssessment?.AccuracyScore ?? p.AccuracyScore ?? 0),
        })),
        feedback: w.Feedback || null,
      };
    });

    // Count problem words (score < 70 AFTER strictness adjustment)
    const problemWords = words.filter((w: any) => w.accuracyScore < 70);

    const result = {
      // Overall scores (0-100) — adjusted with strictness curve
      accuracyScore: adjustScore(getScore("AccuracyScore")),
      fluencyScore: adjustScore(getScore("FluencyScore")),
      completenessScore: adjustScore(getScore("CompletenessScore")),
      prosodyScore: adjustScore(getScore("ProsodyScore")),
      pronScore: adjustScore(getScore("PronScore")),
      // Word-level detail
      words,
      // Recognized text (Azure's own recognition)
      recognizedText: nBest.Display || nBest.Lexical || "",
      // Summary stats
      wordCount: words.length,
      problemWordCount: problemWords.length,
    };

    console.log(`[PronunciationAssess] ✅ FINAL (adjusted): accuracy=${result.accuracyScore} fluency=${result.fluencyScore} prosody=${result.prosodyScore} completeness=${result.completenessScore} | ${result.wordCount} words, ${result.problemWordCount} problems`);

    return c.json(result);
  } catch (err) {
    console.log("[PronunciationAssess Error]", err);
    return c.json({ error: `Pronunciation assessment failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /save-pronunciation — Persist pronunciation data for a session
// Stores turn-level Azure assessment data in KV for:
//   1. Post-session Pronunciation Replay tab
//   2. Dashboard longitudinal Professional Vocabulary Tracker
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/save-pronunciation", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";

    const { sessionId, turns } = await c.req.json();

    if (!sessionId) {
      return c.json({ error: "Missing sessionId for pronunciation save" }, 400);
    }
    if (!Array.isArray(turns) || turns.length === 0) {
      return c.json({ error: "No pronunciation turn data to save" }, 400);
    }

    // Compute session-level aggregates
    const avgAccuracy = turns.reduce((sum: number, t: any) => sum + (t.assessment?.accuracyScore ?? 0), 0) / turns.length;
    const avgFluency = turns.reduce((sum: number, t: any) => sum + (t.assessment?.fluencyScore ?? 0), 0) / turns.length;
    const avgProsody = turns.reduce((sum: number, t: any) => sum + (t.assessment?.prosodyScore ?? 0), 0) / turns.length;

    const pronRecord = {
      sessionId,
      userId,
      turns,
      sessionAccuracy: Math.round(avgAccuracy * 10) / 10,
      sessionFluency: Math.round(avgFluency * 10) / 10,
      sessionProsody: Math.round(avgProsody * 10) / 10,
      savedAt: new Date().toISOString(),
    };

    // Store pronunciation data keyed by session
    await kv.set(`pronunciation:${userId}:${sessionId}`, JSON.stringify(pronRecord));

    // Update pronunciation index for this user (for Dashboard longitudinal tracker)
    const indexRaw = await kv.get(`pronunciation_index:${userId}`);
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    if (!index.includes(sessionId)) {
      index.unshift(sessionId);
    }
    await kv.set(`pronunciation_index:${userId}`, JSON.stringify(index));

    // Aggregate problem words into the vocabulary tracker
    // Collect all problem words (score < 70) across all turns
    const allProblemWords: Array<{ word: string; score: number }> = [];
    for (const turn of turns) {
      const words = turn.assessment?.words || [];
      for (const w of words) {
        if (w.accuracyScore < 70 && w.errorType !== "Insertion") {
          allProblemWords.push({ word: w.word.toLowerCase(), score: w.accuracyScore });
        }
      }
    }

    // Update vocabulary tracker
    if (allProblemWords.length > 0) {
      const vocabRaw = await kv.get(`vocab_tracker:${userId}`);
      const vocab: Record<string, any> = vocabRaw ? JSON.parse(vocabRaw) : {};

      for (const pw of allProblemWords) {
        const existing = vocab[pw.word];
        if (existing) {
          existing.totalAttempts += 1;
          existing.scores.push(pw.score);
          // Keep last 20 scores
          if (existing.scores.length > 20) existing.scores = existing.scores.slice(-20);
          existing.currentScore = pw.score;
          // Determine trend
          const recent = existing.scores.slice(-3);
          const avg = recent.reduce((s: number, v: number) => s + v, 0) / recent.length;
          const prevAvg = existing.scores.length > 3
            ? existing.scores.slice(-6, -3).reduce((s: number, v: number) => s + v, 0) / Math.min(3, existing.scores.slice(-6, -3).length)
            : avg;
          existing.trend = avg > prevAvg + 5 ? "improving" : avg < prevAvg - 5 ? "declining" : "stable";
          // Mastery level
          if (avg >= 85) existing.mastery = "mastered";
          else if (avg >= 60) existing.mastery = "practicing";
          else existing.mastery = "learning";
          existing.lastPracticed = new Date().toISOString();
        } else {
          vocab[pw.word] = {
            word: pw.word,
            category: "Communication", // Default — can be refined by GPT-4o later
            totalAttempts: 1,
            scores: [pw.score],
            currentScore: pw.score,
            trend: "stable",
            mastery: pw.score >= 60 ? "practicing" : "learning",
            lastPracticed: new Date().toISOString(),
          };
        }
      }

      await kv.set(`vocab_tracker:${userId}`, JSON.stringify(vocab));
      console.log(`[SavePronunciation] Updated vocab tracker: ${allProblemWords.length} problem words, ${Object.keys(vocab).length} total vocab entries`);

      // Fire-and-forget: GPT-4o categorization for uncategorized words
      const uncategorized = Object.values(vocab)
        .filter((v: any) => v.category === "Communication" && v.totalAttempts <= 2)
        .map((v: any) => v.word)
        .slice(0, 30);

      if (uncategorized.length > 0) {
        (async () => {
          try {
            const catPrompt = `You are a vocabulary classifier for a professional English coaching app targeting LATAM nearshoring professionals.

Classify each word into EXACTLY one category:
- "Technical" — IT, engineering, software, data terms (e.g. infrastructure, scalable, deployment, API)
- "Business" — Finance, strategy, operations, sales terms (e.g. revenue, pipeline, stakeholder, ROI)
- "Leadership" — Management, team, decision-making terms (e.g. delegate, alignment, accountability)
- "Communication" — General professional communication (e.g. regarding, approximately, nevertheless)

Words to classify: ${JSON.stringify(uncategorized)}

Respond with a JSON object where keys are words and values are categories. Example:
{"infrastructure": "Technical", "revenue": "Business", "delegate": "Leadership"}`;

            const raw = await callOpenAIChat(
              [{ role: "user", content: catPrompt }],
              { temperature: 0.2, max_tokens: 300, jsonMode: true }
            );
            const categories = JSON.parse(raw);
            const validCats = new Set(["Technical", "Business", "Leadership", "Communication"]);

            let updated = 0;
            for (const [word, cat] of Object.entries(categories)) {
              if (vocab[word] && validCats.has(cat as string)) {
                vocab[word].category = cat;
                updated++;
              }
            }

            if (updated > 0) {
              await kv.set(`vocab_tracker:${userId}`, JSON.stringify(vocab));
              console.log(`[SavePronunciation] GPT-4o categorized ${updated}/${uncategorized.length} words`);
            }
          } catch (catErr) {
            console.log("[SavePronunciation] GPT-4o categorization failed (non-blocking):", catErr);
          }
        })();
      }
    }

    console.log(`[SavePronunciation] ✅ Saved ${turns.length} turns for session ${sessionId} | accuracy=${pronRecord.sessionAccuracy} fluency=${pronRecord.sessionFluency} prosody=${pronRecord.sessionProsody}`);

    return c.json({
      status: "saved",
      sessionId,
      turnCount: turns.length,
      sessionAccuracy: pronRecord.sessionAccuracy,
      sessionFluency: pronRecord.sessionFluency,
      sessionProsody: pronRecord.sessionProsody,
    });
  } catch (err) {
    console.log("[SavePronunciation Error]", err);
    return c.json({ error: `Failed to save pronunciation data: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /vocab-tracker — Retrieve longitudinal vocabulary pronunciation data
// Returns all tracked words with scores, trends, and mastery levels
// for the authenticated user's Dashboard Vocabulary Tracker widget.
// ═══════════════════════════════════════════════════════════════
app.get("/make-server-08b8658d/vocab-tracker", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";

    const vocabRaw = await kv.get(`vocab_tracker:${userId}`);
    if (!vocabRaw) {
      console.log(`[VocabTracker] No vocab data found for user ${userId}`);
      return c.json({ entries: [], totalWords: 0 });
    }

    const vocab: Record<string, any> = JSON.parse(vocabRaw);
    const entries = Object.values(vocab);

    // Sort by lastPracticed (most recent first)
    entries.sort((a: any, b: any) =>
      new Date(b.lastPracticed).getTime() - new Date(a.lastPracticed).getTime()
    );

    // Compute summary stats
    const totalWords = entries.length;
    const mastered = entries.filter((e: any) => e.mastery === "mastered").length;
    const practicing = entries.filter((e: any) => e.mastery === "practicing").length;
    const learning = entries.filter((e: any) => e.mastery === "learning").length;
    const improving = entries.filter((e: any) => e.trend === "improving").length;
    const declining = entries.filter((e: any) => e.trend === "declining").length;

    // Category counts
    const categoryCounts: Record<string, number> = {};
    for (const e of entries) {
      const cat = (e as any).category || "Communication";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    // Words at risk (declining trend, ordered by score ascending)
    const atRisk = entries
      .filter((e: any) => e.trend === "declining")
      .sort((a: any, b: any) => a.currentScore - b.currentScore)
      .slice(0, 5)
      .map((e: any) => ({ word: e.word, currentScore: e.currentScore, category: e.category }));

    console.log(
      `[VocabTracker] ✅ Returning ${totalWords} vocab entries for user ${userId} | mastered=${mastered} practicing=${practicing} learning=${learning} declining=${declining}`
    );

    return c.json({
      entries,
      totalWords,
      mastered,
      practicing,
      learning,
      improving,
      declining,
      categoryCounts,
      atRisk,
    });
  } catch (err) {
    console.log("[VocabTracker Error]", err);
    return c.json({ error: `Failed to fetch vocab tracker: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// Spaced Repetition — GET: retrieve user's SR phrases
// ═══════════════════════���═══════════════════════════════════════
app.get("/make-server-08b8658d/spaced-repetition", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";

    const raw = await kv.get(`sr_phrases:${userId}`);
    if (!raw) {
      console.log(`[SpacedRepetition] No SR data found for user ${userId}`);
      return c.json({ phrases: [] });
    }

    const phrases = JSON.parse(raw);
    console.log(`[SpacedRepetition] Returning ${Array.isArray(phrases) ? phrases.length : 0} SR phrases for user ${userId}`);
    return c.json({ phrases: Array.isArray(phrases) ? phrases : [] });
  } catch (err) {
    console.log("[SpacedRepetition GET Error]", err);
    return c.json({ error: `Failed to fetch SR phrases: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// Spaced Repetition — POST: save/update user's SR phrases
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/spaced-repetition", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";

    const body = await c.req.json();
    const { phrases } = body;

    if (!Array.isArray(phrases)) {
      return c.json({ error: "phrases must be an array" }, 400);
    }

    // Enforce max 10 active phrases (box < 4)
    const active = phrases.filter((p: any) => p.box < 4);
    const mastered = phrases.filter((p: any) => p.box >= 4);

    let toStore = phrases;
    if (active.length > 10) {
      const sorted = [...active].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const kept = sorted.slice(0, 10);
      const archived = sorted.slice(10).map((p: any) => ({
        ...p,
        box: 4,
        nextReviewDate: "9999-12-31",
      }));
      toStore = [...kept, ...archived, ...mastered];
    }

    await kv.set(`sr_phrases:${userId}`, JSON.stringify(toStore));
    console.log(`[SpacedRepetition] Saved ${toStore.length} SR phrases for user ${userId} (${active.length > 10 ? 10 : active.length} active)`);

    return c.json({ status: "ok", saved: toStore.length });
  } catch (err) {
    console.log("[SpacedRepetition POST Error]", err);
    return c.json({ error: `Failed to save SR phrases: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// Process CV — Extract text from uploaded PDF via GPT-4o
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/process-cv", async (c) => {
  try {
    const contentType = c.req.header("Content-Type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return c.json({ error: "Expected multipart/form-data with a PDF file" }, 400);
    }

    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided in form data" }, 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: "File size exceeds 5MB limit" }, 400);
    }

    console.log(`[ProcessCV] Received file: ${file.name} (${file.size} bytes, type: ${file.type})`);

    // Detect document type from form field (default: cv)
    const docType = (formData.get("type") as string) || "cv";

    // Read file as base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    // Send to GPT-4o to extract and summarize CV content
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: docType === "deck"
              ? `You are a sales deck content extractor. Extract ALL the actual content and data from this presentation PDF. Return the full text organized by slide or section. Include:
- Slide titles and all bullet points verbatim
- Statistics, metrics, and data points (revenue, growth %, customer counts, etc.)
- Value propositions and key messaging
- Pricing information, plans, or packages
- Case studies, testimonials, and social proof
- Product features and differentiators
- Competitive comparisons
- Call to action and next steps

Do NOT summarize or interpret — extract the actual content as written in the deck. Preserve numbers, names, and specific claims. Organize by slide/section with clear headers. Be thorough — include everything.`
              : `You are a CV/resume parser. Extract the key professional information from the uploaded PDF and return a concise summary in English that includes:
- Current/most recent role and company
- Years of experience
- Key skills and technologies
- Notable achievements with metrics
- Education highlights
- Industries worked in

Format as a clean, readable paragraph (not bullet points). Keep it under 500 words. Focus on information relevant for job interviews.`,
          },
          {
            role: "user",
            content: [
              {
                type: "file",
                file: {
                  filename: file.name,
                  file_data: `data:application/pdf;base64,${base64}`,
                },
              },
              {
                type: "text",
                text: docType === "deck"
                  ? "Extract ALL the content from this sales/pitch deck. Include every slide's text, data points, and key information."
                  : "Please extract and summarize the key professional information from this CV/resume.",
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.2,
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      console.log(`[ProcessCV] OpenAI error ${openaiRes.status}: ${errBody}`);
      return c.json({ error: `OpenAI API error (${openaiRes.status}): ${errBody.slice(0, 200)}` }, 502);
    }

    const openaiData = await openaiRes.json();
    const summary = openaiData.choices?.[0]?.message?.content?.trim() || "";

    if (!summary) {
      console.log("[ProcessCV] OpenAI returned empty content");
      return c.json({ error: "Could not extract text from the CV" }, 422);
    }

    console.log(`[ProcessCV] ✅ Extracted ${summary.length} chars from CV`);
    return c.json({ summary, fileName: file.name });
  } catch (err) {
    console.log("[ProcessCV Error]", err);
    return c.json({ error: `Failed to process CV: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// SR CARDS — Spaced Repetition CRUD
// KV key: sr_cards:{userId} → JSON array of card objects
// ═══════════════════════════════════════════════════════════════

const SR_INTERVALS = [
  { step: 1, days: 1, label: "24h" },
  { step: 2, days: 3, label: "3 days" },
  { step: 3, days: 7, label: "1 week" },
  { step: 4, days: 14, label: "2 weeks" },
];
const MIN_PASSING_SCORE = 80;
const MAX_DAILY_CARDS = 5;

async function getSRCards(userId: string): Promise<any[]> {
  const raw = await kv.get(`sr_cards:${userId}`);
  if (!raw) return [];
  return typeof raw === "string" ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
}

async function saveSRCards(userId: string, cards: any[]): Promise<void> {
  await kv.set(`sr_cards:${userId}`, JSON.stringify(cards));
}

// GET /sr-cards — List all SR cards for the authenticated user
app.get("/make-server-08b8658d/sr-cards", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";
    const cards = await getSRCards(userId);
    return c.json({ cards });
  } catch (err) {
    console.log("[SR Cards GET Error]", err);
    return c.json({ error: `Failed to get SR cards: ${err}` }, 500);
  }
});

// GET /sr-cards/today — Get today's review cards
app.get("/make-server-08b8658d/sr-cards/today", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";
    const cards = await getSRCards(userId);
    const now = Date.now();
    const dueCards = cards
      .filter((card: any) => !card.nextReviewAt || new Date(card.nextReviewAt).getTime() <= now)
      .sort((a: any, b: any) => (a.lastScore || 0) - (b.lastScore || 0))
      .slice(0, MAX_DAILY_CARDS);
    return c.json({ cards: dueCards });
  } catch (err) {
    console.log("[SR Cards Today Error]", err);
    return c.json({ error: `Failed to get today's SR cards: ${err}` }, 500);
  }
});

// POST /sr-cards — Add new SR cards (from session or arena)
app.post("/make-server-08b8658d/sr-cards", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";
    const body = await c.req.json();
    const newCards: any[] = body.cards || [];

    if (newCards.length === 0) {
      return c.json({ error: "No cards provided" }, 400);
    }

    const existing = await getSRCards(userId);
    const existingPhrases = new Set(existing.map((c: any) => c.phrase?.toLowerCase()));

    const added: any[] = [];
    for (const card of newCards) {
      if (existingPhrases.has(card.phrase?.toLowerCase())) continue; // dedup
      const srCard = {
        id: `sr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        phrase: card.phrase || "",
        word: card.word || card.phrase?.split(" ").slice(0, 3).join(" ") || "",
        phonetic: card.phonetic || "",
        lastScore: 0,
        intervalStep: 1,
        nextReviewAt: new Date().toISOString(),
        origin: card.origin || "Session",
        createdAt: new Date().toISOString(),
      };
      existing.push(srCard);
      added.push(srCard);
    }

    await saveSRCards(userId, existing);
    console.log(`[SR Cards] Added ${added.length} cards for user ${userId} (total: ${existing.length})`);
    return c.json({ status: "added", cards: added, total: existing.length });
  } catch (err) {
    console.log("[SR Cards POST Error]", err);
    return c.json({ error: `Failed to add SR cards: ${err}` }, 500);
  }
});

// POST /sr-cards/attempt — Submit a pronunciation attempt for a card
app.post("/make-server-08b8658d/sr-cards/attempt", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";
    const { cardId, score } = await c.req.json();

    if (!cardId || typeof score !== "number") {
      return c.json({ error: "Missing cardId or score" }, 400);
    }

    const cards = await getSRCards(userId);
    const card = cards.find((c: any) => c.id === cardId);
    if (!card) {
      return c.json({ error: `Card ${cardId} not found` }, 404);
    }

    const passed = score >= MIN_PASSING_SCORE;
    card.lastScore = Math.max(card.lastScore || 0, score);

    if (passed) {
      card.intervalStep = Math.min((card.intervalStep || 1) + 1, SR_INTERVALS.length);
    }

    // Calculate next review date
    const interval = SR_INTERVALS.find((iv: any) => iv.step === card.intervalStep) || SR_INTERVALS[0];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval.days);
    card.nextReviewAt = nextDate.toISOString();

    await saveSRCards(userId, cards);

    const nextInterval = passed
      ? (SR_INTERVALS.find((iv: any) => iv.step === card.intervalStep)?.label || "mastered")
      : interval.label;

    console.log(`[SR Cards] Attempt on ${cardId}: score=${score} passed=${passed} next=${nextInterval}`);
    return c.json({ cardId, score, passed, nextInterval });
  } catch (err) {
    console.log("[SR Cards Attempt Error]", err);
    return c.json({ error: `Failed to submit attempt: ${err}` }, 500);
  }
});

// DELETE /sr-cards/:id — Remove a mastered/dismissed card
app.delete("/make-server-08b8658d/sr-cards/:id", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";
    const cardId = c.req.param("id");

    const cards = await getSRCards(userId);
    const filtered = cards.filter((c: any) => c.id !== cardId);

    if (filtered.length === cards.length) {
      return c.json({ error: `Card ${cardId} not found` }, 404);
    }

    await saveSRCards(userId, filtered);
    console.log(`[SR Cards] Deleted ${cardId} for user ${userId} (remaining: ${filtered.length})`);
    return c.json({ status: "deleted", remaining: filtered.length });
  } catch (err) {
    console.log("[SR Cards DELETE Error]", err);
    return c.json({ error: `Failed to delete SR card: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// LESSON PROGRESS — Track completed micro-lessons
// Stored in profile.stats.completedLessons (array of lesson IDs)
// ═══════════════════════════════════════════════════════════════

// GET /lesson-progress — Get completed lesson IDs
app.get("/make-server-08b8658d/lesson-progress", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";
    const raw = await kv.get(`profile:${userId}`);
    const profile = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : {};
    const completed = profile?.stats?.completedLessons || [];
    return c.json({ completedLessons: completed });
  } catch (err) {
    console.log("[Lesson Progress GET Error]", err);
    return c.json({ error: `Failed to get lesson progress: ${err}` }, 500);
  }
});

// POST /lesson-progress — Mark a lesson as completed
app.post("/make-server-08b8658d/lesson-progress", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const userId = user?.id || "anon";
    const { lessonId } = await c.req.json();

    if (!lessonId) {
      return c.json({ error: "Missing lessonId" }, 400);
    }

    const raw = await kv.get(`profile:${userId}`);
    const profile = raw
      ? (typeof raw === "string" ? JSON.parse(raw) : raw)
      : { id: userId, stats: {} };

    const stats = profile.stats || {};
    const completed: string[] = stats.completedLessons || [];

    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
      stats.completedLessons = completed;
      profile.stats = stats;
      await kv.set(`profile:${userId}`, JSON.stringify(profile));
      console.log(`[Lesson Progress] ✅ Marked ${lessonId} complete for user ${userId} (total: ${completed.length})`);
    }

    return c.json({ status: "ok", completedLessons: completed });
  } catch (err) {
    console.log("[Lesson Progress POST Error]", err);
    return c.json({ error: `Failed to mark lesson complete: ${err}` }, 500);
  }
});

/* ══════════════════════════════════════════════════════════════
   ADMIN ENDPOINTS — Internal dashboard for inFluentia team
   Protected by email whitelist (ADMIN_EMAILS env var)
   ══════════════════════════════════════════════════════════════ */

const ADMIN_EMAILS_RAW = Deno.env.get("ADMIN_EMAILS") || "";
const ADMIN_EMAILS = ADMIN_EMAILS_RAW
  ? ADMIN_EMAILS_RAW.split(",").map((e: string) => e.trim().toLowerCase())
  : [];

/** Middleware: require admin email */
async function requireAdmin(c: any, next: any) {
  try {
    const authHeader = c.req.header("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return c.json({ error: "Unauthorized" }, 401);

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );
    const { data: { user }, error } = await adminSupabase.auth.getUser(token);
    if (error || !user?.email) return c.json({ error: "Unauthorized" }, 401);

    const email = user.email.toLowerCase();
    if (!ADMIN_EMAILS.includes(email)) {
      console.log(`[Admin] Access denied for ${email}`);
      return c.json({ error: "Forbidden — not an admin" }, 403);
    }

    c.set("adminEmail", email);
    await next();
  } catch (err: any) {
    console.log("[Admin] Auth error:", err);
    return c.json({ error: "Unauthorized" }, 401);
  }
}

app.use("/make-server-08b8658d/admin/*", requireAdmin);

/** GET /admin/users — List all user profiles with stats */
app.get("/make-server-08b8658d/admin/users", async (c: any) => {
  try {
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );

    const { data: profileRows, error } = await adminSupabase
      .from("kv_store_4e8a5b39")
      .select("key, value")
      .like("key", "profile:%");
    if (error) throw error;

    const { data: { users: authUsers } } = await adminSupabase.auth.admin.listUsers();
    const authMap = new Map();
    for (const u of authUsers || []) {
      authMap.set(u.id, {
        email: u.email || "",
        name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "",
        created_at: u.created_at || "",
        last_sign_in_at: u.last_sign_in_at || "",
      });
    }

    const users = (profileRows || []).map((row: any) => {
      const userId = row.key.replace("profile:", "");
      const profile = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
      const stats = profile.stats || {};
      const auth = authMap.get(userId);
      return {
        id: userId,
        email: auth?.email || profile.email || "",
        displayName: auth?.name || profile.display_name || userId.slice(0, 8),
        createdAt: auth?.created_at || profile.created_at || "",
        lastSignIn: auth?.last_sign_in_at || "",
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
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
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
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
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

Deno.serve({
  onError(err) {
    const msg = String(err);
    if (msg.includes("connection closed") || msg.includes("broken pipe")) {
      console.log(`[Deno.serve] Client disconnected (non-fatal): ${msg.slice(0, 120)}`);
      return new Response("Client disconnected", { status: 499 });
    }
    console.log(`[Deno.serve] Transport error: ${msg}`);
    return new Response("Internal Server Error", { status: 500 });
  },
}, app.fetch);