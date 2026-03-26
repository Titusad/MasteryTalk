/**
 * ══════════════════════════════════════════════════════════════
 *  Shadowing — Pure Functions & Types (Shared Layer)
 *  No React, no DOM — 100% reusable in React Native.
 * ══════════════════════════════════════════════════════════════
 */
import type { TurnPronunciationData, BeforeAfterComparison } from "../../../../services/types";

/* ── Types ── */

export interface ShadowingPhrase {
  id: string;
  sentence: string;
  focusWord: string;
  ipa: string;
  originalScore: number;
  problemWords: { word: string; score: number; errorType: string }[];
  turnIndex: number;
}

export interface DrillResult {
  accuracy: number;
  fluency: number;
  prosody: number;
  overall: number;
  wordResults: { word: string; score: number; errorType: string }[];
}

export type ShadowingPhase =
  | "idle"
  | "playing"
  | "ready"
  | "recording"
  | "processing"
  | "result"
  | "error";

/* ── Constants ── */

export const SR_FAIL_THRESHOLD = 70;
export const SR_MAX_ATTEMPTS = 3;

/* ── Phoneme → IPA mapping (Azure SAPI → IPA) ── */

const PHONEME_IPA: Record<string, string> = {
  aa: "\u0251", ah: "\u028C", ae: "\u00E6", ao: "\u0254", aw: "a\u028A",
  ax: "\u0259", ay: "a\u026A", b: "b", ch: "t\u0283", d: "d",
  dh: "\u00F0", eh: "\u025B", er: "\u025D", ey: "e\u026A", f: "f",
  g: "\u0261", hh: "h", ih: "\u026A", iy: "i", jh: "d\u0292",
  k: "k", l: "l", m: "m", n: "n", ng: "\u014B",
  ow: "o\u028A", oy: "\u0254\u026A", p: "p", r: "\u0279", s: "s",
  sh: "\u0283", t: "t", th: "\u03B8", uh: "\u028A", uw: "u",
  v: "v", w: "w", y: "j", z: "z", zh: "\u0292",
};

export function phonemesToIpa(
  phonemes: { phoneme: string }[]
): string {
  if (!phonemes || phonemes.length === 0) return "";
  const ipa = phonemes
    .map((p) => PHONEME_IPA[p.phoneme.toLowerCase()] || p.phoneme.toLowerCase())
    .join("");
  return `/${ipa}/`;
}

/* ── Stress syllable detection ── */

export function splitStress(word: string): [string, string, string] {
  if (word.length <= 3) return ["", word, ""];
  const lower = word.toLowerCase();
  const vowels = "aeiouy";

  let vStart = -1;
  for (let i = 0; i < lower.length; i++) {
    if (vowels.includes(lower[i])) {
      vStart = i;
      break;
    }
  }
  if (vStart === -1) return ["", word, ""];

  let vEnd = vStart;
  while (vEnd < lower.length && vowels.includes(lower[vEnd])) vEnd++;
  if (vEnd < lower.length) vEnd++;

  const stressEnd = Math.min(vEnd, word.length);
  return ["", word.slice(0, stressEnd), word.slice(stressEnd)];
}

/* ── Clean transcription ── */

export function cleanTranscription(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/\b(\w+)(\s+\1)+\b/gi, "$1");
  cleaned = cleaned.replace(/\b(um|uh|uhm|hmm|umm|er|ah)\b[,.]?\s*/gi, "");
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
  if (cleaned.length > 0) {
    cleaned = cleaned[0].toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

/* ── Extract shadowing phrases from pronunciation data ── */

export function extractShadowingPhrases(
  turns: TurnPronunciationData[],
  beforeAfter?: BeforeAfterComparison[]
): ShadowingPhrase[] {
  const phrases: ShadowingPhrase[] = [];

  for (const turn of turns) {
    const { words, recognizedText, accuracyScore } = turn.assessment;
    if (!words || words.length < 4) continue;
    if (!recognizedText || recognizedText.trim().length < 10) continue;

    const problemWords = words
      .filter((w) => w.errorType !== "None" || w.accuracyScore < 75)
      .map((w) => ({
        word: w.word,
        score: w.accuracyScore,
        errorType: w.errorType,
      }));

    if (problemWords.length === 0 && accuracyScore >= 85) continue;

    const sortedWords = [...words]
      .filter((w) => w.word.length > 2)
      .sort((a, b) => a.accuracyScore - b.accuracyScore);

    const focusWordData = sortedWords[0];
    if (!focusWordData) continue;

    const ipa = phonemesToIpa(focusWordData.phonemes || []);

    const normalize = (s: string) =>
      s.toLowerCase().replace(/[^\w\s]/g, "").trim();
    const normRecognized = normalize(recognizedText);

    let sentenceToPractice = recognizedText;
    if (beforeAfter && beforeAfter.length > 0) {
      const matched = beforeAfter.find((ba) => {
        if (!ba.userOriginal) return false;
        const normOriginal = normalize(ba.userOriginal);
        return (
          normRecognized.includes(normOriginal) ||
          normOriginal.includes(normRecognized)
        );
      });
      if (matched?.professionalVersion) {
        sentenceToPractice = matched.professionalVersion;
      }
    }

    sentenceToPractice = cleanTranscription(sentenceToPractice);

    phrases.push({
      id: `shadowing-t${turn.turnIndex}`,
      sentence: sentenceToPractice.trim(),
      focusWord: focusWordData.word.toLowerCase(),
      ipa,
      originalScore: accuracyScore,
      problemWords,
      turnIndex: turn.turnIndex,
    });
  }

  phrases.sort((a, b) => a.originalScore - b.originalScore);
  return phrases.slice(0, 5);
}

/* ── Scoring helpers ── */

export function spacedRepetitionDays(score: number): number {
  if (score >= 90) return 7;
  if (score >= 80) return 3;
  if (score >= 60) return 1;
  return 0;
}

export function scoreLabel(score: number): string {
  if (score >= 90) return "Excellent pronunciation";
  if (score >= 80) return "Great pronunciation";
  if (score >= 60) return "Good effort, keep practicing";
  if (score >= 40) return "Needs more practice";
  return "Let's try again";
}

export function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}
