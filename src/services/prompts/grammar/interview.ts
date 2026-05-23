/**
 * Grammar Bank — Interview Mastery Path
 *
 * 6 levels × 4 structures = 24 total entries.
 * Concepts and patterns are static.
 * Examples are static fallbacks — the /grammar-examples endpoint generates
 * personalized versions using the user's profile (position, industry, seniority).
 *
 * Rotation: one structure per session, sequential, cycles after all 4 are shown.
 * Tracked in OnboardingProfile.grammarRotationIndex[levelId].
 */

export interface GrammarStructure {
  /** Unique ID — used as rotation key */
  id: string;
  /** Level this structure belongs to */
  levelId: string;
  /** Display title */
  title: string;
  /** Grammatical pattern — always shown, not personalized */
  pattern: string;
  /** Professional use cases — static, 3 bullet points */
  professionalUses: string[];
  /** Static fallback examples — shown if /grammar-examples call fails */
  staticExamples: string[];
  /** Optional contrast note ("⚠️ Don't confuse with...") */
  warningNote?: string;
}

// ─────────────────────────────────────────────────────────────
// L1 — Phone Screen
// Focus: self-introduction, screening questions, first impression
// CEFR: B1 → B2
// ─────────────────────────────────────────────────────────────

const INT_1: GrammarStructure[] = [
  {
    id: "int-1-pp-simple",
    levelId: "int-1",
    title: "Present Perfect: Proving Your Track Record",
    pattern: "have/has + past participle",
    professionalUses: [
      "Anchor achievements without a specific date — the result matters, not when it happened",
      "Signal that past experience is still relevant to the present role",
      "Quantify impact in a pitch context without over-explaining the timeline",
    ],
    staticExamples: [
      "I've led three product launches that reached $1M ARR within the first year.",
      "We've reduced deployment time by 60% since I joined the team.",
      "I've worked across five different industries, which has given me a unique cross-functional perspective.",
    ],
    warningNote:
      "Simple Past vs. Present Perfect — Simple Past: \"I led a team.\" (finished, disconnected from now). Present Perfect: \"I've led teams.\" (experience that still applies today).",
  },
  {
    id: "int-1-pp-continuous",
    levelId: "int-1",
    title: "Present Perfect Continuous: Signaling Current Focus",
    pattern: "have/has been + verb-ing",
    professionalUses: [
      "Show what you're actively working on right now",
      "Signal momentum and ongoing commitment to a current project or skill",
      "Bridge from your current role to the opportunity you're discussing",
    ],
    staticExamples: [
      "I've been building out the data infrastructure for the past 18 months.",
      "We've been transitioning our clients from legacy systems to cloud-native solutions.",
      "I've been developing my leadership skills — I recently took on two direct reports for the first time.",
    ],
    warningNote:
      "Simple Past vs. Present Perfect Continuous — \"I worked on the API\" (finished, closed). \"I've been working on the API\" (still happening, still relevant).",
  },
  {
    id: "int-1-present-purpose",
    levelId: "int-1",
    title: "Present Simple + Infinitive of Purpose: Framing Your Role",
    pattern: "I [verb] + to + infinitive  /  I'm [role] + who + [verb]",
    professionalUses: [
      "Define your current role with precision — avoid the flat 'I am a developer' opener",
      "Connect your identity to your function and the value you deliver",
      "Make your elevator pitch feel purposeful, not just descriptive",
    ],
    staticExamples: [
      "I work at [company] to help enterprise clients migrate their infrastructure without downtime.",
      "I'm a product manager who focuses specifically on reducing time-to-value in complex B2B onboarding flows.",
      "I lead a team of eight engineers to deliver the platform integrations that power our core revenue stream.",
    ],
  },
  {
    id: "int-1-future-aspiration",
    levelId: "int-1",
    title: "Future Forms for Professional Aspiration",
    pattern: "I'm looking for...  /  I'd like to...  /  I'm hoping to...",
    professionalUses: [
      "Close your elevator pitch with direction, not desperation",
      "Signal intentionality — you're targeting this specific role, not any job",
      "Differentiate 'I need a job' from 'I'm building toward a clear goal'",
    ],
    staticExamples: [
      "I'm looking for an environment where architectural decisions move quickly from proposal to production.",
      "I'd like to bring what I've learned about distributed systems to a team that's still designing its foundation.",
      "I'm hoping to step into a role where I can grow into engineering leadership within the next two years.",
    ],
    warningNote:
      "Avoid 'will' for personal aspiration in an interview: \"I will grow in this role\" sounds like a promise you can't make yet. \"I'm looking to grow...\" sounds intentional and grounded.",
  },
];

