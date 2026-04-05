/**
 * entities/session — Session domain types
 *
 * Sprint 2 FSD: extracted from services/types.ts and shared/session-types.ts.
 * services/types.ts and session-types.ts re-export from here for backward compat.
 */

/* ── Session flow step ── */

export type Step =
  | "key-experience"
  | "cv-upload"
  | "extra-context"
  | "generating-script"
  | "pre-briefing"
  | "practice"
  | "analyzing"
  | "interview-analysis"
  | "path-conversion"
  | "conversation-feedback"
  | "skill-drill"
  | "cp-unlock"
  | "remedial"
  | "session-recap";

/* ── Session mode (Quick Prep vs Conversational Path) ── */

export type SessionMode = "quick-prep" | "conversational-path";

/* ── Scenario type ── */

export type ScenarioType =
  | "interview"
  | "sales";

/* MVP ships with interview + sales only. Future expansions (csuite, negotiation, networking) were removed from assembler.ts during v2.1 cleanup. */

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
