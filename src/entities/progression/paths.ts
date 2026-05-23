import type { ProgressionState, LevelState, LevelStatus } from "./index";
import type { ProgressionPath, ProgressionLevel } from "./path-types";

import { INTERVIEW_LEVELS } from "./interview";
import { SALES_LEVELS } from "./sales";
import { MEETING_LEVELS } from "./meeting";
import { PRESENTATION_LEVELS } from "./presentation";
import { CULTURE_LEVELS } from "./culture";
import { CLIENT_LEVELS } from "./client";
import { SELF_INTRO_LEVELS, INTRODUCTIONS_LEVELS } from "./self-intro";

export const PROGRESSION_PATHS: ProgressionPath[] = [
  {
    id: "self-intro",
    scenarioType: "self-intro",
    title: "Self-Introduction",
    description: "Master how to introduce yourself with clarity and confidence in any professional setting — networking events, new teams, and client meetings.",
    icon: "mic",
    levels: SELF_INTRO_LEVELS,
  },
  {
    id: "introductions",
    scenarioType: "self-intro",
    title: "Professional Introductions",
    description: "From networking events to executive encounters — master the art of introducing yourself with precision, confidence, and presence in any high-stakes setting.",
    icon: "mic",
    levels: INTRODUCTIONS_LEVELS,
  },
  {
    id: "culture",
    scenarioType: "culture",
    title: "U.S. Business Culture",
    description: "Operate with confidence in U.S. corporate culture — direct communication, individual ownership, and executive presence across 6 real-world scenarios.",
    icon: "crown",
    levels: CULTURE_LEVELS,
  },
  {
    id: "interview",
    scenarioType: "interview",
    title: "Interview Mastery",
    description: "Land the role you want by communicating your experience with precision, structure, and conviction — from the phone screen to the final round.",
    icon: "target",
    levels: INTERVIEW_LEVELS,
  },
  {
    id: "sales",
    scenarioType: "sales",
    title: "Sales Champion",
    description: "Win more deals by mastering how to frame value, handle objections, and close with confidence — from the first call to the C-suite.",
    icon: "briefcase",
    levels: SALES_LEVELS,
  },
  {
    id: "meeting",
    scenarioType: "meeting",
    title: "Remote Meeting Presence",
    description: "Lead and participate in remote meetings with authority — speak clearly, redirect diplomatically, and close every meeting with concrete decisions.",
    icon: "video",
    levels: MEETING_LEVELS,
  },
  {
    id: "presentation",
    scenarioType: "presentation",
    title: "Presentations",
    description: "Deliver presentations that move people to action — structure your message, command the room, and handle tough Q&A without losing your thread.",
    icon: "mic",
    levels: PRESENTATION_LEVELS,
  },
  {
    id: "client",
    scenarioType: "client",
    title: "Dealing with Clients",
    description: "Build lasting client relationships through professional communication — set expectations, deliver difficult feedback, and navigate high-stakes conversations.",
    icon: "handshake",
    levels: CLIENT_LEVELS,
  },
];

/* ── Feature Flag: Visible Paths in Production ──
   Set VITE_ENABLED_SCENARIOS in Vercel env to control which paths
   are shown to users. Comma-separated IDs, e.g. "interview,meeting,presentation".
   When unset (local dev), all paths are visible. */

const _enabledRaw = (import.meta.env.VITE_ENABLED_SCENARIOS as string | undefined) || "";
const ENABLED_SCENARIO_IDS = _enabledRaw.split(",").map(s => s.trim()).filter(Boolean);

/** Paths visible to users — filtered by feature flag in production */
const ALWAYS_VISIBLE_PATHS = new Set(["self-intro", "introductions"]);
export const VISIBLE_PATHS: ProgressionPath[] = ENABLED_SCENARIO_IDS.length > 0
  ? PROGRESSION_PATHS.filter(p => ALWAYS_VISIBLE_PATHS.has(p.id) || ENABLED_SCENARIO_IDS.includes(p.id))
  : PROGRESSION_PATHS;