// ─────────────────────────────────────────────────────────────
// L2 — Behavioral Round
// Focus: STAR stories, past evidence, quantified results
// CEFR: B2
// ─────────────────────────────────────────────────────────────

const INT_2: GrammarStructure[] = [
  {
    id: "int-2-simple-past",
    levelId: "int-2",
    title: "Simple Past: Building the STAR Timeline",
    pattern: "verb-ed  /  irregular past form",
    professionalUses: [
      "Narrate the events of a STAR story with clarity and sequence",
      "Signal that the story is complete and self-contained",
      "Anchor each STAR beat — Situation, Task, Action, Result — in a specific action you took",
    ],
    staticExamples: [
      "I noticed the two teams had fundamentally different approaches to the architecture, so I set up a structured working session.",
      "I took ownership of the client relationship after the previous manager left, and rebuilt trust over the first three months.",
      "I designed the framework, ran it by the key stakeholders, and launched it before the end of the quarter.",
    ],
    warningNote:
      "Sequencing markers to use with Simple Past: \"First, I... Then I... After that... Finally...\" / \"At that point... / When that happened... / As a result...\"",
  },
  {
    id: "int-2-past-perfect",
    levelId: "int-2",
    title: "Past Perfect: Setting the Scene",
    pattern: "had + past participle",
    professionalUses: [
      "Establish what was already true BEFORE your key action — the context that made it necessary",
      "Add depth to the Situation/Task beat of a STAR answer",
      "Signal that you understand the full context, not just the event you acted on",
    ],
    staticExamples: [
      "The system had been running without proper monitoring for over a year before I joined the team.",
      "By the time I took over the account, the client had already submitted two formal complaints.",
      "We hadn't established a clear decision-making process, which was why the conflict escalated.",
    ],
    warningNote:
      "Rule of thumb: Past Perfect = the BEFORE. Simple Past = the ACTION. \"The team had missed three deadlines (before). I introduced a weekly sync to address it (action).\"",
  },
  {
    id: "int-2-result-clauses",
    levelId: "int-2",
    title: "Result Clauses: Connecting Action to Impact",
    pattern: "...which meant that...  /  ...which allowed us to...  /  ...enabling the team to...",
    professionalUses: [
      "Make the causal link between your action and the result explicit",
      "Avoid flat 'and then the result was' — show the mechanism, not just the outcome",
      "Signal analytical thinking: you understand why your action worked, not just that it did",
    ],
    staticExamples: [
      "I restructured the sprint planning process, which meant that the team stopped carrying unfinished work into the next cycle.",
      "I brought in a neutral facilitator, which allowed both sides to present their reasoning without it becoming personal.",
      "We automated the deployment pipeline, enabling the team to ship twice a week instead of once a month.",
    ],
  },
  {
    id: "int-2-quantified-impact",
    levelId: "int-2",
    title: "Quantified Impact Structures",
    pattern: "...by [X%]  /  from [X] to [Y]  /  reduced/increased [metric] by...",
    professionalUses: [
      "Make results concrete and verifiable — not vague impressions",
      "Signal commercial and analytical awareness",
      "Make your STAR answer memorable and specific enough to stand out",
    ],
    staticExamples: [
      "We reduced customer onboarding time from 14 days to 3 days.",
      "This resulted in a 34% reduction in support tickets within the first quarter.",
      "Revenue for that product line increased by $800K over six months — roughly 22% of the team's annual target.",
    ],
    warningNote:
      "If you don't have an exact number, estimate honestly: \"I don't have the exact figure, but the rough estimate was around 30% faster.\" — better than vague, worse than precise.",
  },
];

