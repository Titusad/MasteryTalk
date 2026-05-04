/**
 * entities/user — User domain types
 *
 * Sprint 2 FSD: extracted from services/types.ts.
 * services/types.ts re-exports from here for backward compat.
 */

/** v9.0: "free" = no purchases, "path" = at least 1 Learning Path purchased */
export type UserPlan = "free" | "path";

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  plan: UserPlan;
  /** ScenarioType[] — scenarios where demo session was used */
  freeSessionsUsed: string[];
  /** ScenarioType[] — purchased paths (permanent access) */
  pathsPurchased: string[];
  createdAt: string;
  marketFocus?: string;
}

export type AuthProvider = "google";

export interface OnboardingProfile {
  industry: string;
  position: string;
  seniority: string;
  /** Persisted from widget — role user is applying for */
  role?: string;
  /** Persisted from widget — company or company type */
  company?: string;
  /** Persisted from Key Experience screen — career highlights */
  keyExperience?: string;
  /** Extracted summary from uploaded CV/resume (GPT-4o processed) */
  cvSummary?: string;
  /** Original CV filename for display */
  cvFileName?: string;
  /** Extracted summary from uploaded sales deck (GPT-4o processed) */
  deckSummary?: string;
  /** Original deck filename for display */
  deckFileName?: string;
  /** Whether user consented to share anonymized professional profile */
  cvConsentGiven?: boolean;
  /** Last job description pasted — pre-filled on the next session */
  lastJobDescription?: string;
  /** User's Ideal L2 Self goal — shown on dashboard as motivational anchor */
  englishGoal?: string;
  /** ID of last pre-session lesson shown — prevents same lesson on consecutive sessions */
  last_pre_session_lesson_id?: string | null;
  /** True after the user completes their first practice session end-to-end */
  narrationCompleted?: boolean;
  /** WhatsApp verification status */
  whatsapp_verified?: boolean;
  /** WhatsApp phrases mastered via spaced-repetition */
  wa_phrases_mastered?: number;
  /** War Room session month tracker (ISO month string, e.g. "2026-04") */
  war_room_month?: string | null;
  /** War Room sessions used in current month */
  war_room_monthly_count?: number;
  /** Aggregated stats persisted from sessions */
  stats?: {
    pillarScores?: Record<string, number>;
    sessions_count?: number;
    [key: string]: unknown;
  };
}
