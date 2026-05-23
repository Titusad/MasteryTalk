/**
 * useSessionSave — persists completed session data to the backend
 *
 * Extracts from PracticeSessionPage:
 *  - saveSessionToBackend callback
 *  - sessionSavedRef guard
 *  - auto-save effect (fires when feedback + summary are ready)
 */

import { useRef, useCallback, useEffect } from "react";
import type { ScenarioType, SessionSummary, ScriptSection, TurnPronunciationData, InterviewBriefingData } from "@/services/types";
import type { RealFeedbackData } from "@/entities/feedback";
import type { PathId } from "@/entities/progression";
import type { Step } from "@/entities/session";
import { saveSession, completeProgressionLevel } from "./session-api";

interface UseSessionSaveParams {
  step: Step;
  sessionId: string | null;
  feedbackStatus: "idle" | "loading" | "ready" | "error";
  summaryStatus: "idle" | "loading" | "ready" | "error";
  realFeedback: RealFeedbackData | null;
  sessionSummary: SessionSummary | null;
  sessionPronData: TurnPronunciationData[];
  improvedScript: ScriptSection[] | null;
  effectiveScenario: string;
  effectiveInterlocutor: string;
  scenarioType?: ScenarioType;
  interviewBriefing: InterviewBriefingData | null;
  briefingPersonalizations: Record<number, string>;
  startAtContext?: boolean;
  progressionPathId?: PathId;
  progressionLevelId?: string;
  sessionStartRef: React.MutableRefObject<number>;
}

export function useSessionSave({
  step,
  sessionId,
  feedbackStatus,
  summaryStatus,
  realFeedback,
  sessionSummary,
  sessionPronData,
  improvedScript,
  effectiveScenario,
  effectiveInterlocutor,
  scenarioType,
  interviewBriefing,
  briefingPersonalizations,
  startAtContext,
  progressionPathId,
  progressionLevelId,
  sessionStartRef,
}: UseSessionSaveParams) {
  const sessionSavedRef = useRef(false);

  const saveSessionToBackend = useCallback(async () => {
    if (sessionSavedRef.current || !sessionId) return;
    sessionSavedRef.current = true;

    const duration = `${Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000))} min`;
    const payload = {
      scenario: effectiveScenario,
      interlocutor: effectiveInterlocutor,
      scenarioType: scenarioType || "interview",
      duration,
      feedback: realFeedback ? {
        strengths: realFeedback.strengths,
        opportunities: realFeedback.opportunities,
        beforeAfter: realFeedback.beforeAfter,
        pillarScores: realFeedback.pillarScores ? {
          ...realFeedback.pillarScores,
          Pronunciation: sessionPronData.length > 0
            ? Math.round(sessionPronData.reduce((s, t) => s + t.assessment.accuracyScore, 0) / sessionPronData.length)
            : (realFeedback.pillarScores.Pronunciation ?? 0),
        } : null,
        professionalProficiency: realFeedback.professionalProficiency ?? null,
      } : null,
      summary: sessionSummary ? {
        overallSentiment: sessionSummary.overallSentiment,
        nextSteps: sessionSummary.nextSteps,
        sessionHighlight: sessionSummary.sessionHighlight,
        pillarScores: sessionSummary.pillarScores || null,
        professionalProficiency: sessionSummary.professionalProficiency ?? null,
        cefrApprox: sessionSummary.cefrApprox || null,
      } : null,
      improvedScript: improvedScript || null,
      practiceSessionId: sessionId,
      is_war_room: startAtContext === true,
      interviewBriefing: scenarioType === "interview" && interviewBriefing ? {
        anticipatedQuestions: interviewBriefing.anticipatedQuestions.map(q => ({
          id: String(q.id),
          question: q.question,
          approach: q.approach,
        })),
        questionsToAsk: interviewBriefing.questionsToAsk.map(q => ({
          question: q.question,
        })),
      } : null,
      briefingPersonalizations: Object.keys(briefingPersonalizations).length > 0
        ? Object.fromEntries(Object.entries(briefingPersonalizations).map(([k, v]) => [String(k), v]))
        : undefined,
    };

    saveSession(payload).catch((err) => {
      console.error("[SaveSession] ❌ Failed (non-blocking):", err.message);
      sessionSavedRef.current = false;
    });

    if (progressionLevelId && progressionPathId && realFeedback) {
      completeProgressionLevel(
        progressionPathId,
        progressionLevelId,
        realFeedback.professionalProficiency ?? 0,
        realFeedback.pillarScores || {},
      ).catch((err) => {
        console.error("[Progression] ❌ Failed to generate remedial content:", err.message);
      });
    }
  }, [
    sessionId, effectiveScenario, effectiveInterlocutor, scenarioType,
    realFeedback, sessionSummary, sessionPronData, improvedScript,
    interviewBriefing, briefingPersonalizations, startAtContext,
    progressionPathId, progressionLevelId, sessionStartRef,
  ]);

  // Auto-save when entering feedback with both feedback + summary ready
  useEffect(() => {
    if (step === "feedback" && sessionId && !sessionSavedRef.current) {
      if (
        (feedbackStatus === "ready" || feedbackStatus === "error") &&
        (summaryStatus === "ready" || summaryStatus === "error")
      ) {
        saveSessionToBackend();
      }
    }
  }, [step, sessionId, feedbackStatus, summaryStatus, saveSessionToBackend]);

  return { saveSessionToBackend };
}
