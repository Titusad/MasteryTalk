/**
 * ISpacedRepetitionService — SR card management & daily review
 *
 * Production: Supabase PostgreSQL (sr_cards table)
 *             + Edge Function (score-pronunciation)
 * Mock: Returns hardcoded SR phrases with simulated scoring
 */
import type { SRCard, SRInterval, SRSessionResult, ArenaPowerPhrase, ArenaPhase } from "../types";

export interface ISpacedRepetitionService {
  /** Get all SR cards for a user */
  getAllCards(uid: string): Promise<SRCard[]>;

  /** Get today's review cards (max daily limit), sorted by priority */
  getTodayCards(uid: string): Promise<SRCard[]>;

  /** Submit a pronunciation attempt for an SR card */
  submitAttempt(
    cardId: string,
    attemptNumber: number
  ): Promise<SRSessionResult>;

  /** Add new cards from a shadowing session (phrases that weren't passed) */
  addCardsFromSession(
    uid: string,
    sessionId: string,
    phraseIndices: number[]
  ): Promise<SRCard[]>;

  /**
   * Add new cards from Arena Power Phrases used during a conversation session.
   * Deduplicates against existing cards by phrase text.
   */
  addCardsFromArena(
    uid: string,
    phrases: ArenaPowerPhrase[],
    phase: ArenaPhase
  ): Promise<SRCard[]>;

  /** Get the interval definitions */
  getIntervals(): SRInterval[];
}