// ─────────────────────────────────────────────────────────────
// L3 — Storytelling & STAR Deep Dive
// Focus: business impact, retrospective thinking, leadership signals
// CEFR: B2 → C1
// ─────────────────────────────────────────────────────────────

const INT_3: GrammarStructure[] = [
  {
    id: "int-3-third-conditional",
    levelId: "int-3",
    title: "Third Conditional: The Retrospective Layer",
    pattern: "If + had + past participle, would have + past participle",
    professionalUses: [
      "Add the 'what I'd do differently' layer to an Elevated STAR answer",
      "Signal self-awareness and capacity to learn from experience",
      "Distinguish a reflective senior from someone who just reports facts",
    ],
    staticExamples: [
      "If I had involved the legal team earlier, we would have avoided two weeks of rework at the most critical point.",
      "If I'd known the client's actual decision timeline, I would have structured the proposal completely differently.",
      "Looking back, if I had trusted my gut on the initial architecture, I would have saved the team three months of refactoring.",
    ],
    warningNote:
      "Key phrases to open the retrospective: \"Looking back...\" / \"In retrospect...\" / \"With what I know now...\"",
  },
  {
    id: "int-3-passive-voice",
    levelId: "int-3",
    title: "Passive Voice: Scaling Your Impact",
    pattern: "was/were + past participle  (+ by...)",
    professionalUses: [
      "Connect individual results to organizational-level impact — shift from 'I did X' to 'X was adopted'",
      "Signal that your work had systemic, not just local, effects",
      "Elevate the narrative from personal achievement to business consequence",
    ],
    staticExamples: [
      "That framework was later adopted across three other product teams.",
      "The process I designed was implemented as the standard for all new client onboardings in the region.",
      "The architecture was validated by the CTO and became the foundation for two subsequent platforms.",
    ],
    warningNote:
      "Don't overuse passive — it should appear in the 'business impact' layer, not replace active narration in the Action beat of your STAR answer.",
  },
  {
    id: "int-3-nominalization",
    levelId: "int-3",
    title: "Nominalization: Executive Register",
    pattern: "implement → the implementation of  /  reduce → a reduction in  /  decide → the decision to",
    professionalUses: [
      "Raise the register of your language without sounding robotic",
      "Talk about impact at a systemic level ('the restructuring of X' vs 'I restructured X')",
      "Signal familiarity with business and executive communication patterns",
    ],
    staticExamples: [
      "The restructuring of the team allowed for faster decision-making at the product level.",
      "The reduction in handoff time — from 5 days to same-day — had a direct effect on client satisfaction scores.",
      "The implementation of a shared OKR process was what finally aligned engineering and product around the same priorities.",
    ],
    warningNote:
      "Key nominalizations for interviews: the adoption of · the introduction of · the deployment of · a reduction in · an improvement in · the decision to · the shift toward",
  },
  {
    id: "int-3-concession",
    levelId: "int-3",
    title: "Concession Structures: Showing Nuance",
    pattern: "Although...  /  While X, Y...  /  Despite [noun]...  /  That said,...",
    professionalUses: [
      "Acknowledge complexity without undermining your main point",
      "Signal senior-level thinking — you see the full picture, not just your side of it",
      "Respond to 'what would you do differently?' with intellectual honesty",
    ],
    staticExamples: [
      "Although the timeline was aggressive, we were able to maintain quality by cutting scope, not corners.",
      "While the decision wasn't unanimous, the team aligned quickly once the tradeoffs were made explicit.",
      "That said, I underestimated how long the stakeholder alignment would take — I'd build more buffer into that phase next time.",
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// L4 — Technical Discussion
// Focus: reasoning out loud, hedging, tradeoffs, intellectual honesty
// CEFR: B2 → C1
// ─────────────────────────────────────────────────────────────

const INT_4: GrammarStructure[] = [
  {
    id: "int-4-hedging",
    levelId: "int-4",
    title: "Hedging Language: Intellectual Honesty Without Losing Ground",
    pattern: "My understanding is...  /  I'm not 100% certain, but...  /  It seems like...  /  I'd want to verify, but...",
    professionalUses: [
      "Admit knowledge gaps without sounding incompetent — precision is respected more than false confidence",
      "Signal that you distinguish between what you know and what you assume",
      "Build trust with technical interviewers who value accuracy over performance",
    ],
    staticExamples: [
      "I'm not 100% certain on the specific implementation, but my understanding is that the bottleneck is at the I/O layer, not compute.",
      "As far as I know, most teams at this scale use event sourcing — but I'd want to look at your specific consistency requirements before committing to that direction.",
      "It seems like the issue might be in the queue depth — though I'd want to see the metrics before ruling out the connection pool.",
    ],
  },
  {
    id: "int-4-conditional-reasoning",
    levelId: "int-4",
    title: "Conditional for Reasoning: Thinking Through Tradeoffs",
    pattern: "If [X], then [Y would...]  /  Assuming [X], the logical step would be...  /  In a scenario where X...",
    professionalUses: [
      "Show you reason systematically, not intuitively — your decisions are context-dependent",
      "Explore multiple scenarios before committing to one answer",
      "Demonstrate that you don't have dogmatic defaults — you adapt to constraints",
    ],
    staticExamples: [
      "If the team is small and the product is early-stage, a well-structured monolith would probably serve better than microservices right now.",
      "Assuming the read/write ratio is heavily skewed toward reads, caching at the application layer would give the most immediate impact.",
      "Were scalability the primary constraint, I'd prioritize horizontal scaling over optimizing the current architecture.",
    ],
  },
  {
    id: "int-4-contrast-markers",
    levelId: "int-4",
    title: "Contrast Markers: Structuring Tradeoff Arguments",
    pattern: "While X offers Y, the tradeoff is Z  /  X, however, Y  /  On one hand... on the other hand...",
    professionalUses: [
      "Structure a tradeoff argument so the interviewer can follow your reasoning clearly",
      "Signal that you see both sides of a technical decision — not just the upside",
      "Avoid the trap of advocating for one approach without acknowledging its costs",
    ],
    staticExamples: [
      "While microservices offer clear scalability benefits, the tradeoff is operational complexity — you'd need robust service discovery and distributed tracing from day one.",
      "A relational database gives you consistency guarantees; however, at the scale you're describing, you'd need to plan for sharding from the start.",
      "On one hand, rewriting from scratch removes all the legacy debt. On the other hand, you'd lose two quarters of velocity with no guarantee the new system is more stable.",
    ],
  },
  {
    id: "int-4-thinking-out-loud",
    levelId: "int-4",
    title: "Discourse Markers: Narrating Your Reasoning",
    pattern: "Let me think through this out loud...  /  My first instinct is X because...  /  The part I'm less certain about is...",
    professionalUses: [
      "Narrate your reasoning process so the interviewer can follow your logic and intervene with hints",
      "Show that you approach problems systematically, not impulsively",
      "Turn silence or uncertainty into a signal of structured thinking, not confusion",
    ],
    staticExamples: [
      "Let me think through this out loud — my first instinct is to address the database layer, because that's where I'd expect the latency to originate.",
      "My first intuition is X, and here's why — but the part I'm less certain about is how this behaves under write-heavy load.",
      "I want to stress-test my own assumption here: if the bottleneck isn't at the network layer, then this whole approach needs to be reconsidered.",
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// L5 — Salary Negotiation
// Focus: advocating for value, polite firmness, counter-offers
// CEFR: B2 → C1
// ─────────────────────────────────────────────────────────────

const INT_5: GrammarStructure[] = [
  {
    id: "int-5-modal-advocacy",
    levelId: "int-5",
    title: "Modal Verbs: Firm but Collaborative",
    pattern: "I'd like to...  /  I was hoping for...  /  Would it be possible to...  /  I'd need...",
    professionalUses: [
      "Express what you want without sounding aggressive or desperate",
      "Signal that you're advocating for yourself, not attacking the company",
      "Keep the conversation collaborative — you and HR want the same outcome",
    ],
    staticExamples: [
      "I'd like to find a number that reflects the market rate for this level of experience in this industry.",
      "I was hoping for something closer to $95K — is there flexibility to get there, or would it be easier to discuss the equity component?",
      "I'd appreciate the opportunity to review the full offer in writing before giving you a final answer.",
    ],
  },
  {
    id: "int-5-indirect-data",
    levelId: "int-5",
    title: "Indirect Speech + Data Framing: Anchoring with Evidence",
    pattern: "Based on my research...  /  According to [source]...  /  From what I've found in the market...",
    professionalUses: [
      "Remove the negotiation from personal feeling and ground it in external data",
      "Signal that your counter-offer isn't arbitrary — it's backed by market information",
      "Depersonalize the conversation: it's not you vs. them, it's both of you vs. the data",
    ],
    staticExamples: [
      "Based on my research into market rates for this role in this industry, I was expecting something closer to $95,000.",
      "From what I've found across Glassdoor, LinkedIn Salary, and a few conversations with peers, this range seems below the median for senior-level positions in your sector.",
      "According to the data I've gathered, the typical total compensation for this scope of responsibility falls between $90K and $105K.",
    ],
  },
  {
    id: "int-5-conditional-proposals",
    levelId: "int-5",
    title: "Conditional Proposals: Opening Space to Negotiate",
    pattern: "If [X] is possible, I'd be...  /  Would you be open to...?  /  What if we looked at...?",
    professionalUses: [
      "Make counter-proposals that open a door without closing the conversation",
      "Signal flexibility on components while being clear about your target",
      "Give HR a path forward rather than a binary accept/reject situation",
    ],
    staticExamples: [
      "If getting to $95K on base isn't possible, would you be open to revisiting the equity component or the signing bonus?",
      "What if we looked at a performance review at 6 months instead of 12? That would give me confidence that the path to the target comp is realistic.",
      "If the base is fixed at this level, I'd need to understand what the on-target earnings look like including bonus to make a fully informed decision.",
    ],
  },
  {
    id: "int-5-concession-pivot",
    levelId: "int-5",
    title: "Concession + Pivot: Acknowledging Without Yielding",
    pattern: "I understand [their constraint], and I also...  /  I appreciate that, and at the same time...",
    professionalUses: [
      "Acknowledge the other side's position without abandoning yours",
      "Signal maturity — you're not ignoring their constraints, you're balancing them with yours",
      "Prevent the conversation from becoming adversarial while holding your ground",
    ],
    staticExamples: [
      "I understand that the band for this role has a ceiling, and I also want to make sure we find a structure that works for both sides.",
      "I appreciate that there are constraints on the base, and at the same time, I want to be transparent that I have another offer I'm considering at a higher number.",
      "I hear that this is the top of the range — and I'd still like to explore whether other components of the package could bridge the gap.",
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// L6 — Executive Presence Close
// Focus: strategic questions, closing statement, executive register
// CEFR: C1
// ─────────────────────────────────────────────────────────────

const INT_6: GrammarStructure[] = [
  {
    id: "int-6-embedded-questions",
    levelId: "int-6",
    title: "Embedded Questions: Strategic Curiosity",
    pattern: "I'm curious how/what/whether...  /  I'd love to understand...  /  I'm wondering if...",
    professionalUses: [
      "Ask sharp questions without sounding interrogative — executive register softens direct questions",
      "Signal that you've done your research and are probing at depth, not gathering basic information",
      "Show you're already thinking like someone who works there, not just a candidate in an interview",
    ],
    staticExamples: [
      "I'm curious how the team currently balances technical debt against new feature velocity — is that a tension you actively manage?",
      "I'd love to understand what the decision-making process looks like when engineering and product are in conflict.",
      "I'm wondering whether the roadmap for the next 12 months is more about expanding the current product or building an adjacent one.",
    ],
    warningNote:
      "Lower register: \"How do you handle technical debt?\" — fine but less executive. Higher register: \"I'm curious how you handle technical debt as the product scales.\" — sharper, signals strategic thinking.",
  },
  {
    id: "int-6-declarative-confidence",
    levelId: "int-6",
    title: "Declarative Confidence: Expressing Intent Without Desperation",
    pattern: "I want to be direct about...  /  What I find most compelling is...  /  I'll be straightforward...",
    professionalUses: [
      "Express genuine interest in the role with authority, not eagerness",
      "Close the interview with a specific, memorable statement — not a generic 'I'm very interested'",
      "Signal executive presence: you say what you mean, directly and with precision",
    ],
    staticExamples: [
      "I want to be direct — this role is my first choice, and specifically because of the infrastructure challenge you described in the first round.",
      "What I find most compelling about this opportunity isn't the title — it's the scope of the problem and the stage the company is at.",
      "I'll be straightforward: I'm in conversations with two other companies, but this is the role I'd choose if both offers came in at the same time.",
    ],
  },
  {
    id: "int-6-conditional-strategic",
    levelId: "int-6",
    title: "Conditional Framing for Strategic Questions",
    pattern: "Given [X], how does the team...?  /  If [scenario], what would...?  /  Assuming [context], is...?",
    professionalUses: [
      "Ask questions that demonstrate you've thought through business scenarios, not just role requirements",
      "Signal strategic thinking — you're already modeling how you'd contribute before you've joined",
      "Show that you understand the business context well enough to ask conditional questions",
    ],
    staticExamples: [
      "Given the shift toward AI-assisted workflows in this space, how is the team currently thinking about where human judgment stays irreplaceable?",
      "If the company hits its Series B target in the next 12 months, how does the scope of this role change?",
      "Assuming the product expands into the enterprise segment as planned, what capabilities would this team need to build that it doesn't have today?",
    ],
  },
  {
    id: "int-6-given-framing",
    levelId: "int-6",
    title: "'Given / Considering' as Setup: Signaling Prior Research",
    pattern: "Given [fact you researched]...  /  Considering [context]...  /  Based on what I read about...",
    professionalUses: [
      "Open questions in a way that proves you did your homework before the interview",
      "Distinguish yourself from candidates who ask generic questions",
      "Show that your curiosity is specific, not formulaic",
    ],
    staticExamples: [
      "Given what I read about the recent platform migration in your engineering blog, I'm curious whether that decision has changed how the team thinks about vendor lock-in.",
      "Considering that you've grown from 50 to 200 engineers in 18 months, what's been the biggest organizational challenge that no one talks about externally?",
      "Based on what I understand about your current market position, is the primary competitive threat coming from the enterprise end or from new entrants below?",
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// SI-0 — Crafting Your Professional Narrative
// Focus: Narrative Arc beats — Anchor, Proof, Direction, Bridge
// CEFR: B1 → B2
// ─────────────────────────────────────────────────────────────

const SI_0: GrammarStructure[] = [
  {
    id: "si-0-anchor",
    levelId: "si-0",
    title: "Present Simple + Infinitive of Purpose: The Anchor Beat",
    pattern: "I [verb] [audience] + to + [outcome]  /  I [role] at [company]",
    professionalUses: [
      "Open your introduction with what you do for others — not your job title",
      "Replace 'I am a [job title]' with a value-first statement that hooks the listener immediately",
      "Make the first sentence answer 'why should I care?' before they even ask",
    ],
    staticExamples: [
      "I help engineering teams ship faster without sacrificing code quality — I lead platform architecture at Rappi.",
      "I work with finance leaders to turn raw data into decisions — I run analytics for the retail division at Bancolombia.",
      "I help startups build legal infrastructure they can actually use — I'm a corporate lawyer specializing in early-stage tech companies.",
    ],
    warningNote:
      "'I am a product manager at X.' vs. 'I help product teams at X reduce time-to-market.' — The first describes a label. The second describes value. Lead with the outcome, anchor with the role.",
  },
  {
    id: "si-0-proof",
    levelId: "si-0",
    title: "Present Perfect: The Proof Beat",
    pattern: "We've / I've + past participle + quantified result",
    professionalUses: [
      "Back up your Anchor with one specific, measurable achievement",
      "Signal that your past experience is still active and relevant — not just history",
      "Make your credibility concrete: numbers, timeframes, or named outcomes beat vague claims every time",
    ],
    staticExamples: [
      "We've cut onboarding time from three weeks to five days for enterprise clients.",
      "I've led two platform migrations that saved the company over $400K in annual infrastructure costs.",
      "Our team has shipped four major product updates this quarter without a single P1 incident.",
    ],
    warningNote:
      "'I did a project that reduced costs.' (Simple Past — closed, forgotten) vs. 'I've led cost reduction initiatives that still drive our margin.' (Present Perfect — ongoing relevance). In a self-introduction, Present Perfect sounds like your track record still matters.",
  },
  {
    id: "si-0-direction",
    levelId: "si-0",
    title: "Future Forms for Direction: The Direction Beat",
    pattern: "I'm focused on...  /  I'm looking to...  /  Right now I'm [verb-ing]...",
    professionalUses: [
      "Signal intentionality — you're moving toward something, not just away from something",
      "Show ambition without making promises: 'I'm looking to' is grounded, 'I will' sounds like a contract",
      "Open a natural door for the other person to connect — direction invites conversation",
    ],
    staticExamples: [
      "Right now I'm focused on moving into a data strategy role at a more product-driven company.",
      "I'm looking to apply what I've built in B2B SaaS to a team that's still designing its foundation.",
      "I'm currently exploring opportunities where I can grow into a regional leadership position within two or three years.",
    ],
    warningNote:
      "Avoid 'I want a new job' or 'I'm leaving because...' — Direction is about where you're going, not what you're escaping. 'I'm looking to...' frames you as purposeful. 'I need to find...' frames you as desperate.",
  },
  {
    id: "si-0-bridge",
    levelId: "si-0",
    title: "Indirect Questions: The Bridge Beat",
    pattern: "What's your [X]?  /  How are you [verb-ing]...?  /  I'd love to hear how...",
    professionalUses: [
      "Close your introduction with a question that puts the spotlight on the other person",
      "Transform a monologue into a two-way conversation — the best introductions end on curiosity, not information",
      "Use indirect questions to sound engaged and professional, not interrogative",
    ],
    staticExamples: [
      "What's your biggest challenge with digital transformation right now?",
      "I'd love to hear how your team is approaching AI integration in the design process.",
      "How are you thinking about scaling the data function as the company grows?",
    ],
    warningNote:
      "'Do you have any questions for me?' sounds like a presenter wrapping up. 'What does your data setup look like today?' sounds like someone genuinely curious. One closes the conversation. The other opens it.",
  },
];

// ─────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────

export const INTERVIEW_GRAMMAR_BANK: Record<string, GrammarStructure[]> = {
  "si-0": SI_0,
  "int-1": INT_1,
  "int-2": INT_2,
  "int-3": INT_3,
  "int-4": INT_4,
  "int-5": INT_5,
  "int-6": INT_6,
};

/** Get the grammar structure to show for a given level and rotation index */
export function getGrammarStructure(
  levelId: string,
  rotationIndex: number
): GrammarStructure | null {
  const bank = INTERVIEW_GRAMMAR_BANK[levelId];
  if (!bank || bank.length === 0) return null;
  return bank[rotationIndex % bank.length];
}

/** Get the next rotation index after showing a structure */
export function nextGrammarIndex(levelId: string, currentIndex: number): number {
  const bank = INTERVIEW_GRAMMAR_BANK[levelId];
  if (!bank || bank.length === 0) return 0;
  return (currentIndex + 1) % bank.length;
}
