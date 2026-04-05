/**
 * Mock chat messages — Scenario-specific AI conversations (9 messages each: opening + 8 responses)
 *
 * The array contains ONLY AI messages. User messages are generated
 * in real-time by VoicePractice via speechService.transcribe().
 *
 * Message 0: Delivered by prepareSession (Support phase opener)
 * Messages 1-5: Mid-conversation (Support → Guidance → Challenge transitions)
 * Message 6: Deeper challenge / advanced topic
 * Message 7: CLOSING QUESTION — AI must end with a question for the user
 * Message 8: Final farewell after user answers the closing question (isComplete=true)
 */
import type { ChatMessage, ArenaPowerPhrase, BeforeAfterComparison, ScenarioType } from "../../../types";

/* ═══════════════════════════════════════════════════════════
   CHAT MESSAGES BY SCENARIO
   ═══════════════════════════════════════════════════════════ */

const CHAT_MESSAGES_BY_SCENARIO: Record<string, ChatMessage[]> = {
  /* ── Sales (default) ── */
  sales: [
    {
      role: "ai",
      label: "Client",
      time: "10:23",
      text: "Good morning! I understand you're here to present your marketing automation platform. I'm interested, but I'd like to understand how this differs from what we're currently using. Can you walk me through the key benefits?",
    },
    {
      role: "ai",
      label: "Client",
      time: "10:25",
      text: "That's interesting. I hear you're saying you offer regional specialization. A more executive way to frame that would be: \"We've built a purpose-designed solution for the LATAM mid-market, with native bilingual capabilities and seamless integration into the local payment ecosystem.\" — But tell me, I'm concerned about the implementation timeline. We're a lean team and can't afford weeks of setup. How long does it typically take to get fully operational?",
    },
    {
      role: "ai",
      label: "Client",
      time: "10:28",
      text: "Good, you're using data effectively. Those are compelling numbers. But here's what I'm really thinking about: we tried a similar tool last year and adoption was terrible. Half the team just went back to spreadsheets. How do you ensure people actually use the platform?",
    },
    {
      role: "ai",
      label: "Client",
      time: "10:31",
      text: "The champion program is a smart approach. But let me push on something — your pricing is 30% higher than what we paid for the last tool. How do you justify that premium?",
    },
    {
      role: "ai",
      label: "Client",
      time: "10:34",
      text: "Fair enough on the ROI argument. Let me ask you something more strategic — we're expanding into Brazil next quarter. Can your platform handle Portuguese-language campaigns and local payment methods there?",
    },
    {
      role: "ai",
      label: "Client",
      time: "10:37",
      text: "That's good to know about the Brazil capability. One more thing that's been on my mind — data security. We've had issues with vendors storing client data outside the region. Where do you host your LATAM data?",
    },
    {
      role: "ai",
      label: "Client",
      time: "10:40",
      text: "Regional hosting is a must-have for us, so that checks the box. You know what, I'm going to be presenting vendor options to our leadership team on Thursday. What makes you confident we should choose you over the two other platforms we're evaluating?",
    },
    {
      role: "ai",
      label: "Client",
      time: "10:43",
      text: "You've given me a lot to think about. Before I go — what's the single biggest concern you think I should raise with my leadership team to make sure we're making the right decision?",
    },
    {
      role: "ai",
      label: "Client",
      time: "10:46",
      text: "That's a strong point. I'll bring that up Thursday. Let me take all of this back to the team — can you send me a one-pager with those ROI numbers and the champion program details? I'll be in touch by end of week.",
    },
  ],

  /* ── Interview ── */
  interview: [
    {
      role: "ai",
      label: "Recruiter",
      time: "09:00",
      text: "Welcome! Thank you for coming in today. I've reviewed your resume and I'm impressed with your background. Let's start with the basics — can you tell me about yourself and what brought you to apply for this Senior Product Manager role?",
    },
    {
      role: "ai",
      label: "Recruiter",
      time: "09:04",
      text: "That's a solid overview. I like that you mentioned specific metrics. Now, let me ask you something more specific — can you walk me through a time when you had to lead a project that was falling behind? What was the situation and how did you turn it around?",
    },
    {
      role: "ai",
      label: "Recruiter",
      time: "09:08",
      text: "Great example. I can see the leadership skills there. Let me push you a little — this role requires working closely with engineering teams in different time zones. How would you handle a situation where the engineering lead disagrees with your product roadmap priorities?",
    },
    {
      role: "ai",
      label: "Recruiter",
      time: "09:12",
      text: "Good approach. Now let me shift gears — we're a fast-growing company and things change quickly. Tell me about a time you had to make a major product decision with incomplete data. What was your framework?",
    },
    {
      role: "ai",
      label: "Recruiter",
      time: "09:16",
      text: "I appreciate the structured thinking. Here's a harder one — imagine you join us and after 90 days, you realize the product strategy inherited from your predecessor isn't working. What do you do?",
    },
    {
      role: "ai",
      label: "Recruiter",
      time: "09:20",
      text: "That's a mature answer. Let me ask about team dynamics — you'd be managing a team of 8 across three countries. How do you build trust and maintain alignment with a distributed team you've never met in person?",
    },
    {
      role: "ai",
      label: "Recruiter",
      time: "09:24",
      text: "Strong answer. I can tell you've managed remote teams before. One thing I want to understand better — what's your biggest professional weakness, and what are you actively doing about it?",
    },
    {
      role: "ai",
      label: "Recruiter",
      time: "09:28",
      text: "I appreciate the honesty. We're coming up on time, and I've really enjoyed this conversation. Before we wrap up — do you have any questions for me about the role, the team, or the company?",
    },
    {
      role: "ai",
      label: "Recruiter",
      time: "09:32",
      text: "Those are excellent questions — they tell me you're thinking strategically about this role. We'll be in touch within the next week. Thanks so much for your time today — it's been a great conversation.",
    },
  ],

  /* ── C-Suite ── */
  csuite: [
    {
      role: "ai",
      label: "CEO",
      time: "14:00",
      text: "Good afternoon. I have 20 minutes before my next call, so let's make this count. I understand you want to discuss the Q4 results and a budget reallocation proposal. What's your recommendation?",
    },
    {
      role: "ai",
      label: "CEO",
      time: "14:04",
      text: "Interesting. The retention data is compelling. But here's my concern — if we pull 20% from acquisition, won't that create a pipeline gap in Q2? The board is expecting continued growth numbers. How do you reconcile that?",
    },
    {
      role: "ai",
      label: "CEO",
      time: "14:09",
      text: "Okay, the scenario modeling is helpful. But I need to understand the risk better. What happens if the retention improvement doesn't materialize as projected? What's our fallback position?",
    },
    {
      role: "ai",
      label: "CEO",
      time: "14:13",
      text: "The phased approach with Brazil is smart risk management. But let me challenge you on the timeline — you're saying we'll see results in 90 days. In my experience, behavior change in customer success takes longer. What evidence supports that timeline?",
    },
    {
      role: "ai",
      label: "CEO",
      time: "14:17",
      text: "Fair point about the onboarding automation. Now, I need to think about this from the board's perspective. They approved a growth-first strategy last quarter. How do I sell them on shifting to retention without looking like we're pivoting?",
    },
    {
      role: "ai",
      label: "CEO",
      time: "14:21",
      text: "\"Growth through retention\" — I like that framing. The CAC payback improvement is the kind of number that resonates with our investors. What about headcount? Does this reallocation affect any current team positions?",
    },
    {
      role: "ai",
      label: "CEO",
      time: "14:25",
      text: "Good — no layoffs, just redeployment. That makes the board conversation much easier. Let me ask you about competitive risk — are any of our competitors already making this shift to retention-first?",
    },
    {
      role: "ai",
      label: "CEO",
      time: "14:29",
      text: "That's valuable competitive intelligence. You've built a strong case here. Before I take this to the board — is there anything else you think I should know, or any risk I haven't asked about?",
    },
    {
      role: "ai",
      label: "CEO",
      time: "14:33",
      text: "Thorough as always. Send me the full model by end of day — I want to review the numbers before presenting to the board next Tuesday. If the data holds up, you'll have your green light.",
    },
  ],

  /* ── Negotiation ── */
  negotiation: [
    {
      role: "ai",
      label: "Client",
      time: "11:00",
      text: "Thanks for making time to discuss the contract renewal. Let me be direct — we've enjoyed working together this year, but our finance team is pushing for a 15% reduction across all vendor contracts. Where do you see flexibility on your end?",
    },
    {
      role: "ai",
      label: "Client",
      time: "11:05",
      text: "I appreciate you holding on price, and the additional licenses are a nice touch. But my CFO is going to ask why we're not getting a discount when competitors are offering 20% less. What would you say to that?",
    },
    {
      role: "ai",
      label: "Client",
      time: "11:10",
      text: "Fair point about the switching costs and the ROI we've already seen. Let me ask you this — if we committed to a two-year term instead of annual, would that change your flexibility on pricing or the package?",
    },
    {
      role: "ai",
      label: "Client",
      time: "11:14",
      text: "The premium tier at current pricing is interesting. But I need to understand what 'premium' actually gets us that we don't have today. Can you be specific about the added value?",
    },
    {
      role: "ai",
      label: "Client",
      time: "11:18",
      text: "Okay, the dedicated account manager and priority support are appealing. But here's my real concern — we've grown 40% this year. If we lock in a two-year deal, I need assurance that the platform can scale with us without surprise costs. How do you handle volume growth?",
    },
    {
      role: "ai",
      label: "Client",
      time: "11:22",
      text: "Volume-based pricing that decreases per unit — that's the kind of structure I can sell internally. Let me push on one more thing — what happens if we need to downscale? Life's unpredictable. Is there an exit clause?",
    },
    {
      role: "ai",
      label: "Client",
      time: "11:26",
      text: "A 90-day notice with proportional adjustment is reasonable. I'm feeling good about where this is heading. My CFO meets with vendors on Fridays — can you have a formal proposal ready by Thursday?",
    },
    {
      role: "ai",
      label: "Client",
      time: "11:30",
      text: "Good. One last question before we close — if my CFO pushes back on the two-year commitment and wants to stay annual, what's the best you can offer us in that scenario?",
    },
    {
      role: "ai",
      label: "Client",
      time: "11:34",
      text: "That's a fair position — I understand the two-year gives you more flexibility on pricing. Let me run both scenarios by the CFO today. If she approves, we'll have the paperwork ready by Friday. Thanks for being straightforward — I appreciate it.",
    },
  ],

  /* ── Networking ── */
  networking: [
    {
      role: "ai",
      label: "VP of Partnerships",
      time: "17:30",
      text: "Hey! I noticed your badge says MasteryTalk. I'm Sarah, VP of Partnerships at CloudScale. What's MasteryTalk all about? I don't think I've heard of you guys yet.",
    },
    {
      role: "ai",
      label: "VP of Partnerships",
      time: "17:33",
      text: "Oh, that's fascinating — AI-powered communication coaching for LATAM professionals. We actually have a huge LATAM expansion initiative this year. Tell me more — how does the coaching actually work? Is it just language training or something more?",
    },
    {
      role: "ai",
      label: "VP of Partnerships",
      time: "17:36",
      text: "Executive presence coaching, not just grammar — that's a smart positioning. We're spending a fortune sending our LATAM team leads to in-person workshops. How are your clients typically measuring the impact?",
    },
    {
      role: "ai",
      label: "VP of Partnerships",
      time: "17:39",
      text: "A 35% improvement in deal close rates? That's impressive if it holds. I'm curious — how does the AI simulate real business scenarios? Is it like role-playing with a chatbot, or something more sophisticated?",
    },
    {
      role: "ai",
      label: "VP of Partnerships",
      time: "17:42",
      text: "Scenario-specific personas with real-time pronunciation scoring — that's much more than I expected. How many companies are using this right now? Are there any names I'd recognize?",
    },
    {
      role: "ai",
      label: "VP of Partnerships",
      time: "17:45",
      text: "Still early stage but with strong traction — I respect that honesty. You know, we have about 200 LATAM-based team leads who struggle with executive communication in English. Have you ever considered a B2B enterprise licensing model?",
    },
    {
      role: "ai",
      label: "VP of Partnerships",
      time: "17:48",
      text: "Enterprise pilots — smart way to prove value before scaling. Our L&D team is always looking for innovative solutions. I think there could be a real fit here, especially with our Mexico and Colombia offices.",
    },
    {
      role: "ai",
      label: "VP of Partnerships",
      time: "17:51",
      text: "This has been a really interesting conversation. Before we part ways — what would be the ideal next step from your side? A demo, a pilot proposal, or just a follow-up call?",
    },
    {
      role: "ai",
      label: "VP of Partnerships",
      time: "17:54",
      text: "Perfect — let me give you my card. Send me the case study and a pilot proposal by Tuesday, and I'll loop in our Head of L&D for a call next week. Great meeting you!",
    },
  ],
};

