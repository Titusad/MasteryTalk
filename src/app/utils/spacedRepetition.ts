import { SUPABASE_URL } from "@/services/supabase";
/**
 * ==============================================================
 *  inFluentia PRO - Spaced Repetition System
 *
 *  Leitner-based scheduling for pronunciation phrases that the
 *  user struggled with during shadowing practice (< 70% after 3
 *  attempts). Phrases are persisted in KV backend and shown in
 *  the Dashboard for periodic review.
 *
 *  Box system (internal, not exposed to user):
 *    Box 0 = newly flagged (review today)
 *    Box 1 = 1 day interval
 *    Box 2 = 3 day interval
 *    Box 3 = 7 day interval
 *    Box 4 = mastered (removed from queue)
 *
 *  - Pass >= 70% in review -> advance box
 *  - Pass >= 80% in box 3  -> box 4 (mastered, exits queue)
 *  - Fail < 70% in any box -> back to box 1
 *
 *  Queue cap: 10 active phrases. Oldest box-0 phrases without
 *  progress are archived after 30 days.
 * ==============================================================
 */

import { projectId } from "../../../utils/supabase/info";
import { getAuthToken } from "../../services/supabase";


/* -- Types -- */

export interface SpacedRepetitionPhrase {
    id: string;
    /** Full sentence from conversation */
    phrase: string;
    /** Focus word (worst-scoring) */
    focusWord: string;
    /** IPA transcription */
    ipa: string;
    /** Scenario type the phrase came from */
    scenarioType: string;
    /** Scenario label */
    scenarioLabel: string;

    /* Attempt tracking */
    attempts: number;
    bestScore: number;
    lastAttemptDate: string; // ISO

    /* Leitner scheduling (internal) */
    box: 0 | 1 | 2 | 3 | 4;
    nextReviewDate: string; // ISO date (YYYY-MM-DD)
    consecutiveSuccess: number;

    /** When the phrase was first flagged */
    createdAt: string; // ISO
}

/* -- Constants -- */

const BOX_INTERVALS: Record<number, number> = {
    0: 0,  // today
    1: 1,  // 1 day
    2: 3,  // 3 days
    3: 7,  // 7 days
    4: 999, // mastered -- won't appear
};

const PASS_THRESHOLD = 70;
const MASTERY_THRESHOLD = 80;
const MAX_QUEUE_SIZE = 10;
const ARCHIVE_DAYS = 30;

const SERVER_BASE = `${SUPABASE_URL}/functions/v1/make-server-08b8658d`;

/* -- Scheduling helpers -- */

function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

/** Advance or demote a phrase based on review score */
export function updatePhraseAfterReview(
    phrase: SpacedRepetitionPhrase,
    score: number
): SpacedRepetitionPhrase {
    const updated = { ...phrase };
    updated.attempts += 1;
    updated.bestScore = Math.max(updated.bestScore, score);
    updated.lastAttemptDate = new Date().toISOString();

    if (score >= PASS_THRESHOLD) {
        updated.consecutiveSuccess += 1;

        // In box 3, need 80% to graduate to mastered
        if (updated.box === 3 && score >= MASTERY_THRESHOLD) {
            updated.box = 4;
            updated.nextReviewDate = "9999-12-31"; // effectively archived
        } else if (updated.box < 3) {
            updated.box = (updated.box + 1) as 0 | 1 | 2 | 3 | 4;
            updated.nextReviewDate = addDays(todayStr(), BOX_INTERVALS[updated.box]);
        } else {
            // box 3, passed but < 80%: stay in box 3, reschedule
            updated.nextReviewDate = addDays(todayStr(), BOX_INTERVALS[3]);
        }
    } else {
        // Failed: back to box 1 (not 0, to avoid frustration)
        updated.consecutiveSuccess = 0;
        updated.box = 1;
        updated.nextReviewDate = addDays(todayStr(), BOX_INTERVALS[1]);
    }

    return updated;
}

