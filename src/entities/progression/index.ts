/**
 * entities/progression — Progression, level and lesson domain types
 *
 * Sprint 2 FSD: extracted from services/types.ts.
 * services/types.ts re-exports from here for backward compat.
 */

import type { ScenarioType } from "@/entities/session";

/* ── Level state ── */

export type LevelStatus = "locked" | "unlocked" | "study" | "completed";

export interface LevelState {
  status: LevelStatus;
  bestScore?: number;
  attempts?: number;
  remedialCompleted?: boolean;
}

export interface ProgressionState {
  activeGoal: ScenarioType;
  interview: Record<string, LevelState>;
  sales: Record<string, LevelState>;
  meeting: Record<string, LevelState>;
  presentation: Record<string, LevelState>;
  client: Record<string, LevelState>;
  csuite: Record<string, LevelState>;
}

/* ── Path level access (computed from PathLevelProgress) ── */

export type PathStatus =
  | "not-started"
  | "demo-completed"
  | "purchased"
  | "in-progress"
  | "completed";

export interface PathLevelProgress {
  scenarioType: string;
  levelId: string;
  freshAttempts: number;
  bestSessionId: string | null;
  status: "locked" | "unlocked" | "completed";
  completedAt: string | null;
}

export interface PathLevelAccess {
  scenarioType: string;
  levelId: string;
  freshAttempts: number;
  freshAttemptsRemaining: number;
  bestSessionId: string | null;
  status: "locked" | "unlocked" | "completed";
}

/* ── Remedial content ── */

export interface RemedialLesson {
  id: string;
  title: string;
  pillar: string;
  content: string;
  example: { wrong: string; correct: string };
}

export interface RemedialShadowingPhrase {
  id: string;
  phrase: string;
  focus: string;
}

export interface RemedialContent {
  generatedAt: string;
  weakPillars: string[];
  lessons: RemedialLesson[];
  shadowingPhrases: RemedialShadowingPhrase[];
  completedAt: string | null;
  shadowingScore: number | null;
}

/* ── Structured lesson (5-step study phase) ── */

export interface LessonConceptStep {
  id: "concept";
  title: string;
  subtitle: string;
  body: string;
  mentalModel: string;
}

export interface LessonScenarioStep {
  id: "scenario";
  title: string;
  context: string;
  challenge: string;
}

export interface LessonComparisonStep {
  id: "comparison";
  title: string;
  weak: { label: string; script: string };
  strong: { label: string; script: string };
  analysis: string;
}

export interface LessonToolkitPhrase {
  pattern: string;
  usage: string;
}

export interface LessonToolkitStep {
  id: "toolkit";
  title: string;
  phrases: LessonToolkitPhrase[];
}

export interface LessonExerciseStep {
  id: "exercise";
  title: string;
  instruction: string;
  template: string;
  evaluationCriteria: string;
}

export type LessonStep =
  | LessonConceptStep
  | LessonScenarioStep
  | LessonComparisonStep
  | LessonToolkitStep
  | LessonExerciseStep;

export interface StructuredLesson {
  lessonTitle: string;
  targetPillar: string;
  nextLevelPrep: string;
  steps: LessonStep[];
  generatedAt: string;
  completedAt: string | null;
}
