/**
 * Mock feedback data — scenario-specific strengths and opportunities
 */
import type { Strength, Opportunity, ScenarioType } from "../../../types";

const STRENGTHS_BY_SCENARIO: Record<string, Strength[]> = {
  sales: [
    {
      title: "Clear and direct opening",
      desc: "You led with the main benefit without beating around the bush. This captured attention immediately.",
    },
    {
      title: "Objection handling",
      desc: "When they asked about adoption, you didn't get defensive. You repositioned with the champions program.",
    },
    {
      title: "Vocal confidence",
      desc: "Your pacing was steady and your volume consistent. This projects authority and preparation.",
    },
  ],
  interview: [
    {
      title: "Solid STAR structure",
      desc: "Your answers followed a clear arc: situation, action, and result with specific numbers.",
    },
    {
      title: "Genuine connection with the role",
      desc: "When explaining your motivation, you were specific about what attracts you — not generic.",
    },
    {
      title: "Strategic questions",
      desc: "You closed with questions that demonstrate leadership thinking, not logistics.",
    },
  ],
  csuite: [
    {
      title: "Conclusion first",
      desc: "You opened with the recommendation before the evidence. This respects the executive's time.",
    },
    {
      title: "Proactive risk management",
      desc: "You anticipated the pipeline gap objection before they raised it. That builds trust.",
    },
    {
      title: "Clear decision ask",
      desc: "You closed with a specific ask — pilot, amount, timeline. No ambiguity.",
    },
  ],
  negotiation: [
    {
      title: "Anchoring with value, not price",
      desc: "Instead of lowering the price, you proposed more value. That redefines the conversation.",
    },
    {
      title: "Conditional concession",
      desc: "Every concession came tied to a commitment from the other side. Trading, not giving.",
    },
    {
      title: "Firm but collaborative tone",
      desc: "You maintained firmness without being confrontational. That's executive negotiation.",
    },
  ],
  networking: [
    {
      title: "Memorable value proposition",
      desc: "Your 15-second pitch was clear and generated the perfect follow-up question.",
    },
    {
      title: "Genuine curiosity",
      desc: "You asked about their work before talking about yours. That creates natural rapport.",
    },
    {
      title: "Concrete follow-up",
      desc: "You closed with a specific day and a specific resource. That's 10x more likely to happen than 'stay in touch'.",
    },
  ],
};

const OPPORTUNITIES_BY_SCENARIO: Record<string, Opportunity[]> = {
  sales: [
    {
      title: "Structure objections with frameworks",
      tag: "High impact",
      desc: "When addressing implementation concerns, try: 'Great question. Let me break this into three parts: timeline, resources, and support.' This gives you control and clarity.",
    },
    {
      title: "Close each section with a micro-commitment",
      desc: "After explaining a benefit, ask: 'Does this align with what you're looking for?' It keeps the client engaged.",
    },
  ],
  interview: [
    {
      title: "Quantify every achievement",
      tag: "High impact",
      desc: "When you mention 'we improved results', add: 'We improved retention by 30%, which translated to $1.2M in annual savings.' Numbers make you memorable.",
    },
    {
      title: "Project yourself into the role",
      desc: "Beyond talking about what you did, describe what you'd do in the first 90 days. It helps the interviewer see you in the position.",
    },
  ],
  csuite: [
    {
      title: "Use the Rule of Three",
      tag: "High impact",
      desc: "Present three supporting data points, three options, or three priorities. Three is the magic number for executive retention.",
    },
    {
      title: "Anticipate the second question",
      desc: "After your recommendation, prepare the answer to 'What if it doesn't work?' Confidence comes from having Plan B ready.",
    },
  ],
  negotiation: [
    {
      title: "Use strategic silences",
      tag: "High impact",
      desc: "After making your offer, stop. Count to 5 in your head. Silence creates positive pressure without being aggressive.",
    },
    {
      title: "Anchor with external data",
      desc: "Before your number, cite a benchmark: 'Based on Gartner data for this category...' External data is more credible than your opinion.",
    },
  ],
  networking: [
    {
      title: "Have a 'gift' prepared",
      tag: "High impact",
      desc: "Offer something of value before asking for anything: an article, an intro, an insight. 'I recently read a report on LATAM SaaS that I think you'd find relevant...'",
    },
    {
      title: "Ask about projects, not titles",
      desc: "Instead of 'What do you do?', ask 'What's the most interesting challenge you're working on?' It generates real conversations.",
    },
  ],
};

/* ─── Accessors ─── */

export function getStrengthsForScenario(scenarioType?: ScenarioType | string | null): Strength[] {
  if (scenarioType && STRENGTHS_BY_SCENARIO[scenarioType]) {
    return STRENGTHS_BY_SCENARIO[scenarioType];
  }
  return STRENGTHS_BY_SCENARIO.sales;
}

export function getOpportunitiesForScenario(scenarioType?: ScenarioType | string | null): Opportunity[] {
  if (scenarioType && OPPORTUNITIES_BY_SCENARIO[scenarioType]) {
    return OPPORTUNITIES_BY_SCENARIO[scenarioType];
  }
  return OPPORTUNITIES_BY_SCENARIO.sales;
}

/** Legacy exports */
export const MOCK_STRENGTHS: Strength[] = STRENGTHS_BY_SCENARIO.sales;
export const MOCK_OPPORTUNITIES: Opportunity[] = OPPORTUNITIES_BY_SCENARIO.sales;