/** Default chat messages (sales) for backward compatibility */
export const MOCK_CHAT_MESSAGES: ChatMessage[] = CHAT_MESSAGES_BY_SCENARIO.sales;

/** Get chat messages for a given scenario type */
export function getChatMessagesForScenario(
  scenarioType?: ScenarioType | string | null
): ChatMessage[] {
  if (scenarioType && CHAT_MESSAGES_BY_SCENARIO[scenarioType]) {
    return CHAT_MESSAGES_BY_SCENARIO[scenarioType];
  }
  return CHAT_MESSAGES_BY_SCENARIO.sales;
}

/* ═══════════════════════════════════════════════════════════
   POWER PHRASES BY SCENARIO
   ═══════════════════════════════════════════════════════════ */

const POWER_PHRASES_BY_SCENARIO: Record<string, Record<string, ArenaPowerPhrase[]>> = {
  /* ── Default / Sales (legacy) ── */
  default: {
    support: [
      { id: "pp-1", phrase: "Let me walk you through the key differentiators", context: "Opening a value proposition", category: "opener" },
      { id: "pp-2", phrase: "Based on our experience with similar organizations...", context: "Building credibility with evidence", category: "data" },
      { id: "pp-3", phrase: "The measurable impact we've seen is...", context: "Presenting ROI with specifics", category: "data" },
      { id: "pp-4", phrase: "I'd like to address that concern directly", context: "Handling objections head-on", category: "objection" },
      { id: "pp-5", phrase: "To put that in perspective for your team...", context: "Translating features to business value", category: "transition" },
    ],
    guidance: [
      { id: "pp-6", phrase: "What we've found is that the key success factor is...", context: "Demonstrating strategic thinking", category: "transition" },
      { id: "pp-7", phrase: "I'd recommend we structure this as...", context: "Proposing a framework", category: "opener" },
      { id: "pp-8", phrase: "The investment pays for itself through...", context: "ROI justification", category: "closing" },
    ],
    challenge: [],
  },

  /* ── Sales-specific ── */
  sales: {
    support: [
      { id: "s-pp-1", phrase: "Based on what you've shared, the core issue is...", context: "Diagnosing client pain", category: "opener" },
      { id: "s-pp-2", phrase: "Let me address that concern with a specific case...", context: "Evidence-based objection handling", category: "objection" },
      { id: "s-pp-3", phrase: "What would success look like for your team in Q3?", context: "Discovery question — paints the future", category: "data" },
      { id: "s-pp-4", phrase: "The ROI timeline we typically see is...", context: "Setting concrete expectations", category: "data" },
      { id: "s-pp-5", phrase: "Here's what changed for [similar company]...", context: "Social proof storytelling", category: "transition" },
    ],
    guidance: [
      { id: "s-pp-6", phrase: "If we could reduce that by 40%, what would that free up?", context: "Reframing value as opportunity", category: "transition" },
      { id: "s-pp-7", phrase: "Let me propose a structured pilot approach...", context: "De-risking the purchase decision", category: "opener" },
      { id: "s-pp-8", phrase: "The cost of inaction here is...", context: "Creating urgency without pressure", category: "closing" },
    ],
    challenge: [],
  },

  /* ── Interview ── */
  interview: {
    support: [
      { id: "i-pp-1", phrase: "In my previous role, I led a team that...", context: "Opening with a STAR story", category: "opener" },
      { id: "i-pp-2", phrase: "The measurable impact of that initiative was...", context: "Quantifying your contributions", category: "data" },
      { id: "i-pp-3", phrase: "One challenge I navigated was...", context: "Showing problem-solving ability", category: "transition" },
      { id: "i-pp-4", phrase: "What attracted me to this role specifically is...", context: "Demonstrating genuine interest", category: "opener" },
      { id: "i-pp-5", phrase: "I learned that the key to [skill] is...", context: "Showing growth mindset", category: "data" },
    ],
    guidance: [
      { id: "i-pp-6", phrase: "The approach I'd take in your environment would be...", context: "Projecting into the new role", category: "transition" },
      { id: "i-pp-7", phrase: "Based on what you've described about the team...", context: "Active listening signal", category: "opener" },
      { id: "i-pp-8", phrase: "In the first 90 days, my priority would be...", context: "Showing strategic thinking", category: "closing" },
    ],
    challenge: [],
  },

  /* ── C-Suite ── */
  csuite: {
    support: [
      { id: "c-pp-1", phrase: "The bottom line is...", context: "Leading with the conclusion", category: "opener" },
      { id: "c-pp-2", phrase: "Here's the data that supports this recommendation...", context: "Evidence-first approach", category: "data" },
      { id: "c-pp-3", phrase: "The risk if we don't act is...", context: "Creating strategic urgency", category: "data" },
      { id: "c-pp-4", phrase: "I've considered three options. Here's why I recommend this one...", context: "Structured decision framework", category: "transition" },
    ],
    guidance: [
      { id: "c-pp-5", phrase: "To address your concern about [risk]...", context: "Anticipating executive pushback", category: "objection" },
      { id: "c-pp-6", phrase: "The market signal we're seeing is...", context: "External validation", category: "data" },
      { id: "c-pp-7", phrase: "My specific ask is...", context: "Clear decision request", category: "closing" },
    ],
    challenge: [],
  },

  /* ── Negotiation ── */
  negotiation: {
    support: [
      { id: "n-pp-1", phrase: "Based on the market data, a fair range would be...", context: "Anchoring with evidence", category: "opener" },
      { id: "n-pp-2", phrase: "I understand your position. Here's what I can offer...", context: "Acknowledging before countering", category: "transition" },
      { id: "n-pp-3", phrase: "What if we restructure this as...", context: "Creative problem-solving", category: "data" },
      { id: "n-pp-4", phrase: "That's below what I can accept. Here's why...", context: "Firm boundary with rationale", category: "objection" },
    ],
    guidance: [
      { id: "n-pp-5", phrase: "To make this work for both sides...", context: "Win-win framing", category: "transition" },
      { id: "n-pp-6", phrase: "I'm flexible on [term] if we can agree on [term]...", context: "Strategic concession", category: "closing" },
      { id: "n-pp-7", phrase: "Let me be transparent about my constraints...", context: "Building trust through honesty", category: "opener" },
    ],
    challenge: [],
  },

  /* ── Networking ── */
  networking: {
    support: [
      { id: "nw-pp-1", phrase: "I help [audience] solve [problem] by...", context: "Clear value proposition", category: "opener" },
      { id: "nw-pp-2", phrase: "What's the biggest challenge you're seeing in [area]?", context: "Showing genuine curiosity", category: "data" },
      { id: "nw-pp-3", phrase: "That reminds me of something we're working on...", context: "Finding common ground", category: "transition" },
      { id: "nw-pp-4", phrase: "I'd love to continue this conversation. Can I send you...?", context: "Concrete follow-up ask", category: "closing" },
    ],
    guidance: [
      { id: "nw-pp-5", phrase: "Based on what you're describing, you should talk to...", context: "Being a connector adds value", category: "transition" },
      { id: "nw-pp-6", phrase: "Here's a quick example of how that played out...", context: "Micro-story for memorability", category: "data" },
    ],
    challenge: [],
  },
};