export type PathId = "self-intro" | "introductions" | "interview" | "sales" | "meeting" | "presentation" | "client" | "csuite" | "culture";

export function getDefaultProgressionState(): ProgressionState {
  return {
    activeGoal: "self-intro",
    "self-intro": {
      "si-0": { status: "unlocked" },
    },
    introductions: {
      "intro-1": { status: "locked" },
      "intro-2": { status: "locked" },
      "intro-3": { status: "locked" },
      "intro-4": { status: "locked" },
      "intro-5": { status: "locked" },
      "intro-6": { status: "locked" },
    },
    interview: {
      "int-1": { status: "locked" },
      "int-2": { status: "locked" },
      "int-3": { status: "locked" },
      "int-4": { status: "locked" },
      "int-5": { status: "locked" },
      "int-6": { status: "locked" },
    },
    sales: {
      "sal-1": { status: "locked" },
      "sal-2": { status: "locked" },
      "sal-3": { status: "locked" },
      "sal-4": { status: "locked" },
      "sal-5": { status: "locked" },
      "sal-6": { status: "locked" },
    },
    meeting: {
      "meet-1": { status: "locked" },
      "meet-2": { status: "locked" },
      "meet-3": { status: "locked" },
      "meet-4": { status: "locked" },
      "meet-5": { status: "locked" },
      "meet-6": { status: "locked" },
    },
    presentation: {
      "pres-1": { status: "locked" },
      "pres-2": { status: "locked" },
      "pres-3": { status: "locked" },
      "pres-4": { status: "locked" },
      "pres-5": { status: "locked" },
      "pres-6": { status: "locked" },
    },
    client: {
      "cli-1": { status: "locked" },
      "cli-2": { status: "locked" },
      "cli-3": { status: "locked" },
      "cli-4": { status: "locked" },
      "cli-5": { status: "locked" },
      "cli-6": { status: "locked" },
    },
    csuite: {
      "cs-1": { status: "locked" },
      "cs-2": { status: "locked" },
      "cs-3": { status: "locked" },
      "cs-4": { status: "locked" },
      "cs-5": { status: "locked" },
      "cs-6": { status: "locked" },
    },
    culture: {
      "cul-1": { status: "locked" },
      "cul-2": { status: "locked" },
      "cul-3": { status: "locked" },
      "cul-4": { status: "locked" },
      "cul-5": { status: "locked" },
      "cul-6": { status: "locked" },
    },
  };
}

export function isLevelUnlocked(state: ProgressionState, pathId: PathId, levelId: string): boolean {
  const pathState = state[pathId as keyof ProgressionState] as Record<string, LevelState> | undefined;
  if (!pathState) return false;
  const level = pathState[levelId];
  if (!level) return false;
  return level.status !== "locked";
}

export function getLevelState(state: ProgressionState, pathId: PathId, levelId: string): LevelState {
  const pathState = state[pathId as keyof ProgressionState] as Record<string, LevelState> | undefined;
  return pathState?.[levelId] ?? { status: "locked" as LevelStatus };
}

export function getNextLevelId(pathId: PathId, currentLevelId: string): string | null {
  const path = PROGRESSION_PATHS.find((p) => p.id === pathId);
  if (!path) return null;
  const idx = path.levels.findIndex((l) => l.id === currentLevelId);
  if (idx < 0 || idx >= path.levels.length - 1) return null;
  return path.levels[idx + 1].id;
}

export function getPreviousLevelId(pathId: PathId, currentLevelId: string): string | null {
  const path = PROGRESSION_PATHS.find((p) => p.id === pathId);
  if (!path) return null;
  const idx = path.levels.findIndex((l) => l.id === currentLevelId);
  if (idx <= 0) return null;
  return path.levels[idx - 1].id;
}

export function getLevelDefinition(pathId: PathId, levelId: string): ProgressionLevel | null {
  const path = PROGRESSION_PATHS.find((p) => p.id === pathId);
  if (!path) return null;
  return path.levels.find((l) => l.id === levelId) ?? null;
}
