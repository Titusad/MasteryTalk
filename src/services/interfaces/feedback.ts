/**
 * IFeedbackService — Session analysis & improved script generation
 *
 * Production: Supabase Edge Functions (analyze-feedback, generate-script, generate-results-summary)
 *             + Gemini 1.5 Flash for analysis
 * Mock: Returns hardcoded strengths, opportunities, script sections, and pronunciation tips
 */
import type { SessionFeedbackResult, ImprovedScriptResult, CompletedPhraseSummary, ResultsSummary } from "../types";

export interface IFeedbackService {
  /** Analyze the completed conversation and return feedback */
  analyzeFeedback(sessionId: string): Promise<SessionFeedbackResult>;

  /** Generate an improved script based on the session */
  generateImprovedScript(sessionId: string): Promise<ImprovedScriptResult>;

  /** Get completed phrase summaries for the results screen (§9.2 phrase cards) */
  getCompletedSummary(sessionId: string): Promise<CompletedPhraseSummary[]>;

  /** Generate pronunciation coach results summary (§9.1, §9.3, §9.4) via Gemini */
  generateResultsSummary(sessionId: string): Promise<ResultsSummary>;
}