/**
 * Get power phrases for a given scenario type and arena phase.
 * Falls back to "default" (legacy sales phrases) if scenarioType is not found.
 */
export function getPowerPhrasesForScenario(
  scenarioType?: string | null
): Record<string, ArenaPowerPhrase[]> {
  if (scenarioType && POWER_PHRASES_BY_SCENARIO[scenarioType]) {
    return POWER_PHRASES_BY_SCENARIO[scenarioType];
  }
  return POWER_PHRASES_BY_SCENARIO.default;
}

/**
 * Legacy export — backwards compatible flat map (default/sales phrases).
 * Used by existing code that doesn't yet know about scenarioType.
 */
export const MOCK_ARENA_POWER_PHRASES: Record<string, ArenaPowerPhrase[]> =
  POWER_PHRASES_BY_SCENARIO.default;

/* ══════════════════════════════════════════════════════════════
   Semantic Hint Matching — picks the most relevant Power Phrase
   based on keywords detected in the AI message.
   ══════════════════════════════════════════════════════════════ */

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  objection: [
    "concern", "worried", "concerned", "issue", "problem", "risk",
    "afraid", "hesitant", "pushback", "tried", "failed", "terrible",
    "adoption", "skeptic", "doubt", "challenge", "difficult",
  ],
  opener: [
    "walk me through", "tell me", "explain", "introduce", "present",
    "describe", "start", "begin", "pitch", "overview", "share",
    "what do you", "who are you", "background", "yourself",
  ],
  data: [
    "numbers", "data", "roi", "impact", "results", "metrics",
    "measure", "percentage", "growth", "revenue", "cost",
    "savings", "performance", "kpi", "evidence", "proof", "case study",
    "timeline", "how long", "how fast", "implementation", "setup",
  ],
  transition: [
    "next step", "process", "approach", "how would", "what if",
    "structure", "plan", "strategy", "framework", "phase",
    "how does", "differs", "different", "compare", "differentiator",
    "specifically", "perspective", "context",
  ],
  closing: [
    "decision", "move forward", "next steps", "follow up", "send me",
    "leadership", "meeting", "consider", "proposal", "one-pager",
    "bring this", "schedule", "pricing", "investment", "commitment",
  ],
};

