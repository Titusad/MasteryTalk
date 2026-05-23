/**
 * useFeedbackGeneration — manages post-session feedback/summary/improved-script generation
 *
 * Extracts from PracticeSessionPage:
 *  - realFeedback, feedbackStatus, feedbackAnimDone
 *  - sessionSummary, summaryStatus
 *  - improvedScript, improvedScriptStatus
 *  - sessionPronData
 *  - fireFeedbackAnalysis, fireSummaryGeneration, fireImprovedScriptGeneration
 *  - SR seed effect (seeds spaced-repetition phrases from feedback)
 */

import { useState, useRef, useCallback, useEffect } from "react";
import type { ScenarioType, SessionSummary, ScriptSection, TurnPronunciationData } from "@/services/types";
import type { RealFeedbackData } from "@/entities/feedback";
import {
  analyzeFeedback,
  generateSummary,
  generateImprovedScript,
} from "./session-api";
import {
  feedbackCache,
  summaryCache,
  improvedScriptCache,
  pronDataCache,
} from "@/shared/lib/sessionCache";
import { createSRPhrase, flagPhrasesForReview } from "@/shared/lib/spacedRepetition";
import { detectLanguageBackground } from "@/services/locale-detect";

const _detectedLocale = detectLanguageBackground();

interface UseFeedbackGenerationParams {
  sessionId: string | null;
  scenarioType?: ScenarioType;
  scenario: string;
  /** Browser-history session ID for restoring state on Back/Forward */
  initialSessionId?: string | null;
  /** Browser-history step for restoring state on Back/Forward */
  initialHistoryStep?: string | null;
}

export function useFeedbackGeneration({
  sessionId,
  scenarioType,
  scenario,
  initialSessionId,
  initialHistoryStep,
}: UseFeedbackGenerationParams) {
  const [realFeedback, setRealFeedback] = useState<RealFeedbackData | null>(() =>
    initialSessionId ? feedbackCache.get(initialSessionId) || null : null
  );
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "loading" | "ready" | "error">(() =>
    initialHistoryStep === "feedback" ? "ready" : "idle"
  );
  const [feedbackAnimDone, setFeedbackAnimDone] = useState(() =>
    initialHistoryStep === "feedback"
  );

  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(() =>
    initialSessionId ? summaryCache.get(initialSessionId) || null : null
  );
  const [summaryStatus, setSummaryStatus] = useState<"idle" | "loading" | "ready" | "error">(() =>
    initialHistoryStep === "feedback" ? "ready" : "idle"
  );

  const [improvedScript, setImprovedScript] = useState<ScriptSection[] | null>(() =>
    initialSessionId ? improvedScriptCache.get(initialSessionId) || null : null
  );
  const [improvedScriptStatus, setImprovedScriptStatus] = useState<"idle" | "loading" | "ready" | "error">(() =>
    initialHistoryStep === "feedback" ? "ready" : "idle"
  );

  const [sessionPronData, setSessionPronData] = useState<TurnPronunciationData[]>(() =>
    initialSessionId ? pronDataCache.get(initialSessionId) || [] : []
  );

  const srSeededRef = useRef(false);

  const fireFeedbackAnalysis = useCallback(async () => {
    if (!sessionId) return;
    if (feedbackStatus === "loading" || feedbackStatus === "ready") return;
    setFeedbackStatus("loading");
    setRealFeedback(null);

    try {
      const fb = await analyzeFeedback(sessionId, scenarioType, _detectedLocale);
      setRealFeedback(fb);
      feedbackCache.set(sessionId, fb);
      setFeedbackStatus("ready");
    } catch (err: any) {
      console.error("[AnalyzeFeedback] ❌ Failed:", err.message);
      setFeedbackStatus("error");
    }
  }, [sessionId, scenarioType, feedbackStatus]);

  const fireSummaryGeneration = useCallback(async () => {
    if (!sessionId) return;
    setSessionSummary(null);
    setSummaryStatus("loading");

    try {
      const sum = await generateSummary(sessionId, scenarioType, _detectedLocale);
      setSessionSummary(sum);
      setSummaryStatus("ready");
      summaryCache.set(sessionId, sum);
    } catch (err: any) {
      console.error("[GenerateSummary] ❌ Failed:", err.message);
      setSummaryStatus("error");
    }
  }, [sessionId, scenarioType]);

  const fireImprovedScriptGeneration = useCallback(async () => {
    if (!sessionId) return;
    setImprovedScript(null);
    setImprovedScriptStatus("loading");

    try {
      const sections = await generateImprovedScript(sessionId, _detectedLocale);
      setImprovedScript(sections);
      improvedScriptCache.set(sessionId, sections);
      setImprovedScriptStatus("ready");
    } catch (err: any) {
      console.error("[GenerateImprovedScript] ❌ Failed:", err.message);
      setImprovedScriptStatus("error");
    }
  }, [sessionId]);

  // Seed "Phrases to Review" from feedback beforeAfter (first session bootstrap)
  useEffect(() => {
    if (feedbackStatus !== "ready" || !realFeedback || srSeededRef.current) return;
    srSeededRef.current = true;

    const beforeAfter = realFeedback.beforeAfter || [];
    if (beforeAfter.length === 0) return;

    const srPhrases = beforeAfter.slice(0, 5).map((ba, i) => {
      const words = ba.professionalVersion.split(/\s+/);
      const focusWord = words.find((w: string) => w.replace(/[^a-zA-Z]/g, "").length > 4) || words[0] || "";
      return createSRPhrase(
        `feedback-${sessionId}-${i}`,
        ba.professionalVersion,
        focusWord.replace(/[^a-zA-Z'-]/g, ""),
        "",
        0,
        0,
        scenarioType || "interview",
        scenario || "Practice Session",
      );
    });

    flagPhrasesForReview(srPhrases).catch(err =>
      console.warn("[SR Seed] Failed to seed phrases from feedback:", err)
    );
  }, [feedbackStatus, realFeedback, sessionId, scenarioType, scenario]);

  return {
    realFeedback,
    feedbackStatus,
    feedbackAnimDone,
    sessionSummary,
    summaryStatus,
    improvedScript,
    improvedScriptStatus,
    sessionPronData,
    fireFeedbackAnalysis,
    fireSummaryGeneration,
    fireImprovedScriptGeneration,
    setFeedbackAnimDone,
    setSessionPronData,
    setFeedbackStatus,
    setRealFeedback,
  };
}
