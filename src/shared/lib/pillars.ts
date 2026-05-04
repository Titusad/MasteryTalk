export const PILLAR_NAMES = [
  "Vocabulary",
  "Grammar",
  "Fluency",
  "Pronunciation",
  "Professional Tone",
  "Persuasion",
] as const;

export type PillarName = (typeof PILLAR_NAMES)[number];

export const PILLAR_COLORS: Record<string, string> = {
  Vocabulary: "#6366f1",
  Grammar: "#0ea5e9",
  Fluency: "#22c55e",
  Pronunciation: "#f59e0b",
  "Professional Tone": "#ec4899",
  Persuasion: "#8b5cf6",
};
