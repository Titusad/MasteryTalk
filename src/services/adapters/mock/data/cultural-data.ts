/**
 * Mock Cultural Intelligence Data (Phase 5 of Master Prompt)
 *
 * PowerQuestions: Strategic questions the user should ask their counterpart
 * CulturalTips: Cultural bridge tips for LATAM professionals in US business
 *
 * Both are contextualised by scenarioType.
 */
import type { ScenarioType } from "../../../types";

/* ─── Power Questions ─── */

export interface PowerQuestion {
  question: string;
  /** Why this question works */
  rationale: string;
  /** When to use it in the conversation */
  timing: string;
}

const POWER_QUESTIONS: Record<string, PowerQuestion[]> = {
  sales: [
    {
      question: "What would success look like for your team in the next 90 days?",
      rationale: "Forces the client to articulate their ideal outcome — now you can frame your product as the path to it.",
      timing: "Early in discovery, before presenting features",
    },
    {
      question: "What's the cost of NOT solving this problem this quarter?",
      rationale: "Creates urgency without being pushy. The client sells themselves on the timeline.",
      timing: "After they've acknowledged the pain point",
    },
    {
      question: "Who else needs to be in the room when we discuss next steps?",
      rationale: "Identifies hidden stakeholders early. Prevents deals from stalling in committee.",
      timing: "Before closing the meeting",
    },
    {
      question: "If you could change one thing about your current solution, what would it be?",
      rationale: "Surfaces the real objection to the status quo — and gives you your competitive angle.",
      timing: "When they mention their existing vendor",
    },
  ],
  interview: [
    {
      question: "What does the ideal candidate look like in this role after 6 months?",
      rationale: "Shows you're thinking beyond landing the job — you're already planning to deliver results.",
      timing: "When they ask 'Do you have questions for us?'",
    },
    {
      question: "What's the biggest challenge the team is facing right now?",
      rationale: "Positions you as a problem-solver. If you can address this in your next answer, you win.",
      timing: "Mid-interview, after behavioral questions",
    },
    {
      question: "How do you measure success for this position?",
      rationale: "Gives you the rubric they're using to evaluate you — and every future answer can reference it.",
      timing: "Early in the conversation",
    },
  ],
  csuite: [
    {
      question: "What's the one number the board is watching this quarter?",
      rationale: "Anchors your entire presentation to what matters most at the executive level.",
      timing: "Before diving into your data",
    },
    {
      question: "If we could only do ONE thing from this proposal, which would move the needle most?",
      rationale: "Forces prioritisation and signals you understand resource constraints.",
      timing: "After presenting options",
    },
    {
      question: "What would make you confident enough to greenlight this today?",
      rationale: "Identifies the real decision criteria — not the stated ones.",
      timing: "When the conversation is winding down",
    },
  ],
  negotiation: [
    {
      question: "What would a win-win look like from your perspective?",
      rationale: "Opens collaborative framing. You learn their priorities without revealing yours.",
      timing: "Early, before positions harden",
    },
    {
      question: "If we solve [their concern], would you be comfortable moving forward on [your term]?",
      rationale: "Conditional close — links your concession to their commitment.",
      timing: "When both sides have stated positions",
    },
    {
      question: "What flexibility do you have on the timeline?",
      rationale: "Tests their constraints without showing your hand. Time is often more negotiable than price.",
      timing: "When price seems stuck",
    },
  ],
  networking: [
    {
      question: "What's the most interesting problem you're working on right now?",
      rationale: "People love talking about their work. This is 10x better than 'What do you do?'",
      timing: "First 30 seconds of a new conversation",
    },
    {
      question: "Who should I be talking to at this event?",
      rationale: "Turns them into a connector. People remember those who asked for introductions, not pitches.",
      timing: "After 2-3 minutes of good conversation",
    },
    {
      question: "What's the best way to follow up with you?",
      rationale: "Concrete next step. Email, LinkedIn, WhatsApp — let them choose their preferred channel.",
      timing: "Before saying goodbye",
    },
  ],
};

