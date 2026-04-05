/**
 * PhraseCard — Phrase display with stress markers, linking marks,
 * IPA, and problem word highlights.
 *
 * When `stressedWords` is provided (from GPT), uses those for bold rendering.
 * Otherwise falls back to the heuristic `splitStress` for multi-syllable words.
 *
 * Linking pairs are shown with a ‿ connector between the words.
 */
import { useMemo } from "react";
import { splitStress } from "../model/shadowing.computations";

interface PhraseCardProps {
  sentence: string;
  focusWord: string;
  problemWords: { word: string; score: number }[];
  /** GPT-generated: words carrying primary stress (bold) */
  stressedWords?: string[];
  /** GPT-generated: word pairs that should link in speech */
  linkedPairs?: [string, string][];
  /** Full IPA for the phrase */
  phraseIpa?: string;
}

export function PhraseCard({
  sentence,
  focusWord,
  problemWords,
  stressedWords,
  linkedPairs,
  phraseIpa,
}: PhraseCardProps) {
  const problemSet = useMemo(
    () => new Set(problemWords.map((w) => w.word.toLowerCase())),
    [problemWords]
  );

  const stressSet = useMemo(
    () => new Set((stressedWords || []).map((w) => w.toLowerCase())),
    [stressedWords]
  );

  // Build a map: word → next word it links to (for ‿ rendering)
  const linkAfterMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!linkedPairs) return map;
    for (const [a, b] of linkedPairs) {
      map.set(a.toLowerCase(), b.toLowerCase());
    }
    return map;
  }, [linkedPairs]);

  const hasGPTStress = stressedWords && stressedWords.length > 0;
  const words = sentence.split(/\s+/);

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-[#fafbfc] p-5 md:p-6">
      <p
        className="text-lg md:text-xl leading-relaxed text-[#1e293b]"
        style={{ fontWeight: 400 }}
      >
        {words.map((word, i) => {
          const clean = word
            .replace(/[.,!?;:'"()]/g, "")
            .toLowerCase();
          const isProblem =
            problemSet.has(clean) || clean === focusWord;
          const isStressed = hasGPTStress
            ? stressSet.has(clean)
            : clean.length >= 4;

          // Check if next word forms a linking pair
          const nextClean = i < words.length - 1
            ? words[i + 1].replace(/[.,!?;:'"()]/g, "").toLowerCase()
            : "";
          const showLink = linkAfterMap.has(clean) &&
            linkAfterMap.get(clean) === nextClean;

          if (hasGPTStress) {
            // GPT-driven: bold the whole word if stressed
            return (
              <span key={i}>
                {i > 0 ? " " : ""}
                <span
                  className={isProblem ? "text-[#6366f1]" : ""}
                  style={{ fontWeight: isStressed ? 700 : 400 }}
                >
                  {word}
                </span>
                {showLink && (
                  <span className="text-[#6366f1]/50 text-sm mx-[-1px] select-none" aria-hidden>‿</span>
                )}
              </span>
            );
          }

          // Fallback: heuristic split-stress for multi-syllable words
          if (clean.length >= 4) {
            const [before, stressed, after] = splitStress(word);
            return (
              <span key={i}>
                {i > 0 ? " " : ""}
                {before}
                <span style={{ fontWeight: 700 }}>{stressed}</span>
                {after}
                {showLink && (
                  <span className="text-[#6366f1]/50 text-sm mx-[-1px] select-none" aria-hidden>‿</span>
                )}
              </span>
            );
          }

          return (
            <span
              key={i}
              className={isProblem ? "text-[#6366f1]" : ""}
            >
              {i > 0 ? " " : ""}
              {word}
              {showLink && (
                <span className="text-[#6366f1]/50 text-sm mx-[-1px] select-none" aria-hidden>‿</span>
              )}
            </span>
          );
        })}
      </p>

      {/* IPA transcription */}
      {phraseIpa && (
        <p
          className="text-sm text-[#94a3b8] mt-2 tracking-wide"
          style={{ fontFamily: "'Noto Sans', serif", fontStyle: "italic" }}
        >
          {phraseIpa}
        </p>
      )}
    </div>
  );
}