/**
 * Picks the most relevant Power Phrase for a given AI message.
 * Uses keyword-category matching; falls back to sequential rotation.
 */
export function matchHintToMessage(
  aiText: string,
  phrases: ArenaPowerPhrase[],
  fallbackIndex: number
): ArenaPowerPhrase {
  if (phrases.length === 0) return phrases[0]; // safety

  const textLower = aiText.toLowerCase();

  // Score each category by keyword hits
  const categoryScores: Record<string, number> = {};
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (textLower.includes(kw)) score++;
    }
    if (score > 0) categoryScores[category] = score;
  }

  // Find best matching category
  const sortedCategories = Object.entries(categoryScores).sort(
    (a, b) => b[1] - a[1]
  );

  if (sortedCategories.length > 0) {
    const bestCategory = sortedCategories[0][0];
    const match = phrases.find((p) => p.category === bestCategory);
    if (match) return match;

    // Try second-best category
    if (sortedCategories.length > 1) {
      const secondCategory = sortedCategories[1][0];
      const secondMatch = phrases.find((p) => p.category === secondCategory);
      if (secondMatch) return secondMatch;
    }
  }

  // Fallback: sequential rotation
  return phrases[fallbackIndex % phrases.length];
}

/* ══════════════════════════════════════════════════════════════
   "Try saying..." — Concrete response starters per scenario
   and detected AI topic. Gives the user a springboard sentence
   so they don't freeze.
   ══════════════════════════════════════════════════════════════ */

