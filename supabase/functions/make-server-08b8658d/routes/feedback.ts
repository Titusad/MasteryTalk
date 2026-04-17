import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import { getAuthUser, callOpenAIChat } from "../_shared.ts";
import { buildCvMatchPrompt } from "../../_shared/prompts/cv-match-prompt.ts";
import { buildFeedbackAnalystPrompt, buildTranscriptForAnalyst } from "../analyst-prompt.ts";
import { buildSessionSummaryPrompt } from "../summary-prompt.ts";
import { sendEmail } from "../email.ts";
import { sessionSummaryEmailHtml } from "../email-templates.ts";

const app = new Hono();

app.post("/make-server-08b8658d/analyze-cv-match", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required" }, 401);
    }

    const body = await c.req.json();
    const { cv, jobDescription } = body;

    if (!cv || !jobDescription) {
      return c.json({ error: "Missing cv or jobDescription" }, 400);
    }

    const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
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
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required for feedback" }, 401);
    }

    const fbBody = await c.req.json();
    const { sessionId, scenarioType } = fbBody;
    const fbLocale = fbBody.locale || null;

    if (!sessionId) {
      return c.json({ error: "Missing sessionId for feedback analysis" }, 400);
    }

    const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return c.json({ error: "OPENAI_API_KEY not configured on server" }, 500);
    }

    // Retrieve session from KV
    const raw = await kv.get(`practice:${sessionId}`);
    if (!raw) {
      return c.json({ error: `Session ${sessionId} not found for feedback analysis` }, 404);
    }

    const session = raw;
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
      const userId = user.id;

      // 1. Update profile stats with latest pillarScores
      if (pillarScores && Object.keys(pillarScores).length > 0) {
        const profileRaw = await kv.get(`profile:${userId}`);
        const profile = profileRaw
          ? (typeof profileRaw === "object" ? profileRaw : profileRaw)
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
        await kv.set(`profile:${userId}`, profile);
        console.log(`[AnalyzeFeedback] 📊 Persisted pillarScores to profile:${userId}`);
      }

      // 2. Save feedback to the stored session record (so Dashboard history can read it)
      const indexRaw = await kv.get(`session_index:${userId}`);
      const sessionIndex: string[] = indexRaw
        ? (typeof indexRaw === "object" ? indexRaw : indexRaw)
        : [];
      // Find the most recent session to attach feedback to
      if (sessionIndex.length > 0) {
        const latestKey = `session:${userId}:${sessionIndex[0]}`;
        const sessRaw = await kv.get(latestKey);
        if (sessRaw) {
          const sessRecord = typeof sessRaw === "object" ? sessRaw : sessRaw;
          sessRecord.feedback = {
            strengths,
            opportunities,
            beforeAfter,
            pillarScores,
            professionalProficiency,
            ...(contentScores && { contentScores }),
            ...(interviewReadinessScore !== null && { interviewReadinessScore }),
          };
          await kv.set(latestKey, sessRecord);
          console.log(`[AnalyzeFeedback] 💾 Saved feedback to session ${sessionIndex[0]}`);
        }
      }
    } catch (persistErr) {
      // Non-blocking: feedback still returned even if persistence fails
      console.log(`[AnalyzeFeedback] ⚠️ Failed to persist scores: ${persistErr}`);
    }

    // ── Send session summary email (fire-and-forget) ──
    try {
      if (user?.email) {
        const emailName = user.user_metadata?.full_name || user.email.split("@")[0] || "there";
        const topOpp = opportunities[0]?.text || (typeof opportunities[0] === "string" ? opportunities[0] : null);
        const topStrTexts = strengths.map((s: any) => typeof s === "string" ? s : s.text || String(s));
        sendEmail({
          to: user.email,
          subject: `Your ${(scenarioType || session.scenarioType || "practice").replace(/^\w/, (c: string) => c.toUpperCase())} Session Results 📊`,
          html: sessionSummaryEmailHtml({
            userName: emailName,
            scenarioType: scenarioType || session.scenarioType || "practice",
            professionalProficiency,
            strengths: topStrTexts,
            topOpportunity: topOpp,
            pillarScores,
          }),
        }).catch(() => {});
      }
    } catch { /* non-blocking */ }

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
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required for summary" }, 401);
    }

    const sumBody = await c.req.json();
    const sessionId = sumBody.sessionId;
    const scenarioType = sumBody.scenarioType;
    const sumLocale = sumBody.locale || null;

    if (!sessionId) {
      return c.json({ error: "Missing sessionId for summary generation" }, 400);
    }

    const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return c.json({ error: "OPENAI_API_KEY not configured on server" }, 500);
    }

    // Retrieve session from KV
    const raw = await kv.get(`practice:${sessionId}`);
    if (!raw) {
      return c.json({ error: `Session ${sessionId} not found for summary generation` }, 404);
    }

    const session = raw;
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
export default app;
