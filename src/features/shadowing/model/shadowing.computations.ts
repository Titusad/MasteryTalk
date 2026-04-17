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
  /** GPT-generated: words that carry primary lexical stress (for bold rendering) */
  stressedWords?: string[];
  /** GPT-generated: pairs of adjacent words that should link in speech */
  linkedPairs?: [string, string][];
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

/* ── Compute stressed words (content-word heuristic) ── */

const FUNCTION_WORDS = new Set([
  "a", "an", "the", "is", "am", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should",
  "may", "might", "must", "can", "could", "to", "of", "in", "for", "on", "with",
  "at", "by", "from", "as", "into", "through", "during", "before", "after",
  "and", "but", "or", "nor", "not", "so", "yet", "both", "either", "neither",
  "i", "me", "my", "we", "us", "our", "you", "your", "he", "him", "his",
  "she", "her", "it", "its", "they", "them", "their", "this", "that", "these",
  "those", "who", "whom", "which", "what", "if", "then", "than", "when",
  "where", "how", "all", "each", "every", "some", "any", "no", "just",
  "about", "also", "very", "much", "more", "most", "such", "even",
]);

export function computeStressedWords(sentence: string): string[] {
  return sentence
    .split(/\s+/)
    .map((w) => w.replace(/[.,!?;:'"()]/g, ""))
    .filter((w) => w.length >= 3 && !FUNCTION_WORDS.has(w.toLowerCase()));
}

/* ── Compute linked pairs (consonant→vowel at word boundaries) ── */

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

export function computeLinkedPairs(sentence: string): [string, string][] {
  const words = sentence.split(/\s+/).map((w) => w.replace(/[.,!?;:'"()]/g, ""));
  const pairs: [string, string][] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i].toLowerCase();
    const b = words[i + 1].toLowerCase();
    if (!a || !b) continue;
    const lastChar = a[a.length - 1];
    const firstChar = b[0];
    // Link when: consonant→vowel, same consonant, or vowel→vowel
    const endsConsonant = !VOWELS.has(lastChar);
    const startsVowel = VOWELS.has(firstChar);
    if ((endsConsonant && startsVowel) || lastChar === firstChar) {
      pairs.push([words[i], words[i + 1]]);
    }
  }
  return pairs;
}

/* ── Build full phrase IPA from Azure word phonemes ── */

import type { AzureWordAssessment } from "@/services/types";

export function buildPhraseIpa(azureWords: AzureWordAssessment[]): string {
  const wordIpas = azureWords
    .filter((w) => w.phonemes && w.phonemes.length > 0 && w.errorType !== "Omission")
    .map((w) => {
      const raw = w.phonemes
        .map((p) => PHONEME_IPA[p.phoneme.toLowerCase()] || p.phoneme.toLowerCase())
        .join("");
      return raw;
    })
    .filter(Boolean);
  if (wordIpas.length === 0) return "";
  return `/${wordIpas.join(" ")}/`;
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
    const recognizedWords = new Set(normRecognized.split(/\s+/).filter(Boolean));

    let sentenceToPractice = recognizedText;
    if (beforeAfter && beforeAfter.length > 0) {
      // Use word-overlap (Jaccard) similarity for robust fuzzy matching
      let bestMatch: BeforeAfterComparison | null = null;
      let bestSimilarity = 0;

      for (const ba of beforeAfter) {
        if (!ba.userOriginal) continue;
        const origWords = new Set(normalize(ba.userOriginal).split(/\s+/).filter(Boolean));
        // Calculate Jaccard similarity: |intersection| / |union|
        let intersection = 0;
        for (const w of origWords) {
          if (recognizedWords.has(w)) intersection++;
        }
        const union = new Set([...recognizedWords, ...origWords]).size;
        const similarity = union > 0 ? intersection / union : 0;

        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = ba;
        }
      }

      // Threshold: 30% word overlap is enough for a match
      if (bestMatch?.professionalVersion && bestSimilarity >= 0.3) {
        sentenceToPractice = bestMatch.professionalVersion;
      }
    }

    sentenceToPractice = cleanTranscription(sentenceToPractice);

    const finalSentence = sentenceToPractice.trim();

    // Compute rich annotations from Azure data + heuristics
    const stressedWords = computeStressedWords(finalSentence);
    const linkedPairs = computeLinkedPairs(finalSentence);
    const phraseIpa = buildPhraseIpa(words);

    phrases.push({
      id: `shadowing-t${turn.turnIndex}`,
      sentence: finalSentence,
      focusWord: focusWordData.word.toLowerCase(),
      ipa: phraseIpa || ipa, // prefer full phrase IPA, fallback to focus word
      originalScore: accuracyScore,
      problemWords,
      turnIndex: turn.turnIndex,
      stressedWords,
      linkedPairs,
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
  if (score >= 95) return "Excellent pronunciation";
  if (score >= 90) return "Great pronunciation";
  if (score >= 80) return "Good — small details to polish";
  if (score >= 60) return "Almost there — keep practicing";
  if (score >= 40) return "Needs more practice";
  return "Let's try again";
}

export function scoreColor(score: number): string {
  if (score >= 90) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}
