/**
 * ══════════════════════════════════════════════════════════════
 *  Unit Tests — Spaced Repetition (Pure Functions)
 *
 *  Tests the Leitner-based scheduling logic:
 *    - Box promotion / demotion
 *    - Score thresholds (70 pass, 80 mastery)
 *    - Queue cap enforcement
 *    - Stale phrase archival
 *    - Due phrase filtering
 * ══════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  updatePhraseAfterReview,
  createSRPhrase,
  getDuePhrases,
  enforceQueueCap,
  archiveStale,
  type SpacedRepetitionPhrase,
} from "../spacedRepetition";

/* ── Test data factory ── */

function makePhrase(overrides: Partial<SpacedRepetitionPhrase> = {}): SpacedRepetitionPhrase {
  return {
    id: "test-1",
    phrase: "Could you walk me through your experience?",
    focusWord: "experience",
    ipa: "/ɪkˈspɪəriəns/",
    scenarioType: "interview",
    scenarioLabel: "Job Interview",
    attempts: 0,
    bestScore: 0,
    lastAttemptDate: new Date().toISOString(),
    box: 0,
    nextReviewDate: new Date().toISOString().slice(0, 10),
    consecutiveSuccess: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/* ═══════════════════════════════════════════════════════════════
   createSRPhrase
   ═══════════════════════════════════════════════════════════════ */

describe("createSRPhrase", () => {
  it("should create a phrase with box 0 and today's review date", () => {
    const phrase = createSRPhrase(
      "p-1", "Hello world", "world", "/wɜːrld/", 45, 2, "interview", "Mock Interview"
    );

    expect(phrase.id).toBe("p-1");
    expect(phrase.phrase).toBe("Hello world");
    expect(phrase.focusWord).toBe("world");
    expect(phrase.box).toBe(0);
    expect(phrase.consecutiveSuccess).toBe(0);
    expect(phrase.attempts).toBe(2);
    expect(phrase.bestScore).toBe(45);
  });

  it("should set nextReviewDate to today", () => {
    const phrase = createSRPhrase("p-2", "Test", "test", "/tɛst/", 0, 0, "sales", "Sales");
    const today = new Date().toISOString().slice(0, 10);
    expect(phrase.nextReviewDate).toBe(today);
  });
});

/* ═══════════════════════════════════════════════════════════════
   updatePhraseAfterReview — Box Promotion
   ═══════════════════════════════════════════════════════════════ */

describe("updatePhraseAfterReview", () => {
  it("should advance from box 0 to box 1 on passing score (>= 70)", () => {
    const phrase = makePhrase({ box: 0, consecutiveSuccess: 0 });
    const result = updatePhraseAfterReview(phrase, 75);

    expect(result.box).toBe(1);
    expect(result.consecutiveSuccess).toBe(1);
    expect(result.attempts).toBe(1);
  });

  it("should advance from box 1 to box 2 on passing score", () => {
    const phrase = makePhrase({ box: 1, consecutiveSuccess: 1 });
    const result = updatePhraseAfterReview(phrase, 70);

    expect(result.box).toBe(2);
    expect(result.consecutiveSuccess).toBe(2);
  });

  it("should advance from box 2 to box 3 on passing score", () => {
    const phrase = makePhrase({ box: 2, consecutiveSuccess: 2 });
    const result = updatePhraseAfterReview(phrase, 85);

    expect(result.box).toBe(3);
  });

  it("should stay in box 3 when passing (70-79) but not reaching mastery (80)", () => {
    const phrase = makePhrase({ box: 3, consecutiveSuccess: 3 });
    const result = updatePhraseAfterReview(phrase, 75);

    expect(result.box).toBe(3); // stays — needs 80+ to graduate
    expect(result.consecutiveSuccess).toBe(4);
  });

  it("should graduate to box 4 (mastered) when scoring >= 80 in box 3", () => {
    const phrase = makePhrase({ box: 3, consecutiveSuccess: 3 });
    const result = updatePhraseAfterReview(phrase, 85);

    expect(result.box).toBe(4);
    expect(result.nextReviewDate).toBe("9999-12-31");
  });

  it("should demote to box 1 on failing score (< 70)", () => {
    const phrase = makePhrase({ box: 3, consecutiveSuccess: 5 });
    const result = updatePhraseAfterReview(phrase, 60);

    expect(result.box).toBe(1);
    expect(result.consecutiveSuccess).toBe(0);
  });

  it("should track bestScore across attempts", () => {
    const phrase = makePhrase({ bestScore: 50 });
    const result = updatePhraseAfterReview(phrase, 90);

    expect(result.bestScore).toBe(90);
  });

  it("should not decrease bestScore on lower score", () => {
    const phrase = makePhrase({ bestScore: 85 });
    const result = updatePhraseAfterReview(phrase, 60);

    expect(result.bestScore).toBe(85);
  });

  it("should not mutate the original phrase", () => {
    const phrase = makePhrase({ box: 0 });
    updatePhraseAfterReview(phrase, 75);

    expect(phrase.box).toBe(0); // original unchanged
  });
});

/* ═══════════════════════════════════════════════════════════════
   getDuePhrases
   ═══════════════════════════════════════════════════════════════ */

describe("getDuePhrases", () => {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  it("should return phrases due today or earlier", () => {
    const phrases = [
      makePhrase({ id: "due", nextReviewDate: today, box: 1 }),
      makePhrase({ id: "overdue", nextReviewDate: yesterday, box: 0 }),
      makePhrase({ id: "future", nextReviewDate: tomorrow, box: 2 }),
    ];

    const due = getDuePhrases(phrases);
    expect(due).toHaveLength(2);
    expect(due.map((p) => p.id)).toContain("due");
    expect(due.map((p) => p.id)).toContain("overdue");
  });

  it("should exclude mastered phrases (box 4)", () => {
    const phrases = [
      makePhrase({ id: "mastered", nextReviewDate: today, box: 4 }),
      makePhrase({ id: "active", nextReviewDate: today, box: 1 }),
    ];

    const due = getDuePhrases(phrases);
    expect(due).toHaveLength(1);
    expect(due[0].id).toBe("active");
  });

  it("should sort by nextReviewDate ascending (oldest first)", () => {
    const phrases = [
      makePhrase({ id: "newer", nextReviewDate: today, box: 1 }),
      makePhrase({ id: "older", nextReviewDate: yesterday, box: 0 }),
    ];

    const due = getDuePhrases(phrases);
    expect(due[0].id).toBe("older");
    expect(due[1].id).toBe("newer");
  });

  it("should return empty array when no phrases are due", () => {
    const phrases = [makePhrase({ nextReviewDate: tomorrow, box: 1 })];
    expect(getDuePhrases(phrases)).toHaveLength(0);
  });
});

/* ═══════════════════════════════════════════════════════════════
   enforceQueueCap (max 10 active)
   ═══════════════════════════════════════════════════════════════ */

describe("enforceQueueCap", () => {
  it("should not modify phrases if active count <= 10", () => {
    const phrases = Array.from({ length: 8 }, (_, i) =>
      makePhrase({ id: `p-${i}`, box: 1 })
    );

    const result = enforceQueueCap(phrases);
    expect(result).toHaveLength(8);
    expect(result.every((p) => p.box === 1)).toBe(true);
  });

  it("should archive oldest phrases when active count > 10", () => {
    // Create 12 active phrases with staggered creation dates
    const baseDate = new Date("2026-01-01T00:00:00Z");
    const phrases = Array.from({ length: 12 }, (_, i) =>
      makePhrase({
        id: `p-${i}`,
        box: 1,
        createdAt: new Date(baseDate.getTime() + i * 86400000).toISOString(),
      })
    );

    const result = enforceQueueCap(phrases);
    const active = result.filter((p) => p.box < 4);
    const archived = result.filter((p) => p.box === 4);

    expect(active).toHaveLength(10);
    expect(archived).toHaveLength(2);
  });

  it("should preserve already-mastered phrases", () => {
    const phrases = [
      ...Array.from({ length: 11 }, (_, i) => makePhrase({ id: `active-${i}`, box: 1 })),
      makePhrase({ id: "mastered-1", box: 4 }),
    ];

    const result = enforceQueueCap(phrases);
    const mastered = result.filter((p) => p.id === "mastered-1");
    expect(mastered).toHaveLength(1);
    expect(mastered[0].box).toBe(4);
  });
});

/* ═══════════════════════════════════════════════════════════════
   archiveStale (30-day inactive phrases)
   ═══════════════════════════════════════════════════════════════ */

describe("archiveStale", () => {
  it("should archive box 0 phrases with no progress older than 30 days", () => {
    const oldDate = new Date(Date.now() - 35 * 86400000).toISOString();
    const phrases = [
      makePhrase({ id: "stale", box: 0, consecutiveSuccess: 0, lastAttemptDate: oldDate }),
    ];

    const result = archiveStale(phrases);
    expect(result[0].box).toBe(4);
    expect(result[0].nextReviewDate).toBe("9999-12-31");
  });

  it("should NOT archive box 0 phrases that have recent activity", () => {
    const recentDate = new Date().toISOString();
    const phrases = [
      makePhrase({ id: "recent", box: 0, consecutiveSuccess: 0, lastAttemptDate: recentDate }),
    ];

    const result = archiveStale(phrases);
    expect(result[0].box).toBe(0);
  });

  it("should NOT archive box 2+ phrases even if stale", () => {
    const oldDate = new Date(Date.now() - 35 * 86400000).toISOString();
    const phrases = [
      makePhrase({ id: "box2-old", box: 2, consecutiveSuccess: 0, lastAttemptDate: oldDate }),
    ];

    const result = archiveStale(phrases);
    expect(result[0].box).toBe(2); // untouched
  });

  it("should NOT archive phrases with consecutive successes", () => {
    const oldDate = new Date(Date.now() - 35 * 86400000).toISOString();
    const phrases = [
      makePhrase({ id: "progressing", box: 1, consecutiveSuccess: 2, lastAttemptDate: oldDate }),
    ];

    const result = archiveStale(phrases);
    expect(result[0].box).toBe(1); // kept — has progress
  });
});
