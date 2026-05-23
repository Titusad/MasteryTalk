import { Hono } from "npm:hono";
import { logApiUsage, getAuthUser } from "../_shared.ts";
import * as kv from "../kv_store.ts";
import { buildPreBriefingPrompt } from "../prebriefing-prompts.ts";
import { buildPreparationToolkitPrompt } from "../preparation-toolkit-prompt.ts";
import { buildInterviewBriefingPrompt } from "../interview-briefing-prompt.ts";
import { buildSelfIntroBriefingPrompt } from "../self-intro-briefing-prompt.ts";

const app = new Hono();

app.post("/make-server-08b8658d/transcribe", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required for transcription" }, 401);
    }

    const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
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
    // Anti-hallucination: temperature=0 makes output deterministic (no creative guessing)
    whisperForm.append("temperature", "0");
    // Prompt gives Whisper context — dramatically reduces hallucination on short/quiet audio
    whisperForm.append("prompt", "This is an English-speaking professional practicing interview and sales conversation skills. They are answering a question about their professional background, experience, or approach.");

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

    // Anti-hallucination: detect and reject common Whisper noise hallucinations
    const rawText = (result.text || "").trim();
    const noSpeechProb = result.segments?.[0]?.no_speech_prob ?? 0;

    // Known hallucination patterns: Whisper outputs these when it hears silence/noise
    const HALLUCINATION_PATTERNS = [
      /^(thank you|thanks for watching|please subscribe|like and subscribe)/i,
      /^(music|applause|\[music\]|\(music\))/i,
      /you$/, // ends abruptly with "you"
      /^.{1,8}$/, // extremely short output (likely noise)
    ];

    const isLikelyHallucination =
      noSpeechProb > 0.6 ||
      HALLUCINATION_PATTERNS.some(p => p.test(rawText)) ||
      // Repetition detection: same word repeated 4+ times
      (() => {
        const words = rawText.toLowerCase().split(/\s+/);
        if (words.length < 4) return false;
        const counts: Record<string, number> = {};
        for (const w of words) { counts[w] = (counts[w] || 0) + 1; }
        return Object.values(counts).some(c => c >= Math.max(4, words.length * 0.4));
      })();

    if (isLikelyHallucination) {
      console.log(`[Transcribe] ⚠️ Rejected hallucination: "${rawText}" (no_speech_prob=${noSpeechProb})`);
      return c.json({
        text: "",
        confidence: 0,
        duration: result.duration,
        language: result.language,
        rejected: true,
        reason: "hallucination_detected",
      });
    }

    console.log(`[Transcribe] ✅ "${rawText.slice(0, 80)}..." | duration=${result.duration}s | no_speech_prob=${noSpeechProb}`);

    // Log API usage (Whisper charges per minute, estimate ~1500 tokens/min)
    const estimatedTokens = Math.ceil((result.duration || 1) / 60 * 1500);
    logApiUsage("whisper", "/transcribe", {
      prompt: estimatedTokens, completion: 0, total: estimatedTokens,
    }, "whisper-1").catch(() => {});

    return c.json({
      text: rawText,
      confidence: noSpeechProb < 0.3 ? 0.95 : 0.7,
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
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required" }, 401);
    }

    const body = await c.req.json();
    const { scenario, interlocutor, scenarioType, guidedFields } = body;
    const locale = body.locale || null;
    const pathId: string | null = body.pathId || null;
    const levelId: string | null = body.levelId || null;

    // ── Script cache: check KV before calling GPT-4o ──
    if (pathId && levelId) {
      const profileRaw = await kv.get(`profile:${user.id}`);
      const profileData = profileRaw ? (typeof profileRaw === "string" ? JSON.parse(profileRaw) : profileRaw) : null;
      const cacheVersion = profileData?.scriptCacheVersion ?? 0;
      const cacheKey = `script:${user.id}:${pathId}:${levelId}:${cacheVersion}`;
      const cached = await kv.get(cacheKey);
      if (cached?.sections) {
        console.log(`[Generate Script] Cache HIT — ${cacheKey}`);
        return c.json({ sections: cached.sections, _debug: { cached: true } });
      }
      console.log(`[Generate Script] Cache MISS — ${cacheKey}, generating...`);
    }

    if (!scenario && !interlocutor) {
      return c.json({ error: "Missing required fields: scenario or interlocutor" }, 400);
    }

    const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
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
      const u = data.usage || {};
      logApiUsage("openai-chat", "/generate-script", {
        prompt: u.prompt_tokens || 0, completion: u.completion_tokens || 0, total: u.total_tokens || 0,
      }, "gpt-4o").catch(() => {});
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

    // ── Script cache: store in KV for future sessions ──
    if (pathId && levelId) {
      const profileRaw2 = await kv.get(`profile:${user.id}`);
      const profileData2 = profileRaw2 ? (typeof profileRaw2 === "string" ? JSON.parse(profileRaw2) : profileRaw2) : null;
      const cacheVersion2 = profileData2?.scriptCacheVersion ?? 0;
      const cacheKey2 = `script:${user.id}:${pathId}:${levelId}:${cacheVersion2}`;
      const TTL_30_DAYS = 30 * 24 * 3600;
      kv.setWithTTL(cacheKey2, { sections }, TTL_30_DAYS).catch(() => {});
      console.log(`[Generate Script] Cached at ${cacheKey2}`);
    }

    return c.json({ sections, _debug: { version: "v3-validate-rewrite", wordCount: finalWordCount, wasRewritten: needsRewrite } });
  } catch (err) {
    console.log("[Generate Script Error]", err);
    return c.json({ error: `Script generation failed: ${err}` }, 500);
  }
});

