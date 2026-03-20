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

async function serverFetch(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
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
 * SupabaseFeedbackService — Invoca Edge Functions reales
 * 
 * Por ahora delega en el MockService los métodos no implementados en backend.
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
        duration: "10 mins", // Esto debería venir de los metadatos de la sesión
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

  // Delegación temporal a MOCK para las partes de la Fase 3 pendientes de backend
  async generateImprovedScript(sessionId: string): Promise<ImprovedScriptResult> {
    return this.mockSvc.generateImprovedScript(sessionId);
  }

  async getCompletedSummary(sessionId: string): Promise<CompletedPhraseSummary[]> {
    return this.mockSvc.getCompletedSummary(sessionId);
  }

  async generateResultsSummary(sessionId: string): Promise<ResultsSummary> {
    return this.mockSvc.generateResultsSummary(sessionId);
  }
}