export function getPowerQuestions(scenarioType?: ScenarioType | null): PowerQuestion[] {
  if (scenarioType && POWER_QUESTIONS[scenarioType]) {
    return POWER_QUESTIONS[scenarioType];
  }
  return POWER_QUESTIONS.sales;
}

/* ─── Cultural Tips ─── */

export interface CulturalTip {
  title: string;
  description: string;
  /** "do" or "avoid" */
  type: "do" | "avoid";
}

const CULTURAL_TIPS_BASE: CulturalTip[] = [
  {
    title: "Lead with data, not relationships",
    description: "In US business, credibility comes from numbers first, personal rapport second. Open with your strongest metric before building rapport.",
    type: "do",
  },
  {
    title: "Silence is not awkward — it's strategic",
    description: "Americans use pauses after stating a position. Don't rush to fill silence — it signals confidence and gives the other party time to process.",
    type: "do",
  },
  {
    title: "Avoid softening language",
    description: "Phrases like 'maybe we could try...' or 'I think perhaps...' signal uncertainty. Replace with 'I recommend...' or 'Based on our data...'",
    type: "avoid",
  },
];

const CULTURAL_TIPS_BY_SCENARIO: Record<string, CulturalTip[]> = {
  sales: [
    ...CULTURAL_TIPS_BASE,
    {
      title: "Ask for the next step explicitly",
      description: "In LATAM, deals close through relationships over time. In the US, you're expected to propose a concrete next step at the end of every meeting.",
      type: "do",
    },
    {
      title: "Don't over-apologise for pricing",
      description: "If your product costs more, frame it as an investment with ROI — not as something that needs justification. Confidence in your pricing signals value.",
      type: "avoid",
    },
  ],
  interview: [
    ...CULTURAL_TIPS_BASE,
    {
      title: "Self-promotion is expected",
      description: "In many LATAM cultures, highlighting your own achievements feels boastful. In US interviews, it's required. Use 'I led...', 'I delivered...', 'My impact was...'",
      type: "do",
    },
    {
      title: "Don't say 'we' when you mean 'I'",
      description: "If YOU led the project, say 'I'. Using 'we' when you were the driver undersells your contribution. Save 'we' for genuine team efforts.",
      type: "avoid",
    },
  ],
  csuite: [
    ...CULTURAL_TIPS_BASE,
    {
      title: "Start with the recommendation, not the analysis",
      description: "C-Suite audiences want your conclusion first, evidence second. The LATAM tendency to build context before the ask loses executives in the first 30 seconds.",
      type: "do",
    },
    {
      title: "Don't hedge your recommendation",
      description: "If you say 'We could consider exploring option B', the executive hears 'I'm not sure'. Say 'I recommend option B. Here's why.'",
      type: "avoid",
    },
  ],
  negotiation: [
    ...CULTURAL_TIPS_BASE,
    {
      title: "State your position first, explain second",
      description: "In US negotiations, anchoring early signals strength. The LATAM tendency to build up to the number gives the other party time to prepare objections.",
      type: "do",
    },
    {
      title: "Don't concede without getting something back",
      description: "Every concession should be paired with a request: 'I can do X if you can commit to Y.' Free concessions signal weakness, not generosity.",
      type: "avoid",
    },
  ],
  networking: [
    ...CULTURAL_TIPS_BASE,
    {
      title: "Keep it to 60 seconds, then listen",
      description: "Your elevator pitch should be under a minute. Americans at networking events evaluate whether to invest time in 30 seconds. Be memorable, not thorough.",
      type: "do",
    },
    {
      title: "Don't start with your job title",
      description: "Instead of 'I'm a Senior Manager at X', try 'I help LATAM companies break into the US market' — lead with value, not hierarchy.",
      type: "avoid",
    },
  ],
};

export function getCulturalTips(scenarioType?: ScenarioType | null): CulturalTip[] {
  if (scenarioType && CULTURAL_TIPS_BY_SCENARIO[scenarioType]) {
    return CULTURAL_TIPS_BY_SCENARIO[scenarioType];
  }
  return CULTURAL_TIPS_BY_SCENARIO.sales;
}
