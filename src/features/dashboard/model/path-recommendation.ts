/**
 * path-recommendation.ts — Post Warm-Up Path Recommendation Engine
 *
 * Pure function that maps pillarScores + selfIntroContext + profile
 * → recommended PathId + personalized reason.
 *
 * No side effects, no React, portable to React Native.
 */

import type { PathId } from "./progression-paths";
import { PROGRESSION_PATHS } from "./progression-paths";
import type { OnboardingProfile } from "@/services/types";

// Re-export from entities (canonical location)
export type { PathRecommendation } from "@/entities/progression";

/* ── Local alias for use within this file ── */
import type { PathRecommendation } from "@/entities/progression";

type SelfIntroContextId = "networking" | "team" | "client";

/* ── Pillar → Path Primary Mapping ── */

const PILLAR_TO_PATH: Record<string, PathId> = {
  Persuasion: "sales",
  "Professional Tone": "client",
  Fluency: "presentation",
  Grammar: "meeting",
  Vocabulary: "interview",
  Pronunciation: "meeting",
};

/* ── Context → Tiebreaker Path ── */

const CONTEXT_TIEBREAKER: Record<SelfIntroContextId, PathId> = {
  networking: "interview",
  team: "meeting",
  client: "client",
};

/* ── Dual-pillar overrides (when 2 weak pillars together signal a specific path) ── */

const DUAL_PILLAR_OVERRIDES: Array<{
  pillars: [string, string];
  pathId: PathId;
}> = [
  { pillars: ["Persuasion", "Professional Tone"], pathId: "csuite" },
  { pillars: ["Fluency", "Grammar"], pathId: "meeting" },
  { pillars: ["Fluency", "Pronunciation"], pathId: "presentation" },
];

/* ── Reason Templates ── */

const REASON_TEMPLATES: Record<PathId, {
  primary: string;
  withContext: Record<SelfIntroContextId, string>;
}> = {
  interview: {
    primary: "Your vocabulary precision needs strengthening — using the right terms at the right moment is what separates a good answer from a memorable one.",
    withContext: {
      networking: "In networking settings, your word choices need to land fast. Interview Mastery builds exactly that — precise, impactful vocabulary under pressure.",
      team: "When introducing yourself to a new team, domain-specific vocabulary builds instant credibility. This path trains that muscle.",
      client: "Client-facing introductions demand polished, precise language. This path will sharpen your professional vocabulary.",
    },
  },
  sales: {
    primary: "Your persuasion and argumentation structure showed room for growth — this path focuses on building compelling, evidence-backed arguments.",
    withContext: {
      networking: "Networking is fundamentally about persuading someone you're worth a follow-up. Sales Champion teaches you to make every word count.",
      team: "Even in team settings, you need to sell your ideas. This path builds the persuasion frameworks that make people listen.",
      client: "You struggled to hold your ground under pressure. Sales Champion is built specifically for high-stakes persuasion with senior stakeholders.",
    },
  },
  meeting: {
    primary: "Your fluency under real-time pressure needs work — this path trains you to think and respond clearly in group settings.",
    withContext: {
      networking: "Quick, confident responses matter in networking. This path builds the real-time fluency you need when there's no time to rehearse.",
      team: "Team meetings require thinking on your feet. This path is designed specifically for the real-time dynamics of group conversations.",
      client: "Client meetings demand smooth, uninterrupted delivery. This path strengthens your ability to speak clearly under pressure.",
    },
  },
  presentation: {
    primary: "Your message structure and delivery flow need strengthening — this path teaches you to organize and deliver ideas with clarity.",
    withContext: {
      networking: "A great elevator pitch is a mini-presentation. This path teaches you to structure your message for maximum impact in minimal time.",
      team: "Presenting to a team requires clear structure and confident delivery. This path builds both from the ground up.",
      client: "Client presentations demand polished structure and confident delivery. This path focuses exactly on that.",
    },
  },
  client: {
    primary: "Your professional register and diplomatic tone need refinement — this path focuses on building credibility through polished, client-appropriate language.",
    withContext: {
      networking: "Networking with senior professionals requires a polished register. This path teaches you to project authority without over-formality.",
      team: "Diplomatic communication is key in cross-functional teams. This path builds the professional tone that earns trust.",
      client: "Your introduction showed potential but lacked the executive polish that senior stakeholders expect. This path is built for exactly that.",
    },
  },
  csuite: {
    primary: "You communicate well but tend to over-explain in high-stakes contexts. C-Suite Communication is designed to sharpen your executive presence.",
    withContext: {
      networking: "Executive networking demands conciseness and gravitas. This path trains you to command attention with fewer, better-chosen words.",
      team: "Leading conversations with senior leadership requires a different register. This path builds that executive-level communication skill.",
      client: "Senior stakeholders expect concise, high-impact communication. This path trains you to deliver under executive-level scrutiny.",
    },
  },
  culture: {
    primary: "Before mastering any specific scenario, the most impactful skill to build is operating naturally in U.S. corporate culture — direct communication, individual ownership, and confident disagreement.",
    withContext: {
      networking: "Networking with U.S. professionals requires cultural fluency, not just language fluency. This path trains the behavioral patterns that make you memorable.",
      team: "Joining a U.S. team means adapting to a direct, flat-hierarchy communication style. This path builds exactly those behavioral habits.",
      client: "U.S. clients respond to confident, direct communicators who own their positions. This path trains the cultural behaviors that build trust instantly.",
    },
  },
};

