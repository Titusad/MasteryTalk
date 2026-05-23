import { SELF_INTRO_CONTEXTS } from "@/shared/lib/self-intro-contexts";
import type { ProgressionLevel } from "./path-types";

/* ── Self-Introduction — universal warm-up level ── */
const SI_UNIVERSAL_LEVEL: ProgressionLevel = {
  id: "si-0",
  level: 0,
  title: "Professional Intro",
  scenario: "Professional self-introduction in a neutral context — not a job interview, not a team onboarding, not a client meeting. The user must deliver a clear, value-led introduction using the Three-Move structure: Anchor (who they are and what value they create), Relevance Bridge (one specific, quantified proof point relevant to any professional), and Invitation (a question that ends on the other person). Evaluate whether Move 1 is value-led (not title-led), Move 2 is specific and quantified, and Move 3 ends on the listener.",
  interlocutor: "interlocutor",
  unlockRequirement: "Always open",
  introHeadline: "introduce yourself using a structure that adapts to any situation",
  introValue: "Most professionals memorize one introduction and use it everywhere. It works in some rooms and fails in others. This session teaches you the 3-move skeleton behind every great professional introduction — so the next three sessions can teach you how to adapt it to any context.",
  methodology: {
    name: "The Three-Move Introduction",
    tagline: "Same structure. Different room. One principle.",
    explanation: `Most professionals think about introductions as a script to memorize. The problem: a script optimized for a networking event sounds robotic in a client meeting. One optimized for a new team falls flat at a conference.\n\nThe Three-Move Introduction gives you a skeleton that works anywhere — because only one of the three moves changes.\n\n**Move 1 — Anchor.** Who you are + what value you create. This never changes. It's your professional identity in one sentence — not your title, but the outcome you produce. Write this once, refine it until it's sharp, then stop changing it.\n\n**Move 2 — Relevance Bridge.** Why that matters to *this person, in this context.* This is the only move that adapts. In a networking event, you make it **intriguing** — you open with a problem they recognize. In a new team, you make it **human** — you show curiosity and something personal. In a client meeting, you make it **expert** — you mirror their problem before mentioning yourself. Same principle, three executions. The next three sessions will train each one.\n\n**Move 3 — Invitation.** End on them, not on you. A question, a bridge, a signal that you're interested in their world. Always. This is what transforms a monologue into a conversation — and a conversation into a relationship.`,
    anchorPhrases: [
      "I help [audience] [achieve outcome] — I [role] at [company].",
      "We recently [specific, quantified result] for [team / client / metric].",
      "What's your [relevant challenge] right now?",
    ],
    coachTip: "The Anchor is fixed — write it once, get it sharp, use it everywhere. The Relevance Bridge is what you'll practice for the next three sessions. The Invitation is non-negotiable: every introduction ends on the other person, no exceptions.",
  },
  vocabularyBank: [
    { term: "narrative",      ipa: "/ˈnær.ə.tɪv/",       definition: "a structured account of connected events or ideas",              example: "Her career narrative made the transition feel intentional." },
    { term: "expertise",      ipa: "/ˌek.spɜːˈtiːz/",    definition: "deep skill or knowledge in a specific area",                    example: "He brings 10 years of expertise in supply chain optimization." },
    { term: "specialize",     ipa: "/ˈspeʃ.ə.laɪz/",     definition: "to focus on a particular area of work",                        example: "I specialize in data-driven product decisions." },
    { term: "outcome",        ipa: "/ˈaʊt.kʌm/",          definition: "the result produced by an action or process",                   example: "The outcome of the project exceeded our initial targets." },
    { term: "background",     ipa: "/ˈbæk.ɡraʊnd/",      definition: "professional history and accumulated experience",               example: "Her background in fintech made her an ideal fit." },
    { term: "transition",     ipa: "/trænˈzɪʃ.ən/",      definition: "a deliberate move from one role or phase to another",           example: "He made a successful transition from engineering to product." },
    { term: "focused on",     ipa: "/ˈfoʊkəst ɒn/",      definition: "currently directing effort toward a specific goal",             example: "Right now I'm focused on scaling the LATAM team." },
    { term: "contribute",     ipa: "/kənˈtrɪb.juːt/",    definition: "to add value or effort toward a shared goal",                   example: "I want to contribute to a team working on real user problems." },
  ],
};

