import { SUPABASE_URL } from "@/services/supabase";
/**
 * ══════════════════════════════════════════════════════════════
 *  MasteryTalk PRO — Micro-Lessons API & Completion Tracking
 *
 *  Data lives in ./microLessonsData.ts (pure static content).
 *  This file exports query helpers + backend sync logic.
 * ══════════════════════════════════════════════════════════════
 */

export type { MicroLesson } from "./microLessonsData";
export { MICRO_LESSONS, getPreSessionLesson } from "./microLessonsData";
import { MICRO_LESSONS } from "./microLessonsData";
import type { MicroLesson } from "./microLessonsData";

/** Get lessons filtered by specific pillars */
export function getLessonsForPillars(pillars: string[]): MicroLesson[] {
  const pillarSet = new Set(pillars.map((p) => p.toLowerCase()));
  return MICRO_LESSONS.filter((l) => pillarSet.has(l.pillar.toLowerCase()));
}

/**
 * Dual-axis lesson recommendation:
 * Axis 1 — weakness: weakest pillars from radarData
 * Axis 2 — context: path/level from the session just completed
 * Returns 2-3 lessons max (1 context + up to 2 weakness-based).
 */
export function getRecommendedLessons(
  radarData: Array<{ skill: string; score: number; fullMark: number }>,
  sessionContext?: { pathId?: string; levelId?: string; scenarioType?: string }
): MicroLesson[] {
  const results: MicroLesson[] = [];
  const seen = new Set<string>();

  // Axis 2 — context: prefer level-specific, then path-general
  const pathId = sessionContext?.pathId || sessionContext?.scenarioType;
  if (pathId) {
    const levelId = sessionContext?.levelId;
    const contextMatches = MICRO_LESSONS.filter(
      (l) => l.pathIds?.includes(pathId)
    );
    const levelSpecific = levelId
      ? contextMatches.filter((l) => l.levelIds?.includes(levelId))
      : [];
    const pick = (levelSpecific[0] ?? contextMatches[0]);
    if (pick) { results.push(pick); seen.add(pick.id); }
  }

  // Axis 1 — weakness: up to 2 lessons from weakest pillars
  const withScores = radarData.filter((d) => d.score > 0);
  if (withScores.length > 0) {
    const weakest = [...withScores]
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((d) => d.skill);
    for (const lesson of getLessonsForPillars(weakest)) {
      if (results.length >= 3) break;
      if (!seen.has(lesson.id)) { results.push(lesson); seen.add(lesson.id); }
    }
  }

  // Fallback
  if (results.length === 0) return MICRO_LESSONS.slice(0, 2);
  return results.slice(0, 3);
}

/* ═══ Completion tracking (localStorage cache + backend sync) ═══ */
const COMPLETED_KEY = "masterytalk_completed_lessons";

function getCompletedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function isLessonComplete(id: string): boolean {
  return getCompletedSet().has(id);
}

export function markLessonComplete(id: string): void {
  // 1. Immediate localStorage write (fast, offline-safe)
  const set = getCompletedSet();
  if (set.has(id)) return; // already done
  set.add(id);
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...set]));
  } catch { /* ignore */ }

  // 2. Fire-and-forget backend sync
  _syncToBackend(id).catch(() => { /* silent */ });
}

export function getCompletedLessonIds(): string[] {
  return [...getCompletedSet()];
}

/** Sync a single lesson completion to the backend */
async function _syncToBackend(lessonId: string): Promise<void> {
  try {
    const { projectId } = await import("../../utils/supabase/info");
    const { getAuthToken } = await import("./supabase");
    const token = await getAuthToken();

    await fetch(
      `${SUPABASE_URL}/functions/v1/make-server-08b8658d/lesson-progress`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonId }),
      }
    );
  } catch { /* silent — localStorage is the source of truth for now */ }
}

/**
 * Fetch completed lessons from backend and merge into localStorage.
 * Call this once on Dashboard/Library mount for cross-device sync.
 */
export async function syncLessonProgress(): Promise<void> {
  try {
    const { projectId } = await import("../../utils/supabase/info");
    const { getAuthToken } = await import("./supabase");
    const token = await getAuthToken();

    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/make-server-08b8658d/lesson-progress`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) return;
    const data = await res.json();
    const backendIds: string[] = data.completedLessons || [];

    // Merge: backend ∪ localStorage
    const local = getCompletedSet();
    let changed = false;
    for (const id of backendIds) {
      if (!local.has(id)) {
        local.add(id);
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(COMPLETED_KEY, JSON.stringify([...local]));
    }
  } catch { /* silent */ }
}
