/**
 * ══════════════════════════════════════════════════════════════
 *  Session Report — Constants & Pure Computations (Shared Layer)
 *  No React, no DOM — 100% reusable in React Native.
 * ══════════════════════════════════════════════════════════════
 */
import type { TurnPronunciationData } from "../../../../services/types";

/* ── Scenario labels ── */
export const SCENARIO_LABELS_MAP: Record<string, string> = {
  sales: "Sales Pitch",
  interview: "Job Interview",
  csuite: "Executive Presentation",
  negotiation: "Negotiation",
  networking: "Networking",
};

/* ── Pillar color map (for Next Steps badges) ── */
export const PILLAR_COLORS: Record<string, { bg: string; text: string }> = {
  "Resiliencia Linguistica": { bg: "rgba(96,165,250,0.15)", text: "#60a5fa" },
  "Defensa de Valor": { bg: "rgba(251,191,36,0.15)", text: "#fbbf24" },
  "Alineacion Cultural": { bg: "rgba(80,200,120,0.15)", text: "#50C878" },
  "Estructura del Discurso": { bg: "rgba(168,85,247,0.15)", text: "#a855f7" },
  "Resiliência Linguística": { bg: "rgba(96,165,250,0.15)", text: "#60a5fa" },
  "Defesa de Valor": { bg: "rgba(251,191,36,0.15)", text: "#fbbf24" },
  "Alinhamento Cultural": { bg: "rgba(80,200,120,0.15)", text: "#50C878" },
  "Estrutura do Discurso": { bg: "rgba(168,85,247,0.15)", text: "#a855f7" },
  Vocabulary: { bg: "rgba(96,165,250,0.15)", text: "#60a5fa" },
  Grammar: { bg: "rgba(168,85,247,0.15)", text: "#a855f7" },
  Fluency: { bg: "rgba(251,191,36,0.15)", text: "#fbbf24" },
  Pronunciation: { bg: "rgba(239,68,68,0.12)", text: "#ef4444" },
  "Professional Tone": { bg: "rgba(80,200,120,0.15)", text: "#50C878" },
  Persuasion: { bg: "rgba(99,102,241,0.15)", text: "#6366f1" },
};

/* ── Proficiency helpers ── */
export function feedbackProficiencyColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 60) return "#6366f1";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export function feedbackProficiencyLabel(score: number): string {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Strong";
  if (score >= 60) return "Intermediate";
  if (score >= 40) return "Developing";
  return "Needs Work";
}

/* ── Pronunciation computed data ── */
export interface PronScores {
  accuracy: number;
  fluency: number;
  prosody: number;
  overall: number;
  turnCount: number;
}

export interface ProblemWord {
  word: string;
  avgScore: number;
  errorType: string;
  count: number;
}

export function computePronScores(
  pronunciationData: TurnPronunciationData[]
): PronScores | null {
  if (!pronunciationData?.length) return null;
  const turns = pronunciationData;
  return {
    accuracy: turns.reduce((s, t) => s + t.assessment.accuracyScore, 0) / turns.length,
    fluency: turns.reduce((s, t) => s + t.assessment.fluencyScore, 0) / turns.length,
    prosody: turns.reduce((s, t) => s + t.assessment.prosodyScore, 0) / turns.length,
    overall: turns.reduce((s, t) => s + t.assessment.pronScore, 0) / turns.length,
    turnCount: turns.length,
  };
}

export function computeProblemWords(
  pronunciationData: TurnPronunciationData[]
): ProblemWord[] {
  if (!pronunciationData?.length) return [];
  const wordMap = new Map<string, { count: number; totalScore: number; errorType: string }>();
  for (const turn of pronunciationData) {
    for (const w of turn.assessment.words) {
      if (w.accuracyScore < 60 || w.errorType === "Mispronunciation") {
        const key = w.word.toLowerCase();
        const existing = wordMap.get(key);
        if (existing) {
          existing.count++;
          existing.totalScore += w.accuracyScore;
        } else {
          wordMap.set(key, { count: 1, totalScore: w.accuracyScore, errorType: w.errorType });
        }
      }
    }
  }
  return Array.from(wordMap.entries())
    .map(([word, data]) => ({
      word,
      avgScore: Math.round(data.totalScore / data.count),
      errorType: data.errorType,
      count: data.count,
    }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 8);
}

export function computePronTip(pronScores: PronScores | null): string {
  if (!pronScores) return "";
  if (pronScores.fluency >= 80)
    return "Your speech flow is strong. Focus on refining intonation and rhythm for even more natural delivery.";
  if (pronScores.fluency >= 60)
    return "Practice linking words together smoothly. Try reading professional articles aloud for 5 minutes daily.";
  return "Start with shorter sentences and gradually build complexity. Record yourself and compare with native speakers.";
}