interface TrySayingSuggestion {
  trigger: string[];       // keywords to detect in AI message
  starter: string;         // the "Try saying..." text
  why: string;             // short rationale
}

const TRY_SAYING_BY_SCENARIO: Record<string, TrySayingSuggestion[]> = {
  default: [
    { trigger: ["walk me through", "key benefits", "differentiator", "differs"], starter: "What sets us apart is three things: first...", why: "Rule of three creates structure" },
    { trigger: ["timeline", "how long", "implementation", "setup", "operational"], starter: "For a team your size, we typically see 10–14 business days, and here's why...", why: "Precision builds executive confidence" },
    { trigger: ["concern", "worried", "tried", "failed", "adoption", "terrible"], starter: "That's a valid concern. What we've learned from similar rollouts is...", why: "Acknowledge before redirecting" },
    { trigger: ["decision", "consider", "leadership", "one-pager", "send me"], starter: "Absolutely. I'll have that to you by tomorrow, including...", why: "Show urgency and exceed expectations" },
  ],
  sales: [
    { trigger: ["walk me through", "key benefits", "differentiator", "differs"], starter: "The core value we deliver is solving your lead follow-up gap. Specifically, our platform reduces response time from hours to minutes...", why: "Lead with the problem you solve" },
    { trigger: ["price", "cost", "investment", "budget", "expensive"], starter: "Great question on investment. Let me frame the ROI first...", why: "Reframe cost as investment" },
    { trigger: ["timeline", "how long", "implementation", "setup", "lean team", "operational"], starter: "For a lean team like yours, our fastest deployment was 8 days. We assign a dedicated specialist who handles 90% of the setup...", why: "Anchor with your best case" },
    { trigger: ["concern", "worried", "tried", "failed", "adoption", "terrible", "spreadsheets"], starter: "I completely understand — low adoption kills ROI. That's why we built a champion program: we train 2-3 power users who become internal advocates...", why: "Social proof dissolves objections" },
    { trigger: ["competition", "alternative", "already using", "currently"], starter: "Unlike generic platforms, we built specifically for the LATAM mid-market — native bilingual support, local payment integration...", why: "Differentiate without attacking" },
    { trigger: ["decision", "consider", "leadership", "one-pager", "send me", "thursday"], starter: "Absolutely. I'll send the one-pager by end of day with the ROI calculator and two client references your team can call directly...", why: "Arm your champion with ammo" },
  ],
  interview: [
    { trigger: ["tell me about yourself", "background", "what brought you", "yourself"], starter: "I'm a product leader with 8 years of experience building products for the LATAM market. Most recently, I led a team of 12 that grew revenue 3x in 18 months...", why: "Present-past-future structure" },
    { trigger: ["challenge", "falling behind", "difficult", "problem", "obstacle", "conflict", "turn it around"], starter: "When I joined, the team was missing targets by 40%. I restructured the sprint process and implemented weekly stakeholder check-ins. Within two quarters, we were hitting 95% of targets...", why: "STAR method: Situation → Action → Result" },
    { trigger: ["disagree", "engineering", "time zones", "roadmap", "priorities", "push you"], starter: "I believe the best product decisions come from data, not hierarchy. I'd start by understanding the engineering lead's constraints, then present the user data that supports the priority...", why: "Show collaborative leadership" },
    { trigger: ["questions for me", "anything else", "before we finish", "wrapping up"], starter: "Yes — I'd love to understand how your team measures success for this role in the first six months. And what's the biggest challenge the team is facing right now that this hire needs to solve?", why: "Smart questions show strategic thinking" },
  ],
  csuite: [
    { trigger: ["recommendation", "suggest", "propose", "what's your", "make this count"], starter: "My recommendation is to reallocate 20% of acquisition spend to retention. Our cohort data shows a 5% improvement in churn reduces CAC payback by 8 months — that's $2.3M in annual savings...", why: "Lead with the conclusion" },
    { trigger: ["concern", "pipeline gap", "growth numbers", "board", "pull from acquisition"], starter: "I've modeled three scenarios. Even in the conservative case, we break even by month 4. The key insight is that retained customers generate 3x more expansion revenue than new acquisitions...", why: "Address risk with scenarios" },
    { trigger: ["risk", "fallback", "doesn't materialize", "what happens"], starter: "If retention doesn't improve as projected, we have a built-in circuit breaker: we run the pilot with the Brazil team only, measure at 90 days, and can reallocate back without long-term commitment...", why: "Show you've planned for failure" },
    { trigger: ["send me", "review", "board", "green light", "end of day", "numbers"], starter: "I'll have the full model on your desk by 5 PM today — the three scenarios, the pilot timeline, and the decision framework for the board presentation...", why: "Exceed the ask" },
  ],
  negotiation: [
    { trigger: ["direct", "15% reduction", "flexibility", "where do you see"], starter: "I appreciate the transparency. Rather than reducing price, I'd like to propose maintaining our current rate while adding 15% more licenses — that gives your growing team more value at the same investment...", why: "Anchor with value, not discount" },
    { trigger: ["competitors", "20% less", "CFO", "discount"], starter: "That's a fair challenge. Here's what I'd say to your CFO: the switching cost alone — migration, training, 3-month productivity dip — would exceed any first-year savings. Plus, our ROI data shows we've already delivered 4x the contract value...", why: "Reframe the comparison" },
    { trigger: ["two-year", "committed", "longer term", "change your flexibility"], starter: "Absolutely — a two-year commitment changes the equation. If you can commit to 24 months, I can include the premium tier at no additional cost. That's an $85K value add for your team...", why: "Trade, never concede" },
    { trigger: ["creative", "works for me", "CFO", "paperwork", "proposal", "run the numbers"], starter: "Perfect. I'll have the updated proposal with the two-year terms and premium tier details in your inbox by end of day. I'll also include a one-page ROI summary your CFO can review quickly...", why: "Lock in momentum" },
  ],
  networking: [
    { trigger: ["what's", "all about", "heard of you", "badge"], starter: "Great to meet you, Sarah! MasteryTalk is AI-powered communication coaching — we help LATAM professionals master executive conversations in English. Think of it as a personal presentation coach that's available 24/7...", why: "Value prop + memorable hook" },
    { trigger: ["fascinating", "tell me more", "how does", "coaching actually work", "language training"], starter: "It goes way beyond language. We simulate real business scenarios — sales pitches, board presentations, negotiations — and give real-time feedback on executive presence, not just grammar. Our clients see a 35% improvement in deal close rates...", why: "Differentiate + quantify impact" },
    { trigger: ["measuring", "impact", "workshops", "fortune", "spending"], starter: "Our clients track three metrics: deal close rates, promotion velocity, and self-reported confidence scores. One enterprise client replaced their $200K annual workshop program with us and saw better results in 90 days...", why: "ROI speaks louder than features" },
    { trigger: ["case study", "card", "send that", "call next week", "impressive"], starter: "I'd love that. Let me send you the LATAM SaaS expansion case study by Tuesday — and I'll include a quick analysis of how MasteryTalk could fit your partnership team's needs. How about coffee Wednesday?", why: "Specific follow-up beats vague promises" },
  ],
};

