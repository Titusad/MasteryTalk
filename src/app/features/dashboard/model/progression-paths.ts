/**
 * ══════════════════════════════════════════════════════════════
 *  Scenario Progression Tree — Static Path Definitions
 *  Two goal paths (Interview Mastery / Sales Champion) × 4 levels each.
 * ══════════════════════════════════════════════════════════════
 */

import type { ProgressionState, LevelState, LevelStatus } from "../../../services/types";

/* ── Level Definition ── */

export interface ProgressionLevel {
  id: string;
  level: number;
  title: string;
  scenario: string;
  interlocutorBehavior: string;
  interlocutor: string;
  unlockRequirement: string;
}

export interface ProgressionPath {
  id: "interview" | "sales";
  title: string;
  icon: string;
  levels: ProgressionLevel[];
}

/* ── Interview Mastery Path ── */

const INTERVIEW_LEVELS: ProgressionLevel[] = [
  {
    id: "int-1",
    level: 1,
    title: "Phone Screen",
    scenario: "Initial recruiter phone screen — introduce yourself and answer standard questions",
    interlocutorBehavior: "Friendly, standard questions",
    interlocutor: "recruiter",
    unlockRequirement: "Always open",
  },
  {
    id: "int-2",
    level: 2,
    title: "Behavioral Round",
    scenario: "Behavioral interview — 'Tell me about a time…' questions with STAR method",
    interlocutorBehavior: "Probes follow-ups, expects STAR format",
    interlocutor: "hiring_manager",
    unlockRequirement: "Complete Level 1 remedial",
  },
  {
    id: "int-3",
    level: 3,
    title: "Technical Discussion",
    scenario: "Technical deep-dive — system design and problem-solving discussion",
    interlocutorBehavior: "Challenges vagueness, probes deeply",
    interlocutor: "sme",
    unlockRequirement: "Complete Level 2 remedial",
  },
  {
    id: "int-4",
    level: 4,
    title: "Salary Negotiation",
    scenario: "Compensation and benefits negotiation with HR",
    interlocutorBehavior: "Pushback, counter-offers, objections",
    interlocutor: "hr",
    unlockRequirement: "Complete Level 3 remedial",
  },
];

/* ── Sales Champion Path ── */

const SALES_LEVELS: ProgressionLevel[] = [
  {
    id: "sal-1",
    level: 1,
    title: "Discovery Call",
    scenario: "Discovery call — understanding client needs and pain points",
    interlocutorBehavior: "Busy, gives short answers",
    interlocutor: "gatekeeper",
    unlockRequirement: "Always open",
  },
  {
    id: "sal-2",
    level: 2,
    title: "Product Demo",
    scenario: "B2B SaaS product demo — presenting value proposition",
    interlocutorBehavior: "Questions value prop, asks 'so what?'",
    interlocutor: "technical_buyer",
    unlockRequirement: "Complete Level 1 remedial",
  },
  {
    id: "sal-3",
    level: 3,
    title: "Objection Handling",
    scenario: "Handling price and timing objections mid-deal",
    interlocutorBehavior: "Aggressive pushback, budget concerns",
    interlocutor: "champion",
    unlockRequirement: "Complete Level 2 remedial",
  },
  {
    id: "sal-4",
    level: 4,
    title: "Close the Deal",
    scenario: "Final negotiation — closing a six-figure B2B deal",
    interlocutorBehavior: "Tests conviction, plays hardball",
    interlocutor: "decision_maker",
    unlockRequirement: "Complete Level 3 remedial",
  },
];

/* ── Exported Paths ── */

export const PROGRESSION_PATHS: ProgressionPath[] = [
  { id: "interview", title: "Interview Mastery", icon: "🎯", levels: INTERVIEW_LEVELS },
  { id: "sales", title: "Sales Champion", icon: "💼", levels: SALES_LEVELS },
];

/* ── Helpers ── */

export function getDefaultProgressionState(): ProgressionState {
  return {
    activeGoal: "interview",
    interview: {
      "int-1": { status: "unlocked" },
      "int-2": { status: "locked" },
      "int-3": { status: "locked" },
      "int-4": { status: "locked" },
    },
    sales: {
      "sal-1": { status: "unlocked" },
      "sal-2": { status: "locked" },
      "sal-3": { status: "locked" },
      "sal-4": { status: "locked" },
    },
  };
}

export function isLevelUnlocked(state: ProgressionState, pathId: "interview" | "sales", levelId: string): boolean {
  const pathState = state[pathId];
  if (!pathState) return false;
  const level = pathState[levelId];
  if (!level) return false;
  return level.status !== "locked";
}

export function getLevelState(state: ProgressionState, pathId: "interview" | "sales", levelId: string): LevelState {
  const pathState = state[pathId];
  return pathState?.[levelId] ?? { status: "locked" as LevelStatus };
}

export function getNextLevelId(pathId: "interview" | "sales", currentLevelId: string): string | null {
  const path = PROGRESSION_PATHS.find((p) => p.id === pathId);
  if (!path) return null;
  const idx = path.levels.findIndex((l) => l.id === currentLevelId);
  if (idx < 0 || idx >= path.levels.length - 1) return null;
  return path.levels[idx + 1].id;
}

export function getLevelDefinition(pathId: "interview" | "sales", levelId: string): ProgressionLevel | null {
  const path = PROGRESSION_PATHS.find((p) => p.id === pathId);
  if (!path) return null;
  return path.levels.find((l) => l.id === levelId) ?? null;
}
