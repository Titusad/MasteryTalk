import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import { getAuthUser, callOpenAIChat, logApiUsage } from "../_shared.ts";

const app = new Hono();

app.post("/make-server-08b8658d/pronunciation-assess", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized — valid session required" }, 401);

    const azureKey = (globalThis as any).Deno.env.get("AZURE_SPEECH_KEY");
    const azureRegion = (globalThis as any).Deno.env.get("AZURE_SPEECH_REGION");

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
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id;

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
    await kv.set(`pronunciation:${userId}:${sessionId}`, pronRecord);

    // Update pronunciation index for this user (for Dashboard longitudinal tracker)
    const indexRaw = await kv.get(`pronunciation_index:${userId}`);
    const index: string[] = indexRaw ? indexRaw : [];
    if (!index.includes(sessionId)) {
      index.unshift(sessionId);
    }
    await kv.set(`pronunciation_index:${userId}`, index);

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
      const vocab: Record<string, any> = vocabRaw ? vocabRaw : {};

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

      await kv.set(`vocab_tracker:${userId}`, vocab);
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
              await kv.set(`vocab_tracker:${userId}`, vocab);
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

export default app;
