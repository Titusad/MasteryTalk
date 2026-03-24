import type { IFeedbackService } from "../../interfaces";
import type {
  SessionFeedbackResult,
  ImprovedScriptResult,
  CompletedPhraseSummary,
  ResultsSummary,
} from "../../types";
import { FeedbackError } from "../../errors";
import { MockFeedbackService } from "../mock/feedback.mock";
import { projectId, publicAnonKey } from "../../../../utils/supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d`;

async function getToken(): Promise<string> {
  try {
    const { getSupabaseClient } = await import("../../supabase");
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || publicAnonKey;
  } catch {
    return publicAnonKey;
  }
}

async function serverFetch(path: string, body: Record<string, unknown>) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Server ${res.status}: ${errBody.slice(0, 300)}`);
  }
  return res.json();
}

/**
 * SupabaseFeedbackService — Real Edge Function feedback analysis
 */
export class SupabaseFeedbackService implements IFeedbackService {
  private mockSvc = new MockFeedbackService();

  async analyzeFeedback(sessionId: string): Promise<SessionFeedbackResult> {
    try {
      console.log(`[SupabaseFeedback] Requesting AI analyst for session: ${sessionId}`);
      const data = await serverFetch("/analyze-feedback", {
        sessionId,
      });

      return {
        strengths: data.strengths || [],
        opportunities: data.opportunities || [],
        duration: "10 mins",
        scenarioType: "Interview",
        
        // Extended AI fields
        beforeAfter: data.beforeAfter || [],
        pillarScores: data.pillarScores || {},
        professionalProficiency: data.professionalProficiency,
        contentScores: data.contentScores,
        interviewReadinessScore: data.interviewReadinessScore,
        preparationUtilization: data.preparationUtilization,
        contentInsights: data.contentInsights,
      };
    } catch (err) {
      console.error("[SupabaseFeedback] analyzeFeedback failed:", err);
      throw new FeedbackError("ANALYSIS_FAILED", err instanceof Error ? err : new Error(String(err)));
    }
  }

  async generateImprovedScript(sessionId: string): Promise<ImprovedScriptResult> {
    // The improved script is based on the beforeAfter data from feedback analysis.
    // For the MVP, we still use mock data because generating a full improved script
    // requires a separate GPT call with the original pre-briefing script context.
    // TODO: Create a dedicated /generate-improved-script endpoint in Phase 2.
    return this.mockSvc.generateImprovedScript(sessionId);
  }

  async getCompletedSummary(sessionId: string): Promise<CompletedPhraseSummary[]> {
    // Completed phrase summaries are for shadowing sessions — not yet backend-powered
    return this.mockSvc.getCompletedSummary(sessionId);
  }

  async generateResultsSummary(sessionId: string): Promise<ResultsSummary> {
    try {
      console.log(`[SupabaseFeedback] Requesting session summary for: ${sessionId}`);
      const data = await serverFetch("/generate-summary", {
        sessionId,
      });

      return {
        totalPhrases: data.totalPhrases || 0,
        totalTime: data.totalTime || "—",
        overallSentiment: data.overallSentiment || "Great session!",
        pronunciationNotes: data.pronunciationNotes || [],
        improvementAreas: data.improvementAreas || [],
      };
    } catch (err) {
      console.warn("[SupabaseFeedback] generateResultsSummary failed, using mock:", err);
      return this.mockSvc.generateResultsSummary(sessionId);
    }
  }
}
