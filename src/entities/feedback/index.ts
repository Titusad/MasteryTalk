/**
 * entities/feedback — Feedback domain types
 *
 * Sprint 2 FSD: extracted from services/types.ts and ConversationFeedback.tsx.
 * services/types.ts re-exports from here for backward compat.
 */

/* ── Session Summary ── */

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

/* ── Core feedback items ── */

export interface Strength {
  title: string;
  desc: string;
}

export interface Opportunity {
  title: string;
  tag?: string;
  desc: string;
}

/* ── Content Quality (interview scenarios) ── */

export interface ContentQualityScores {
  Relevance: number;
  Structure: number;
  Examples: number;
  Impact: number;
}

export interface ContentInsight {
  dimension: keyof ContentQualityScores;
  observation: string;
  tip: string;
}

export interface InterviewReadinessData {
  contentScores: ContentQualityScores;
  interviewReadinessScore: number;
  contentInsights?: ContentInsight[];
}

/* ── Before/After comparison ── */

export interface BeforeAfterComparison {
  userOriginal: string;
  professionalVersion: string;
  technique: string;
}

/* ── Full feedback result from /analyze-feedback ── */

export interface SessionFeedbackResult {
  strengths: Strength[];
  opportunities: Opportunity[];
  duration: string;
  scenarioType: string;
  beforeAfter?: BeforeAfterComparison[];
  pillarScores?: Record<string, number>;
  professionalProficiency?: number;
  contentScores?: ContentQualityScores;
  interviewReadinessScore?: number;
  preparationUtilization?: {
    score: number;
    verdict: string;
    insights: Array<{
      aspect: string;
      observation: string;
      rating: "strong" | "partial" | "missed";
    }>;
  };
  contentInsights?: ContentInsight[];
}

/* ── RealFeedbackData — domain type for AI feedback payload ── */

export interface RealFeedbackData {
  strengths: Strength[];
  opportunities: Opportunity[];
  beforeAfter: BeforeAfterComparison[];
  pillarScores?: Record<string, number> | null;
  professionalProficiency?: number | null;
  contentScores?: Record<string, number> | null;
  interviewReadinessScore?: number | null;
  preparationUtilization?: {
    score: number;
    verdict: string;
    insights: Array<{
      aspect: string;
      observation: string;
      rating: "strong" | "partial" | "missed";
    }>;
  } | null;
  contentInsights?: Array<{
    dimension: string;
    observation: string;
    tip: string;
  }> | null;
  languageInsights?: Array<{
    dimension: string;
    observation: string;
    tip: string;
  }> | null;
}