/* ── Self-Introduction — warm-up only (si-0) ── */
export const SELF_INTRO_LEVELS: ProgressionLevel[] = [SI_UNIVERSAL_LEVEL];

/* ── Professional Introductions — 6-level path ── */
export const INTRODUCTIONS_LEVELS: ProgressionLevel[] = [
  // L1–L3: existing context scenarios
  ...SELF_INTRO_CONTEXTS.map((ctx, i) => ({
    id: `intro-${i + 1}`,
    level: i + 1,
    title: ctx.label,
    scenario: ctx.scenario,
    interlocutorBehavior: ctx.interlocutorBehavior,
    interlocutor: ctx.interlocutor,
    unlockRequirement: i === 0 ? "Always open" : `Complete Level ${i}`,
    introHeadline: ctx.introHeadline,
    introValue: ctx.description,
    measurableObjective: `Deliver a confident self-introduction for a ${ctx.label.toLowerCase()} in under 90 seconds.`,
    anchorPhrases: ctx.methodology.anchorPhrases,
    methodology: {
      name: ctx.methodology.name,
      tagline: ctx.methodology.tagline,
      explanation: ctx.methodology.explanation,
      pattern: ctx.methodology.pattern,
      anchorPhrases: ctx.methodology.anchorPhrases,
      coachTip: ctx.methodology.coachTip,
    },
    vocabularyBank: [
      { term: "rapport",       ipa: "/ræˈpɔːr/",         definition: "a harmonious, empathetic connection with someone",                example: "She quickly built rapport with the entire panel." },
      { term: "credibility",   ipa: "/ˌkred.ɪˈbɪl.ɪ.ti/", definition: "the quality of being trusted and believed",                      example: "Specific numbers instantly increase your credibility." },
      { term: "concise",       ipa: "/kənˈsaɪs/",         definition: "giving a lot of information clearly in a few words",              example: "A concise introduction respects the other person's time." },
      { term: "relevant",      ipa: "/ˈrel.ə.vənt/",      definition: "directly connected to the matter at hand",                       example: "Make sure every detail you share is relevant to your audience." },
      { term: "impact",        ipa: "/ˈɪm.pækt/",         definition: "a marked effect or influence on a situation",                    example: "Quantify your impact whenever possible." },
      { term: "positioning",   ipa: "/pəˈzɪʃ.ən.ɪŋ/",    definition: "how you frame yourself relative to context and audience",        example: "Your positioning changes depending on who's in the room." },
    ],
  })),
  // L4: Executive Encounter
  {
    id: "intro-4",
    level: 4,
    title: "Executive Encounter",
    scenario: "Spontaneous, unplanned encounter with a C-suite executive — elevator, conference corridor, or end of a meeting. The user must deliver a sharp, memorable introduction in under 45 seconds that communicates who they are, what they drive, and why it matters. No slides, no prep, no second chances.",
    interlocutorBehavior: "A VP or C-level executive — perpetually evaluating, time-constrained, and visibly impatient with anything generic. Responds to specificity, confidence, and brevity. Might ask one sharp follow-up question if impressed. Will politely end the conversation if the introduction rambles or lacks a clear point.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 3",
    introHeadline: "introduce yourself to a C-suite executive in under 45 seconds and make it count",
    introValue: "Most professionals over-explain when they finally get face time with a senior leader. This level trains you to distill your value into a focused, confident brief that opens doors — not closes them.",
    measurableObjective: "Deliver a Power Brief in under 45 seconds: role + driving initiative + executive-relevant impact + one clean close.",
    anchorPhrases: [
      "I'm leading [initiative] — we're at [current state], targeting [goal] by [timeframe].",
      "I know you've been watching [metric/area] — I'd love 15 minutes to walk you through [specific result].",
      "We recently [quantified achievement] for [team/client].",
      "One thing I'd love your take on: [specific, concise question].",
    ],
    methodology: {
      name: "The Power Brief",
      tagline: "Rank + relevance in under 45 seconds.",
      explanation: `Most professionals over-explain when they finally get face time with a senior leader. They list context, background, and caveats — and lose the executive in the first 20 seconds.\n\nThe Power Brief flips this with a **3-part structure** built for time-constrained, high-stakes encounters:\n\n**Part 1 — Who You Are + What You're Driving.** State your role and the initiative you lead in one sentence. Not your title — your momentum. "I'm leading the LATAM expansion" is more powerful than "I'm a Regional Director."\n\n**Part 2 — Their Stake.** Connect your work to something the executive is already watching. Revenue, retention, cost, speed — pick the one that matters to them and make the link explicit. This signals you understand the business, not just your function.\n\n**Part 3 — The Clean Close.** Either close with a specific ask ("I'd love 15 minutes to walk you through the Brazil numbers") or close cleanly with no ask at all. Never end on a vague "we should catch up sometime."`,
      pattern: {
        bad: {
          label: "The Status Report",
          script: "Hi, I'm Marcos, Senior Product Manager in the growth team. I've been here about 2 years. We work on the acquisition funnel mainly. I was actually just presenting some results to the team — we've been running some experiments on the onboarding flow. It's been interesting. I'd love to tell you more about it sometime.",
        },
        good: {
          label: "The Power Brief",
          script: "I'm leading the onboarding redesign — we just cut drop-off in the first session from 43% to 18% for the enterprise segment. I know retention is on your dashboard for Q3. I'd love 20 minutes to show you how we got there and what's next.",
        },
      },
      anchorPhrases: [
        "I'm leading [initiative] — we're at [current state], targeting [goal] by [timeframe].",
        "I know you've been watching [metric/area] — I'd love 15 minutes to walk you through [specific result].",
        "We recently [quantified achievement] for [team/client].",
        "One thing I'd love your take on: [specific, concise question].",
      ],
      coachTip: "Executives make a mental bet within the first 10 seconds on whether continuing the conversation is worth their time. Lead with momentum, not background.",
    },
    vocabularyBank: [
      { term: "initiative",    ipa: "/ɪˈnɪʃ.ə.tɪv/",     definition: "a plan or program driven toward a goal",                        example: "I'm leading the data governance initiative for LATAM." },
      { term: "traction",      ipa: "/ˈtræk.ʃən/",        definition: "early progress and momentum toward a goal",                    example: "We're getting real traction in the mid-market segment." },
      { term: "retention",     ipa: "/rɪˈten.ʃən/",       definition: "keeping users, customers, or employees long-term",             example: "Our retention improved 22% after the onboarding redesign." },
      { term: "drop-off",      ipa: "/ˈdrɒp.ɒf/",         definition: "a reduction in users or activity at a specific point",         example: "We identified a 40% drop-off in the first 3 minutes." },
      { term: "bandwidth",     ipa: "/ˈbænd.wɪdθ/",       definition: "available capacity or time to take on work",                   example: "I know you have limited bandwidth — this is a 15-minute ask." },
      { term: "alignment",     ipa: "/əˈlaɪn.mənt/",      definition: "shared understanding and agreement on goals or priorities",    example: "I want to make sure we're in alignment before we scale." },
    ],
  },
  // L5: Panel Introduction
  {
    id: "intro-5",
    level: 5,
    title: "Panel Introduction",
    scenario: "Introducing yourself at the opening of a panel interview or multi-stakeholder meeting. Three to four evaluators are present with different priorities: at least one technical, one commercial, and one assessing cultural fit. The user must craft a single narrative that resonates with all of them simultaneously.",
    interlocutorBehavior: "Represents the most senior panelist — a hiring director or division lead. Listens critically, occasionally nods, asks one probing follow-up after the introduction. The challenge: the user cannot know in advance which angle the follow-up will target. A strong introduction makes any follow-up easy to land.",
    interlocutor: "hiring_manager",
    unlockRequirement: "Complete Level 4",
    introHeadline: "introduce yourself to a panel of evaluators and land with every person in the room",
    introValue: "A panel is a different beast — you're not pitching to one person, you're playing to an entire room of competing priorities. This level teaches you to construct a narrative that works on multiple levels at once.",
    measurableObjective: "Deliver a Layered Intro that explicitly addresses technical depth, business impact, and collaboration style — without sounding like a checklist.",
    anchorPhrases: [
      "On the technical side — [specific tool/methodology/result].",
      "From a business impact perspective — [metric or outcome].",
      "In terms of how I work — [collaboration style in one sentence].",
      "What excites me most about this role is [specific, researched reason].",
    ],
    methodology: {
      name: "The Layered Intro",
      tagline: "One narrative. Every stakeholder.",
      explanation: `A panel doesn't share priorities. The technical lead wants to know your depth. The business lead wants to see your impact. The HR lead wants to feel your culture fit.\n\nThe instinct is to tailor different versions for each person — but that reads as inconsistent. The Layered Intro solves this with **one narrative designed to satisfy multiple listeners at once**:\n\n**Layer 1 — The Core Narrative.** Your standard professional narrative (role, proof, direction). This anchors everyone in who you are.\n\n**Layer 2 — The Signal Sentence.** One sentence that contains a technical, commercial, AND human element — compressed into a tight, high-information statement. "We rebuilt the recommendation engine — cut latency 60%, grew session length 18%, and the team shipped it in 6 weeks with zero rollbacks." Technical depth ✓. Business impact ✓. Team culture ✓.\n\n**Layer 3 — The Energy Close.** How you close sets the tone for the entire interview. End with genuine enthusiasm about one specific aspect of the role — not generic excitement, but something you clearly researched.`,
      pattern: {
        bad: {
          label: "The Generic Intro",
          script: "Hi everyone, I'm Sofia, Senior Data Scientist. I have 6 years of experience in machine learning and data analysis. I've worked at several companies in fintech and e-commerce. I'm very passionate about data and I think I'd be a great fit for this role because I have a strong technical background and I'm also a good communicator.",
        },
        good: {
          label: "The Layered Intro",
          script: "I'm Sofia — I lead applied ML at Nubank, where I spent the last 3 years building the fraud detection system that now covers 8M cards with a 0.3% false positive rate. Beyond the model work, I partnered closely with risk and product to ship it — we went from prototype to full rollout in 11 months. I'm here because I want to work at a stage where the models I build go directly into the product, and from what I've read, that's exactly how this team operates.",
        },
      },
      anchorPhrases: [
        "On the technical side — [specific tool/methodology/result].",
        "From a business impact perspective — [metric or outcome].",
        "In terms of how I work — [collaboration style in one sentence].",
        "What excites me most about this role is [specific, researched reason].",
      ],
      coachTip: "The panel isn't five separate conversations — it's one audience with multiple dimensions. Find the sentence that satisfies all dimensions at once and build your intro around it.",
    },
    vocabularyBank: [
      { term: "cross-functional", ipa: "/krɒs ˈfʌŋk.ʃən.əl/", definition: "involving multiple teams or departments working together",    example: "I led a cross-functional team spanning engineering, product, and legal." },
      { term: "rollout",          ipa: "/ˈroʊl.aʊt/",         definition: "the process of launching a product or system to users",      example: "The rollout covered 12 markets in under 90 days." },
      { term: "prototype",        ipa: "/ˈproʊ.tə.taɪp/",     definition: "an early model built to test a concept",                    example: "We validated the concept with a prototype before full build." },
      { term: "latency",          ipa: "/ˈleɪ.tən.si/",       definition: "the delay before a transfer of data begins",                example: "We reduced API latency from 800ms to 120ms." },
      { term: "ownership",        ipa: "/ˈoʊ.nər.ʃɪp/",      definition: "full accountability for a result, from decision to delivery", example: "I took full ownership of the migration from start to finish." },
      { term: "scope",            ipa: "/skoʊp/",             definition: "the extent or range of a project or activity",              example: "We kept the scope tight to ship on time." },
    ],
  },
  // L6: The Cold Open
  {
    id: "intro-6",
    level: 6,
    title: "The Cold Open",
    scenario: "Zero preparation time. An unexpected, high-stakes introduction — a surprise encounter with a key decision-maker, an unplanned speaking opportunity, or being called on without warning to introduce yourself in a room of senior professionals. The user must reconstruct their professional narrative under pressure, in under 30 seconds, with no notes and no warm-up.",
    interlocutorBehavior: "A senior professional who didn't expect to meet the user — and signals this through body language. Time-constrained, slightly skeptical. Rewards composure, specificity, and confident eye contact. Penalizes hesitation, filler words, and anything that sounds rehearsed-but-shaky. If the introduction is sharp, may extend the conversation beyond the 30 seconds.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 5",
    introHeadline: "deliver your professional narrative under pressure — no prep, no notes, no second chance",
    introValue: "Every framework you've learned is only worth something if you can access it under pressure. The Cold Open tests whether the Three-Move Introduction is truly internalized — not memorized, but owned.",
    measurableObjective: "Deliver a 20-30 second professional narrative under simulated pressure conditions with zero filler words, clear structure, and confident close.",
    anchorPhrases: [
      "[Name]. I [role] at [company] — we [one-line result].",
      "Right now I'm focused on [direction] — [why it matters in 5 words].",
      "The thing I'd want you to remember is [3-word anchor].",
      "I'd love to follow up — what's the best way to reach you?",
    ],
    methodology: {
      name: "The Mental Blueprint",
      tagline: "When there's no script — there's still a structure.",
      explanation: `You've learned the Narrative Arc. You've practiced the Power Brief. But there's a moment every professional eventually faces: someone important looks at you, unexpectedly, and says "Tell me about yourself." And you have 20 seconds.\n\nThe Mental Blueprint is not a new framework — it's a method for internalizing the ones you already know so deeply that pressure can't disrupt them.\n\n**The 3-Word Anchor.** Before any introduction, ask yourself one question: "What do I want them to remember?" Your answer becomes your anchor — 3 words maximum. Everything else serves that anchor. "Execution under pressure." "Data-driven growth." "Cross-cultural leadership." Build your intro around it, end on it.\n\n**The Under-Pressure Protocol.** When caught off-guard: (1) Take one beat — a breath, a micro-pause. Composure is itself a signal. (2) Lead with your anchor. (3) One proof point, maximum. (4) Close cleanly. Under 30 seconds.\n\n**Why this level is last.** Frameworks are training wheels. The Cold Open confirms you no longer need them — that your professional narrative is part of how you think, not something you recall.`,
      pattern: {
        bad: {
          label: "The Freeze",
          script: "Oh — um, sure. So, I'm... I'm Daniel, I work in, uh, product management. I've been doing that for... about 5 years? I'm currently at a fintech company. We do, uh, payment infrastructure, I think you might know it — anyway, yeah. I mostly work on the mobile side. Sorry, I wasn't expecting— yeah.",
        },
        good: {
          label: "The Mental Blueprint",
          script: "Daniel — I make complex payment infrastructure feel simple for users. I lead mobile product at Kushki; we just moved 2 million users to a new checkout flow with a 99.2% success rate. Right now I'm focused on the merchant side. Glad to be here.",
        },
      },
      anchorPhrases: [
        "[Name]. I [role] at [company] — we [one-line result].",
        "Right now I'm focused on [direction] — [why it matters in 5 words].",
        "The thing I'd want you to remember is [3-word anchor].",
        "I'd love to follow up — what's the best way to reach you?",
      ],
      coachTip: "Composure is information. Taking one deliberate breath before answering signals confidence — not hesitation. The pause gives you 2 seconds and costs you nothing.",
    },
    vocabularyBank: [
      { term: "composure",     ipa: "/kəmˈpoʊ.ʒər/",     definition: "calm self-control under pressure",                              example: "She maintained composure even when the question caught her off guard." },
      { term: "conciseness",   ipa: "/kənˈsaɪs.nəs/",    definition: "the quality of being brief and to the point",                  example: "In a cold open, conciseness signals confidence." },
      { term: "anchor",        ipa: "/ˈæŋ.kər/",          definition: "a central idea that holds everything else in place",           example: "My anchor for this introduction is 'data-driven growth.'" },
      { term: "impromptu",     ipa: "/ɪmˈprɒmp.tjuː/",   definition: "done without preparation or planning",                         example: "An impromptu introduction tests how well you know your own narrative." },
      { term: "articulate",    ipa: "/ɑːˈtɪk.jə.lɪt/",  definition: "able to express ideas clearly and effectively",                example: "Even under pressure, she was articulate and specific." },
      { term: "deliberate",    ipa: "/dɪˈlɪb.ər.ɪt/",   definition: "done intentionally and with purpose",                          example: "A deliberate pause before answering signals confidence." },
    ],
  },
];
