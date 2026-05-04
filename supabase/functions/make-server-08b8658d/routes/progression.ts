import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import { getAuthUser, callOpenAIChat } from "../_shared.ts";
import { LEVEL_TITLES, NEXT_LEVEL, getDefaultProgressionState, getDomainLabel } from "../data/level-maps.ts";

const app = new Hono();

app.get("/make-server-08b8658d/progression", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const raw = await kv.get(`progression:${user.id}`);
    const defaults = getDefaultProgressionState();

    let merged: Record<string, any>;
    if (!raw) {
      merged = { ...defaults };
    } else {
      const saved = typeof raw === "string" ? JSON.parse(raw) : raw;
      merged = { ...defaults, ...saved };
      for (const key of Object.keys(defaults)) {
        if (key === "activeGoal") continue;
        if (!saved[key]) {
          merged[key] = defaults[key as keyof typeof defaults];
        }
      }
    }

    const profileRaw = await kv.get(`profile:${user.id}`);
    const profile = profileRaw
      ? (typeof profileRaw === "string" ? JSON.parse(profileRaw) : profileRaw)
      : null;

    if (profile?.subscription_active) {
      const primaryPath: string | null = profile.primary_path || null;

      if (!primaryPath) {
        // Legacy subscriber (subscribed before primary_path model) — grant full access
        for (const key of Object.keys(merged)) {
          if (key === "activeGoal" || key === "unlocked_paths") continue;
          const pathState = merged[key] as Record<string, { status: string }>;
          if (typeof pathState === "object" && pathState !== null) {
            for (const levelId of Object.keys(pathState)) {
              if (pathState[levelId]?.status === "locked") {
                pathState[levelId] = { ...pathState[levelId], status: "unlocked" };
              }
            }
          }
        }
        console.log(`[Progression GET] legacy subscriber — full access granted for ${user.id}`);
      } else {
        // Progressive model — unlock primary_path + self-intro + any user-chosen unlocked paths
        const additionalPaths: string[] = merged.unlocked_paths || [];
        const pathsToUnlock = new Set(["self-intro", primaryPath, ...additionalPaths]);

        for (const key of Object.keys(merged)) {
          if (key === "activeGoal" || key === "unlocked_paths") continue;
          const pathState = merged[key] as Record<string, { status: string }>;
          if (typeof pathState === "object" && pathState !== null && pathsToUnlock.has(key)) {
            for (const levelId of Object.keys(pathState)) {
              if (pathState[levelId]?.status === "locked") {
                pathState[levelId] = { ...pathState[levelId], status: "unlocked" };
              }
            }
          }
        }
        console.log(`[Progression GET] progressive unlock — paths: [${[...pathsToUnlock].join(", ")}] for ${user.id}`);
      }
    }

    return c.json(merged);
  } catch (err) {
    console.log("[Progression GET] Error:", err);
    return c.json({ error: `Failed to fetch progression: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /progression/unlock-path
// Called when user picks their next path after completing the current one.
// Validates subscription + adds pathId to unlocked_paths[].
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/progression/unlock-path", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { pathId } = await c.req.json();
    if (!pathId) return c.json({ error: "Missing pathId" }, 400);

    const profileRaw = await kv.get(`profile:${user.id}`);
    const profile = profileRaw
      ? (typeof profileRaw === "string" ? JSON.parse(profileRaw) : profileRaw)
      : null;

    if (!profile?.subscription_active) {
      return c.json({ error: "Active subscription required" }, 403);
    }

    const progRaw = await kv.get(`progression:${user.id}`);
    const state = progRaw
      ? (typeof progRaw === "string" ? JSON.parse(progRaw) : progRaw)
      : getDefaultProgressionState();

    // Add path to unlocked list (deduplicated)
    const currentUnlocked: string[] = state.unlocked_paths || [];
    if (!currentUnlocked.includes(pathId)) {
      state.unlocked_paths = [...currentUnlocked, pathId];
    }

    // Unlock level 1 of the new path (first level of pathState)
    const pathState = state[pathId] as Record<string, { status: string }> | undefined;
    if (pathState) {
      const levelIds = Object.keys(pathState);
      if (levelIds.length > 0) {
        const firstLevel = levelIds[0];
        if (pathState[firstLevel]?.status === "locked") {
          pathState[firstLevel] = { ...pathState[firstLevel], status: "unlocked" };
        }
        state[pathId] = pathState;
      }
    }

    state.activeGoal = pathId;
    await kv.set(`progression:${user.id}`, state);

    console.log(`[Progression] ✅ Path unlocked: ${pathId} for user ${user.id}`);
    return c.json({ success: true, unlockedPath: pathId, state });
  } catch (err) {
    console.log("[Progression unlock-path] Error:", err);
    return c.json({ error: `Failed to unlock path: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// Progression Tree — GET /progression/remedial
// Fetch remedial content for a specific level
// ═══════════════════════════════════════════════════════════════
app.get("/make-server-08b8658d/progression/remedial", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const pathId = c.req.query("pathId");
    const levelId = c.req.query("levelId");
    if (!pathId || !levelId) {
      return c.json({ error: "Missing pathId or levelId" }, 400);
    }

    const remedialKey = `remedial:${user.id}:${levelId}`;
    const remedialRaw = await kv.get(remedialKey);

    if (!remedialRaw) {
      return c.json({ error: "No remedial content found" }, 404);
    }

    return c.json(JSON.parse(remedialRaw));
  } catch (err) {
    console.log("[Progression get-remedial] Error:", err);
    return c.json({ error: `Failed to fetch remedial content: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// Progression Tree — POST /progression/complete-level
// Record level score + generate AI remedial content via GPT-4o-mini
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/progression/complete-level", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { pathId, levelId, score, pillarScores, transcript } = await c.req.json();
    if (!pathId || !levelId) {
      return c.json({ error: "Missing pathId or levelId" }, 400);
    }

    const numScore = typeof score === "number" ? Math.round(score) : 0;

    // 1. Update progression state
    const progRaw = await kv.get(`progression:${user.id}`);
    const state = progRaw
      ? (typeof progRaw === "string" ? JSON.parse(progRaw) : progRaw)
      : getDefaultProgressionState();

    const pathState = state[pathId] || {};
    const current = pathState[levelId] || { status: "unlocked" };
    const attempts = (current.attempts || 0) + 1;
    const bestScore = Math.max(current.bestScore || 0, numScore);

    // If level was already in 'study' status, this re-practice completes it
    // (replaces the old LevelDrawer complete-lesson flow)
    const wasStudy = current.status === "study";
    const newStatus = wasStudy ? "completed" : "study";

    pathState[levelId] = {
      ...current,
      status: newStatus as "study" | "completed",
      bestScore,
      attempts,
      remedialCompleted: wasStudy,
    };

    // If completing from study, unlock next level
    if (wasStudy) {
      const nextId = NEXT_LEVEL[levelId];
      if (nextId && pathState[nextId]?.status === "locked") {
        pathState[nextId] = { ...pathState[nextId], status: "unlocked" };
        console.log(`[Progression] ✅ Study→Completed: ${levelId}. Next level ${nextId} unlocked.`);
      }
    }

    state[pathId] = pathState;
    state.activeGoal = pathId;
    await kv.set(`progression:${user.id}`, state);

    // 2. Generate or return cached remedial content
    const remedialKey = `remedial:${user.id}:${levelId}`;
    const existingRemedial = await kv.get(remedialKey);

    if (existingRemedial) {
      const cached = typeof existingRemedial === "string" ? JSON.parse(existingRemedial) : existingRemedial;
      console.log(`[Progression] Returning cached remedial for ${levelId}`);
      return c.json({ state, remedial: cached });
    }

    // 3. Generate remedial via GPT-4o-mini
    const weakPillars: string[] = [];
    if (pillarScores && typeof pillarScores === "object") {
      const entries = Object.entries(pillarScores as Record<string, number>)
        .filter(([, v]) => typeof v === "number")
        .sort((a, b) => (a[1] as number) - (b[1] as number));
      // Take bottom 2 pillars (weakest areas)
      for (const [pillar] of entries.slice(0, 2)) {
        weakPillars.push(pillar);
      }
    }
    if (weakPillars.length === 0) weakPillars.push("Fluency", "Grammar");

    const levelTitle = LEVEL_TITLES[levelId] || levelId;

    const remedialPrompt = `You are a professional English communication coach. A user just completed a "${levelTitle}" practice session and scored ${numScore}% overall.

Their weakest communication pillars are: ${weakPillars.join(", ")}.
${transcript ? `\nBrief transcript excerpt: "${transcript.slice(0, 500)}"` : ""}

Generate personalized remedial content in JSON format:
{
  "lessons": [
    {
      "id": "lesson-1",
      "title": "Short lesson title (4-6 words)",
      "pillar": "Which pillar this addresses",
      "content": "2-3 sentences explaining the specific issue observed and how to fix it. Reference their actual performance.",
      "example": {
        "wrong": "Example of what the user said or would say incorrectly",
        "correct": "The improved professional version"
      }
    }
  ],
  "shadowingPhrases": [
    {
      "id": "shd-1",
      "phrase": "A professional English phrase (8-15 words) targeting the weak pillar",
      "focus": "Which pillar this targets"
    }
  ]
}

Generate exactly 2-3 lessons and 3-5 shadowing phrases. Make them specific to a ${pathId === "interview" ? "job interview" : "B2B sales"} context.
All content must be in English.`;

    let remedialData;
    try {
      const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
      if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: remedialPrompt }],
          temperature: 0.7,
          max_tokens: 1200,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`GPT-4o-mini ${res.status}: ${errBody.slice(0, 200)}`);
      }

      const aiData = await res.json();
      const content = aiData.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);

      remedialData = {
        generatedAt: new Date().toISOString(),
        weakPillars,
        lessons: parsed.lessons || [],
        shadowingPhrases: parsed.shadowingPhrases || [],
        completedAt: null,
        shadowingScore: null,
      };
    } catch (aiErr) {
      console.log("[Progression] GPT-4o-mini remedial generation failed:", aiErr);
      // Fallback: generic remedial content
      remedialData = {
        generatedAt: new Date().toISOString(),
        weakPillars,
        lessons: weakPillars.map((pillar, i) => ({
          id: `lesson-${i + 1}`,
          title: `Strengthen Your ${pillar}`,
          pillar,
          content: `Focus on improving your ${pillar.toLowerCase()} skills. Pay attention to how native speakers structure their ${pillar.toLowerCase()} in professional contexts.`,
          example: {
            wrong: "I think that... um... we could maybe...",
            correct: "Based on my experience, I recommend we...",
          },
        })),
        shadowingPhrases: [
          { id: "shd-1", phrase: "In my experience leading cross-functional teams, I've found that...", focus: weakPillars[0] },
          { id: "shd-2", phrase: "I'd like to walk you through my approach to solving this challenge.", focus: weakPillars[0] },
          { id: "shd-3", phrase: "The key takeaway from that project was the importance of clear communication.", focus: weakPillars[1] || weakPillars[0] },
        ],
        completedAt: null,
        shadowingScore: null,
      };
    }

    await kv.set(remedialKey, remedialData);
    console.log(`[Progression] ✅ Level ${levelId} completed (score: ${numScore}), remedial generated`);

    return c.json({ state, remedial: remedialData });
  } catch (err) {
    console.log("[Progression complete-level] Error:", err);
    return c.json({ error: `Failed to complete level: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// Progression Tree — POST /progression/complete-remedial
// Record shadowing score, unlock next level if ≥ 60%
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/progression/complete-remedial", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { pathId, levelId, shadowingScore } = await c.req.json();
    if (!pathId || !levelId || typeof shadowingScore !== "number") {
      return c.json({ error: "Missing pathId, levelId, or shadowingScore" }, 400);
    }

    const passed = shadowingScore >= 60;

    // 1. Update remedial record
    const remedialKey = `remedial:${user.id}:${levelId}`;
    const remedialRaw = await kv.get(remedialKey);
    if (remedialRaw) {
      const remedial = typeof remedialRaw === "string" ? JSON.parse(remedialRaw) : remedialRaw;
      remedial.shadowingScore = shadowingScore;
      if (passed) remedial.completedAt = new Date().toISOString();
      await kv.set(remedialKey, remedial);
    }

    // 2. Update progression state
    const progRaw = await kv.get(`progression:${user.id}`);
    if (!progRaw) return c.json({ error: "No progression state found" }, 404);

    const state = typeof progRaw === "string" ? JSON.parse(progRaw) : progRaw;
    const pathState = state[pathId];
    if (!pathState) return c.json({ error: `Path ${pathId} not found` }, 404);

    if (passed) {
      // Mark current level as completed
      pathState[levelId] = {
        ...pathState[levelId],
        status: "completed",
        remedialCompleted: true,
      };

      // Unlock next level
      const nextId = NEXT_LEVEL[levelId];
      if (nextId && pathState[nextId]?.status === "locked") {
        pathState[nextId] = { ...pathState[nextId], status: "unlocked" };
      }

      state[pathId] = pathState;
      await kv.set(`progression:${user.id}`, state);
      console.log(`[Progression] ✅ Remedial passed for ${levelId} (score: ${shadowingScore}). ${nextId ? `Level ${nextId} unlocked.` : "Path complete!"}`);
    }

    return c.json({ passed, state, nextLevelUnlocked: passed ? true : false });
  } catch (err) {
    console.log("[Progression complete-remedial] Error:", err);
    return c.json({ error: `Failed to complete remedial: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// Structured Study Lesson — GET /progression/lesson
// Fetch or generate a 5-step personalized lesson for a level
// ═══════════════════════════════════════════════════════════════
app.get("/make-server-08b8658d/progression/lesson", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const pathId = c.req.query("pathId");
    const levelId = c.req.query("levelId");
    if (!pathId || !levelId) return c.json({ error: "Missing pathId or levelId" }, 400);

    // Check cache first
    const lessonKey = `lesson:${user.id}:${levelId}`;
    const cached = await kv.get(lessonKey);
    if (cached) {
      const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
      console.log(`[Lesson] Returning cached lesson for ${levelId}`);
      return c.json(parsed);
    }

    // Look up user's weak pillars from most recent session feedback
    const progRaw = await kv.get(`progression:${user.id}`);
    const progState = progRaw ? (typeof progRaw === "string" ? JSON.parse(progRaw) : progRaw) : {};
    const levelState = progState[pathId]?.[levelId];
    const score = levelState?.bestScore || 50;

    // Try to get weak pillars from remedial data
    const remedialKey = `remedial:${user.id}:${levelId}`;
    const remedialRaw = await kv.get(remedialKey);
    let weakPillars = ["Fluency", "Professional Tone"];
    if (remedialRaw) {
      const remedial = typeof remedialRaw === "string" ? JSON.parse(remedialRaw) : remedialRaw;
      if (remedial.weakPillars?.length) weakPillars = remedial.weakPillars;
    }

    const levelTitle = LEVEL_TITLES[levelId] || levelId;
    const nextLevelId = NEXT_LEVEL[levelId];
    const nextLevelTitle = nextLevelId ? (LEVEL_TITLES[nextLevelId] || "Next Level") : "Mastery";
    const domain = getDomainLabel(pathId as string);
    const primaryPillar = weakPillars[0] || "Fluency";

    const lessonPrompt = `You are an expert English communication coach for Latin American professionals. A user just completed a "${levelTitle}" practice (${domain} context) with a score of ${score}%.

Their weakest communication pillar is: "${primaryPillar}" (also weak in: ${weakPillars.slice(1).join(", ") || "N/A"}).

Generate a STRUCTURED LESSON that:
1. Teaches a specific technique or framework to improve their "${primaryPillar}" skill
2. Is contextualized to their ${domain} scenario
3. PREPARES THEM for their next challenge: "${nextLevelTitle}"

Return valid JSON with this exact schema:
{
  "lessonTitle": "A compelling 4-8 word lesson title (e.g. 'Start with the Answer')",
  "targetPillar": "${primaryPillar}",
  "nextLevelPrep": "${nextLevelTitle}",
  "steps": [
    {
      "id": "concept",
      "title": "The Concept",
      "subtitle": "A short subtitle explaining why this matters",
      "body": "2-3 paragraphs explaining the technique or framework. Use clear, conversational language. Include a specific mental model the user can remember.",
      "mentalModel": "One memorable sentence that captures the core idea (e.g. 'Lead with the destination, not the journey.')"
    },
    {
      "id": "scenario",
      "title": "Practice Scenario",
      "context": "A 2-3 sentence description of a realistic scenario. The user is a Latin American professional working with English-speaking colleagues/clients. Make it specific: include role, company type, and situation.",
      "challenge": "What specifically they need to accomplish in this scenario (1-2 sentences)"
    },
    {
      "id": "comparison",
      "title": "Side-by-Side Comparison",
      "weak": {
        "label": "What We Usually Say",
        "script": "A 3-4 sentence example of how a non-native speaker would typically handle this (with common mistakes)"
      },
      "strong": {
        "label": "The Professional Way",
        "script": "The same scenario handled using the technique taught in step 1 (3-4 sentences)"
      },
      "analysis": "2 sentences explaining exactly why the professional version is more effective"
    },
    {
      "id": "toolkit",
      "title": "Power Phrases",
      "phrases": [
        { "pattern": "A ready-to-use English phrase (8-15 words)", "usage": "When/how to use it (5-8 words)" },
        { "pattern": "Another powerful phrase", "usage": "Its usage context" },
        { "pattern": "A third phrase", "usage": "Its usage context" },
        { "pattern": "A fourth phrase", "usage": "Its usage context" }
      ]
    },
    {
      "id": "exercise",
      "title": "Your Turn",
      "instruction": "A clear instruction in Spanish for the user. Tell them to respond to a specific ${domain} scenario using the technique they just learned. 2-3 sentences.",
      "template": "A fill-in-the-blank English template they should follow (e.g. 'I am recommending we [action] because of three factors: First, [reason]. Second, [reason]. Finally, [reason].')",
      "evaluationCriteria": "What the coach will evaluate: structure, ${primaryPillar.toLowerCase()}, and confidence."
    }
  ]
}

IMPORTANT:
- All lesson content (except the exercise instruction) must be in English
- The exercise instruction should be in Spanish (the user's native language)
- Make phrases practical and immediately usable in real ${domain} situations
- The lesson should feel premium: like a $200/hour executive coaching session
- Connect the lesson to their upcoming "${nextLevelTitle}" challenge`;

    let lessonData;
    try {
      const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
      if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: lessonPrompt }],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`GPT-4o-mini ${res.status}: ${errBody.slice(0, 200)}`);
      }

      const aiData = await res.json();
      const content = aiData.choices?.[0]?.message?.content || "{}";
      lessonData = {
        ...JSON.parse(content),
        generatedAt: new Date().toISOString(),
        completedAt: null,
      };
    } catch (aiErr) {
      console.log("[Lesson] GPT generation failed:", aiErr);
      return c.json({ error: "Failed to generate lesson content" }, 500);
    }

    await kv.set(lessonKey, lessonData);
    console.log(`[Lesson] ✅ Generated lesson for ${levelId} (pillar: ${primaryPillar})`);

    return c.json(lessonData);
  } catch (err) {
    console.log("[Lesson GET] Error:", err);
    return c.json({ error: `Failed to fetch lesson: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// Structured Study Lesson — POST /progression/complete-lesson
// Mark lesson completed, unlock next level
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/progression/complete-lesson", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { pathId, levelId } = await c.req.json();
    if (!pathId || !levelId) return c.json({ error: "Missing pathId or levelId" }, 400);

    // 1. Mark lesson as completed
    const lessonKey = `lesson:${user.id}:${levelId}`;
    const lessonRaw = await kv.get(lessonKey);
    if (lessonRaw) {
      const lesson = typeof lessonRaw === "string" ? JSON.parse(lessonRaw) : lessonRaw;
      lesson.completedAt = new Date().toISOString();
      await kv.set(lessonKey, lesson);
    }

    // 2. Update progression: mark current as completed, unlock next
    const progRaw = await kv.get(`progression:${user.id}`);
    if (!progRaw) return c.json({ error: "No progression state found" }, 404);

    const state = typeof progRaw === "string" ? JSON.parse(progRaw) : progRaw;
    const pathState = state[pathId];
    if (!pathState) return c.json({ error: `Path ${pathId} not found` }, 404);

    pathState[levelId] = {
      ...pathState[levelId],
      status: "completed",
      remedialCompleted: true,
    };

    // Unlock next level
    const nextId = NEXT_LEVEL[levelId];
    if (nextId && pathState[nextId]?.status === "locked") {
      pathState[nextId] = { ...pathState[nextId], status: "unlocked" };
    }

    state[pathId] = pathState;
    await kv.set(`progression:${user.id}`, state);

    console.log(`[Lesson] ✅ Lesson completed for ${levelId}. ${nextId ? `Level ${nextId} unlocked.` : "Path complete!"}`);
    return c.json({ success: true, state, nextLevelUnlocked: !!nextId });
  } catch (err) {
    console.log("[Lesson complete] Error:", err);
    return c.json({ error: `Failed to complete lesson: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /evaluate-briefing-draft — Evaluate user's practice answer
// Returns improved version + explanation based on communication strategy
// Used by Briefing Card 4 (FeedbackCard)
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/evaluate-briefing-draft", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      question,
      userDraft,
      strategy,
      framework,
      suggestedOpener,
      scenarioType,
      interlocutor,
    } = await c.req.json();

    if (!question || !userDraft) {
      return c.json({ error: "Missing required fields: question and userDraft" }, 400);
    }

    const isInterview = scenarioType === "interview";
    const contextLabel = isInterview ? "interview question" : "sales scenario";
    const roleLabel = isInterview
      ? `${interlocutor || "interviewer"}`
      : `${interlocutor || "prospect/buyer"}`;

    const systemPrompt = `You are MasteryTalk Pro's communication coach — an expert in professional English communication for non-native speakers in high-stakes business conversations.

Your task: Evaluate the user's draft answer to a ${contextLabel} and produce an improved, professional version they can practice saying out loud.

CONTEXT:
- Question: "${question}"
- Communication Strategy: ${strategy || "Not provided"}
- Framework: ${framework ? `${framework.name}: ${framework.description}` : "Not provided"}
- Suggested Opener: ${suggestedOpener || "Not provided"}
- Scenario: ${scenarioType || "interview"} with ${roleLabel}

RULES:
1. The improved response must sound NATURAL when spoken aloud — not like written text.
2. Keep the user's core message and personal experiences intact — don't invent facts.
3. Apply the communication strategy/framework to structure the answer better.
4. Use professional but conversational English (avoid overly formal or stiff language).
5. The improved version should be 2-4 sentences max — concise and impactful.
6. Explain WHY each change makes it stronger (reference the framework/strategy).
7. Identify 2-3 key changes as bullet points.

SHADOWING PHRASES:
Split the improvedResponse into 2-5 short clause-level chunks (5-10 words each) for pronunciation practice.
For each chunk provide:
- "sentence": the phrase text
- "stressedWords": words that carry PRIMARY lexical stress (content words the speaker should emphasize)
- "linkedPairs": pairs of adjacent words that should flow together without a pause (e.g. ["excited","about"], ["aligns","with"])
- "ipa": full IPA transcription for the phrase (use standard IPA notation with stress marks ˈ and ˌ)
- "focusWord": the single most challenging word to pronounce for a non-native speaker

Respond in JSON:
{
  "improvedResponse": "The improved version of their answer",
  "explanation": "1-2 sentences explaining the overall improvement approach",
  "keyChanges": [
    { "original": "what they said (paraphrased)", "improved": "what the improvement does", "reason": "why this is stronger" }
  ],
  "communicationScore": 0-100 (how effective the original draft was),
  "tone": "professional|casual|too-formal|unclear",
  "shadowingPhrases": [
    {
      "sentence": "I'm excited about Addi's mission",
      "stressedWords": ["excited", "Addi's", "mission"],
      "linkedPairs": [["excited", "about"], ["Addi's", "mission"]],
      "ipa": "/aɪm ɪkˈsaɪtɪd əˈbaʊt ˈædiz ˈmɪʃən/",
      "focusWord": "excited"
    }
  ]
}`;

    console.log(`[EvaluateBriefingDraft] User ${user.id} | Q: "${question.slice(0, 60)}..." | Draft: ${userDraft.length} chars`);

    const aiResponse = await callOpenAIChat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `My answer: "${userDraft}"` },
      ],
      { temperature: 0.7, max_tokens: 1500, jsonMode: true },
    );

    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      parsed = {
        improvedResponse: aiResponse,
        explanation: "Could not parse structured feedback.",
        keyChanges: [],
        communicationScore: 50,
        tone: "unclear",
      };
    }

    console.log(`[EvaluateBriefingDraft] ✅ Score: ${parsed.communicationScore} | Improved: ${(parsed.improvedResponse || "").length} chars`);

    return c.json(parsed);
  } catch (err) {
    console.log("[EvaluateBriefingDraft Error]", err);
    return c.json({ error: `Briefing evaluation failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /progression/personalize-patterns
// Generate personalized bad/good examples using GPT-4o-mini
// based on user context (CV, role, company) + methodology name.
// Cached per user+level for subsequent sessions.
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/progression/personalize-patterns", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { levelId, methodologyName, badLabel, goodLabel, userContext } = await c.req.json();
    if (!levelId || !methodologyName) {
      return c.json({ error: "Missing levelId or methodologyName" }, 400);
    }

    // Build a content fingerprint for cache invalidation when user context changes
    const contextStr = JSON.stringify(userContext || {});
    const contextHash = contextStr.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0).toString(36);
    const cacheKey = `patterns:${user.id}:${levelId}:${contextHash}`;

    // Check cache
    const cached = await kv.get(cacheKey);
    if (cached) {
      const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
      console.log(`[PersonalizePatterns] Cache hit for ${levelId}`);
      return c.json(parsed);
    }

    // Extract user info for prompt
    const role = userContext?.role || userContext?.["Role you're applying for"] || "professional";
    const company = userContext?.company || userContext?.["Company"] || "";
    const cv = userContext?.cvSummary || userContext?.manualExperience || userContext?.["Your key experience"] || "";
    const jd = userContext?.["Job Description"] || "";

    const systemPrompt = `You are a communication coach creating realistic interview examples. Generate two contrasting responses personalized to this candidate's background.

CANDIDATE PROFILE:
- Role: ${role}${company ? `\n- Target Company: ${company}` : ""}${cv ? `\n- Experience: ${cv.slice(0, 500)}` : ""}${jd ? `\n- Job Description: ${jd.slice(0, 300)}` : ""}

METHODOLOGY: ${methodologyName}

Generate a JSON object with exactly two fields:
1. "bad" — A realistic example of how THIS specific candidate might poorly answer using common mistakes (vague, unfocused, too long, no structure). Make it sound authentically like a nervous candidate rambling. Use their actual background details but badly. 2-4 sentences.
2. "good" — A polished example of how THIS candidate should answer using the ${methodologyName} methodology. Reference their ACTUAL role, companies, and achievements from the profile. Make it specific, structured, and impactful. 3-5 sentences.

Rules:
- Both examples must use the candidate's REAL background (role, company, experience)
- The bad example should feel relatable — a common mistake, not absurdly bad
- The good example should feel achievable — aspirational but realistic
- Write in first person as if the candidate is speaking
- Keep each example under 120 words
- Return ONLY valid JSON: { "bad": "...", "good": "..." }`;

    const result = await callOpenAIChat(
      [{ role: "system", content: systemPrompt }],
      { model: "gpt-4o-mini", temperature: 0.7, max_tokens: 500 }
    );

    let parsed;
    try {
      // Strip markdown fences if present
      const clean = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      console.warn("[PersonalizePatterns] Failed to parse GPT response, using raw");
      parsed = { bad: result.slice(0, 300), good: result.slice(300) };
    }

    const response = {
      bad: { label: badLabel || "How most people answer", script: parsed.bad },
      good: { label: goodLabel || `${methodologyName} in action`, script: parsed.good },
    };

    // Cache for 7 days
    await kv.set(cacheKey, response);
    console.log(`[PersonalizePatterns] ✅ Generated for ${levelId} (${methodologyName})`);

    return c.json(response);
  } catch (err) {
    console.log("[PersonalizePatterns Error]", err);
    return c.json({ error: `Pattern personalization failed: ${err}` }, 500);
  }
});

export default app;
