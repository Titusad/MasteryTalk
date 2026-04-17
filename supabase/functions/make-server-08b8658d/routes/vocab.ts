import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import { getAuthUser, callOpenAIChat, logApiUsage } from "../_shared.ts";

const app = new Hono();

app.get("/make-server-08b8658d/vocab-tracker", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;

    const vocabRaw = await kv.get(`vocab_tracker:${userId}`);
    if (!vocabRaw) {
      console.log(`[VocabTracker] No vocab data found for user ${userId}`);
      return c.json({ entries: [], totalWords: 0 });
    }

    const vocab: Record<string, any> = vocabRaw;
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
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;

    const raw = await kv.get(`sr_phrases:${userId}`);
    if (!raw) {
      console.log(`[SpacedRepetition] No SR data found for user ${userId}`);
      return c.json({ phrases: [] });
    }

    const phrases = raw;
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
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;

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

    await kv.set(`sr_phrases:${userId}`, toStore);
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
    const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
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
  await kv.set(`sr_cards:${userId}`, cards);
}

// GET /sr-cards — List all SR cards for the authenticated user
app.get("/make-server-08b8658d/sr-cards", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;
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
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;
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
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;
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
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;
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
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;
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
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;
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
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;
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
      await kv.set(`profile:${userId}`, profile);
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

const ADMIN_EMAILS_RAW = (globalThis as any).Deno.env.get("ADMIN_EMAILS") || "";
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
      (globalThis as any).Deno.env.get("SUPABASE_URL"),
      (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
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

/** GET /admin/users — List ALL registered users (Auth) with KV profile stats */

export default app;
