/**
 * ==============================================================
 *  salesAdapter — Converts ScriptSection[] → InterviewQuestionCard[]
 *
 *  KEY RULES:
 *  - `text` fields = English coaching body → used for `why`
 *  - `highlights[].phrase` = English practice phrases → `suggestedOpener` + `keyPhrases`
 *  - `suffix` fields = coaching annotations in user's locale
 *    → ONLY used for `pivot` (last paragraph's suffix = contingency)
 *  - Inline quoted phrases in `text` that duplicate highlights are stripped
 *    from `why` to avoid the same phrase appearing twice.
 * ==============================================================
 */

import type { ScriptSection, InterviewQuestionCard, InterviewBriefingData, ScriptHighlight } from "@/services/types";

/**
 * Remove inline single-quoted phrases from text that already appear
 * as highlights, preventing duplication between `why` and `suggestedOpener`.
 * Also cleans up dangling intro phrases like "by saying:" or "stating,".
 */
function stripInlineHighlights(text: string, highlights: ScriptHighlight[]): string {
  let cleaned = text;
  for (const h of highlights) {
    // The AI wraps inline phrases in single quotes: 'phrase here'
    // Remove the quoted phrase + any lead-in like "by saying:" / "stating,"
    const escaped = h.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Pattern: optional intro text + quoted phrase
    cleaned = cleaned.replace(
      new RegExp(`\\s*(?:by saying:|by stating,?|stating,|You want to (?:finish|say|start) by saying:?)\\s*'${escaped}'\\s*`, "gi"),
      " "
    );
    // Also catch standalone single-quoted highlight
    cleaned = cleaned.replace(new RegExp(`'${escaped}'`, "gi"), "");
  }
  // Clean up double spaces and trailing punctuation issues
  return cleaned.replace(/\s{2,}/g, " ").replace(/\.\s*\./g, ".").trim();
}

/**
 * Transform a single ScriptSection into an InterviewQuestionCard.
 */
function sectionToCard(section: ScriptSection): InterviewQuestionCard {
  const allHighlights: ScriptHighlight[] = [];
  const cleanedTexts: string[] = [];

  // First pass: collect all highlights
  for (const p of section.paragraphs) {
    if (p.highlights?.length) {
      allHighlights.push(...p.highlights);
    }
  }

  // Second pass: collect cleaned English text (strip inline highlight duplicates)
  for (const p of section.paragraphs) {
    const text = p.text?.trim() || "";
    if (text) {
      const cleaned = allHighlights.length > 0
        ? stripInlineHighlights(text, allHighlights)
        : text;
      if (cleaned) {
        cleanedTexts.push(cleaned);
      }
    }
  }

  // `why` = cleaned coaching context
  const why = cleanedTexts.join("\n\n") || `Section ${section.num}: ${section.title}`;

  // `suggestedOpener` = first highlight phrase (the line to practice)
  const suggestedOpener = allHighlights[0]?.phrase || "";

  // `approach` = empty to avoid any further duplication
  const approach = "";

  // `pivot` = English contingency from last paragraph's suffix.
  // The suffix is mixed-language: Spanish coaching + English "If they..."/"When they..." guidance.
  // We extract ONLY the English contingency sentence(s).
  const lastPara = section.paragraphs[section.paragraphs.length - 1];
  const rawSuffix = lastPara?.suffix?.trim() || "";
  const contingencyMatch = rawSuffix.match(/((?:If|When)\s+they\b[\s\S]*)/i);
  const pivot = contingencyMatch ? contingencyMatch[1].trim() : "";

  return {
    id: section.num,
    question: section.title,
    why,
    approach,
    suggestedOpener,
    keyPhrases: allHighlights.length > 0
      ? allHighlights
      : [{ phrase: section.title, color: "#c4b5fd", tooltip: "Key talking point" }],
    pivot,
  };
}

/**
 * Convert full script sections into InterviewBriefingData
 * compatible with InterviewBriefingScreen.
 */
export function scriptSectionsToBriefingData(sections: ScriptSection[]): InterviewBriefingData {
  return {
    anticipatedQuestions: sections.map(sectionToCard),
    questionsToAsk: [],
    culturalTips: [],
  };
}