/** Create a new SR phrase from shadowing data */
export function createSRPhrase(
    phraseId: string,
    sentence: string,
    focusWord: string,
    ipa: string,
    bestScore: number,
    attempts: number,
    scenarioType: string,
    scenarioLabel: string
): SpacedRepetitionPhrase {
    return {
        id: phraseId,
        phrase: sentence,
        focusWord,
        ipa,
        scenarioType,
        scenarioLabel,
        attempts,
        bestScore,
        lastAttemptDate: new Date().toISOString(),
        box: 0,
        nextReviewDate: todayStr(),
        consecutiveSuccess: 0,
        createdAt: new Date().toISOString(),
    };
}

/** Filter phrases due for review today */
export function getDuePhrases(
    phrases: SpacedRepetitionPhrase[]
): SpacedRepetitionPhrase[] {
    const today = todayStr();
    return phrases
        .filter((p) => p.box < 4 && p.nextReviewDate <= today)
        .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
}

/** Enforce queue cap: keep most recent, archive overflow */
export function enforceQueueCap(
    phrases: SpacedRepetitionPhrase[]
): SpacedRepetitionPhrase[] {
    const active = phrases.filter((p) => p.box < 4);
    const mastered = phrases.filter((p) => p.box === 4);

    if (active.length <= MAX_QUEUE_SIZE) return phrases;

    // Sort by creation date (newest first), keep top MAX_QUEUE_SIZE
    const sorted = [...active].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const kept = sorted.slice(0, MAX_QUEUE_SIZE);
    // Archive the rest by setting box = 4
    const archived = sorted.slice(MAX_QUEUE_SIZE).map((p) => ({
        ...p,
        box: 4 as const,
        nextReviewDate: "9999-12-31",
    }));

    return [...kept, ...archived, ...mastered];
}

/** Archive stale phrases (in box 0-1 with no progress for 30+ days) */
export function archiveStale(
    phrases: SpacedRepetitionPhrase[]
): SpacedRepetitionPhrase[] {
    const cutoff = addDays(todayStr(), -ARCHIVE_DAYS);
    return phrases.map((p) => {
        if (
            p.box <= 1 &&
            p.consecutiveSuccess === 0 &&
            p.lastAttemptDate < cutoff
        ) {
            return { ...p, box: 4 as const, nextReviewDate: "9999-12-31" };
        }
        return p;
    });
}

/* -- API calls -- */

export async function fetchSRPhrases(): Promise<SpacedRepetitionPhrase[]> {
    try {
        const token = await getAuthToken();
        const res = await fetch(`${SERVER_BASE}/spaced-repetition`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            console.warn("[SR] Failed to fetch phrases:", res.status);
            return [];
        }
        const data = await res.json();
        return data.phrases || [];
    } catch (err) {
        console.error("[SR] Fetch error:", err);
        return [];
    }
}

export async function saveSRPhrases(
    phrases: SpacedRepetitionPhrase[]
): Promise<boolean> {
    try {
        const token = await getAuthToken();
        const res = await fetch(`${SERVER_BASE}/spaced-repetition`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ phrases }),
        });
        if (!res.ok) {
            console.warn("[SR] Failed to save phrases:", res.status);
            return false;
        }
        return true;
    } catch (err) {
        console.error("[SR] Save error:", err);
        return false;
    }
}

/** Convenience: add new phrases and save */
export async function flagPhrasesForReview(
    newPhrases: SpacedRepetitionPhrase[]
): Promise<void> {
    if (newPhrases.length === 0) return;

    const existing = await fetchSRPhrases();

    // Merge: don't duplicate by id
    const existingIds = new Set(existing.map((p) => p.id));
    const toAdd = newPhrases.filter((p) => !existingIds.has(p.id));

    let merged = [...existing, ...toAdd];
    merged = archiveStale(merged);
    merged = enforceQueueCap(merged);

    await saveSRPhrases(merged);
}
