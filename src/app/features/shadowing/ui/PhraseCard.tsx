/**
 * PhraseCard — Phrase display with stress markers and problem highlights
 * Presentational component (web-specific).
 */
import { useMemo } from "react";
import { splitStress } from "../model/shadowing.computations";

interface PhraseCardProps {
  sentence: string;
  focusWord: string;
  problemWords: { word: string; score: number }[];
}

export function PhraseCard({
  sentence,
  focusWord,
  problemWords,
}: PhraseCardProps) {
  const problemSet = useMemo(
    () => new Set(problemWords.map((w) => w.word.toLowerCase())),
    [problemWords]
  );

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
          const isMultiSyllable = clean.length >= 4;
          const isProblem =
            problemSet.has(clean) || clean === focusWord;

          if (isMultiSyllable) {
            const [before, stressed, after] = splitStress(word);
            return (
              <span key={i}>
                {i > 0 ? " " : ""}
                {before}
                <span style={{ fontWeight: 700 }}>{stressed}</span>
                {after}
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
            </span>
          );
        })}
      </p>
    </div>
  );
}
