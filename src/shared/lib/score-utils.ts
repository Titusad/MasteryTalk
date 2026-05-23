/** Returns a color hex string for a 0–100 score. */
export function scoreColor(score: number): string {
  if (score >= 90) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

/**
 * Splits a word into [before, stressed, after] syllable segments
 * using a vowel-cluster heuristic.
 */
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
