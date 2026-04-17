/**
 * IUserService — User profile, plan management, usage tracking (v9.0)
 *
 * Production: Supabase PostgreSQL (profiles, power_phrases tables)
 *             + Edge Function (on user create trigger)
 * Mock: Returns hardcoded user data
 */
import type {
  User,
  UserPlan,
  PracticeHistoryItem,
  PowerPhrase,
  PathLevelAccess,
} from "../types";

/** v9.0: Session access check result */
export interface SessionAccessResult {
  allowed: boolean;
  /** "demo" = free first session, "path" = within purchased path */
  mode?: "demo" | "path";
  reason?: "PATH_PURCHASE_REQUIRED" | "FRESH_ATTEMPTS_EXHAUSTED" | "LEVEL_LOCKED";
}

export interface IUserService {
  /** Get user profile */
  getProfile(uid: string): Promise<User>;

  /** Update user profile fields */
  updateProfile(uid: string, data: Partial<User>): Promise<void>;

  /** Get the user's current plan info */
  getPlan(uid: string): Promise<UserPlan>;

  /**
   * v9.0: Check if user can start a session for a specific scenario.
   * - No demo used → allowed (mode: "demo")
   * - Path purchased → allowed (mode: "path"), check level access separately
   * - Otherwise → PATH_PURCHASE_REQUIRED
   */
  canStartSession(
    uid: string,
    scenarioType: string
  ): Promise<SessionAccessResult>;

  /**
   * v9.0: Check if user can start a fresh attempt on a specific level.
   * Returns FRESH_ATTEMPTS_EXHAUSTED if >= 3 attempts used.
   */
  canStartFreshAttempt(
    uid: string,
    scenarioType: string,
    levelId: string
  ): Promise<SessionAccessResult>;

  /** Mark a demo session as used for a scenario */
  markDemoSessionUsed(uid: string, scenarioType: string): Promise<void>;

  /** Get practice history for dashboard */
  getPracticeHistory(uid: string): Promise<PracticeHistoryItem[]>;

  /** Get saved power phrases */
  getPowerPhrases(uid: string): Promise<PowerPhrase[]>;

  /** Save a power phrase */
  savePowerPhrase(uid: string, phrase: PowerPhrase): Promise<void>;
}