/**
 * Get a "Try saying..." suggestion based on the AI message and scenario.
 * Returns null if no keyword matches.
 */
export function getTrySaying(
  scenarioType: string | null | undefined,
  aiText: string
): { starter: string; why: string } | null {
  const scenario = scenarioType && TRY_SAYING_BY_SCENARIO[scenarioType]
    ? scenarioType
    : "default";
  const suggestions = TRY_SAYING_BY_SCENARIO[scenario];
  const textLower = aiText.toLowerCase();

  // Score each suggestion by trigger hits
  let bestMatch: TrySayingSuggestion | null = null;
  let bestScore = 0;

  for (const s of suggestions) {
    let score = 0;
    for (const t of s.trigger) {
      if (textLower.includes(t)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = s;
    }
  }

  if (bestMatch && bestScore > 0) {
    return { starter: bestMatch.starter, why: bestMatch.why };
  }

  // Fallback: rotate through suggestions based on AI text hash (avoids always showing the same tip)
  if (suggestions.length > 0) {
    let hash = 0;
    for (let i = 0; i < aiText.length; i++) {
      hash = ((hash << 5) - hash + aiText.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % suggestions.length;
    return { starter: suggestions[idx].starter, why: suggestions[idx].why };
  }
  return null;
}

/* ══════════════════════════════════════════════════════════════
   Before/After Comparisons — Scenario-specific
   ══════════════════════════════════════════════════════════════ */

const BEFORE_AFTER_BY_SCENARIO: Record<string, BeforeAfterComparison[]> = {
  sales: [
    {
      userOriginal: "We can do it in like two weeks, more or less.",
      professionalVersion:
        "Our standard implementation runs 10-14 business days, with the timeline primarily influenced by team size and integration complexity.",
      technique: "Precision framing — specific numbers build executive confidence",
    },
    {
      userOriginal: "The main differentiator is that we offer bilingual support and integrations with local payment processors.",
      professionalVersion:
        "We've built a purpose-designed solution for the LATAM mid-market, with native bilingual capabilities and seamless integration into the local payment ecosystem.",
      technique: "Value elevation — reframing features as strategic capabilities",
    },
    {
      userOriginal: "It depends on the size of the team, but usually it's pretty fast.",
      professionalVersion:
        "For a lean team like yours, we'd likely be on the faster end of our 10-14 day implementation window.",
      technique: "Personalization — tailoring the answer to the prospect's context",
    },
  ],
  interview: [
    {
      userOriginal: "I managed a team and we improved our numbers a lot.",
      professionalVersion:
        "I led a cross-functional team of 12 that delivered a 30% increase in retention within two quarters.",
      technique: "Quantification — numbers make your claims credible and memorable",
    },
    {
      userOriginal: "I want this job because it seems like a good fit for what I do.",
      professionalVersion:
        "What specifically drew me to this role is the intersection of product strategy and emerging markets — two areas where I've built deep expertise over 8 years.",
      technique: "Specificity — generic interest signals low preparation, specific interest signals commitment",
    },
    {
      userOriginal: "I'd probably talk to the engineering lead and try to work it out.",
      professionalVersion:
        "I'd start by understanding the engineering lead's technical constraints, then present the user data that supports the priority. I believe the best product decisions come from data, not hierarchy.",
      technique: "Framework thinking — showing a structured approach signals seniority",
    },
  ],
  csuite: [
    {
      userOriginal: "I think we should spend more on retention instead of acquisition.",
      professionalVersion:
        "My recommendation is to reallocate 20% of acquisition spend to retention. Our cohort data shows a 5% improvement in churn reduces CAC payback by 8 months — that's $2.3M in annual savings.",
      technique: "Conclusion-first — executives want the answer before the evidence",
    },
    {
      userOriginal: "I don't think there's much risk if we do this.",
      professionalVersion:
        "I've modeled three scenarios: conservative, moderate, and aggressive. Even in the conservative case, we break even by month 4.",
      technique: "Risk acknowledgment — addressing risks proactively builds trust",
    },
    {
      userOriginal: "We could test it with one team first to see if it works.",
      professionalVersion:
        "I propose a controlled pilot with the Brazil team in Q2 — $180K investment with a projected 4.2x return. We measure at 90 days and have a built-in circuit breaker if results underperform.",
      technique: "Structured proposal — specific investment + projected return + timeline removes ambiguity",
    },
  ],
  negotiation: [
    {
      userOriginal: "I can't really lower the price, but maybe I can add some extras.",
      professionalVersion:
        "Rather than adjusting the rate, I'd like to propose maintaining our current pricing while adding 15% additional licenses — delivering more value at the same investment.",
      technique: "Value reframing — adding value feels generous, lowering price feels like weakness",
    },
    {
      userOriginal: "Our competitors charge more, so I think our price is fair.",
      professionalVersion:
        "The switching cost alone — migration, training, a 3-month productivity dip — would exceed any first-year savings. And our ROI data shows we've already delivered 4x the contract value this year.",
      technique: "Total cost framing — shift the conversation from price to total value",
    },
    {
      userOriginal: "If you sign for two years, maybe I can do something about the price.",
      professionalVersion:
        "A two-year commitment changes the equation. I can include the premium tier at no additional cost — that's an $85K value add for your team, and it gives us the partnership stability we value.",
      technique: "Conditional concession — every give should be tied to a get",
    },
  ],
  networking: [
    {
      userOriginal: "We do like AI coaching for people who need to speak English better.",
      professionalVersion:
        "We help LATAM professionals master executive conversations in English — not grammar, but the communication patterns that win deals and accelerate promotions.",
      technique: "Value proposition reframe — focus on outcomes, not features",
    },
    {
      userOriginal: "It works pretty well, our clients like it.",
      professionalVersion:
        "Our clients see a 35% improvement in deal close rates within 90 days. One enterprise client replaced their $200K annual workshop program with us and saw better outcomes.",
      technique: "Data storytelling — combine a metric with a specific client story",
    },
    {
      userOriginal: "Sure, let's keep in touch. Here's my LinkedIn.",
      professionalVersion:
        "I'd love that. Let me send you the LATAM SaaS expansion case study by Tuesday — I'll include a quick analysis of how it could fit your partnership team. How about coffee Wednesday?",
      technique: "Concrete follow-up — specific day + specific deliverable = 10x more likely to happen",
    },
  ],
};

export const MOCK_BEFORE_AFTER: BeforeAfterComparison[] = BEFORE_AFTER_BY_SCENARIO.sales;

export function getBeforeAfterForScenario(
  scenarioType?: ScenarioType | string | null
): BeforeAfterComparison[] {
  if (scenarioType && BEFORE_AFTER_BY_SCENARIO[scenarioType]) {
    return BEFORE_AFTER_BY_SCENARIO[scenarioType];
  }
  return BEFORE_AFTER_BY_SCENARIO.sales;
}