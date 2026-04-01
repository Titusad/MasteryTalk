/**
 * entities/user — User domain types
 *
 * Sprint 2 FSD: extracted from services/types.ts.
 * services/types.ts re-exports from here for backward compat.
 */

export type UserPlan = "free" | "per-session";

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  plan: UserPlan;
  freeSessionUsed: boolean;
  sessionsCompleted: number;
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
}
