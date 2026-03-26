/**
 * ══════════════════════════════════════════════════════════════
 *  Practice Session — API Service Functions (Shared Layer)
 *  All Edge Function calls extracted from PracticeSessionPage.
 *  No React, no DOM — 100% reusable in React Native.
 * ══════════════════════════════════════════════════════════════
 */
import { projectId, publicAnonKey } from "../../../../../utils/supabase/info";
import { getAuthToken } from "../../../../services/supabase";
import type {
  ScenarioType,
  ScriptSection,
  SessionSummary,
  InterviewBriefingData,
  TurnPronunciationData,
  SessionConfig,
} from "../../../../services/types";
import type { RealFeedbackData } from "../../../../components/session/ConversationFeedback";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d`;
const TIMEOUT_MS = 40_000;

/* ── Helper: fetch with auth + timeout ── */
async function authFetch(
  path: string,
  body: Record<string, unknown>,
  signal?: AbortSignal
): Promise<Response> {
  const token = await getAuthToken();
  if (!token) throw new Error("No auth token available");

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: publicAnonKey,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Server ${res.status}: ${errBody.slice(0, 200)}`);
  }
  return res;
}

/* ═══════════════════════════════════════════════════════════
   1. Generate Interview Briefing
   ═══════════════════════════════════════════════════════════ */
export interface GenerateBriefingResult {
  briefing: InterviewBriefingData;
}

export async function generateInterviewBriefing(
  scenario: string,
  interlocutor: string,
  guidedFields: Record<string, string>,
  locale: string,
  signal?: AbortSignal
): Promise<GenerateBriefingResult> {
  const res = await authFetch(
    "/generate-interview-briefing",
    { scenario, interlocutor, guidedFields, locale },
    signal
  );
  const data = await res.json();
  const questions = data.anticipatedQuestions || [];
  if (questions.length === 0) throw new Error("No anticipated questions generated");

  return {
    briefing: {
      anticipatedQuestions: questions,
      questionsToAsk: data.questionsToAsk || [],
      culturalTips: data.culturalTips || [],
    },
  };
}

/* ═══════════════════════════════════════════════════════════
   2. Generate Script (Sales / Default path)
   ═══════════════════════════════════════════════════════════ */
export interface GenerateScriptResult {
  sections: ScriptSection[];
}

export async function generateScript(
  scenario: string,
  interlocutor: string,
  scenarioType: ScenarioType | undefined,
  guidedFields: Record<string, string>,
  locale: string,
  signal?: AbortSignal
): Promise<GenerateScriptResult> {
  const token = await getAuthToken();
  const controller = signal ? undefined : new AbortController();
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), TIMEOUT_MS)
    : undefined;

  const res = await fetch(`${BASE_URL}/generate-script`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      scenario,
      interlocutor,
      scenarioType,
      guidedFields,
      locale,
    }),
    signal: signal || controller?.signal,
  });

  if (timeoutId) clearTimeout(timeoutId);
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Server ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  if (!data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
    throw new Error("Response missing valid sections array");
  }
  return { sections: data.sections };
}

/* ═══════════════════════════════════════════════════════════
   3. Generate Preparation Toolkit
   ═══════════════════════════════════════════════════════════ */
export interface PreparationToolkit {
  powerPhrases: Array<{ id: string; phrase: string; context: string; category: string }>;
  powerQuestions: Array<{ question: string; rationale: string; timing: string }>;
  culturalTips: Array<{ title: string; description: string; type: "do" | "avoid" }>;
}

export async function generatePreparationToolkit(
  scenario: string,
  interlocutor: string,
  scenarioType: ScenarioType | undefined,
  guidedFields: Record<string, string>,
  locale: string
): Promise<PreparationToolkit> {
  const token = await getAuthToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const res = await fetch(`${BASE_URL}/generate-preparation-toolkit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      scenario,
      interlocutor,
      scenarioType,
      guidedFields,
      locale,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Toolkit server ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  return {
    powerPhrases: data.powerPhrases || [],
    powerQuestions: data.powerQuestions || [],
    culturalTips: data.culturalTips || [],
  };
}

/* ═══════════════════════════════════════════════════════════
   4. Analyze Feedback
   ═══════════════════════════════════════════════════════════ */
export async function analyzeFeedback(
  sessionId: string,
  scenarioType: ScenarioType | undefined,
  locale: string
): Promise<RealFeedbackData> {
  const token = await getAuthToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const res = await fetch(`${BASE_URL}/analyze-feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId, scenarioType, locale }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Server ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  return {
    strengths: data.strengths || [],
    opportunities: data.opportunities || [],
    beforeAfter: data.beforeAfter || [],
    pillarScores: data.pillarScores || null,
    professionalProficiency:
      typeof data.professionalProficiency === "number"
        ? data.professionalProficiency
        : null,
    contentScores: data.contentScores || null,
    interviewReadinessScore:
      typeof data.interviewReadinessScore === "number"
        ? data.interviewReadinessScore
        : null,
    contentInsights: data.contentInsights || null,
    preparationUtilization: data.preparationUtilization || null,
  };
}

