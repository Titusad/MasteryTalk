/**
 * IUserService — User profile, plan management, usage tracking
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
} from "../types";

export interface IUserService {
  /** Get user profile */
  getProfile(uid: string): Promise<User>;

  /** Update user profile fields */
  updateProfile(uid: string, data: Partial<User>): Promise<void>;

  /** Get the user's current plan info */
  getPlan(uid: string): Promise<UserPlan>;

  /** Check if user can start a new session (based on plan & credits) */
  canStartSession(uid: string): Promise<{
    allowed: boolean;
    reason?: string;
    creditsRemaining?: number;
  }>;

  /** Mark the free session as used */
  markFreeSessionUsed(uid: string): Promise<void>;

  /** Get practice history for dashboard */
  getPracticeHistory(uid: string): Promise<PracticeHistoryItem[]>;

  /** Get saved power phrases */
  getPowerPhrases(uid: string): Promise<PowerPhrase[]>;

  /** Save a power phrase */
  savePowerPhrase(uid: string, phrase: PowerPhrase): Promise<void>;
}