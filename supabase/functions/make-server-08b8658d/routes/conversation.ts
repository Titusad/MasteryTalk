import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import { callOpenAIChat, displayLabel, getAuthUser } from "../_shared.ts";

const app = new Hono();

// POST /prepare-session — Initialize a voice practice session
app.post("/make-server-08b8658d/prepare-session", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required" }, 401);
    }

    const { systemPrompt, scenario, interlocutor, scenarioType, voiceId, interviewBriefing } = await c.req.json();

    if (!systemPrompt) {
      return c.json({ error: "Missing systemPrompt for session preparation" }, 400);
    }

    const sessionId = `vsession_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    console.log(`[PrepareSession] Creating session ${sessionId} | type=${scenarioType} interlocutor=${interlocutor}`);

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
      firstAiText = firstResponse;
    }

    const firstMessage = {
      role: "ai" as const,
      label: displayLabel(interlocutor),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      text: firstAiText,
    };

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
      interviewBriefing: interviewBriefing || null,
      arenaPhase: "support",
      performanceHistory: [] as number[],
    };

    await kv.set(`practice:${sessionId}`, sessionState);
    console.log(`[PrepareSession] ✅ Session ${sessionId} ready — first message: ${firstAiText.length} chars`);

    return c.json({ sessionId, firstMessage, coachingHint: firstCoachingHint });
  } catch (err) {
    console.log("[PrepareSession Error]", err);
    return c.json({ error: `Session preparation failed: ${err}` }, 500);
  }
});

// POST /process-turn — Process a conversation turn with GPT-4o
app.post("/make-server-08b8658d/process-turn", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required" }, 401);
    }

    const { sessionId, userMessage } = await c.req.json();

    if (!sessionId || !userMessage) {
      return c.json({ error: "Missing sessionId or userMessage" }, 400);
    }

    const raw = await kv.get(`practice:${sessionId}`);
    if (!raw) {
      return c.json({ error: `Session ${sessionId} not found` }, 404);
    }

    const session = raw;

    if (session.isComplete) {
      return c.json({
        aiMessage: { role: "ai", label: displayLabel(session.interlocutor), time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }), text: "This conversation has concluded. Thank you for your time." },
        isComplete: true,
      });
    }

    session.messages.push({ role: "user", content: userMessage });
    session.turnCount += 1;

    // Arena: determine current phase directive
    const currentPhase = session.arenaPhase || "support";
    const ARENA_DIRECTIVES: Record<string, string> = {
      support: `=== DIFFICULTY LEVEL: SUPPORTIVE ===
The user is warming up. Ask straightforward questions. Give them space to develop arguments before challenging. If they stumble, give a natural opening to recover. Assess foundational skills in internalAnalysis.`,
      guidance: `=== DIFFICULTY LEVEL: GUIDED CHALLENGE ===
The user is performing reasonably. Challenge their claims with follow-ups that require deeper thinking. Introduce mild curveballs. Don't accept surface-level answers — push one level deeper. If they deflect, call it out once. Focus on mid-level skills in internalAnalysis.`,
      challenge: `=== DIFFICULTY LEVEL: HIGH PRESSURE ===
The user is performing well. Push them to their ceiling. Be more skeptical, direct, demanding. Interrupt if they ramble. Create realistic pressure: bring up competitors, question assumptions, impose constraints. Use tactical silence after big claims. Test executive composure. Evaluate peak performance in internalAnalysis.`,
    };

    let phaseDirective = ARENA_DIRECTIVES[currentPhase] || ARENA_DIRECTIVES.support;
    if (currentPhase === "challenge" && session.interviewBriefing?.anticipatedQuestions?.length) {
      phaseDirective += `\n\nBRIEFING-AWARE CHALLENGE: The candidate prepared for specific questions. NOW is the time to test adaptability:
- Ask questions that were NOT in their preparation to see how they think on their feet.
- Challenge assumptions from their prepared responses — push back on claims they rehearsed.
- If they give a rehearsed-sounding answer, probe deeper: "That sounds prepared. What happened when it didn't go that smoothly?"`;
    }

    const messagesWithPhase = [
      ...session.messages.slice(0, 1),
      { role: "system", content: phaseDirective },
      ...session.messages.slice(1),
    ];

    console.log(`[ProcessTurn] Session ${sessionId} | Turn ${session.turnCount} | Phase: ${currentPhase} | User: "${userMessage.slice(0, 80)}..."`);

    const aiResponse = await callOpenAIChat(
      messagesWithPhase,
      { temperature: 0.85, max_tokens: 400, jsonMode: true },
    );

    let aiText = "";
    let isComplete = false;
    let internalAnalysis = "";
    let performanceSignal = 60;
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

    // Arena: update performance history & compute phase transition
    const perfHistory: number[] = session.performanceHistory || [];
    perfHistory.push(performanceSignal);

    let nextPhase = currentPhase;
    if (session.turnCount >= 2) {
      const recentSignals = perfHistory.slice(-2);
      const avg = recentSignals.reduce((a: number, b: number) => a + b, 0) / recentSignals.length;

      if (avg >= 72 && currentPhase === "support") {
        nextPhase = "guidance";
      } else if (avg >= 72 && currentPhase === "guidance") {
        nextPhase = "challenge";
      } else if (avg < 45 && currentPhase === "challenge") {
        nextPhase = "guidance";
      } else if (avg < 45 && currentPhase === "guidance") {
        nextPhase = "support";
      }
    }

    if (nextPhase !== currentPhase) {
      console.log(`[Arena] Phase transition: ${currentPhase} → ${nextPhase} (avg signal: ${perfHistory.slice(-2).reduce((a: number, b: number) => a + b, 0) / Math.min(2, perfHistory.length)})`);
    }

    session.arenaPhase = nextPhase;
    session.performanceHistory = perfHistory;
    session.messages.push({ role: "assistant", content: aiResponse });
    if (internalAnalysis) {
      session.internalAnalysis.push(internalAnalysis);
    }
    session.isComplete = isComplete;

    await kv.set(`practice:${sessionId}`, session);

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

export default app;
