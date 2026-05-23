import type { LevelMethodology } from "@/entities/session";

export type {
  BriefLocale,
  TranslatedBriefContent,
  LevelMethodology,
  SelfIntroContext,
} from "@/entities/session";
export { SELF_INTRO_CONTEXTS } from "@/shared/lib/self-intro-contexts";

/* ── Level Definition ── */

export interface VocabularyTerm {
  term: string;
  ipa: string;
  definition: string;
  /** Short example sentence showing the word in professional context */
  example?: string;
  /** Industry/role keywords — empty or absent = universal */
  tags?: string[];
}

/**
 * Selects the most relevant vocabulary terms for the user's profile.
 * Tagged terms that match industry/position are prioritized; universal terms fill remaining slots.
 */
export function getVocabularyForProfile(
  bank: VocabularyTerm[],
  profile: { industry?: string; position?: string } | null | undefined,
  maxTerms = 6,
): VocabularyTerm[] {
  if (!bank.length) return [];
  const profileText = [profile?.industry || "", profile?.position || ""]
    .join(" ")
    .toLowerCase();
  const scored = bank.map((term) => ({
    term,
    score: term.tags
      ? term.tags.filter((tag) => profileText.includes(tag.toLowerCase())).length
      : 0,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxTerms).map((s) => s.term);
}

export interface ProgressionLevel {
  id: string;
  level: number;
  title: string;
  scenario: string;
  /** Behavior description for the AI interlocutor — used by backend conversation prompt */
  interlocutorBehavior?: string;
  interlocutor: string;
  unlockRequirement: string;
  /** Pre-Session Brief — curated methodology taught before practice */
  methodology?: LevelMethodology;
  /** What the user should demonstrably achieve in this level */
  measurableObjective?: string;
  /** Power phrases the AI expects the user to integrate naturally */
  anchorPhrases?: string[];
  /** Coach-like intro — what the user will master (lowercase, no period) */
  introHeadline?: string;
  /** Value proposition — why this level matters (1-2 sentences) */
  introValue?: string;
  /** User-facing description of what this scenario IS — shown in IntroductionScreen */
  scenarioContext?: string;
  /** Level-specific vocabulary for pronunciation drill in Strategy step */
  vocabularyBank?: VocabularyTerm[];
  /**
   * Maximum user turns before the session wraps up.
   * Overrides the default of 8. Use for capstone levels that need a longer conversation.
   */
  turnLimit?: number;
}

/* ── Difficulty Tiers ── */

/**
 * Progressive difficulty curve — Sprint C.1
 *
 * Each level within a path maps to one tier (level number = tier number).
 * The assembler injects these as Block 4.8 to modulate interlocutor behavior.
 */
export interface DifficultyTierDef {
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
  assertiveness: string;
  topicSpecificity: string;
  stakesFraming: string;
  formalityRequired: string;
}

export const DIFFICULTY_TIERS: Record<1 | 2 | 3 | 4 | 5 | 6, DifficultyTierDef> = {
  1: {
    tier: 1,
    label: "Foundation",
    assertiveness: "Patient and encouraging — gives the user time to think and self-correct",
    topicSpecificity: "Predictable, standard topics — no curveballs or unexpected pivots",
    stakesFraming: "Low stakes — explicitly friendly and supportive framing",
    formalityRequired: "Conversational professional — minor informalities are acceptable",
  },
  2: {
    tier: 2,
    label: "Standard",
    assertiveness: "Professional and neutral — moves the conversation forward without pressure",
    topicSpecificity: "Mostly predictable — one follow-up probe per topic to test depth",
    stakesFraming: "Normal workplace stakes — realistic but not high-pressure",
    formalityRequired: "Standard business register — full sentences, no slang",
  },
  3: {
    tier: 3,
    label: "Developing",
    assertiveness: "Moderately direct — pushes back on vague answers, asks for specifics",
    topicSpecificity: "Occasional curveballs — one unexpected question or topic pivot per session",
    stakesFraming: "Moderate stakes — decisions and outcomes are referenced",
    formalityRequired: "Business professional — hedging and filler words noted as gaps",
  },
  4: {
    tier: 4,
    label: "Advanced",
    assertiveness: "Direct and demanding — low tolerance for hedging or over-qualifying",
    topicSpecificity: "Specific and probing — regularly challenges the user to justify positions",
    stakesFraming: "High stakes — frames decisions in terms of business impact and accountability",
    formalityRequired: "Elevated business register — C-suite vocabulary expected, LATAM patterns flagged",
  },
  5: {
    tier: 5,
    label: "Executive",
    assertiveness: "High-pressure and skeptical — minimal patience, interrupts if response loses focus",
    topicSpecificity: "Narrow and expert-level — no warm-up questions, dives straight into substance",
    stakesFraming: "Very high stakes — explicitly frames conversation as consequential (career, contract, board-level)",
    formalityRequired: "C-suite register required — directness, brevity, and ownership expected at every turn",
  },
  6: {
    tier: 6,
    label: "Mastery",
    assertiveness: "Maximum pressure — cold, impatient, no encouragement, challenges every weak point",
    topicSpecificity: "Unpredictable and expert — multi-part questions, rapid topic shifts, stress tests",
    stakesFraming: "Maximum stakes — existential framing ('this deal makes or breaks Q3', 'your promotion depends on this')",
    formalityRequired: "Executive mastery — over-qualifying, conflict avoidance, or deference are disqualifying",
  },
};

export interface ProgressionPath {
  id: "self-intro" | "introductions" | "interview" | "sales" | "meeting" | "presentation" | "client" | "csuite" | "culture";
  /** The ScenarioType used to launch practice sessions for this path.
   *  Most paths map 1:1 to their id, except "introductions" → "self-intro". */
  scenarioType: "interview" | "sales" | "meeting" | "presentation" | "client" | "csuite" | "self-intro" | "culture";
  title: string;
  description?: string;
  icon: string;
  levels: ProgressionLevel[];
}