/* ═══════════════════════════════════════════════════════════
   5. Generate Summary
   ═══════════════════════════════════════════════════════════ */
export async function generateSummary(
  sessionId: string,
  scenarioType: ScenarioType | undefined,
  locale: string
): Promise<SessionSummary> {
  const token = await getAuthToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const res = await fetch(`${BASE_URL}/generate-summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      sessionId,
      scenarioType: scenarioType || "interview",
      locale,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Summary ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  return {
    overallSentiment: data.overallSentiment || "",
    nextSteps: data.nextSteps || [],
    sessionHighlight: data.sessionHighlight || "",
    pillarScores: data.pillarScores || null,
    professionalProficiency:
      typeof data.professionalProficiency === "number"
        ? data.professionalProficiency
        : null,
    cefrApprox: data.cefrApprox || null,
  };
}

/* ═══════════════════════════════════════════════════════════
   6. Generate Improved Script (Golden Master)
   ═══════════════════════════════════════════════════════════ */
export async function generateImprovedScript(
  sessionId: string,
  locale: string
): Promise<ScriptSection[]> {
  const token = await getAuthToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/generate-improved-script`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId, locale }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!res.ok) {
      if (res.status === 404) {
        console.warn("⚠️ [GenerateImprovedScript] Edge function not found (404). Returning empty script.");
        return [];
      }
      const errBody = await res.text();
      throw new Error(`Script ${res.status}: ${errBody.slice(0, 200)}`);
    }

    const data = await res.json();
    if (!data?.sections) throw new Error("No improved script sections returned");
    return data.sections;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn("⚠️ [GenerateImprovedScript] Error fetching script:", err.message);
    throw err;
  }
}

/* ═══════════════════════════════════════════════════════════
   7. Save Session to Backend
   ═══════════════════════════════════════════════════════════ */
export interface SaveSessionPayload {
  scenario: string;
  interlocutor: string;
  scenarioType: string;
  duration: string;
  feedback: {
    strengths: RealFeedbackData["strengths"];
    opportunities: RealFeedbackData["opportunities"];
    beforeAfter: RealFeedbackData["beforeAfter"];
    pillarScores: Record<string, number> | null;
    professionalProficiency: number | null;
  } | null;
  summary: {
    overallSentiment: string;
    nextSteps: SessionSummary["nextSteps"];
    sessionHighlight: string;
    pillarScores: Record<string, number> | null;
    professionalProficiency: number | null;
    cefrApprox: string | null;
  } | null;
  improvedScript: ScriptSection[] | null;
  practiceSessionId: string;
  interviewBriefing: {
    anticipatedQuestions: Array<{ id: string; question: string; approach: string }>;
    questionsToAsk: Array<{ question: string }>;
  } | null;
}

export async function saveSession(payload: SaveSessionPayload): Promise<void> {
  await authFetch("/sessions", payload as unknown as Record<string, unknown>);
}

/* ═══════════════════════════════════════════════════════════
   8. Save Pronunciation Data
   ═══════════════════════════════════════════════════════════ */
export async function savePronunciationData(
  sessionId: string,
  turns: TurnPronunciationData[]
): Promise<void> {
  await authFetch("/save-pronunciation", { sessionId, turns });
}

/* ═══════════════════════════════════════════════════════════
   9. Complete Progression Level
   ═══════════════════════════════════════════════════════════ */
export async function completeProgressionLevel(
  pathId: string,
  levelId: string,
  score: number,
  pillarScores: Record<string, number> | null
): Promise<{ remedial?: unknown }> {
  try {
    const res = await authFetch("/progression/complete-level", {
      pathId,
      levelId,
      score,
      pillarScores,
    });
    return res.json();
  } catch (err: any) {
    console.warn("⚠️ [Progression] complete-level failed (Endpoint might not be deployed):", err.message);
    return {};
  }
}

export async function completeRemedial(
  pathId: string,
  levelId: string,
  shadowingScore: number
): Promise<void> {
  try {
    await authFetch("/progression/complete-remedial", {
      pathId,
      levelId,
      shadowingScore,
    });
  } catch (err: any) {
    console.warn("⚠️ [Progression] complete-remedial failed (Endpoint might not be deployed):", err.message);
  }
}
