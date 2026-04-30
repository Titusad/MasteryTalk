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

// POST /process-turn-stream — Streaming GPT-4o response with SSE
// Returns text tokens immediately, computes metadata deterministically after stream ends.
// Each SSE event: {"t":"s","v":"token"} for text, {"t":"end",...metadata} when done.
app.post("/make-server-08b8658d/process-turn-stream", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { sessionId, userMessage } = await c.req.json();
    if (!sessionId || !userMessage) return c.json({ error: "Missing sessionId or userMessage" }, 400);

    const raw = await kv.get(`practice:${sessionId}`);
    if (!raw) return c.json({ error: `Session ${sessionId} not found` }, 404);

    const session = raw as any;

    if (session.isComplete) {
      const body = `data: ${JSON.stringify({ t: "end", text: "This conversation has concluded.", isComplete: true, arenaPhase: session.arenaPhase || "support" })}\n\n`;
      return new Response(body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Access-Control-Allow-Origin": "*" } });
    }

    session.messages.push({ role: "user", content: userMessage });
    session.turnCount += 1;

    const currentPhase = session.arenaPhase || "support";
    const ARENA_DIRECTIVES: Record<string, string> = {
      support: `=== DIFFICULTY LEVEL: SUPPORTIVE ===\nAsk straightforward questions. Give space to develop arguments. Assess foundational skills.`,
      guidance: `=== DIFFICULTY LEVEL: GUIDED CHALLENGE ===\nChallenge claims with follow-ups. Push one level deeper. Don't accept surface-level answers.`,
      challenge: `=== DIFFICULTY LEVEL: HIGH PRESSURE ===\nPush to their ceiling. Be skeptical, direct, demanding. Create realistic pressure.`,
    };

    const messagesForStream = [
      ...session.messages.slice(0, 1),
      { role: "system", content: ARENA_DIRECTIVES[currentPhase] || ARENA_DIRECTIVES.support },
      ...session.messages.slice(1),
      // Override JSON output format — streaming mode returns plain text
      { role: "system", content: `=== STREAMING MODE ===\nIgnore JSON output instructions. Respond with ONLY your conversational reply as plain spoken English. Maximum 3 sentences. No JSON, no formatting.` },
    ];

    const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) return c.json({ error: "OPENAI_API_KEY not configured" }, 500);

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: "gpt-4o", messages: messagesForStream, temperature: 0.85, max_tokens: 300, stream: true }),
    });

    if (!openaiRes.ok || !openaiRes.body) {
      const errBody = await openaiRes.text();
      return c.json({ error: `OpenAI streaming failed: ${errBody.slice(0, 200)}` }, 502);
    }

    // Heuristic performanceSignal from user message (avoids a second API call)
    const computeSignal = (msg: string): number => {
      let s = 50;
      const w = msg.split(/\s+/).length;
      if (w > 20) s += 10;
      if (w > 40) s += 8;
      if (/\d+/.test(msg)) s += 7;
      if (/(leverage|ROI|stakeholder|deliverable|strategy|impact|align|pipeline|metric|outcome)/i.test(msg)) s += 12;
      if (/(umm+|uh+|like,|you know|I mean|basically,)/i.test(msg)) s -= 12;
      if (/^(well,|so,|um,|I think maybe)/i.test(msg.trim())) s -= 5;
      return Math.max(20, Math.min(88, s));
    };

    const detectComplete = (text: string, turns: number): boolean => {
      if (turns < 4) return false;
      if (turns >= 8) return true;
      const t = text.toLowerCase();
      return ["thank you for your time", "i'll be in touch", "we'll circle back", "that wraps up", "good luck with", "let's schedule", "you'll hear from us", "pleasure speaking"].some(p => t.includes(p));
    };

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const reader = openaiRes.body!.getReader();
          const decoder = new TextDecoder();
          let lineBuf = "";
          let fullText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            lineBuf += decoder.decode(value, { stream: true });
            const lines = lineBuf.split("\n");
            lineBuf = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const token = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
                if (!token) continue;
                fullText += token;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ t: "s", v: token })}\n\n`));
              } catch { /* skip malformed */ }
            }
          }

          // Update KV and emit final metadata event
          const perfSignal = computeSignal(userMessage);
          const isComplete = detectComplete(fullText, session.turnCount);
          const perfHistory = [...(session.performanceHistory || []), perfSignal];
          let nextPhase = currentPhase;
          if (session.turnCount >= 2) {
            const avg = perfHistory.slice(-2).reduce((a: number, b: number) => a + b, 0) / Math.min(2, perfHistory.length);
            if (avg >= 72 && currentPhase === "support") nextPhase = "guidance";
            else if (avg >= 72 && currentPhase === "guidance") nextPhase = "challenge";
            else if (avg < 45 && currentPhase === "challenge") nextPhase = "guidance";
            else if (avg < 45 && currentPhase === "guidance") nextPhase = "support";
          }

          session.arenaPhase = nextPhase;
          session.performanceHistory = perfHistory;
          session.messages.push({ role: "assistant", content: fullText });
          session.isComplete = isComplete;
          await kv.set(`practice:${sessionId}`, session);

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ t: "end", text: fullText, isComplete, arenaPhase: nextPhase })}\n\n`));
          controller.close();
        } catch (err) {
          console.error("[ProcessTurnStream] Stream error:", err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ t: "error" })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("[ProcessTurnStream Error]", err);
    return c.json({ error: `Streaming turn failed: ${err}` }, 500);
  }
});

export default app;
