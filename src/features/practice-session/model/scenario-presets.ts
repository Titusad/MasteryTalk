import type { ScenarioType } from "@/services/types";

export interface SituationPreset {
  id: string;
  label: string;
  company: string;
  context: string;
  badge?: string;
}

const PRESETS: Record<string, SituationPreset[]> = {
  interview: [
    {
      id: "tech-startup-hiring",
      label: "Series B Tech Startup",
      company: "Fast-growing SaaS, 200 employees",
      context:
        "A Series B SaaS company just closed a $20M round and is scaling their team aggressively. The hiring manager has three open headcount, is interviewing five candidates this week, and needs someone who can operate independently from day one. The role is critical to hitting Q3 OKRs.",
      badge: "Most common",
    },
    {
      id: "us-consulting",
      label: "U.S. Consulting Firm",
      company: "Top-tier firm, Fortune 500 clients",
      context:
        "A U.S.-based management consulting firm with Fortune 500 clients is hiring for a client-facing role. They work in fast-paced project environments and are specifically evaluating candidates' ability to communicate directly with senior stakeholders at client sites.",
    },
    {
      id: "enterprise-tech",
      label: "Enterprise Tech Company",
      company: "NASDAQ-listed, 5,000+ employees",
      context:
        "A large enterprise technology company is hiring for a strategic role. This is round two of four. The interviewer is evaluating whether the candidate can operate at the pace and scale of an enterprise environment while managing ambiguity without constant guidance.",
      badge: "High pressure",
    },
  ],

  sales: [
    {
      id: "saas-champion",
      label: "SaaS Department Head",
      company: "Mid-market SaaS, $30M ARR",
      context:
        "A mid-market SaaS company is evaluating vendors for a critical tooling decision. Your contact is the department head who would directly use the solution — they're collaborative and want it to work, but they need compelling data to build an internal business case for their VP.",
      badge: "Most common",
    },
    {
      id: "enterprise-decision-maker",
      label: "Enterprise C-Level",
      company: "Fortune 500, $2B annual revenue",
      context:
        "A Fortune 500 company is evaluating a major operational investment. Your meeting is with the VP who signs the check — they've sat through 40 vendor pitches this year and are deeply skeptical of anything that sounds like a standard slide deck.",
      badge: "High pressure",
    },
    {
      id: "tech-gatekeeper",
      label: "Pre-IPO Tech Startup",
      company: "$80M raised, 150 employees",
      context:
        "A pre-IPO tech company is looking to solve a critical scaling problem. You're speaking with a senior manager who acts as the internal filter — they're pitching 15 vendors a week and will only escalate the ones who articulate clear, differentiated value in the first five minutes.",
    },
  ],

  meeting: [
    {
      id: "sprint-review",
      label: "Sprint Review",
      company: "Cross-functional team, US + LATAM",
      context:
        "A weekly sprint review with a cross-functional remote team across US and LATAM time zones. 8 participants. A key deliverable is running two days behind, and two stakeholders from other departments are attending for the first time. The facilitator expects concise updates and will call out anyone who goes over 2 minutes.",
      badge: "Most common",
    },
    {
      id: "skip-level",
      label: "Skip-Level Check-In",
      company: "U.S. tech company, VP attending",
      context:
        "A monthly skip-level meeting with a VP who is direct and impatient. She's hearing status updates from 6 teams in 45 minutes. If you ramble or can't connect your work to business impact, she'll move on. This is also a visibility opportunity — how you communicate here influences her view of your leadership potential.",
      badge: "High pressure",
    },
    {
      id: "exec-update",
      label: "Executive Status Update",
      company: "Multinational consulting project",
      context:
        "A quarterly status meeting for a cross-border project. The senior stakeholder joining today tends to go on tangents and challenge the project direction mid-meeting. The challenge: keep the meeting productive, redirect diplomatically, and get decisions on two open items before time runs out.",
    },
  ],

  presentation: [
    {
      id: "initiative-pitch",
      label: "New Initiative Pitch",
      company: "Enterprise, 3 senior leaders in the room",
      context:
        "A pitch for a new internal initiative requiring budget approval from three senior leaders. One is a supporter, one is neutral, and one is a known skeptic who has rejected similar proposals twice before. You have 20 minutes. If you don't get buy-in in this meeting, the initiative is shelved for the quarter.",
      badge: "High pressure",
    },
    {
      id: "board-results",
      label: "Quarterly Results Review",
      company: "Series C startup, C-level audience",
      context:
        "A quarterly business review to the leadership team (CEO, CTO, VP Sales, VP Marketing). The numbers are mixed — some metrics are strong, others missed targets. The audience expects honesty, clear explanations for misses, and a credible recovery plan. Two of the four execs are known to ask sharp, uncomfortable questions.",
      badge: "Most common",
    },
    {
      id: "roadmap-review",
      label: "Product Roadmap Review",
      company: "Mixed audience: engineering + executives",
      context:
        "A product roadmap review with a mixed audience: the engineering team who will build it, and three executives who approved the budget. Engineers are skeptical about timelines. Executives want ROI justification. The challenge: address both audiences simultaneously without losing either one.",
    },
  ],
};

export function getPresetsForScenario(scenarioType?: ScenarioType | null): SituationPreset[] {
  if (!scenarioType) return [];
  return PRESETS[scenarioType] ?? [];
}
