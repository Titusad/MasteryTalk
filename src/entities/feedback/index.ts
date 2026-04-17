/**
 * entities/feedback — Feedback domain types
 *
 * Sprint 2 FSD: extracted from services/types.ts.
 * services/types.ts re-exports from here for backward compat.
 */

export interface SessionSummaryNextStep {
  title: string;
  desc: string;
  pillar: string;
}

export interface SessionSummary {
  overallSentiment: string;
  nextSteps: SessionSummaryNextStep[];
  sessionHighlight: string;
  pillarScores?: Record<string, number> | null;
  professionalProficiency?: number | null;
  cefrApprox?: string | null;
}
