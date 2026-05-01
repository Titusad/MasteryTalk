/**
 * entities/session — Session domain types
 *
 * Sprint 2 FSD: extracted from services/types.ts and shared/session-types.ts.
 * services/types.ts and session-types.ts re-export from here for backward compat.
 */

/* ── Session flow step ── */

// Sprint 1 FSD: Step is defined in shared/types/session (cross-cutting type).
// Re-exported here for backward compatibility.
export type { Step } from "@/shared/types/session";

/* ── Session mode (Quick Prep vs Conversational Path) ── */

export type SessionMode = "quick-prep" | "conversational-path";

/* ── Scenario type ── */

/**
 * Full union of all scenario types (includes retired ones for backward compat).
 * For runtime validation, use ACTIVE_SCENARIOS below.
 * See PRODUCT_SPEC.md §2 for the canonical list.
 */
export type ScenarioType =
  | "interview"
  | "sales"
  | "meeting"
  | "presentation"
  | "client"
  | "csuite"
  | "self-intro"
  | "culture";

export const ACTIVE_SCENARIOS: ScenarioType[] = ["interview", "sales", "meeting", "presentation", "culture"] as const;

/** Narrow type for active scenarios only */
export type ActiveScenarioType = "interview" | "meeting" | "presentation";

/* ── Conversation ── */

export interface ChatMessage {
  role: "user" | "ai";
  label?: string;
  time: string;
  text: string;
  /** Contextual coaching hint from GPT-4o (only on AI messages) */
  coachingHint?: { starter: string; keywords?: string[]; strategy: string } | null;
}

export interface SessionConfig {
  scenario: string;
  interlocutor: string;
  scenarioType?: ScenarioType;
  context?: string;
  /** Guided fields captured in PracticeSetup (varies per scenarioType) */
  guidedFields?: Record<string, string>;
  /** Market focus / target geography (optional, passed to assembler) */
  marketFocus?: string;
  /** Pillar the user chose to focus on this session (e.g. "Fluency") — injected into system prompt as coaching priority */
  sessionFocus?: string;
  /** User's self-reported confidence level 1–5 before the session — influences interlocutor tone */
  confidenceScore?: number;
  /** Interview briefing data for coherence: anticipated questions + user drafts → injected into interviewer prompt (Gap A+B) */
  interviewBriefing?: {
    anticipatedQuestions: Array<{
      id: number;
      question: string;
      approach: string;
      suggestedOpener: string;
      framework?: { name: string; description: string };
      keyPhrases: string[];
    }>;
    /** User-drafted responses from the "Your Response" tab, keyed by question index */
    userDrafts?: Record<number, string>;
  };
}

/* ── Arena / Progressive Scaffolding ── */

export type ArenaPhase = "support" | "guidance" | "challenge";

export interface ArenaPowerPhrase {
  id: string;
  phrase: string;
  context: string;
  category: "opener" | "transition" | "closing" | "objection" | "data" | "recast";
}

export interface ArenaState {
  phase: ArenaPhase;
  goodInteractions: number;
  totalInteractions: number;
  cognitiveLoadLevel: "normal" | "elevated";
}

/* ── Brief methodology & locale types (extracted from dashboard/model) ── */

export type BriefLocale = "en" | "es" | "pt";

export interface TranslatedBriefContent {
  tagline: string;
  explanation: string;
  patternLabels: { bad: string; good: string };
  coachTip: string;
}

export interface LevelMethodology {
  name: string;
  tagline: string;
  explanation: string;
  pattern: {
    bad: { label: string; script: string };
    good: { label: string; script: string };
  };
  anchorPhrases: string[];
  coachTip: string;
  translations?: Partial<Record<BriefLocale, TranslatedBriefContent>>;
}

export interface SelfIntroContext {
  id: "networking" | "team" | "client";
  label: string;
  description: string;
  icon: string;
  scenario: string;
  interlocutorBehavior: string;
  interlocutor: string;
  methodology: LevelMethodology;
  introHeadline: string;
}