/* ── Focus Detail Templates ── */

const FOCUS_DETAILS: Record<PathId, string> = {
  interview: "Levels 1-2 focus on articulating your experience with precision and confidence.",
  sales: "Levels 1-2 focus on value framing and objection handling frameworks.",
  meeting: "Levels 1-2 focus on real-time response clarity and turn management.",
  presentation: "Levels 1-2 focus on message structure and delivery without filler.",
  client: "Levels 1-2 focus on building rapport and executive-level register.",
  csuite: "Levels 1-2 focus on executive brevity and strategic framing.",
  culture: "Levels 1-3 focus on claim-first communication, ownership language, and meeting control.",
};


/* ── Main Recommendation Function ── */

export function recommendPath(
  pillarScores: Record<string, number> | null | undefined,
  contextId?: SelfIntroContextId | string,
  _profile?: OnboardingProfile | null,
): PathRecommendation | null {
  if (!pillarScores || Object.keys(pillarScores).length < 3) return null;

  // 1. Sort pillars by score (ascending = weakest first)
  const sorted = Object.entries(pillarScores)
    .filter(([, v]) => typeof v === "number" && v > 0)
    .sort(([, a], [, b]) => a - b);

  if (sorted.length < 2) return null;

  const weakest = sorted[0][0];
  const secondWeakest = sorted[1][0];
  const scoreDiff = sorted[1][1] - sorted[0][1];

  // 2. Check dual-pillar overrides first
  let pathId: PathId | undefined;
  for (const override of DUAL_PILLAR_OVERRIDES) {
    const [p1, p2] = override.pillars;
    if (
      (weakest === p1 && secondWeakest === p2) ||
      (weakest === p2 && secondWeakest === p1)
    ) {
      pathId = override.pathId;
      break;
    }
  }

  // 3. Primary mapping from weakest pillar
  if (!pathId) {
    pathId = PILLAR_TO_PATH[weakest] || "interview";
  }

  // 4. Context tiebreaker (if pillar scores are very close)
  const safeContext = contextId as SelfIntroContextId | undefined;
  if (scoreDiff < 5 && safeContext && CONTEXT_TIEBREAKER[safeContext]) {
    pathId = CONTEXT_TIEBREAKER[safeContext];
  }

  // 5. Culture override: if the lowest pillar score is above 60 (balanced profile),
  // recommend U.S. Business Culture as the highest-leverage starting point.
  // Cultural fluency is the foundation — scenario-specific paths build on top of it.
  const lowestScore = sorted[0][1];
  if (lowestScore >= 60) {
    pathId = "culture";
  }

  // 5. Build recommendation
  const path = PROGRESSION_PATHS.find((p) => p.id === pathId);
  if (!path) return null;

  const templates = REASON_TEMPLATES[pathId];
  const reason = (safeContext && templates.withContext[safeContext])
    ? templates.withContext[safeContext]
    : templates.primary;

  return {
    pathId,
    pathTitle: path.title,
    pathIcon: path.icon,
    reason,
    focusDetail: FOCUS_DETAILS[pathId],
  };
}
