/**
 * MockSpacedRepetitionService — Simulates Supabase SR card operations
 *
 * Preserves current prototype behavior:
 * - getTodayCards: returns up to MAX_DAILY_CARDS sorted by lowest score
 * - submitAttempt: first attempt 55-72, retries 80-95 (same as Dashboard mock)
 * - Interval progression based on score vs MIN_PASSING_SCORE (80)
 *
 * Three-band threshold (aligned with Blueprint):
 * - < 80: Fail (retry or mark for SR)
 * - 80-84: Technical pass (advance + create SR card)
 * - >= 85: Mastery (advance, no SR card needed)
 */
import type { ISpacedRepetitionService } from "../../interfaces";
import type { SRCard, SRInterval, SRSessionResult, ArenaPowerPhrase, ArenaPhase } from "../../types";
import {
  MOCK_SR_CARDS,
  SR_INTERVALS,
  MAX_DAILY_CARDS,
  MIN_PASSING_SCORE,
} from "./data/dashboard-data";
import { MOCK_SHADOWING_PHRASES } from "./data/shadowing-data";
import { delay, mockId } from "./utils";

export class MockSpacedRepetitionService
  implements ISpacedRepetitionService
{
  private cards: SRCard[] = MOCK_SR_CARDS.map((c) => ({ ...c }));

  async getAllCards(_uid: string): Promise<SRCard[]> {
    await delay(300);
    return this.cards.map((c) => ({ ...c }));
  }

  async getTodayCards(_uid: string): Promise<SRCard[]> {
    await delay(300);

    // Same logic as Dashboard: sort by lowest score, take MAX_DAILY_CARDS
    return [...this.cards]
      .sort((a, b) => a.lastScore - b.lastScore)
      .slice(0, MAX_DAILY_CARDS)
      .map((c) => ({ ...c }));
  }

  async submitAttempt(
    cardId: string,
    attemptNumber: number
  ): Promise<SRSessionResult> {
    await delay(1800);

    // Same mock scoring as Dashboard: getMockScore()
    const score =
      attemptNumber <= 1
        ? 55 + Math.floor(Math.random() * 18) // 55-72
        : 80 + Math.floor(Math.random() * 16); // 80-95

    const passed = score >= MIN_PASSING_SCORE;

    // Update card in memory
    const card = this.cards.find((c) => c.id === cardId);
    if (card) {
      card.lastScore = Math.max(card.lastScore, score);
      if (passed) {
        card.intervalStep = Math.min(card.intervalStep + 1, SR_INTERVALS.length);
      }
    }

    // Determine next interval label
    let nextInterval: string;
    if (passed && card) {
      const nextIv = SR_INTERVALS.find(
        (iv) => iv.step === card.intervalStep
      );
      nextInterval = nextIv ? nextIv.label : "dominada";
    } else {
      const currentIv = card
        ? SR_INTERVALS.find((iv) => iv.step === card.intervalStep)
        : SR_INTERVALS[0];
      nextInterval = currentIv ? currentIv.label : "24h";
    }

    return {
      cardId,
      score,
      passed,
      nextInterval,
    };
  }

  async addCardsFromSession(
    _uid: string,
    _sessionId: string,
    phraseIndices: number[]
  ): Promise<SRCard[]> {
    await delay(400);

    const newCards: SRCard[] = phraseIndices.map((idx) => {
      const phrase = MOCK_SHADOWING_PHRASES[idx];
      const card: SRCard = {
        id: mockId("sr"),
        phrase: phrase?.text ?? "",
        word: phrase?.feedback.word ?? "",
        phonetic: phrase?.feedback.phonetic ?? "",
        lastScore: 0,
        intervalStep: 1,
        origin: "Sesi\u00F3n actual",
      };
      this.cards.push(card);
      return { ...card };
    });

    return newCards;
  }

  async addCardsFromArena(
    _uid: string,
    phrases: ArenaPowerPhrase[],
    phase: ArenaPhase
  ): Promise<SRCard[]> {
    await delay(400);

    // Deduplicate: skip phrases that already exist as SR cards
    const existingPhrases = new Set(
      this.cards.map((c) => c.phrase.toLowerCase())
    );

    const phaseLabels: Record<ArenaPhase, string> = {
      support: "Arena · Support",
      guidance: "Arena · Guidance",
      challenge: "Arena · Challenge",
    };

    const newCards: SRCard[] = phrases
      .filter((p) => !existingPhrases.has(p.phrase.toLowerCase()))
      .map((p) => {
        const card: SRCard = {
          id: mockId("sr-arena"),
          phrase: p.phrase,
          word: p.phrase.split(" ").slice(0, 3).join(" "),
          phonetic: "",
          lastScore: 0,
          intervalStep: 1,
          origin: phaseLabels[phase] ?? "Arena",
        };
        this.cards.push(card);
        return { ...card };
      });

    return newCards;
  }

  getIntervals(): SRInterval[] {
    return [...SR_INTERVALS];
  }
}