app.post("/make-server-08b8658d/generate-preparation-toolkit", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required" }, 401);
    }

    const body = await c.req.json();
    const { scenario, interlocutor, scenarioType, guidedFields } = body;
    const toolkitLocale = body.locale || null;

    const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
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
    const ptUsage = data.usage || {};
    logApiUsage("openai-chat", "/preparation-toolkit", {
      prompt: ptUsage.prompt_tokens || 0, completion: ptUsage.completion_tokens || 0, total: ptUsage.total_tokens || 0,
    }, "gpt-4o").catch(() => {});
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
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required" }, 401);
    }

    const body = await c.req.json();
    const { scenario, interlocutor, guidedFields } = body;
    const briefingLocale = body.locale || null;
    const ibPathId: string | null = body.pathId || null;
    const ibLevelId: string | null = body.levelId || null;

    // ── Script cache: check KV before calling GPT-4o ──
    if (ibPathId && ibLevelId) {
      const ibProfileRaw = await kv.get(`profile:${user.id}`);
      const ibProfileData = ibProfileRaw ? (typeof ibProfileRaw === "string" ? JSON.parse(ibProfileRaw) : ibProfileRaw) : null;
      const ibCacheVersion = ibProfileData?.scriptCacheVersion ?? 0;
      const ibCacheKey = `script:${user.id}:${ibPathId}:${ibLevelId}:${ibCacheVersion}`;
      const ibCached = await kv.get(ibCacheKey);
      if (ibCached?.anticipatedQuestions) {
        console.log(`[Interview Briefing] Cache HIT — ${ibCacheKey}`);
        return c.json({
          anticipatedQuestions: ibCached.anticipatedQuestions,
          questionsToAsk: ibCached.questionsToAsk ?? [],
          culturalTips: ibCached.culturalTips ?? [],
          _debug: { cached: true },
        });
      }
      console.log(`[Interview Briefing] Cache MISS — ${ibCacheKey}, generating...`);
    }

    const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
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
    const ibUsage = data.usage || {};
    logApiUsage("openai-chat", "/interview-briefing", {
      prompt: ibUsage.prompt_tokens || 0, completion: ibUsage.completion_tokens || 0, total: ibUsage.total_tokens || 0,
    }, "gpt-4o").catch(() => {});
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

    // Cache store — 30-day TTL
    if (ibPathId && ibLevelId) {
      const ibProfileRaw2 = await kv.get(`profile:${user.id}`);
      const ibProfileData2 = ibProfileRaw2 ? (typeof ibProfileRaw2 === "string" ? JSON.parse(ibProfileRaw2) : ibProfileRaw2) : null;
      const ibCacheVersion2 = ibProfileData2?.scriptCacheVersion ?? 0;
      const ibCacheKey2 = `script:${user.id}:${ibPathId}:${ibLevelId}:${ibCacheVersion2}`;
      const TTL_30_DAYS = 30 * 24 * 60 * 60 * 1000;
      await kv.setWithTTL(ibCacheKey2, { anticipatedQuestions, questionsToAsk, culturalTips }, TTL_30_DAYS);
      console.log(`[Interview Briefing] Cached — ${ibCacheKey2}`);
    }

    return c.json({ anticipatedQuestions, questionsToAsk, culturalTips });
  } catch (err) {
    console.log("[Interview Briefing Error]", err);
    return c.json({ error: `Interview briefing generation failed: ${err}` }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /generate-self-intro-briefing
// Generates 3 beat cards for the Three-Move Introduction.
// Each card: Anchor | Relevance Bridge | Invitation
// Output: InterviewBriefingData (3 anticipatedQuestions)
// ═══════════════════════════════════════════════════════════════
app.post("/make-server-08b8658d/generate-self-intro-briefing", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json();
    const { guidedFields, levelId } = body;

    // Cache key includes a hash of the user's profile fields
    const contextStr = JSON.stringify(guidedFields || {});
    const contextHash = contextStr.split("").reduce((a: number, ch: string) => ((a << 5) - a + ch.charCodeAt(0)) | 0, 0).toString(36);
    const cacheKey = `self-intro-briefing:${user.id}:${levelId || "si-0"}:${contextHash}`;

    const cached = await kv.get(cacheKey);
    if (cached?.anticipatedQuestions) {
      console.log(`[SelfIntroBriefing] Cache HIT — ${cacheKey}`);
      return c.json(cached);
    }

    const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) return c.json({ error: "OpenAI API key not configured" }, 500);

    const { systemPrompt, userMessage } = buildSelfIntroBriefingPrompt({ guidedFields });

    console.log(`[SelfIntroBriefing] Generating for user ${user.id}`);

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
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.log(`[SelfIntroBriefing] OpenAI error ${res.status}: ${errBody.slice(0, 300)}`);
      return c.json({ error: `OpenAI ${res.status}` }, 502);
    }

    const data = await res.json();
    const usage = data.usage || {};
    logApiUsage("openai-chat", "/self-intro-briefing", {
      prompt: usage.prompt_tokens || 0, completion: usage.completion_tokens || 0, total: usage.total_tokens || 0,
    }, "gpt-4o-mini").catch(() => {});

    let parsed;
    try {
      parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    } catch {
      return c.json({ error: "Invalid JSON from OpenAI" }, 502);
    }

    const anticipatedQuestions = Array.isArray(parsed.anticipatedQuestions) ? parsed.anticipatedQuestions : [];
    if (anticipatedQuestions.length !== 3) {
      console.log(`[SelfIntroBriefing] Warning: expected 3 cards, got ${anticipatedQuestions.length}`);
    }
    for (const q of anticipatedQuestions) {
      if (!Array.isArray(q.keyPhrases)) q.keyPhrases = [];
    }

    const response = { anticipatedQuestions, questionsToAsk: [], culturalTips: [] };

    const TTL_7_DAYS = 7 * 24 * 60 * 60 * 1000;
    await kv.setWithTTL(cacheKey, response, TTL_7_DAYS);
    console.log(`[SelfIntroBriefing] ✅ Generated and cached — ${cacheKey}`);

    return c.json(response);
  } catch (err) {
    console.log("[SelfIntroBriefing Error]", err);
    return c.json({ error: `Self-intro briefing generation failed: ${err}` }, 500);
  }
});

export default app;
