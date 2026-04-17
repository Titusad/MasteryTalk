/**
 * ══════════════════════════════════════════════════════════════
 *  Dashboard — Constants & Mappings (Shared Layer)
 *  Platform-independent. Safe to use in React Native.
 * ══════════════════════════════════════════════════════════════
 */

export const PILLAR_NAMES = [
  "Vocabulary",
  "Grammar",
  "Fluency",
  "Pronunciation",
  "Professional Tone",
  "Persuasion",
] as const;

export type PillarName = (typeof PILLAR_NAMES)[number];

export const TAG_TO_PILLAR: Record<string, PillarName> = {
  vocabulary: "Vocabulary",
  lexicon: "Vocabulary",
  léxico: "Vocabulary",
  vocabulário: "Vocabulary",
  grammar: "Grammar",
  gramática: "Grammar",
  fluency: "Fluency",
  fluidez: "Fluency",
  fluência: "Fluency",
  pronunciation: "Pronunciation",
  pronunciación: "Pronunciation",
  pronúncia: "Pronunciation",
  "professional tone": "Professional Tone",
  "tono profesional": "Professional Tone",
  "tom profissional": "Professional Tone",
  register: "Professional Tone",
  persuasion: "Persuasion",
  persuasión: "Persuasion",
  persuasão: "Persuasion",
  impact: "Persuasion",
  structure: "Persuasion",
};

export const PILLAR_COLORS: Record<string, string> = {
  Vocabulary: "#6366f1",
  Grammar: "#0ea5e9",
  Fluency: "#22c55e",
  Pronunciation: "#f59e0b",
  "Professional Tone": "#ec4899",
  Persuasion: "#8b5cf6",
};

export const PILLAR_TIPS: Record<string, string> = {
  Vocabulary:
    "Incorporate industry-specific terms and power verbs into your responses.",
  Grammar:
    "Focus on complex sentence structures and conditional tenses.",
  Fluency:
    "Practice speaking without pausing — try 30-second uninterrupted responses.",
  Pronunciation:
    "Practice key phrases aloud before sessions, focusing on stress patterns.",
  "Professional Tone":
    "Use hedging language and diplomatic phrasing in your arguments.",
  Persuasion:
    "Structure arguments with problem-solution framing and data points.",
};

/** Weights for Professional Proficiency calculation */
export const PILLAR_WEIGHTS: Record<string, number> = {
  Vocabulary: 1,
  Grammar: 1,
  Fluency: 1.1,
  Pronunciation: 1,
  "Professional Tone": 1.3,
  Persuasion: 1.3,
};

export interface RadarDataPoint {
  skill: string;
  score: number;
  fullMark: number;
}

export const DEFAULT_RADAR: RadarDataPoint[] = PILLAR_NAMES.map(
  (skill) => ({
    skill,
    score: 0,
    fullMark: 100,
  })
);
