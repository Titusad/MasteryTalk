/**
 * ══════════════════════════════════════════════════════════════
 *  Scenario Progression Tree — Static Path Definitions
 *  Six goal paths:
 *    - Interview Mastery: 6 levels
 *    - Sales Champion: 6 levels
 *    - Remote Meeting Presence: 6 levels
 *    - Presentations: 6 levels
 *    - Client-Facing Communication: 6 levels
 *    - C-Suite Communication: 6 levels
 * ══════════════════════════════════════════════════════════════
 */

import type { ProgressionState, LevelState, LevelStatus } from "@/services/types";

/* ── Pre-Session Brief Methodology ── */

export type BriefLocale = "en" | "es" | "pt";

/** Translatable fields — scripts & anchorPhrases stay in English always */
export interface TranslatedBriefContent {
  tagline: string;
  explanation: string;
  patternLabels: { bad: string; good: string };
  coachTip: string;
}

export interface LevelMethodology {
  /** Framework name: "STAR Method", "SPIN Selling" */
  name: string;
  /** 1-line hook — why this matters */
  tagline: string;
  /** 2-3 paragraphs teaching the framework (English, supports markdown bold) */
  explanation: string;
  /** Bad vs good example — same scenario, two approaches */
  pattern: {
    bad: { label: string; script: string };
    good: { label: string; script: string };
  };
  /** 2-3 phrases the AI interviewer/buyer expects to hear */
  anchorPhrases: string[];
  /** Closing coaching tip (in Spanish — user's native language) */
  coachTip: string;
  /** i18n — translations for ES/PT. Toggle only shows when translations exist. */
  translations?: Partial<Record<BriefLocale, TranslatedBriefContent>>;
}

/* ── Level Definition ── */

export interface ProgressionLevel {
  id: string;
  level: number;
  title: string;
  scenario: string;
  interlocutorBehavior: string;
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
}

export interface ProgressionPath {
  id: "interview" | "sales" | "meeting" | "presentation" | "client" | "csuite";
  title: string;
  icon: string;
  levels: ProgressionLevel[];
}

/* ── Interview Mastery Path (6 Levels) ── */

const INTERVIEW_LEVELS: ProgressionLevel[] = [
  {
    id: "int-1",
    level: 1,
    title: "Phone Screen",
    scenario: "Initial recruiter phone screen — the candidate must introduce themselves clearly, answer standard screening questions, and demonstrate professional communication under time pressure.",
    interlocutorBehavior: "Friendly but efficient. Asks standard questions, gives little context, expects concise answers. Moves quickly between topics.",
    interlocutor: "recruiter",
    unlockRequirement: "Always open",
    introHeadline: "make a powerful first impression in a 60-second phone screen",
    introValue: "Learn the Elevator Pitch — a 3-beat structure that top candidates use to answer 'Tell me about yourself' with clarity and confidence.",
    measurableObjective: "Complete a structured self-introduction in under 90 seconds and answer at least 3 screening questions without long pauses or excessive fillers (um, uh, like).",
    anchorPhrases: [
      "I've been working in [field] for X years, primarily focused on...",
      "What excites me about this role is specifically...",
      "I'm currently looking for an opportunity where I can...",
      "Could you tell me more about the team structure?",
    ],
    methodology: {
      name: "The Elevator Pitch",
      tagline: "You have 60 seconds to prove you belong in the process.",
      explanation: `The Elevator Pitch is how top candidates answer "Tell me about yourself" — the most common opening question in U.S. phone screens. Structure it in three beats:\n\n**Who you are** — Start with what you do NOW. Your current role, company, and one headline achievement. This anchors the conversation in relevance.\n**What you do** — Bridge to your background in 1-2 sentences. What experience brought you here? Don't recite your resume — highlight the thread that connects to THIS role.\n**Why this role** — End with intention. Why this company? Why this role? This shows you're not just looking for any job — you're targeting THIS opportunity.\n\nThe key is compression. Recruiters screen 15-20 candidates a day. If you can't synthesize your career in 60 seconds, they assume you can't communicate clearly in meetings either.`,
      pattern: {
        bad: {
          label: "How most people answer",
          script: "Well, I studied computer science at university, and then I got my first job at a small company where I learned a lot. Then I moved to another company and worked on different projects. I've been doing development for about 8 years now and I'm looking for new opportunities because I want to grow more.",
        },
        good: {
          label: "Elevator Pitch in action",
          script: "I'm currently a Senior Backend Engineer at Globant, where I lead a team of five building payment APIs that process $2M in daily transactions. Before this, I spent three years at a fintech startup where I designed the microservices architecture from scratch — that experience taught me how to build scalable systems under real constraints. I'm excited about this role because your team is solving the exact infrastructure challenges I've been focused on, and I'd love to bring that hands-on scaling experience to your platform.",
        },
      },
      anchorPhrases: [
        "I'm currently...",
        "What brought me here was...",
        "I'm excited about this role because...",
      ],
      coachTip: "Key rule: start with the present, not your history. The recruiter cares about what you do TODAY — your past is context, not the main story.",
    },
  },
  {
    id: "int-2",
    level: 2,
    title: "Behavioral Round",
    scenario: "Behavioral interview focused on past experience — the candidate must answer 'Tell me about a time…' questions using structured storytelling, demonstrating self-awareness and impact.",
    interlocutorBehavior: "Probes follow-ups aggressively. Not satisfied with vague answers. Asks 'and what was the result?' and 'what would you do differently?' after every response.",
    interlocutor: "hiring_manager",
    unlockRequirement: "Complete Level 1 study phase",
    introHeadline: "answer behavioral questions with structured, compelling evidence",
    introValue: "Master the STAR Method — the framework that turns 'tell me about a time...' into proof of how you think, decide, and deliver.",
    measurableObjective: "Complete at least 2 full STAR responses with quantifiable results, without the interlocutor having to explicitly ask for the result.",
    anchorPhrases: [
      "To give you some context, at the time we were...",
      "My specific responsibility was to...",
      "The action I took was — and here's why...",
      "As a result, we were able to... which meant that...",
    ],
    methodology: {
      name: "STAR Method",
      tagline: "The interviewer is looking for evidence of how you think, decide, and act under real conditions.",
      explanation: `Behavioral interviews are built on one premise: the best predictor of future behavior is past behavior. When an interviewer asks "tell me about a time when..." they're not looking for a story — they're looking for evidence of how you think, decide, and act under real conditions.\n\nThe most common mistake here is spending too much time on the situation and not enough on the action and result. The interviewer already understands context quickly — what they can't see without your help is your specific reasoning and the concrete outcome of your decisions.\n\nThe core skill of this level is the **STAR Method**: a four-part structure that transforms a vague story into a compelling piece of evidence. **Situation → Task → Action → Result.** The ratio that works: 10% Situation, 10% Task, 60% Action, 20% Result.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "Yeah so there was this project at my last job where things got kind of complicated with the team, and we had some issues with deadlines and people weren't really communicating well, and I tried to help with that and eventually things got better and we delivered the project, I think it was like a month late but we got it done...",
        },
        good: {
          label: "What it sounds like when it works",
          script: "We were 3 weeks from launch and two engineers had conflicting approaches to the architecture — it was blocking the whole team. My task was to facilitate a decision without having direct authority over either of them. I set up a structured session where each person presented their approach with tradeoffs, then I proposed a hybrid solution and got buy-in from both. We launched on time, and that decision reduced our infrastructure costs by 18%.",
        },
      },
      anchorPhrases: [
        "Situation in 1-2 sentences → My specific task or responsibility...",
        "The exact actions I took and why...",
        "The concrete result, ideally with a number.",
      ],
      coachTip: "Before answering any behavioral question, run this mental check: 'Situation in 1-2 sentences → My specific task → The exact actions I took and why → The concrete result, ideally with a number.' If your answer doesn't have a number at the end, pause and find it before finishing.",
    },
  },
  {
    id: "int-3",
    level: 3,
    title: "Storytelling & STAR Deep Dive",
    scenario: "Advanced behavioral round focused on complex, multi-stakeholder situations — the candidate must demonstrate leadership, conflict resolution, and strategic thinking through storytelling under pressure.",
    interlocutorBehavior: "Challenges the candidate's decisions. Asks 'why did you choose that approach over alternatives?' and 'how did you handle pushback from stakeholders?' Expects depth, not just structure.",
    interlocutor: "hiring_manager",
    unlockRequirement: "Complete Level 2 study phase",
    introHeadline: "tell stories that make the interviewer lean forward",
    introValue: "Go beyond basic STAR with the 'So What' layer — connect your results to business impact and personal growth that signals leadership.",
    measurableObjective: "Complete an extended STAR response that includes business impact and personal learning, without sounding rehearsed or mechanical.",
    anchorPhrases: [
      "What made this situation particularly complex was...",
      "I considered two approaches — I chose this one because...",
      "The broader impact on the business was...",
      "Looking back, what I'd do differently is...",
    ],
    methodology: {
      name: "Elevated STAR",
      tagline: "What separates a competent STAR answer from one that makes the interviewer lean forward.",
      explanation: `You already know the STAR method. This level is about what separates a competent STAR answer from one that makes the interviewer lean forward. The difference is the **"So What" layer** — the moment where you connect your result to a broader business impact and a personal learning.\n\nSenior interviewers — the ones deciding on leadership roles — are not just looking for evidence of past competence. They're looking for **self-awareness, strategic thinking, and the ability to learn from experience.** A candidate who delivered a great result but can't articulate why it mattered or what they'd do differently is a competent executor, not a future leader.\n\nThe core skill of this level is **Elevated STAR**: adding two layers after the Result. **Business Impact** — what did this mean for the organization beyond your immediate team? **Personal Learning** — what did this experience change about how you work or think?`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "So the result was that we launched on time and the client was happy. That's basically it. I mean, it was a good project overall and I think everyone learned a lot from it.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "We launched on time and reduced infrastructure costs by 18%. Beyond the numbers, that decision became the architectural standard for two subsequent products — which meant the team didn't have to re-solve the same problem twice. Personally, it was the moment I realized that the most valuable thing I can do in a conflict isn't to have the right answer — it's to create the conditions where the right answer can emerge from the people closest to the problem.",
        },
      },
      anchorPhrases: [
        "What did this result make possible for the organization?",
        "What do I know now that I didn't know before this experience?",
        "How has it changed how I work?",
      ],
      coachTip: "After every STAR answer, ask yourself two questions before finishing: 'What did this result make possible for the organization that wouldn't have happened otherwise?' and 'What do I know now that I didn't know before — and how did it change the way I work?' If you can't answer them, the story isn't ready.",
    },
  },
  {
    id: "int-4",
    level: 4,
    title: "Technical Discussion",
    scenario: "Technical deep-dive interview — the candidate must explain complex technical concepts clearly to a subject matter expert, defend architectural decisions, and demonstrate problem-solving thinking out loud.",
    interlocutorBehavior: "Challenges vagueness immediately. Asks 'can you be more specific?' and 'what are the tradeoffs of that approach?' Respects depth and intellectual honesty over false confidence.",
    interlocutor: "sme",
    unlockRequirement: "Complete Level 3 study phase",
    introHeadline: "explain complex technical concepts clearly and defend your decisions",
    introValue: "Practice Thinking Out Loud — show the interviewer how you reason, not just what you know. Intellectual honesty beats false confidence.",
    measurableObjective: "Explain at least one complex technical concept without undefined jargon, defend a decision with explicit tradeoffs, and professionally admit a knowledge gap.",
    anchorPhrases: [
      "Let me think through this out loud...",
      "The tradeoff I see here is... and I'd prioritize X because...",
      "I'm not 100% certain on the specifics, but my understanding is...",
      "A simpler way to explain this would be...",
    ],
    methodology: {
      name: "Thinking Out Loud",
      tagline: "A technical discussion is not a test with right answers — it's a window into how you think.",
      explanation: `A technical discussion is not a test with right answers — it's a window into how you think. The interviewer is less interested in whether you arrive at the correct solution and more interested in whether you can **reason clearly, acknowledge uncertainty honestly, and communicate complex ideas** to someone who may think differently than you.\n\nThe trap most candidates fall into is performing certainty they don't have. They give a confident answer to hide a gap in knowledge — and experienced interviewers detect it immediately. The counterintuitive truth is that intellectual honesty — "I'm not certain about this, but here's my reasoning" — consistently outperforms false confidence.\n\nThe core skill of this level is **Thinking Out Loud**: narrating your reasoning process in real time so the interviewer can follow your logic, intervene with hints, and evaluate your problem-solving approach — not just your final answer.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "Yeah, so for that system I would use a microservices architecture because it's more scalable and modern and most companies use it now. You'd have separate services for each function and they'd communicate via APIs.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "Let me think through this out loud. My first instinct is microservices because of the scalability requirements you mentioned — but I want to stress-test that. The tradeoff is operational complexity: you'd need robust service discovery, distributed tracing, and a team experienced in managing that overhead. If the team is small or early-stage, a well-structured monolith might actually serve better until the scale justifies the complexity. I'd want to know more about team size and current infrastructure before committing to either direction.",
        },
      },
      anchorPhrases: [
        "Let me think through this out loud...",
        "First instinct → Why → The tradeoff I see → What I'd want to know more about",
        "I'm not certain, but here's my reasoning...",
      ],
      coachTip: "Every time you answer a technical question, start with: 'Let me think through this out loud...' Then follow this sequence: First intuition → Why → The tradeoff I see → What I'd need to know before deciding. That sequence is your anchor for every technical answer.",
    },
  },
  {
    id: "int-5",
    level: 5,
    title: "Salary Negotiation",
    scenario: "Compensation negotiation with HR — the candidate receives an initial offer and must negotiate base salary, benefits, and start date professionally without damaging the relationship or appearing aggressive.",
    interlocutorBehavior: "Presents a firm offer with practiced language. Pushes back on requests, uses anchoring tactics, and tests the candidate's conviction. Responds well to data and badly to emotional appeals.",
    interlocutor: "hr",
    unlockRequirement: "Complete Level 4 study phase",
    introHeadline: "negotiate your compensation with data and conviction",
    introValue: "Learn BATNA & Anchoring — the skills that let you advocate for your value without damaging the relationship or leaving money on the table.",
    measurableObjective: "Counter-offer at least once with a specific figure and market-based justification, without backing down at the first pushback from the interlocutor.",
    anchorPhrases: [
      "I'm very excited about this opportunity. Based on my research and experience, I was expecting something closer to...",
      "Is there flexibility on the base, or would it be easier to discuss other components of the package?",
      "I want to make this work — what would it take from your side?",
      "I'd like to take 24 hours to review the full offer if that's okay.",
    ],
    methodology: {
      name: "BATNA & Anchoring",
      tagline: "Salary negotiation is the professional skill most people never practice — and it shows.",
      explanation: `Salary negotiation is the professional skill most people never practice — and it shows. Most candidates either accept the first offer out of fear of seeming greedy, or make a counteroffer without a foundation, which is easy to dismiss. Both approaches leave money on the table.\n\nThe fundamental shift this level requires is reframing negotiation from a confrontation into a **collaborative problem-solving conversation.** You and the company want the same thing: to reach an agreement that works for both sides. Your job is not to win — it's to advocate for your value clearly, calmly, and with data.\n\nThe core skills of this level are **BATNA** (Best Alternative to a Negotiated Agreement) — knowing your walk-away point before the conversation starts — and **Anchoring** — making the first specific number in the conversation, with justification, rather than waiting to react to theirs.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "Oh, um, thank you so much for the offer. I was kind of hoping for a bit more if that's possible, maybe like... I don't know, whatever works for you really. I just want to make sure it's fair for both sides.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I'm genuinely excited about this opportunity — I want to make it work. Based on my research into market rates for this role in this industry, and considering my experience leading teams of this size, I was expecting something closer to $95,000. Is there flexibility to get there, or would it be easier to discuss other components of the package?",
        },
      },
      anchorPhrases: [
        "My target: [number]. My anchor: [slightly above]. My walk-away: [minimum].",
        "Based on my research and experience, I was expecting something closer to...",
        "Is there flexibility to get there, or would it be easier to discuss other components?",
      ],
      coachTip: "Before the session, decide three numbers: Your target (what you actually want). Your anchor (slightly above — what you'll say first). Your walk-away (the minimum you'd accept). Never mention your walk-away. Enter the session knowing all three.",
    },
  },
  {
    id: "int-6",
    level: 6,
    title: "Executive Presence Close",
    scenario: "Final interview closing — the candidate must ask high-quality strategic questions to the interviewer, demonstrate genuine curiosity about the business, and close the conversation leaving a strong, memorable final impression.",
    interlocutorBehavior: "Evaluates the quality of questions as a signal of strategic thinking and cultural fit. Responds enthusiastically to sharp questions and gives short, polite answers to generic ones. Notices when a candidate is just going through the motions.",
    interlocutor: "hiring_manager",
    unlockRequirement: "Complete Level 5 study phase",
    introHeadline: "close a final interview with executive presence and strategic questions",
    introValue: "Master the Reverse Interview — turn the Q&A into your best opportunity to show strategic thinking and leave a lasting impression.",
    measurableObjective: "Ask at least 3 strategic questions that generate a substantive response from the interlocutor, and close the conversation with a specific, memorable statement of interest — not generic.",
    anchorPhrases: [
      "What does success look like in this role at 90 days?",
      "What's the biggest challenge the team is facing right now that I'd be walking into?",
      "How does this team typically make decisions when there's disagreement?",
      "I want to be straightforward — this is my top choice and here's why specifically...",
    ],
    methodology: {
      name: "The Reverse Interview",
      tagline: "Most candidates treat the final Q&A as a formality — the candidates who get offers treat it as their best opportunity.",
      explanation: `Most candidates treat the final Q&A as a formality — a polite exchange before the interview ends. The candidates who get offers treat it as their last and best opportunity to demonstrate how they think at a strategic level.\n\nThe questions you ask at the end of an interview are a signal. Generic questions ("what does a typical day look like?") signal that you haven't thought deeply about the role. Sharp, specific questions signal that you've done your research, understand the business challenges, and are already thinking like someone who works there.\n\nThe core skill of this level is **The Reverse Interview**: transforming the Q&A from a passive information-gathering exercise into an active demonstration of executive curiosity and strategic thinking. The best closing questions don't just gather information — they leave the interviewer thinking about you differently.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "Yeah, so I was just wondering... what does the team culture look like? And also, what are the growth opportunities? Oh and also, what's a typical day like in this role?",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I've been thinking about the shift toward [specific industry trend] and I'm curious — how is the team currently positioned to respond to that? And separately: what's the biggest thing the person in this role could do in the first 90 days that would make you say 'that was the right hire'?",
        },
      },
      anchorPhrases: [
        "One question about the business challenge.",
        "One question about what success looks like.",
        "I want to be straightforward — this role is my top choice because [specific reason].",
      ],
      coachTip: "Prepare exactly three questions — but hold them flexibly: one about the business challenge, one about what success looks like, one about team dynamics. And prepare your closing statement: 'I want to be direct — this role is my first choice because [specific reason connected to something said in the interview].' Generic closes are forgotten. Specific closes generate callbacks.",
    },
  },
];

/* ── Sales Champion Path (6 Levels) ── */

const SALES_LEVELS: ProgressionLevel[] = [
  {
    id: "sal-1",
    level: 1,
    title: "Discovery Call",
    introHeadline: "uncover real pain points without sounding like a script",
    introValue: "Learn Problem-First Discovery — a question sequence that makes the client tell you exactly why they need your solution.",
    scenario: "First call with a potential client — the candidate must open the conversation professionally, establish credibility quickly, and ask smart discovery questions to uncover pain points without sounding like they're reading from a script.",
    interlocutorBehavior: "Busy, skeptical, gives short answers. Has been through many sales calls before. Responds well to relevance and badly to generic pitches. Will end the call early if not engaged.",
    interlocutor: "gatekeeper",
    unlockRequirement: "Always open",
    measurableObjective: "Ask at least 4 discovery questions in logical sequence without mentioning the product in the first 3 minutes, and get the interlocutor to describe a specific pain point voluntarily.",
    anchorPhrases: [
      "I don't want to assume — can you walk me through how you currently handle...?",
      "What's the biggest friction point in that process right now?",
      "When that happens, what's the downstream impact on the team?",
      "That's exactly what we hear from companies at your stage — tell me more.",
    ],
    methodology: {
      name: "Problem-First Discovery",
      tagline: "The discovery call is the most important conversation in the entire sales cycle — and the most misunderstood.",
      explanation: `The discovery call is the most important conversation in the entire sales cycle — and the most misunderstood. Most people treat it as an opportunity to present their product. The best salespeople treat it as an opportunity to understand a world they don't yet know.\n\nThe fundamental rule: you cannot solve a problem you haven't fully understood. And you cannot understand a problem by talking about yourself. The discovery call is 70% listening, 30% talking — and the 30% should be almost entirely questions.\n\nThe core skill of this level is **Problem-First Discovery**: a sequence of questions that moves from broad context to specific pain to business impact to emotional cost. By the end of a great discovery call, the client has told you exactly why they need your solution — you haven't had to say it yourself.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "Hi, thanks for taking the time. So let me tell you a bit about what we do — we have a platform that helps companies like yours with their workflow automation, and we've worked with over 200 companies in your space, and our clients typically see about 30% efficiency gains, and I think what makes us different is our AI-powered dashboard which gives you real-time insights...",
        },
        good: {
          label: "What it sounds like when it works",
          script: "Before I say anything about what we do, I want to make sure I understand your situation. Can you walk me through how your team currently handles [process]? I'm specifically curious about where things tend to break down.",
        },
      },
      anchorPhrases: [
        "Context: 'How do you currently handle [X]?'",
        "Pain: 'Where does that tend to break down?'",
        "Impact: 'When that happens, what's the downstream effect?'",
        "Only after all four do you earn the right to talk about your solution.",
      ],
      coachTip: "Follow this sequence and resist jumping ahead: Context → Pain → Impact → Emotional cost. Only after all four questions have you earned the right to talk about your solution. If you're talking more than 30% of the time, you're selling — not discovering.",
    },
  },
  {
    id: "sal-2",
    level: 2,
    title: "Product Demo",
    introHeadline: "deliver demos that feel like proof, not product tours",
    introValue: "Master Feature → Benefit → Impact — connect every feature to a business outcome using the client's own words.",
    scenario: "B2B SaaS product demo with a technical evaluator — the candidate must connect product features directly to the pain points discovered, handle technical questions confidently, and keep the narrative focused on value, not functionality.",
    interlocutorBehavior: "Evaluates everything through a technical lens. Asks 'how does it integrate with X?', 'what's the architecture?', 'can it scale to Y?' Responds well to specificity and badly to vague claims like 'it's very powerful.'",
    interlocutor: "technical_buyer",
    unlockRequirement: "Complete Level 1 study phase",
    measurableObjective: "Present at least 3 features using the Feature → Benefit → Impact framework without the interlocutor having to ask 'so what does that mean for us?'",
    anchorPhrases: [
      "Based on what you shared earlier about [pain point], let me show you specifically how...",
      "What this means for your team is...",
      "The reason this matters at your scale is...",
      "How does this compare to what you're doing today?",
    ],
    methodology: {
      name: "Feature → Benefit → Impact",
      tagline: "A product demo is not a tour — it's a proof.",
      explanation: `A product demo is not a tour — it's a proof. The difference is critical. A tour shows everything the product can do. A proof shows exactly how the product solves this specific client's specific problem. Demos that feel like tours lose deals. Demos that feel like proofs win them.\n\nThe mistake most people make is preparing the same demo for every client. They show the same features in the same order regardless of what they learned in discovery. The client feels like a number, not a priority — because they are.\n\nThe core skill of this level is **Feature → Benefit → Impact**: a three-part structure that ensures every feature you show is immediately connected to a business outcome. You never show a feature and let the client figure out why it matters. You tell them — specifically, in their language, using the pain points they shared with you.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "So here's our dashboard — you can see all your data in one place. And over here we have the automation module, which lets you set up workflows. And this is the reporting section where you can generate reports. Pretty powerful, right? We also have integrations with over 200 tools.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "You mentioned that your team spends about 4 hours a week manually compiling status reports. Let me show you specifically how that goes away. This automation runs every Friday at 4pm, pulls data from the three sources your team uses, and delivers a formatted report to whoever you choose — no manual work. What used to take 4 hours now takes zero.",
        },
      },
      anchorPhrases: [
        "You mentioned [specific pain from discovery] — let me show you specifically how [feature] solves that.",
        "What this means for your team is [concrete outcome].",
        "Does that address what you described?",
      ],
      coachTip: "Before showing any feature, complete this sentence in your head: 'The client mentioned [specific pain] — I'm going to show them specifically how [feature] solves it. What this means for their team is [concrete result].' If you can't complete it, don't show it.",
    },
  },
  {
    id: "sal-3",
    level: 3,
    title: "Stakeholder Alignment",
    introHeadline: "turn your champion into an internal co-seller",
    introValue: "Practice Enabling Your Champion — give them the narrative, data, and objection responses they need to sell on your behalf.",
    scenario: "Internal champion meeting — the candidate must help their internal advocate build the business case to present to decision makers, anticipate executive objections, and arm the champion with the right language and data to sell internally.",
    interlocutorBehavior: "Enthusiastic about the product but nervous about internal pushback. Asks 'how do I justify the cost to my CFO?', 'what if they ask about implementation risk?', 'can you help me with the numbers?' Needs confidence, not more features.",
    interlocutor: "champion",
    unlockRequirement: "Complete Level 2 study phase",
    measurableObjective: "Build a verbal business case with the champion that includes estimated ROI, responses to at least 2 anticipated executive objections, and a concrete next step with a date.",
    anchorPhrases: [
      "When your CFO asks about ROI, here's how I'd frame it...",
      "The risk of not acting is actually higher because...",
      "Let me give you the language that tends to resonate with executives...",
      "What would make this a no-brainer for your leadership team?",
    ],
    methodology: {
      name: "Enabling Your Champion",
      tagline: "The person who loves your product is rarely the person who approves the budget.",
      explanation: `In B2B sales, the person who loves your product is rarely the person who approves the budget. Your champion — the internal advocate who believes in what you're selling — has to walk into a room full of skeptics and sell on your behalf. If you haven't equipped them to do that, you've lost the deal before the final meeting even happens.\n\nMost salespeople stop at convincing the champion. The best salespeople go one step further: they turn the champion into a co-seller. They give them the narrative, the data, the answers to objections they haven't heard yet, and the language that resonates with executives — not with end users.\n\nThe core skill of this level is **Enabling Your Champion**: shifting your role from salesperson to strategist. You're not selling to the champion anymore — you're selling through them. That requires understanding their internal audience as well as they do.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "I think you just need to tell them about all the features we went through and how much your team liked the demo. And maybe show them the pricing again. I think once they see the ROI they'll get it.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "When your CFO asks about ROI, here's exactly how I'd frame it: we're looking at $180K in recovered productivity over 12 months against a $40K investment. That's a 4.5x return in year one. And if they push back on the timeline, the response is: the first value milestone is at 60 days, not 12 months. Would it help if I put that in a one-pager you can share before the meeting?",
        },
      },
      anchorPhrases: [
        "Does the champion know the ROI number and how to explain it?",
        "Do they have answers to the top 3 executive objections?",
        "Do they have something physical to share in the internal meeting?",
      ],
      coachTip: "Before the conversation ends, run this mental checklist: Does the champion know the ROI number and how to explain it? Do they have answers for the 3 most likely executive objections? Do they have a clear narrative: problem → solution → return? Do they have something physical to share in the internal meeting?",
    },
  },
  {
    id: "sal-4",
    level: 4,
    title: "Objection Handling",
    introHeadline: "handle tough objections without flinching or discounting",
    introValue: "Learn the ARC Method — Acknowledge, Reframe, Confirm. The framework that turns pushback into progress.",
    scenario: "Mid-deal objection crisis — the candidate faces serious pushback on price, timing, and competitive alternatives simultaneously. Must handle each objection without becoming defensive, without discounting immediately, and without losing momentum.",
    interlocutorBehavior: "Now under pressure from above. Delivers objections on behalf of leadership. Pushes hard on price, mentions a competitor by name, and signals the deal might stall. Tests whether the candidate panics or holds their ground.",
    interlocutor: "champion",
    unlockRequirement: "Complete Level 3 study phase",
    measurableObjective: "Handle at least 3 distinct objections using ARC without spontaneously offering a discount, and get the interlocutor to confirm that at least 2 objections are resolved.",
    anchorPhrases: [
      "That's a fair concern — let me give you a different way to look at it...",
      "I hear you on the price. The question I'd ask is: what's the cost of the current situation?",
      "Compared to [competitor], the key difference that matters for your use case is...",
      "Does that address the concern, or is there another layer to it?",
    ],
    methodology: {
      name: "The ARC Method",
      tagline: "An objection is not a rejection — it's a question in disguise.",
      explanation: `An objection is not a rejection — it's a question in disguise. When a client says "it's too expensive," they're really asking "can you help me understand why this is worth it?" When they say "the timing isn't right," they're asking "why should this be a priority now?" The salesperson who hears a rejection and backs down loses. The one who hears a question and answers it wins.\n\nThe worst response to an objection is to fight it directly. Fighting creates defensiveness, and a defensive client doesn't buy. The second worst response is to immediately discount or concede — it signals that your original price wasn't real, which destroys credibility.\n\nThe core skill of this level is the **ARC Method**: Acknowledge → Reframe → Confirm. You validate the concern without agreeing with it, you introduce new information or perspective that changes how the objection looks, and you confirm whether the reframe resolved it before moving on. Every step matters — skip one and the method breaks.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "I understand the price is a concern. We could probably look at a discount if that would help. Or maybe we could do a smaller package to start? I really want to make this work for you.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "That's a fair concern — and I want to address it directly. The question isn't whether $40K is a lot of money. It is. The question is whether it's a lot of money compared to the $180K problem it solves. Based on what you shared about manual processing costs, the math actually makes the status quo more expensive than the investment. Does that reframe it, or is there something else driving the concern?",
        },
      },
      anchorPhrases: [
        "Acknowledge: 'That's a fair concern...'",
        "Reframe: 'The way I'd look at it is...'",
        "Confirm: 'Does that address it, or is there something else behind it?'",
      ],
      coachTip: "Every time you hear an objection, pause and execute ARC before responding: Acknowledge → Reframe → Confirm. Never offer a concession before completing all three steps. If you jump straight to defending or discounting, you've lost.",
    },
  },
  {
    id: "sal-5",
    level: 5,
    title: "Close the Deal",
    introHeadline: "close deals with confidence and smart concession strategy",
    introValue: "Practice the Assumptive Close & Concession Sequencing — know what to give, in what order, and always get something in return.",
    scenario: "Final negotiation to close a six-figure B2B deal — the candidate must navigate last-minute demands on price and contract terms, create urgency without pressure tactics, and bring the deal to a verbal commitment without leaving value on the table.",
    interlocutorBehavior: "Plays hardball. Tests conviction with silence and vague non-commitments. Makes last-minute requests ('can you do 20% off if we sign today?'). Responds to confidence and loses respect for desperation.",
    interlocutor: "decision_maker",
    unlockRequirement: "Complete Level 4 study phase",
    measurableObjective: "Reach a verbal commitment without offering more than one spontaneous concession, get something in return for every concession given, and close with a specific next step — signing date, PO, or kickoff.",
    anchorPhrases: [
      "Let's talk about what it would take to get this done by end of month.",
      "I can look at that, but I'd need something from your side in return — specifically...",
      "I want to be direct — I think this is the right decision for your team. Here's why now matters...",
      "So if we can align on X, are we ready to move forward?",
    ],
    methodology: {
      name: "The Assumptive Close & Concession Sequencing",
      tagline: "The close is not a moment — it's a destination you've been building toward since the first discovery call.",
      explanation: `The close is not a moment — it's a destination you've been building toward since the first discovery call. If you've done everything right, the close should feel like the natural conclusion of a conversation, not a high-pressure maneuver. But even in the best deals, the final conversation requires a specific set of skills that most people never develop because they're afraid of what happens if the client says no.\n\nThe two most common mistakes at this stage: closing too softly ("let me know if you want to move forward") which puts all the momentum on the client and loses urgency — and closing too aggressively ("I need an answer today") which creates pressure and damages the relationship.\n\nThe core skills of this level are the **Assumptive Close** — framing the conversation as "how do we make this happen" rather than "do you want this" — and **Concession Sequencing** — knowing which concessions to offer, in what order, and always getting something in return. Every concession that costs nothing to the client is worthless as a negotiating tool.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "So... yeah, let me know what you think and whenever you're ready to move forward just send me an email. No rush, take all the time you need. And if you need any more information just let me know and I can send that over.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "Let's talk about what it would take to get this done by end of month. I can hold the current pricing until Friday — after that it goes back to standard rates. If we align on the contract terms today, I can have legal review done by Wednesday and we'd be ready to kick off on the first. What's standing between us and that timeline?",
        },
      },
      anchorPhrases: [
        "Concession 1: [low-cost to you, high-value to them]",
        "Concession 2: [mid-value — one month free, small discount]",
        "Each concession costs something in return: faster signature, larger commitment, referral.",
      ],
      coachTip: "Before the session, know your concession sequence: Concession 1 (low cost for you, high value for them — extended payment terms, extra onboarding session) → Concession 2 (medium value — one free month, small discount). Every concession costs something in return. Never give two concessions without receiving one.",
    },
  },
  {
    id: "sal-6",
    level: 6,
    title: "Executive Presence & Account Expansion",
    introHeadline: "present results at the executive level and open expansion conversations",
    introValue: "Master the EBR Framework — lead with accountability, present with data, and let the expansion conversation emerge naturally.",
    scenario: "Post-sale executive business review — the candidate must present results to the client's C-Suite, demonstrate the value delivered, navigate dissatisfaction from one executive, and open the conversation toward contract expansion naturally.",
    interlocutorBehavior: "Now the buyer, evaluating whether the investment paid off. Has one area of dissatisfaction they'll raise. Responds well to data, accountability, and forward-looking thinking. Will signal expansion interest if trust is established.",
    interlocutor: "decision_maker",
    unlockRequirement: "Complete Level 5 study phase",
    measurableObjective: "Present results with specific data, proactively acknowledge the area of dissatisfaction before the interlocutor raises it, and open the expansion conversation receiving at least one positive signal from the decision maker.",
    anchorPhrases: [
      "Before we get into the numbers, I want to address something proactively...",
      "Here's what we delivered, here's where we fell short, and here's what we've done about it.",
      "Based on what's working, the natural next conversation is about...",
      "What would make the next 12 months a clear win for you?",
    ],
    methodology: {
      name: "The EBR Framework",
      tagline: "The hardest sale is not the first one — it's the renewal and expansion.",
      explanation: `The hardest sale is not the first one — it's the renewal and expansion. By the time you're in an Executive Business Review, the client has already seen whether you delivered on your promises. They're not evaluating your pitch anymore — they're evaluating your integrity. And integrity, at the executive level, means one thing above all else: did you tell them the truth, including the parts that were inconvenient?\n\nThe salespeople who lose renewals are the ones who spent the whole year managing perception instead of managing reality. When the executive review comes, the gap between what was promised and what was delivered is too wide to paper over.\n\nThe core skill of this level is the **EBR Framework** — Executive Business Review: Results delivered → Challenges acknowledged proactively → Lessons applied → Vision for next phase. The expansion conversation is not a separate pitch — it emerges naturally when the client trusts that you're an advisor who tells them the truth, not a vendor who tells them what they want to hear.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "So overall it's been a great year. We hit most of our targets and the team has been really happy with the platform. There were a few hiccups along the way but nothing major. We're really excited about what's coming next and we'd love to talk about expanding the partnership.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "Before I get into the results, I want to address something proactively. Q2 implementation took 6 weeks longer than we committed to. That affected your team's productivity in a way I want to acknowledge directly. Here's what we've done differently since then, and here's the data showing the course correction. Now — the outcomes we did deliver: [specific numbers]. And based on what's working, there's a natural conversation about where we go next.",
        },
      },
      anchorPhrases: [
        "1. Acknowledge what didn't go perfectly — before they bring it up.",
        "2. Show what changed as a result.",
        "3. Present results with numbers → Connect to the next opportunity naturally.",
      ],
      coachTip: "Structure your EBR in this exact order — don't rearrange it: 1) Acknowledge what didn't go perfectly — before they mention it. 2) Show what changed as a result. 3) Present the results you did deliver, with numbers. 4) Connect those results to the next opportunity naturally: 'Based on what's working, the conversation I'd like to have is...'",
    },
  },
];

/* ── Remote Meeting Presence Path (6 Levels) ── */

const MEETING_LEVELS: ProgressionLevel[] = [
  {
    id: "meet-1",
    level: 1,
    title: "Standup & Daily Sync",
    introHeadline: "deliver clear, concise updates that respect everyone's time",
    introValue: "Learn the 3-Part Update — Yesterday, Today, Blockers. Say everything that matters in under 45 seconds.",
    scenario: "Daily team standup with a cross-functional remote team — the candidate must give a clear, concise update on their work, flag a blocker professionally, and engage with a teammate's update without overexplaining or going off-topic.",
    interlocutorBehavior: "Keeps the meeting on track, cuts people off politely when they ramble, and expects updates in a predictable format. Asks 'can you be more specific?' when answers are vague.",
    interlocutor: "meeting_facilitator",
    unlockRequirement: "First level — unlocked by default",
    measurableObjective: "The user completes a standup update in under 45 seconds using Yesterday → Today → Blockers, flags one specific blocker with enough context for the team to act, and responds to a teammate's update with a relevant, concise contribution.",
    anchorPhrases: [
      "Yesterday I completed [X], today I'm focused on [Y], and I'm blocked on [Z] because...",
      "I might need 15 minutes with [person] to unblock this — can we sync after the standup?",
      "Quick add to what [name] said — I ran into the same issue on my side. Happy to compare notes.",
    ],
    methodology: {
      name: "The 3-Part Update",
      tagline: "How you show up in a 15-minute standup is how your colleagues experience you every single day.",
      explanation: `The daily standup is the meeting most professionals underestimate — and most damage their reputation in without realizing it. In a remote team, how you show up in a 15-minute standup is how your colleagues experience you every single day. It's where you're seen as someone who is clear, reliable, and aware of the team — or as someone who rambles, loses the thread, and doesn't respect everyone else's time.\n\nThe standup is not a progress report. It's a coordination mechanism. The goal is not to explain everything you did — it's to give the team exactly the information they need to do their work without follow-up questions.\n\nThe core skill of this level is the **3-Part Update**: Yesterday → Today → Blockers. Three components, in that order, in under 45 seconds. Everything outside of those three things belongs in a separate conversation.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "Yeah so yesterday I was working on the project and I had a bunch of meetings and then I tried to finish the document but I couldn't really get to it because of the meetings and some other stuff came up, and today I'm going to try to finish it if I can, and I don't think I have any blockers but there might be something with the API but I'm not sure yet...",
        },
        good: {
          label: "What it sounds like when it works",
          script: "Yesterday I completed the first draft of the API documentation — it's in the shared folder. Today I'm focused on the integration test for the payment module. I have one blocker: I need access to the staging environment credentials. Sarah, are you the right person for that or should I go to DevOps?",
        },
      },
      anchorPhrases: [
        "Yesterday I [specific completed task — one sentence].",
        "Today I'm focused on [specific next task — one sentence].",
        "I [have / don't have] a blocker: [what it is, who can help, what you've already tried].",
      ],
      coachTip: "Before speaking, run this three-part structure in your head: Yesterday I completed [specific task]. Today I'm focused on [next specific task]. I have / don't have a blocker: [what it is, who can help]. Make it fit in 30 seconds.",
    },
  },
  {
    id: "meet-2",
    level: 2,
    title: "Taking the Floor",
    introHeadline: "speak up confidently in meetings without waiting to be invited",
    introValue: "Practice Bridge & Signal — a technique that creates space for your voice without interrupting or losing relevance.",
    scenario: "Mid-meeting group discussion where the candidate must interject professionally to share a relevant insight or question. The facilitator opens the floor with 'Anyone have something to add?' and the candidate must take the opportunity confidently — not wait to be called on.",
    interlocutorBehavior: "Runs the meeting briskly, occasionally invites input, but doesn't wait long for volunteers. If the user speaks up, the facilitator engages. If the user stays silent, the facilitator moves on.",
    interlocutor: "meeting_facilitator",
    unlockRequirement: "Complete Level 1",
    measurableObjective: "The user voluntarily takes the floor at least once without being directly called on, presents a point in under 60 seconds with clear structure, and connects it to what was previously discussed.",
    anchorPhrases: [
      "I'd like to add something to what [name] mentioned...",
      "Before we move on — I think there's a dependency here we should flag...",
      "Can I share a quick data point that's relevant to this?",
    ],
    methodology: {
      name: "Bridge & Signal",
      tagline: "In remote meetings, silence is invisible — the professional who doesn't take the floor effectively doesn't exist.",
      explanation: `In remote meetings, silence is invisible. When you don't speak, no one notices you're there — unlike in-person meetings where your physical presence communicates engagement even without words. This means the professional who doesn't actively take the floor in remote meetings effectively doesn't exist in those meetings. Over time, that invisibility has real career consequences.\n\nBut taking the floor poorly is worse than not taking it at all. Interrupting abruptly, talking over people, or jumping in with a half-formed thought creates friction and makes others less likely to create space for you next time.\n\nThe core skill of this level is the **Bridge & Signal** technique: you signal your intent to speak before you speak, which creates a natural pause without requiring you to interrupt. Then you bridge your point to what was just said, so your contribution feels additive rather than disruptive.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "Sorry, can I— sorry, I just wanted to— yeah, sorry for interrupting but I think— actually never mind, I'll wait.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I want to build on that point for a second — before we move on. The risk you're describing connects to something we saw in Q3. If we implement this without addressing the dependency first, we're likely to hit the same bottleneck. I'd suggest we add a checkpoint at week two specifically for that.",
        },
      },
      anchorPhrases: [
        "Signal: 'I want to [add to / build on / push back on] that for a second...'",
        "Bridge: 'What [name] said connects to [your point] because...'",
        "The signal creates the space. The bridge makes your contribution feel relevant.",
      ],
      coachTip: "Every time you want to speak, use this two-part entry: Signal: 'I want to [add to / build on / push back on] that for a second...' → Bridge: 'What [name] said connects to [your point] because...' The signal creates space. The bridge makes your contribution feel relevant, not random.",
    },
  },
  {
    id: "meet-3",
    level: 3,
    title: "Disagreeing Professionally",
    introHeadline: "push back on senior stakeholders with data and diplomacy",
    introValue: "Master Disagree & Commit — separate your opposition from your commitment. Disagree on the what, never on the who.",
    scenario: "A senior stakeholder proposes an approach that the candidate disagrees with. The candidate must push back respectfully using data and logic, not just feelings — while maintaining the relationship and not derailing the meeting.",
    interlocutorBehavior: "Has strong opinions and expresses them confidently. Goes on tangents. Responds well to data-driven pushback, loses respect for vague disagreement. Tests whether you can manage up.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 2",
    measurableObjective: "The user disagrees with the stakeholder's proposal using a specific data point or logical argument, reframes the disagreement as an alternative rather than a rejection, and maintains a collaborative tone throughout.",
    anchorPhrases: [
      "I see the logic there, and I'd like to suggest an alternative based on what we've seen...",
      "I think we're aligned on the goal — where I'd push back is [specific aspect]...",
      "The data from our last sprint suggests a different approach might reduce risk here...",
    ],
    methodology: {
      name: "Disagree & Commit",
      tagline: "Staying silent when you see a problem makes you complicit in bad decisions. Pushing back poorly makes you difficult to work with.",
      explanation: `Most professionals do one of two things when they disagree in a meeting: they say nothing to avoid conflict, or they push back in a way that makes it personal. Both are career-limiting moves. Staying silent when you see a problem makes you complicit in bad decisions. Pushing back poorly makes you difficult to work with. Neither serves you, your team, or the outcome.\n\nThe professionals who advance are the ones who have developed a third option: disagreeing in a way that is direct, specific, and framed as being in service of the team's goals — not as opposition to the person proposing the idea. The goal is never to win the argument. It's to make sure the best information is on the table before the decision is made.\n\nThe core skill of this level is the **Disagree & Commit Framework**: you separate the act of disagreeing clearly and specifically from your commitment to execute once a decision is made. You disagree on the what, never on the who.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "I mean... I guess that could work. I'm just not totally sure about the timeline. But you probably know better than I do. I'll just... yeah, we can try it.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I want to flag a concern before we commit to this — and I'll be direct. The 6-week timeline assumes the API integration is straightforward, but based on what we saw in the last two projects, that assumption has failed both times. My recommendation is to add a two-week buffer in week three specifically for integration issues. I'll fully support whatever the team decides — I just want this on the table before we lock it in.",
        },
      },
      anchorPhrases: [
        "Flag: 'I want to raise a concern before we move forward.'",
        "Position + Evidence: 'I see it differently — specifically... The reason I say that is...'",
        "Commit: 'I'll support whatever we decide — I just want this perspective on the table.'",
      ],
      coachTip: "Use this four-part structure every time you disagree: Flag: 'I want to flag a concern before we move on.' → Position: 'I see this differently — specifically...' → Evidence: 'The reason I say this is...' → Commit: 'I'll support whatever we decide — I just want this perspective on the table.'",
    },
  },
  {
    id: "meet-4",
    level: 4,
    title: "Leading a Meeting",
    introHeadline: "run meetings that end with decisions, not just conversations",
    introValue: "Learn the Meeting Arc — Open with purpose, navigate tangents with grace, close with owners and deadlines.",
    scenario: "The candidate is the meeting host — responsible for opening with context, managing the agenda, keeping a tangent-prone senior stakeholder on track, and closing with clear next steps, owners, and deadlines.",
    interlocutorBehavior: "Goes on tangents with relevant-adjacent stories. Has strong opinions. Responds well to being redirected with grace and specificity. Loses respect if you let them run the meeting for you.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 3",
    measurableObjective: "The user opens the meeting with purpose and agenda in under 30 seconds, successfully redirects the stakeholder's tangent at least once without being rude, and closes with at least 2 specific next steps with named owners and deadlines.",
    anchorPhrases: [
      "The purpose of this meeting is [X], and we have [Y] minutes. Here's the agenda...",
      "That's a great point — and I want to make sure we give it proper time. Can we add it to next week's agenda?",
      "Before we wrap: let me confirm the next steps — [Name] will [action] by [date]...",
    ],
    methodology: {
      name: "The Meeting Arc",
      tagline: "How you run a meeting is a direct signal of how you'd run a team.",
      explanation: `How you run a meeting is a direct signal of how you'd run a team. Executives and senior leaders watch meeting facilitation closely — not because they care about meeting efficiency, but because it reveals whether someone can manage competing priorities, hold structure under social pressure, and drive toward a decision when it would be easier to keep talking.\n\nThe most common failure mode is letting the meeting drift. Someone raises an interesting tangent, the room follows, and 40 minutes later you've had a fascinating conversation but made no decisions. The facilitator who lets this happen has failed — regardless of how good the conversation was.\n\nThe core skill of this level is the **Meeting Arc**: Open (context + objective + time contract) → Navigate (agenda discipline + tangent management) → Close (decisions + owners + deadlines). A well-run meeting ends with no ambiguity. Everyone knows what was decided, who owns what, and by when.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "OK so... I think everyone's here? Great. So yeah, we're here to talk about the Q3 roadmap. Does anyone want to start? Or I can start if you want. Actually, before we get into that — did everyone see the update from the stakeholder call? Because that might be relevant...",
        },
        good: {
          label: "What it sounds like when it works",
          script: "Let's get started — we have 45 minutes. The goal today is to align on the three priorities for Q3 so that by the end of this call, each workstream has a clear owner and a deadline. I'll keep us on track. If something important comes up that's outside scope, I'll put it in the parking lot and we'll address it separately. Let's start with the first item.",
        },
      },
      anchorPhrases: [
        "Time: 'We have [X] minutes.'",
        "Objective: 'The goal today is to [specific outcome].'",
        "Output: 'By the end of this, we need [decision / alignment / plan].'",
      ],
      coachTip: "Open every meeting with this exact structure, in this order: Time: 'We have [X] minutes.' → Objective: 'Today's goal is [specific outcome].' → Output: 'By the end of this, we need [decision / alignment / plan].' Then start — don't ask if everyone's ready.",
    },
  },
  {
    id: "meet-5",
    level: 5,
    title: "Presenting in a Call",
    introHeadline: "deliver structured presentations that hold attention on a video call",
    introValue: "Practice the Pyramid Principle — lead with your conclusion, back it with evidence, and never lose the room.",
    scenario: "The candidate delivers a 3-minute structured presentation to a senior stakeholder during a video call — sharing results, a recommendation, and a clear ask. The stakeholder is multitasking and may interrupt with questions or challenges.",
    interlocutorBehavior: "Multitasks during presentations. Interrupts with 'get to the bottom line' if not engaged quickly. Challenges weak data. Respects confident, structured delivery.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 4",
    measurableObjective: "The user delivers a structured presentation in under 3 minutes using the What → So What → Now What framework, handles at least one interruption without losing their place, and ends with a specific ask.",
    anchorPhrases: [
      "Here's what happened, why it matters, and what I'm recommending...",
      "To answer that directly — [answer]. And here's why that matters for [their priority]...",
      "My ask today is [specific action] by [specific date]. Does that work for everyone?",
    ],
    methodology: {
      name: "The Pyramid Principle",
      tagline: "Presenting in a remote call is a fundamentally different skill from presenting in person.",
      explanation: `Presenting in a remote call is a fundamentally different skill from presenting in person. In person, your physical presence, eye contact, and body language do a significant amount of work before you say a single word. On a call, you have a thumbnail-sized box and a voice. If the first 30 seconds don't earn attention, you've lost the room — and you can't tell, because everyone looks the same on a grid view regardless of whether they're listening or checking email.\n\nThe professionals who present well on calls have learned one critical adaptation: they lead with the conclusion. In person, building up to a point can create dramatic tension. On a call, it creates confusion and dropout. Your audience needs to know where you're going before they'll commit to following you there.\n\nThe core skill of this level is the **Pyramid Principle**: conclusion first, then supporting evidence. You state your recommendation or key finding in the first sentence, then spend the rest of your time proving it. This is the opposite of how most people naturally want to tell a story — and it's exactly why most remote presentations lose their audience.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "So, to give you some context — we started this analysis back in January when we noticed some trends in the data. And we looked at a lot of different factors, and we ran the numbers a few different ways, and after all of that analysis, what we found was that... the current approach is probably not the most efficient one.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "My recommendation is that we shift budget from channel A to channel B — I'll give you three reasons why. First, channel A's cost per acquisition has increased 40% since Q1 while conversion rates are flat. Second, channel B is showing the opposite trend. Third, three comparable companies made this shift in the last six months and saw an average 25% improvement in CAC. That's the case. Questions?",
        },
      },
      anchorPhrases: [
        "My [recommendation / finding / conclusion] is [X].",
        "Here are [two / three] reasons why: [reason 1], [reason 2], [reason 3].",
        "Everything else is supporting detail. The point comes first.",
      ],
      coachTip: "Start every presentation with this sentence structure — no exceptions: 'My [recommendation / finding / conclusion] is [X]. Here are [two / three] reasons why: [reason 1], [reason 2], [reason 3].' Everything else is supporting detail. The point goes first.",
    },
  },
  {
    id: "meet-6",
    level: 6,
    title: "Following Up & Closing the Loop",
    introHeadline: "turn meeting decisions into real action through accountable follow-up",
    introValue: "Master Accountable Follow-Through — close loops without nagging. Reference, ask, and hold the line.",
    scenario: "The meeting ended 24 hours ago. The candidate must write a follow-up message summarizing decisions, next steps, and owners — then handle a reply from the stakeholder who misremembers what was agreed and pushes back on a deadline.",
    interlocutorBehavior: "Replies to the follow-up challenging a deadline. Tests whether the user can hold their ground diplomatically with evidence from the meeting, or caves under pressure.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 5",
    measurableObjective: "The user sends a follow-up within the first exchange that includes decisions, owners, and deadlines. When the stakeholder pushes back, the user references the original meeting agreement, proposes a compromise if needed, and maintains the accountability structure.",
    anchorPhrases: [
      "Following up on yesterday's sync — here's what we aligned on: [decisions], [owners], [deadlines]...",
      "I appreciate the pushback — based on what we discussed yesterday, the agreement was [X]. Happy to revisit if priorities have shifted...",
      "To make sure we don't lose momentum, here's a compromise that preserves the timeline...",
    ],
    methodology: {
      name: "Accountable Follow-Through",
      tagline: "The meeting was great. Everyone aligned. Decisions were made. And then nothing happened.",
      explanation: `The meeting was great. Everyone aligned. Decisions were made. And then nothing happened. This is the most common failure mode in professional environments — not bad decisions, but good decisions that never get executed because no one closed the loop.\n\nFollowing up is where professional reputations are actually built. Anyone can perform well in a meeting. The people who advance are the ones who make sure the meeting mattered — by tracking commitments, holding themselves and others accountable, and escalating when something is at risk before it becomes a crisis.\n\nThe core skill of this level is **Accountable Follow-Through**: the professional discipline of closing loops without nagging. The difference between effective follow-up and annoying follow-up is specificity. You reference exactly what was agreed, you make a precise ask, and you frame it as being in the interest of the project — not as surveillance of the other person.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "Hey, just wanted to check in and see how things are going with that thing we discussed. Let me know if you have any updates whenever you get a chance. No rush!",
        },
        good: {
          label: "What it sounds like when it works",
          script: "Following up on Tuesday's call — we agreed you'd have the vendor contracts reviewed by Thursday EOD so we can finalize the budget before the Friday board meeting. It's Wednesday morning and I want to flag that we're at risk if that slips. Is Thursday still realistic, or do we need to adjust the timeline? I can help remove any blockers if something has come up.",
        },
      },
      anchorPhrases: [
        "What specifically was agreed? ('On [date] we aligned on [specific deliverable] by [specific deadline].')",
        "Why does it matter now? ('This affects [downstream consequence].')",
        "What exactly do I need? ('Can you confirm [yes/no question] by [specific time]?')",
      ],
      coachTip: "Every follow-up must answer three questions: What was specifically agreed? ('On [date] we aligned on [specific deliverable] for [specific deadline].') → Why does it matter now? ('This affects [downstream consequence].') → What do I need exactly? ('Can you confirm [yes/no question] by [specific time]?')",
    },
  },
];

/* ── Presentations Path (6 Levels) ── */

const PRESENTATION_LEVELS: ProgressionLevel[] = [
  {
    id: "pres-1",
    level: 1,
    title: "Opening with Impact",
    introHeadline: "capture attention in the first 60 seconds of any presentation",
    introValue: "Learn the Hook Framework — four types of openings that earn the next 20 minutes before your audience checks out.",
    scenario: "The candidate must open a professional presentation to a mixed audience — they must capture attention in the first 60 seconds, establish credibility, and set clear expectations for what the audience will walk away with.",
    interlocutorBehavior: "Distracted, has seen hundreds of presentations. Will visibly disengage if the opening is generic ('today I'm going to talk about...'). Responds immediately and visibly when something surprising or relevant grabs their attention.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "First level — unlocked by default",
    measurableObjective: "The user opens without using 'today I'm going to talk about' or similar variants, delivers a specific hook in the first 30 seconds that generates a visible reaction from the interlocutor, and states the presentation's objective in one clear sentence.",
    anchorPhrases: [
      "Let me start with something that surprised me when I first saw the data...",
      "By the end of this, you'll have a clear answer to one question:...",
      "Here's the problem we're solving today — and it's bigger than it looks.",
      "I'm going to make a case for something that might seem counterintuitive at first.",
    ],
    methodology: {
      name: "The Hook Framework",
      tagline: "You have 60 seconds. That's how long a professional audience will give you before they decide whether this presentation is worth their attention.",
      explanation: `You have 60 seconds. That's how long a professional audience will give you before they decide whether this presentation is worth their attention. After 60 seconds, they've either leaned in or mentally checked out — and getting them back after they've checked out is nearly impossible.\n\nThe opening is the highest-leverage moment of any presentation. Most people waste it on logistics: 'Today I'm going to talk about X, we have about 30 minutes, please hold questions until the end.' This communicates nothing about why the audience should care — which is the only thing the audience is asking in those first 60 seconds.\n\nThe core skill of this level is the **Hook**: the first sentence that earns the next 20 minutes. There are four types that consistently work: a provocative question, a surprising statistic, a brief story, or a bold statement. Context, agenda, and logistics come after the hook — never before.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "Good morning everyone. Today I'm going to be presenting our Q3 results and some thoughts on what we should focus on for Q4. We have about 30 minutes so I'll try to move through this fairly quickly. Please hold your questions until the end if possible.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "We spent $2.3 million on marketing last quarter. 80% of it went to a channel that drove 12% of our revenue. I'm here to talk about what we do about that.",
        },
      },
      anchorPhrases: [
        "Hook quality — Does your opening create genuine curiosity or discomfort in the first 30 seconds, without using 'today I'm going to talk about'?",
        "Audience orientation — Do you establish why this matters to this specific audience before explaining what it is?",
        "Objective clarity — Do you state the single thing the audience should walk away knowing or deciding, in one sentence?",
      ],
      coachTip: "Write your hook before you start. It must be one of these four types: Provocative question: 'What if everything we believe about [X] is wrong?' — Surprising statistic: '[Number] that challenges what you'd expect...' — Brief story: 'Three months ago, [specific moment]...' — Bold statement: 'The decision we make today will determine whether [consequence].' — Pick one. Deliver it. Then pause.",
    },
  },
  {
    id: "pres-2",
    level: 2,
    title: "Structuring Your Narrative",
    introHeadline: "structure your arguments so the audience follows without effort",
    introValue: "Master the Three-Part Narrative — Problem, Solution, Call to Action. Every transition should feel inevitable, not random.",
    scenario: "The candidate must present a complex proposal with multiple components — they must structure their argument logically so the audience can follow without effort, transition between sections smoothly, and make the hierarchy of ideas immediately clear.",
    interlocutorBehavior: "Asks 'wait, how does this connect to what you said before?' when transitions are unclear. Represents an audience that is willing to follow but won't do the work of connecting dots themselves. Responds well to signposting and clear logic flow.",
    interlocutor: "meeting_facilitator",
    unlockRequirement: "Complete Level 1",
    measurableObjective: "The user presents a proposal of at least 3 sections with explicit transitions between each one, without the interlocutor losing the thread or asking how the points connect.",
    anchorPhrases: [
      "Now that we've established the problem, let me walk you through the solution.",
      "There are three things I want to cover — first... second... third.",
      "This connects directly to what I just showed you because...",
      "Let me pause here and check — does this logic make sense before I continue?",
    ],
    methodology: {
      name: "The Three-Part Narrative",
      tagline: "A presentation without structure is a collection of ideas. A presentation with structure is an argument.",
      explanation: `A presentation without structure is a collection of ideas. A presentation with structure is an argument. The difference is whether your audience can follow your logic without effort — and whether they arrive at your conclusion feeling like it was inevitable, not imposed.\n\nThe most common structural failure is chronological ordering: 'first we did this, then we did that, then we found this.' Chronology is how you experienced the work. It's not how the audience needs to receive it. They need to receive it in the order that makes the argument most compelling — which is almost never the order it happened.\n\nThe core skill of this level is the **Three-Part Narrative**: Problem → Solution → Call to Action. Every section needs a signpost that tells the audience where they are and where they're going next. Transitions are not just connective tissue — they are the argument itself. A weak transition signals a weak logical connection between ideas.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "So first I want to talk about the background, and then I'll get into the analysis, and then we'll look at some options, and then I'll share my recommendation, and then we can discuss.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "We have a problem: our onboarding completion rate dropped 22% in 90 days, and we know why. I'm going to walk you through the root cause, the solution we're proposing, and what I need from this group to move forward. The root cause is...",
        },
      },
      anchorPhrases: [
        "Signposting — Do you explicitly tell the audience which section you're in and where you're going next?",
        "Transition quality — Do your transitions explain the logical connection between sections, or do they just announce a topic change?",
        "Argument clarity — Could someone who missed the first half reconstruct your argument from the second half alone?",
      ],
      coachTip: "Use this structure and make each transition explicit: Problem: 'Here's what's broken and why it matters...' → Transition: 'Now that we've established the problem, the solution has three components...' → Solution: '[Component 1], [Component 2], [Component 3]...' → Transition: 'Given all of that, here's what I need from you...' → Call to Action: '[Specific ask].'",
    },
  },
  {
    id: "pres-3",
    level: 3,
    title: "Data Storytelling",
    introHeadline: "turn numbers into meaning that drives decisions",
    introValue: "Practice Data → Insight → Implication — every data point you present should answer 'so what?' before anyone asks.",
    scenario: "The candidate must present data-heavy findings to a non-technical audience — they must translate numbers into meaning, avoid death-by-spreadsheet, and make the audience feel the implications of the data rather than just understand it intellectually.",
    interlocutorBehavior: "Not a numbers person. Eyes glaze over at tables and percentages without context. Responds powerfully when data is connected to a decision or a human reality. Asks 'so what does this mean for us?' after every data point presented without context.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 2",
    measurableObjective: "The user presents at least 3 data points using the Data → Insight → Implication framework without the interlocutor having to ask 'so what?', and connects at least one data point to a concrete decision the team needs to make.",
    anchorPhrases: [
      "This number matters because what it's telling us is...",
      "What this means in practice for the team is...",
      "The decision this data is pointing to is...",
      "If we ignore this trend, what happens is...",
    ],
    methodology: {
      name: "Data → Insight → Implication",
      tagline: "Data doesn't speak for itself — ever.",
      explanation: `Data doesn't speak for itself — ever. A number on a slide is just a number until someone explains what it means, why it matters, and what should change as a result. The presenter who shows a table full of numbers and assumes the audience will draw the right conclusions is always disappointed. The audience draws no conclusions. They just wait for the next slide.\n\nThe presenters who use data effectively treat every data point as the beginning of a sentence, not the end of one. The number is the evidence. The insight is the interpretation. The implication is the reason it matters to the people in the room. All three are required — the number alone is never enough.\n\nThe core skill of this level is **Data → Insight → Implication**: a three-part structure that ensures every piece of data you present is connected to a decision or action. If you can't complete all three parts for a data point, that data point probably shouldn't be in the presentation.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "So here you can see that customer satisfaction dropped from 78% to 71% in Q3. And retention went from 94% to 89%. And NPS went from 42 to 31. And support ticket volume went up 35%.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "Customer satisfaction dropped 7 points in Q3 — and that number is a leading indicator, not a lagging one. What it's telling us is that the problem we're seeing in retention today — which dropped 5 points — is going to get significantly worse in Q4 unless we act now. The decision this data is pointing to is: we need to prioritize the onboarding fix over the new feature work, because one prevents churn and the other drives acquisition we can't retain.",
        },
      },
      anchorPhrases: [
        "Three-part completion — For every data point, do you provide the data, the insight it reveals, and the implication for the audience?",
        "Decision connection — Does at least one data point lead directly to a decision the audience needs to make?",
        "Simplicity — Do you present the minimum data needed to make the argument, or do you include data because it exists?",
      ],
      coachTip: "For every data point you plan to use, complete this sentence before presenting it: Data: '[Number or finding].' → Insight: 'What this tells us is...' → Implication: 'Which means the decision we need to make is...' — If you can't complete the third part, cut the data.",
    },
  },
  {
    id: "pres-4",
    level: 4,
    title: "Handling Q&A",
    introHeadline: "handle tough questions with composure and structure",
    introValue: "Learn the PREP Response — Point, Reason, Example, Point. Answer any question in under 60 seconds without losing the thread.",
    scenario: "Post-presentation Q&A session — the candidate must handle a mix of genuine questions, challenging pushback, and an off-topic question from a senior stakeholder, without losing composure, credibility, or control of the room.",
    interlocutorBehavior: "Asks one genuinely curious question, one pointed challenge ('did you consider the risk of X?'), and one question that is slightly outside the scope of the presentation. Tests whether the candidate gets defensive, over-explains, or handles pressure with confidence.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 3",
    measurableObjective: "The user answers 3 distinct questions without excessive rambling, handles the challenge without getting defensive, and closes at least one answer by verifying the question was fully resolved.",
    anchorPhrases: [
      "Great question — the short answer is X, and here's why...",
      "I want to make sure I understand what you're asking — are you concerned about...?",
      "That's outside the scope of today, but it's worth exploring — can we take it offline?",
      "Did that address what you were asking, or is there another layer to it?",
    ],
    methodology: {
      name: "The PREP Response",
      tagline: "The Q&A is where presentations are won or lost.",
      explanation: `The Q&A is where presentations are won or lost. A mediocre presentation followed by a sharp, confident Q&A will often leave a better impression than a polished presentation followed by a defensive, rambling one. This is because the Q&A is the only part of the presentation that is genuinely unscripted — and how you perform without a script reveals more about your thinking than any prepared slide ever could.\n\nThe most common mistakes in Q&A: answering the question you wished they'd asked instead of the one they actually asked; rambling because you're nervous and silence feels dangerous; getting defensive when challenged; and admitting uncertainty in a way that undermines your entire presentation.\n\nThe core skill of this level is the **PREP Response**: Point → Reason → Example → Point. A structured way to answer any question in under 60 seconds without losing the thread. Combined with the professional skill of buying time gracefully — acknowledging the question before answering it — PREP makes you look prepared even when you're not.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "That's a great question. Um... so I think... the thing is, it's complicated because there are a lot of factors involved and it really depends on the situation. I mean, we did look at that but it's hard to say definitively. Does that make sense?",
        },
        good: {
          label: "What it sounds like when it works",
          script: "Good question — let me be direct. My view is that we should proceed despite that risk, for one main reason: the cost of waiting exceeds the cost of the risk you're describing. In Q2 we delayed a similar decision for the same reason and lost 6 weeks of runway. The risk is real, but it's manageable. We'd mitigate it by [specific action]. Does that address your concern?",
        },
      },
      anchorPhrases: [
        "PREP structure — Do your answers have a clear point, reason, and example — or do they meander until they find a landing?",
        "Composure under challenge — When pushed back on, do you maintain your position with evidence, or do you soften immediately?",
        "Honest uncertainty — When you don't know, do you say so cleanly and offer a path to find out — without undermining your overall credibility?",
      ],
      coachTip: "For every question, run PREP in your head before you open your mouth: Point: '[My answer in one sentence.]' → Reason: 'The reason I say that is...' → Example: 'For instance, in [specific situation]...' → Point again: 'So my position is [restate answer].' — Then stop. The silence after the restatement is strength, not weakness.",
    },
  },
  {
    id: "pres-5",
    level: 5,
    title: "Virtual Presentation Presence",
    introHeadline: "command a virtual room when your only tools are a voice and a rectangle",
    introValue: "Master Deliberate Virtual Presence — camera address, strategic pausing, and engagement checkpoints that keep remote audiences locked in.",
    scenario: "Remote presentation to a distributed team across multiple time zones — the candidate must maintain energy and engagement through a screen, manage technical friction gracefully, and create a sense of connection with an audience they cannot see or read physically.",
    interlocutorBehavior: "Represents a remote audience that is half-distracted. Gives minimal visual feedback. Occasionally goes silent for awkward periods. Mentions a technical issue mid-presentation. Tests whether the candidate can sustain energy and adapt without an audience feeding them energy back.",
    interlocutor: "meeting_facilitator",
    unlockRequirement: "Complete Level 4",
    measurableObjective: "The user maintains an active engagement cadence every 3-4 minutes (question, pause, check-in), handles a moment of uncomfortable silence without filling it with filler, and adapts their energy to low feedback from the interlocutor without deflating.",
    anchorPhrases: [
      "I want to pause here and check — what's landing so far, what questions are coming up?",
      "If you can see my screen, give me a thumbs up — I want to make sure the tech is cooperating.",
      "I'm going to slow down here because this part is the most important.",
      "I know it can be hard to stay engaged on a call — I'll keep this tight and focused.",
    ],
    methodology: {
      name: "Deliberate Virtual Presence",
      tagline: "In a physical room, your presence is automatic. On a video call, you have a rectangle the size of a playing card and a voice.",
      explanation: `In a physical room, your presence is automatic. Your height, your posture, your eye contact, the way you move — all of it communicates before you say a word. On a video call, you have a rectangle the size of a playing card and a voice. The physical signals that would carry you in a room are gone. What's left is deliberate technique.\n\nThe professionals who present well virtually have learned to compensate for the absence of physical presence with a different set of tools: strategic pausing instead of movement to create emphasis, direct camera address instead of eye contact to create connection, explicit engagement questions instead of reading the room to check for attention, and energy calibration slightly above natural register to compensate for the compression that video creates.\n\nThe core skill of this level is **Deliberate Virtual Presence**: the specific techniques that make you feel present, engaged, and in control of a room you can't physically see.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "So... yeah... can everyone see my screen? OK good. So I'll just go through these slides and let me know if you have questions. Um... so this first slide shows... sorry, can everyone still hear me? OK. So as I was saying...",
        },
        good: {
          label: "What it sounds like when it works",
          script: "Before I share my screen — I want to set expectations. We have 20 minutes. I'll present for 12, then I want 8 minutes of real conversation, not just questions. I'm going to check in at the halfway point to make sure we're aligned before I move to the recommendation. Let's go.",
        },
      },
      anchorPhrases: [
        "Energy calibration — Is your energy level appropriate for a virtual environment — engaged and clear without being performative?",
        "Active engagement — Do you create at least two deliberate engagement moments during the presentation, rather than presenting at the audience?",
        "Technical confidence — Do you handle the virtual environment (screen sharing, pauses, silence) with composure, or does it destabilize you?",
      ],
      coachTip: "Use these three virtual presence techniques deliberately: Camera address: Look directly at the camera when making your key point — not at your slides or your own thumbnail. Strategic pause: After your most important sentence, stop for 2 full seconds before continuing. Engagement checkpoint: Every 4-5 minutes, ask a direct question: 'What's landing so far — any reactions before I continue?'",
    },
  },
  {
    id: "pres-6",
    level: 6,
    title: "The Executive Pitch",
    introHeadline: "pitch to the C-Suite with brevity, conviction, and a clear ask",
    introValue: "Practice the Executive Communication Code — lead with your conclusion, back it with minimum evidence, and treat every question as an opportunity.",
    scenario: "High-stakes pitch to a C-Suite audience — the candidate must present a strategic recommendation in 10 minutes, handle a skeptical executive who challenges the business case, and close with a specific ask for budget, headcount, or approval.",
    interlocutorBehavior: "C-Suite mindset: thinks in terms of risk, ROI, and strategic fit. Interrupts early with 'get to the point.' Challenges assumptions ('how confident are you in these numbers?'). Responds powerfully to brevity, conviction, and a clear ask. Loses interest immediately when presented with operational detail.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 5",
    measurableObjective: "The user opens with their main recommendation in the first 60 seconds, responds to at least one challenge with data and conviction without backing down from their position, and closes with a specific ask — a number, date, or concrete decision.",
    anchorPhrases: [
      "My recommendation is X. I'll give you the rationale in 3 points.",
      "The risk of not acting now is greater than the risk of acting — here's why.",
      "I'm confident in these numbers — they're based on X and validated by Y.",
      "What I need from this room today is a decision on...",
    ],
    methodology: {
      name: "The Executive Communication Code",
      tagline: "Presenting to executives is a different discipline from presenting to peers or managers.",
      explanation: `Presenting to executives is a different discipline from presenting to peers or managers. The audience has less time, less patience for process, and higher stakes for every decision they make. They've seen hundreds of presentations. They can detect uncertainty, unpreparedness, and weak logic in the first two minutes — and once they've made that assessment, it's nearly impossible to reverse.\n\nThe executives who sit through bad presentations aren't just bored — they're forming permanent opinions about the presenter's readiness for more responsibility. Conversely, a sharp executive presentation is one of the fastest ways to expand your visibility and influence in an organization.\n\nThe core skill of this level is the **Executive Communication Code**: leading with your conclusion and your ask, supporting it with the minimum evidence necessary, and treating every question as an opportunity to demonstrate depth — not as an attack to defend against. Executives want advisors who are confident, concise, and honest. They don't want presenters who are impressive.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "Thank you for making time. I know everyone's busy so I'll try to be quick. So we've been working on this initiative for about six months now and there's a lot of context I want to make sure you have before I get to the recommendation, so let me start from the beginning...",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I need a decision today on one question: do we allocate the $200K to expanding the current program or to launching the new one? My recommendation is the expansion. Here's why in three points — then I want your pushback. First...",
        },
      },
      anchorPhrases: [
        "Recommendation first — Does your recommendation or ask appear in the first 60 seconds, before any context or background?",
        "Pushback handling — When challenged, do you defend your position with evidence and maintain your recommendation, or do you immediately defer?",
        "Altitude maintenance — Do you stay at the strategic level throughout, or do you descend into operational detail when nervous?",
      ],
      coachTip: "Memorize this opening structure and deliver it before anything else: Ask: 'I need [a decision / your approval / alignment] on [specific thing].' → Recommendation: 'My recommendation is [X].' → Structure: 'I'll give you [two / three] reasons, then I want your reaction.' — Then deliver the reasons. Never start with context. Never start with background. Start with the ask.",
    },
  },
];

/* ── Client-Facing Communication Path (6 Levels) ── */

const CLIENT_LEVELS: ProgressionLevel[] = [
  {
    id: "cli-1",
    level: 1,
    title: "First Client Call",
    introHeadline: "earn trust in the first 15 minutes with a new client",
    introValue: "Learn the Trust Deposit — listen first, commit only to what you can deliver, and close with a specific next step.",
    scenario: "The first call with a new client after the deal is closed — the candidate must demonstrate active listening, define what success looks like for the client, set realistic expectations, and close with clear next steps.",
    interlocutorBehavior: "Cautiously optimistic. Watching for signs of whether this will be a genuine partnership or a cookie-cutter service. Responds warmly when asked about their goals. Grows skeptical when the service provider talks more about themselves than about the client's situation.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "First level — unlocked by default",
    measurableObjective: "The user asks about the client's definition of success before explaining their own process, sets at least one realistic expectation about the first phase, and closes with a specific next step with owner and date.",
    anchorPhrases: [
      "Before I walk you through how we work, I want to understand your situation first...",
      "What does a successful outcome look like for you specifically?",
      "Here's what the first phase will look like — including one thing that might feel slow initially...",
    ],
    methodology: {
      name: "The Trust Deposit",
      tagline: "The first call with a new client is not a kickoff — it's an audition.",
      explanation: `The first call with a new client is not a kickoff — it's an audition. The client has signed the contract, but they haven't yet decided whether they trust you. Trust at this stage is not earned by enthusiasm or by explaining everything your product or service can do. It's earned by demonstrating that you listen carefully, commit only to what you can deliver, and treat their time as more valuable than your agenda.\\n\\nThe most common mistake in a first client call is over-pitching. The deal is closed — but many professionals keep selling. They walk through capabilities, share success stories, and project optimism. The client, who was hoping to feel understood and set up for success, instead feels like they're still in the sales process.\\n\\nThe core skill of this level is the **Trust Deposit**: the discipline of earning trust through specific actions, not through general enthusiasm. The first call should end with the client feeling three things: that you understood what success means to them, that you were honest about what to expect, and that there is a clear next step with a date.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "We're really excited to be working with you. I think this is going to be a great partnership. We've done this with a lot of companies similar to yours and the results have been fantastic. We're going to get started right away and I'm sure you're going to love how this all comes together.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "Before I walk you through how we typically work, I want to understand your situation first. What does a successful outcome look like for you specifically — not the general goal, but the thing that would make you say six months from now that this was worth it?",
        },
      },
      anchorPhrases: [
        "Discovery before pitch — Do you ask about the client's definition of success before explaining your process or capabilities?",
        "Expectation honesty — Do you set realistic expectations about what the first phase will look like, including potential friction points?",
        "Concrete close — Does the call end with a specific next step, deliverable, owner, and date?",
      ],
      coachTip: "Open the call with this question — before anything else: 'Before I walk you through [our process / next steps / how this works], I want to make sure I understand what success looks like for you specifically. What's the outcome that would make this worth it — in your words?'",
    },
  },
  {
    id: "cli-2",
    level: 2,
    title: "Setting Expectations",
    introHeadline: "protect your scope without damaging the relationship",
    introValue: "Master Scope Integrity — be warm and firm at the same time. Every boundary should feel like a path forward, not a wall.",
    scenario: "The client requests something that is outside the agreed scope. The candidate must protect the boundary without damaging the relationship, reference the original agreement, and offer a constructive path forward.",
    interlocutorBehavior: "Assumes everything is included. Not intentionally pushing — genuinely believes the request is reasonable. Becomes frustrated if told 'that's out of scope' without a solution. Responds well to partners who protect boundaries while offering alternatives.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 1",
    measurableObjective: "The user references the specific agreed scope, reframes the gap as a shared problem, and offers at least one concrete path forward that protects the boundary while giving the client a way to get what they need.",
    anchorPhrases: [
      "I want to make sure we're aligned on what we agreed...",
      "What you're describing sits outside that — and here's how we can make it happen...",
      "Which direction makes more sense for you?",
    ],
    methodology: {
      name: "Scope Integrity",
      tagline: "Scope creep doesn't usually happen because clients are trying to take advantage of you. It happens because expectations were never precisely defined.",
      explanation: `Scope creep doesn't usually happen because clients are trying to take advantage of you. It happens because expectations were never precisely defined — and in the absence of precision, both parties fill the gap with their own assumptions. The client assumes more is included. The service provider assumes less. The conflict is inevitable.\\n\\nThe professional who handles scope conversations well doesn't fight the client — they clarify the agreement. There's a critical difference between 'that's out of scope' (which sounds like a wall) and 'what you're describing would sit outside what we agreed, and here's how we can make it happen' (which sounds like a partner).\\n\\nThe core skill of this level is **Scope Integrity**: protecting agreed boundaries without damaging the relationship. This requires separating two things that often get confused — the warmth of the relationship (which should remain high) and the firmness of the agreement (which should also remain high). You can be both warm and firm. In fact, the best client relationships require it.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "Oh, yeah, of course — we can add that. It shouldn't be a big deal. Let me just check with the team and we'll figure it out. I don't want this to be an issue.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I want to make sure we're aligned on what we agreed, because I think there may be a gap. What we scoped covers X and Y — and what you're describing sounds like Z, which sits outside that. I want to find a way to get you what you need, so let me propose two options: we can address Z in phase two, or if you need it now, we can put together a quick change order. Which direction makes more sense for you?",
        },
      },
      anchorPhrases: [
        "Agreement reference — Do you reference the specific scope agreed, with enough detail to make the gap clear?",
        "Non-defensive framing — Do you address the misalignment as a clarification to make together, not as a client error to correct?",
        "Path forward — Do you offer at least one concrete alternative that gives the client what they need without giving scope away for free?",
      ],
      coachTip: "Use this structure every time the client asks for something out of scope: Align: 'I want to make sure we're working from the same agreement — what we scoped was [specific scope].' → Gap: 'What you're describing is [request], which sits outside that.' → Path: 'Here's how we can make it happen: [option 1] or [option 2]. Which works better for you?'",
    },
  },
  {
    id: "cli-3",
    level: 3,
    title: "Delivering Bad News",
    introHeadline: "deliver bad news early, directly, and with a recovery plan",
    introValue: "Practice Proactive Transparency — tell the client before they find out. The window for delivering bad news closes fast.",
    scenario: "Something has gone wrong — a deadline will be missed, a deliverable will be late, or a commitment can't be met. The candidate must proactively inform the client before they discover it, be specific about the impact, and present a recovery plan.",
    interlocutorBehavior: "Tests whether the professional discloses proactively or waits to be asked. Responds with measured frustration when bad news is delivered — but with respect if it's delivered early, honestly, and with a plan. Loses trust completely if the news is minimized or hidden.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 2",
    measurableObjective: "The user proactively discloses the problem in the first exchange, follows the What → Impact → Recovery → Ask sequence, and provides specific numbers for the impact and the recovery timeline.",
    anchorPhrases: [
      "I'm calling because I want to get ahead of something before it affects your timeline...",
      "Here's what we've done, and here's the honest recovery estimate...",
      "What would be most helpful from me right now?",
    ],
    methodology: {
      name: "Proactive Transparency",
      tagline: "There is a window for delivering bad news — and it closes fast.",
      explanation: `There is a window for delivering bad news — and it closes fast. The professional who tells the client about a problem before the client discovers it is in a completely different conversation than the one who waits until it's unavoidable. In the first conversation, the professional is a trustworthy partner who is managing the situation. In the second, they're someone who hid something — and no amount of explanation will fully undo that impression.\\n\\nThe instinct to delay is understandable. No one wants to make this call. But every hour you wait, the problem grows and the trust cost of disclosure increases. The only thing that gets easier by waiting is the short-term discomfort of the call — everything else gets harder.\\n\\nThe core skill of this level is **Proactive Transparency**: the practice of delivering difficult information early, directly, and with a recovery plan already in hand. The sequence that works every time: What happened → Impact → What we're doing about it → What we need from you. In that order. No exceptions.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "So, um, I wanted to touch base because there have been some developments on our end. Things are still moving forward but there have been some... complications. I don't want you to worry because we're working on it and I'm sure it will all work out, but I wanted to keep you in the loop just in case.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I'm calling because I want to get ahead of something before it affects your timeline. The vendor we depend on for the data integration has pushed their delivery from Friday to Wednesday next week. That puts our go-live date at risk by approximately 5 days. Here's what we've done: we've already sourced a backup vendor and we're running parallel tracks. My current estimate is that we recover 3 of those 5 days. I want to be honest with you about the other 2 — that's the realistic buffer we're working with right now. What would be most helpful from me in the next 24 hours?",
        },
      },
      anchorPhrases: [
        "Proactivity — Do you disclose the problem before the client discovers it, or do you wait until asked?",
        "Sequence discipline — Do you follow What happened → Impact → Recovery plan → Client ask, in that order?",
        "Honest quantification — Do you give specific numbers for the impact and the recovery, even when the numbers are uncomfortable?",
      ],
      coachTip: "Deliver bad news using this exact sequence — don't rearrange it: What: 'I'm calling because [specific thing that happened].' → Impact: 'This affects [specific thing] by [specific amount].' → Recovery: 'Here's what we've already done: [actions taken]. Our current estimate is [honest projection].' → Ask: 'What would be most helpful from me right now?'",
    },
  },
  {
    id: "cli-4",
    level: 4,
    title: "Defending Your Work",
    introHeadline: "defend your professional reasoning without getting defensive",
    introValue: "Learn Confident Humility — the combination of conviction in your thinking with genuine openness to the client's perspective.",
    scenario: "The client challenges a deliverable — they're dissatisfied with something the team produced. The candidate must understand the gap between what was expected and what was delivered, explain the reasoning without being defensive, and arrive at a resolution.",
    interlocutorBehavior: "Disappointed but not hostile. Gives specifics if asked. Loses respect for immediate capitulation. Gains respect for professionals who ask questions, explain their reasoning, and then find a path forward collaboratively.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 3",
    measurableObjective: "The user asks what the client expected before defending the work, explains the specific reasoning behind the approach, and proposes a concrete resolution that addresses both the client's concern and the professional rationale.",
    anchorPhrases: [
      "Before I respond, can you tell me specifically what you were expecting?",
      "Let me explain the reasoning behind our approach...",
      "Given what you've described, here's the version I'd propose...",
    ],
    methodology: {
      name: "Confident Humility",
      tagline: "When a client challenges your work, there are two wrong responses: immediate defense and immediate capitulation.",
      explanation: `When a client challenges your work, there are two wrong responses: immediate defense and immediate capitulation. Defense makes the conversation adversarial — you're now arguing, not solving a problem. Capitulation destroys your credibility — if you agree the work is wrong the moment it's challenged, the client loses faith in your judgment entirely.\\n\\nThe right response is neither. It's a genuine inquiry into what the client was expecting, followed by an honest explanation of your reasoning, followed by a collaborative search for a resolution that serves the underlying goal. This is not a compromise — it's a professional conversation between two people who both want a good outcome.\\n\\nThe core skill of this level is **Confident Humility**: the combination of defending your professional reasoning (which requires conviction) with genuine openness to the client's perspective (which requires curiosity). You never defend your ego — you defend your thinking. And you do it while remaining sincerely interested in understanding theirs.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "I'm sorry you feel that way. I can see why you might think that. You're right that we could have done it differently. Let me just redo it the way you're describing and we'll get that over to you.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I want to understand your concern fully before I respond. Can you tell me what you were expecting to see — specifically? I want to make sure I understand the gap. [After listening] — Thank you for that. Let me explain the reasoning behind what we did, and then I want us to find the version that actually works. We approached it this way because [specific reasoning]. Given what you've described, I think there's a version that serves both intentions. Here's what I'd propose...",
        },
      },
      anchorPhrases: [
        "Inquiry before defense — Do you ask what the client expected before explaining what you did?",
        "Reasoning transparency — Do you explain the specific reasoning behind your approach, not just assert that it was right?",
        "Collaborative resolution — Do you arrive at a specific path forward that addresses both the client's concern and the underlying professional rationale?",
      ],
      coachTip: "When your work is challenged, use this four-step sequence: Inquire: 'Before I respond, can you tell me specifically what you were expecting?' → Listen fully — don't interrupt. → Explain: 'Here's the reasoning behind our approach: [specific rationale].' → Resolve: 'Given what you've described, here's the version I'd propose: [specific adjustment or confirmation].'",
    },
  },
  {
    id: "cli-5",
    level: 5,
    title: "Managing a Difficult Client",
    introHeadline: "reset boundaries with demanding clients while keeping the relationship",
    introValue: "Practice Professional Boundary Setting — frame every limit as serving the client's interest, not your convenience.",
    scenario: "The client has become consistently demanding — requesting things outside of scope, sending urgent messages outside of hours, and pushing boundaries that were never firmly established. The candidate must reset expectations without losing the relationship.",
    interlocutorBehavior: "Pushes aggressively but responds to professionals who hold firm respectfully. Tests whether the professional will cave or hold. Respects boundaries when they are framed as serving the client's interest, not the service provider's convenience.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 4",
    measurableObjective: "The user holds at least one boundary by framing it as serving the client's interest, maintains composure throughout, and offers a specific path within the process that addresses the client's underlying need.",
    anchorPhrases: [
      "I hear the urgency — and I want to get you what you need as fast as possible...",
      "The fastest path is actually through the standard process, not around it...",
      "Here's specifically what I can do within [timeframe]...",
    ],
    methodology: {
      name: "Professional Boundary Setting",
      tagline: "Difficult clients don't usually start difficult. They become difficult when the relationship lacks structure.",
      explanation: `Difficult clients don't usually start difficult. They become difficult when the relationship lacks structure — when the process is unclear, when boundaries were never established, or when early concessions taught them that pushing gets results. By the time you're dealing with a consistently difficult client, some of what you're managing is a pattern you helped create.\\n\\nThis doesn't mean the client is right — it means the solution requires more than just holding firm in one conversation. It requires reestablishing the structure that should have been there from the beginning, without making the client wrong for taking advantage of an opening you left.\\n\\nThe core skill of this level is **Professional Boundary Setting**: the practice of protecting agreed ways of working by framing limits as serving the client's interests, not the service provider's convenience. 'I can't do that' closes a door. 'The way we get you the best result is by going through this process' opens a path. Same boundary — completely different dynamic.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "I understand you need this urgently, and I really want to help, but the thing is our process requires... I mean, I know it might seem bureaucratic, but it's just how we work, and I can't really make exceptions even though I know that's frustrating...",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I hear the urgency — and I want to get you what you need as fast as possible. The fastest path is actually through the standard process, not around it. When we skip steps, we typically create problems downstream that take longer to fix than the time we saved. Here's what I can do: I'll personally prioritize this the moment it comes through the right channel. If you can send the request through [specific channel] in the next hour, I'll have a response to you by end of day.",
        },
      },
      anchorPhrases: [
        "Boundary framing — Do you frame limits as serving the client's interests, or as rules you're obligated to enforce?",
        "Composure — Do you maintain a calm, professional tone throughout even when the client is frustrated or dismissive?",
        "Concrete alternative — Do you offer a specific path within the process, or do you just say no without a forward path?",
      ],
      coachTip: "Every time you need to hold a boundary, use this structure: Acknowledge: 'I hear [the urgency / the frustration / the need].' → Reframe: 'The way we get you the best result here is actually [process], because [reason it serves them].' → Offer: 'Here's specifically what I can do: [concrete action within the boundary].'",
    },
  },
  {
    id: "cli-6",
    level: 6,
    title: "Growing the Relationship",
    introHeadline: "open expansion conversations that feel like insights, not pitches",
    introValue: "Master Insight-Led Expansion — bring a perspective on their business they can't see from the inside. The sale follows naturally.",
    scenario: "The engagement has been successful. The candidate must use an insight about the client's business to open a natural expansion conversation — without it feeling like a sales pitch. The goal is to bring a perspective the client hasn't seen, not to push an additional service.",
    interlocutorBehavior: "Satisfied with the current work. Not looking for additional services. Responds positively to genuine insights about their business. Shuts down immediately if the conversation feels like a pitch. Opens up if the professional demonstrates understanding of their business beyond the current engagement.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 5",
    measurableObjective: "The user opens the conversation with a specific observation about the client's business, frames the expansion as a natural next step from the observation, and gets the client to express genuine interest before mentioning any additional service.",
    anchorPhrases: [
      "Something we've noticed in the work that I want to share with you...",
      "This tends to be invisible from the inside because...",
      "Would it be useful to look at what this could mean for next year?",
    ],
    methodology: {
      name: "Insight-Led Expansion",
      tagline: "The expansion conversation is the one most service professionals handle worst.",
      explanation: `The expansion conversation is the one most service professionals handle worst — either because they're afraid it will feel like a sales pitch, or because they pitch so eagerly it actually does feel like one. Both outcomes leave money on the table and damage the relationship that made expansion possible in the first place.\\n\\nThe distinction that matters is this: vendors pitch products. Advisors bring insights. If you've done your work well, you know things about your client's business that they don't fully see themselves — patterns in the data, gaps in their approach, opportunities they're not positioned to recognize from the inside. That knowledge is the foundation of an expansion conversation that doesn't feel like selling.\\n\\nThe core skill of this level is **Insight-Led Expansion**: bringing the client a perspective on their own business that creates the expansion conversation naturally. You're not introducing a new service — you're sharing an observation that makes the client want to know what to do about it. The expansion is the answer to a question they now have, not a pitch for something you want to sell.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "So we've had a really great year together and I wanted to talk about potentially expanding our engagement. We have some other services that I think could be really valuable for you. We do X, Y, and Z and a lot of our clients at your stage have found them really useful. I'd love to set up a separate call to walk you through what we offer.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "Something we've noticed in the work this year that I want to share with you — we've seen that your highest-performing segments are responding well to X, but you're not set up to scale that systematically. Most companies don't notice this from the inside because the signal is in the aggregate data, not in day-to-day operations. I think there's a significant opportunity here that's being left on the table. Would it be useful to spend 20 minutes looking at what that could mean for next year?",
        },
      },
      anchorPhrases: [
        "Insight specificity — Is your observation specific to this client's situation, or is it generic enough to apply to any client?",
        "Non-pitch framing — Does the expansion feel like a natural response to a problem you've identified, or like a sales agenda you've prepared?",
        "Client curiosity — Does the client signal genuine interest in exploring further, or do they feel like they're being sold to?",
      ],
      coachTip: "Open the expansion conversation with an observation, not a proposal: Observation: 'Something we've noticed in the work that I want to share...' → Specificity: '[Specific pattern or gap unique to this client].' → Why they haven't seen it: 'This tends to be invisible from the inside because...' → Invitation: 'Would it be useful to look at what this could mean for [next quarter / next year]?' — Only after they say yes do you mention a service.",
    },
  },
];

/* ── C-Suite Communication Path (6 Levels) ── */

const CSUITE_LEVELS: ProgressionLevel[] = [
  {
    id: "cs-1",
    level: 1,
    title: "Speaking Up in the Room",
    introHeadline: "contribute powerfully in executive meetings without waiting to be invited",
    introValue: "Learn the One Powerful Point — one sharp, well-timed observation earns more credibility than five safe ones.",
    scenario: "An executive meeting where the candidate is the most junior person present. Multiple senior leaders are discussing a strategic decision. The candidate must contribute at least one substantive point without waiting to be invited.",
    interlocutorBehavior: "Does not invite junior voices. Moves the conversation quickly between senior participants. Stops and pays attention when someone junior says something sharp and specific. Ignores vague or hedged contributions.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "First level — unlocked by default",
    measurableObjective: "The user speaks up at least twice without being invited, each contribution is a specific, actionable observation delivered in under 45 seconds, and at least one point changes the direction of the conversation.",
    anchorPhrases: [
      "I want to push back on one assumption here...",
      "The constraint we're treating as fixed might actually be negotiable...",
      "One data point that's relevant to this decision...",
    ],
    methodology: {
      name: "The One Powerful Point",
      tagline: "Being in the room with senior leadership is not the same as being heard in it.",
      explanation: `Being in the room with senior leadership is not the same as being heard in it. Many professionals get access to executive meetings and then disappear — either because they're waiting to be invited to speak, or because they're trying to say something perfect and the moment passes. Both are costly mistakes.\\n\\nIn executive rooms, the quantity of contributions matters far less than the quality. One sharp, well-timed observation earns more credibility than five safe ones. The discipline is not having more to say — it's being ruthlessly selective about what you say and saying it with full conviction when you say it.\\n\\nThe core skill of this level is the **One Powerful Point**: the practice of identifying the single most valuable contribution you can make in a given moment and delivering it in under 45 seconds. Not a summary of your thinking. Not a hedged observation. One point, clearly stated, with a direct connection to what's being discussed.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "Yeah, I mean, I think there are a few different ways to look at this. On one hand you could say X, but then again there's also Y to consider, and I think it really depends on the context and what the priorities are. I don't know, I think both perspectives have merit.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I want to push back on one assumption here. We're treating the Q4 timeline as fixed, but the constraint that's actually driving it — the board presentation date — was set before we knew the integration would take 6 weeks longer. If we surface that to the board now, we have a real conversation. If we don't, we're optimizing around a constraint that might not exist.",
        },
      },
      anchorPhrases: [
        "Self-initiated contributions — Do you speak without being explicitly invited to, at least twice during the conversation?",
        "Point specificity — Is each contribution a specific, actionable observation — or a general comment that could apply to any situation?",
        "Delivery confidence — Do you deliver your point without hedging, qualifying, or trailing off before you've finished?",
      ],
      coachTip: "Before speaking, run this internal filter: Is this the most valuable thing I can add right now? — Can I say it in under 45 seconds? — Am I stating a position, not just making an observation? — If yes to all three: speak. If not: wait for a better moment instead of filling space.",
    },
  },
  {
    id: "cs-2",
    level: 2,
    title: "Presenting to Leadership",
    introHeadline: "present to executives with your conclusion first and your confidence intact",
    introValue: "Master Executive Altitude — recommendation first, rationale second, detail on request. Stay at the level of decisions, not activities.",
    scenario: "A 10-minute presentation to a VP or C-level executive. The candidate must lead with their recommendation, support it concisely, and handle an interruption from the executive who wants to 'get to the bottom line.'",
    interlocutorBehavior: "Impatient with context. Will interrupt within 90 seconds if the recommendation hasn't been stated. Respects brevity and conviction. Challenges assumptions to test confidence. Loses respect for presenters who start with process or background.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 1",
    measurableObjective: "The user states their recommendation within the first 45 seconds, handles at least one interruption by answering directly and returning to structure, and stays at the strategic level throughout without descending into operational detail.",
    anchorPhrases: [
      "My recommendation is [specific action]...",
      "Here are [two / three] reasons...",
      "That's the case — I want your pushback.",
    ],
    methodology: {
      name: "Executive Altitude",
      tagline: "Most professionals present to executives the same way they present to peers — and it fails every time.",
      explanation: `Most professionals present to executives the same way they present to peers — with context first, analysis second, and recommendation last. This structure works well when your audience has time and patience. Executives have neither. By the time you arrive at your recommendation, they've already formed an opinion based on incomplete information — or they've tuned out entirely.\\n\\nExecutive communication requires inverting the structure completely. Recommendation first. Supporting rationale second. Detail available on request, but not offered proactively. This feels counterintuitive because it means stating your conclusion before you've built the case for it. The discomfort is real — and so is the effectiveness.\\n\\nThe core skill of this level is **Executive Altitude**: the discipline of staying at the level of decisions, not activities. Every sentence should answer 'so what?' before the executive has to ask. If a piece of information doesn't change what the executive should do or think, it doesn't belong in the presentation.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "So we started this project in January and the initial scope was to look at three areas. We pulled data from five different sources and ran the analysis over about six weeks. What we found was interesting — there were some patterns that emerged that we hadn't anticipated, and after looking at those patterns we started to think about what they might mean for the strategy, and ultimately we landed on a recommendation which I'll get to in a few slides...",
        },
        good: {
          label: "What it sounds like when it works",
          script: "My recommendation is that we exit the enterprise segment and focus entirely on mid-market. I'll give you three reasons and I want your pushback. First: our win rate in enterprise is 12% versus 34% in mid-market. Second: the sales cycle in enterprise is 9 months versus 3. Third: our product is 18 months away from being competitive at the enterprise level. The math is clear. Here's what execution looks like.",
        },
      },
      anchorPhrases: [
        "Recommendation timing — Does your recommendation appear in the first 45 seconds, before any context or background?",
        "Altitude maintenance — Do you stay at the level of decisions and implications, or do you descend into process and methodology when nervous?",
        "Interruption recovery — When the executive interrupts, do you answer directly and return to your structure, or do you lose the thread?",
      ],
      coachTip: "Your first sentence must be your recommendation. No exceptions. Use this structure: Recommendation: 'My recommendation is [specific action].' → Structure: 'Here are [two / three] reasons.' → Deliver the reasons concisely. → Invite reaction: 'That's the case — I want your pushback.' — Context is available if they ask. It's never offered first.",
    },
  },
  {
    id: "cs-3",
    level: 3,
    title: "Asking for Resources",
    introHeadline: "request budget, headcount, or time as an investment decision with projected returns",
    introValue: "Practice the Business Case Frame — stop thinking about what you need and start thinking about what the organization gets in return.",
    scenario: "The candidate must request additional headcount, budget, or timeline from a senior leader. The candidate must frame the request as an investment decision with projected returns, not as a resource problem with a human cost.",
    interlocutorBehavior: "Making portfolio decisions across competing priorities. Evaluates requests purely on ROI and strategic alignment. Rejects emotional appeals. Responds to precise numbers and projected returns. Challenges assumptions on both the cost and the return side.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 2",
    measurableObjective: "The user presents the business case before making the ask, uses specific numbers for the problem, the investment, and the expected return, and makes a concrete ask — not a general request for 'more support.'",
    anchorPhrases: [
      "Here's what's at stake if we don't act: [specific consequence with number]...",
      "The investment is [specific resource] at [specific cost]...",
      "The return is [specific outcome] — a [X:1] ratio...",
    ],
    methodology: {
      name: "The Business Case Frame",
      tagline: "Stop thinking about what you need and start thinking about what the organization gets in return.",
      explanation: `Asking for resources from a senior leader is one of the highest-stakes conversations a professional can have — and one of the most poorly prepared for. Most people walk in with a request and a justification. Senior leaders walk out unconvinced, not because the request was wrong, but because it was framed as a need rather than an investment.\\n\\nThe shift that changes everything: stop thinking about what you need and start thinking about what the organization gets in return. A senior leader with constrained resources is making portfolio decisions. They're allocating limited capital across competing priorities. Your job is not to explain why you need more — it's to make the case that investing in your request produces a better return than the alternatives they're weighing it against.\\n\\nThe core skill of this level is the **Business Case Frame**: structuring your request as an investment decision with a projected return, not as a resource problem with a human cost. The ask is the last thing you say — never the first.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "We really need another person on the team. We're completely overwhelmed and the current workload is unsustainable. Everyone is burning out and we're starting to miss deadlines. I know headcount is tight but I think if we don't get support soon things are going to get worse.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I want to make a specific ask and walk you through the business case first. We currently have three projects at risk of missing their Q4 deadline — projects that collectively represent $1.2M in committed revenue. The root cause is a capacity gap: the team is at 140% utilization. One additional hire at $85K fully-loaded cost would bring us to 110% utilization and de-risk all three projects. The return on that investment is protecting $1.2M in revenue. That's a 14:1 ratio. Here's what I need from you.",
        },
      },
      anchorPhrases: [
        "Business case first — Do you present the return on investment before making the ask?",
        "Quantification — Do you use specific numbers for the problem, the investment, and the expected return?",
        "Ask specificity — Is your ask concrete — a specific headcount, budget amount, or timeline — rather than a general request for 'more support'?",
      ],
      coachTip: "Structure your request in this order — the ask always comes last: Business risk: 'Here's what's at stake if we don't act: [specific consequence with number].' → Root cause: 'The reason is [specific constraint].' → Investment: 'What I'm proposing is [specific resource] at [specific cost].' → Return: 'The return is [specific outcome] — a [X:1] ratio.' → Ask: 'What I need from you is [specific decision].'",
    },
  },
  {
    id: "cs-4",
    level: 4,
    title: "Navigating Political Conversations",
    introHeadline: "surface uncomfortable data without making powerful people defensive",
    introValue: "Learn Strategic Honesty — address interests, not positions. Put the right information on the table in a way it can be heard.",
    scenario: "A senior leader with a strong position proposes an approach the candidate disagrees with. The political dynamics make direct contradiction risky. The candidate must surface data and alternative perspectives without creating defensiveness.",
    interlocutorBehavior: "Has invested significant political capital in their current position. Highly attuned to whether pushback is an attack or genuine problem-solving. Responds to data and framing that serves their stated goals. Immediately defensive when they feel their judgment is being questioned publicly.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 3",
    measurableObjective: "The user addresses the leader's underlying interest (not just their stated position), presents data rather than judgment, and offers the leader a path to a different position without requiring them to admit they were wrong.",
    anchorPhrases: [
      "I think we both want [shared objective] — I want to make sure we get there...",
      "What I'm observing is [specific information]...",
      "Where do you see the flaw in that thinking?",
    ],
    methodology: {
      name: "Strategic Honesty",
      tagline: "Every organization has politics. The effective professional navigates them.",
      explanation: `Every organization has politics. The naive professional pretends they don't and gets run over by them. The cynical professional plays them and eventually loses their integrity. The effective professional navigates them — which means understanding the political dynamics clearly enough to work within them without being captured by them.\\n\\nNavigating a political conversation with a senior leader requires one critical skill: distinguishing between their stated position and their underlying interest. A position is what someone says they want. An interest is why they want it. Positions conflict. Interests often don't. The professional who addresses the interest instead of fighting the position can find paths forward that the person arguing about positions will never see.\\n\\nThe core skill of this level is **Strategic Honesty**: the practice of being truthful without being politically self-destructive. This means putting the right information on the table in a way that can be heard, not in a way that makes you feel righteous while the other person gets defensive. Timing, framing, and sequencing matter as much as the content of what you say.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "I think we need to be honest about what's really happening here. The data clearly shows that this approach isn't working and I think we all know why. I've been saying this for months and I think it's time we had a real conversation about it instead of just going along with what's been decided.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I want to make sure I understand what you're trying to achieve here, because I think we're aligned on the goal but I'm seeing it differently on the approach. Can I share what I'm observing in the data? [After listening] — What I'm seeing is [specific data]. I raise this because I want us to get to [stated goal] — and I think this information changes the path. Here's what I'd suggest instead, and I want to know where you see the flaw in my thinking.",
        },
      },
      anchorPhrases: [
        "Interest identification — Do you address what the senior leader is trying to achieve, not just what they're saying?",
        "Data over judgment — Do you present observations and data, or do you make claims about people's motives or decisions?",
        "Exit ramp — Do you offer the senior leader a path to a different position that doesn't require them to admit they were wrong?",
      ],
      coachTip: "Navigate the conversation using this sequence: Align on goal: 'I think we both want [shared objective] — I want to make sure we get there.' → Surface the data: 'What I'm observing is [specific information].' → Reframe: 'The way I'd look at this is [alternative framing that serves their interest].' → Invite: 'Where do you see the flaw in that thinking?'",
    },
  },
  {
    id: "cs-5",
    level: 5,
    title: "Delivering Uncomfortable Truths",
    introHeadline: "tell senior leadership what no one else will — clearly and with data",
    introValue: "Practice Courageous Candor — say the hard thing in a way that makes the leader experience it as loyalty, not betrayal.",
    scenario: "A strategy isn't working and no one has told senior leadership. The candidate must deliver the difficult truth clearly, back it with specific data, and pivot to a recommendation — without hedging the message into invisibility or creating unnecessary defensiveness.",
    interlocutorBehavior: "Has invested in the current strategy. Will be uncomfortable hearing it's not working. Tests the messenger's conviction — do they hold firm when pushed back on, or do they soften? Respects direct, data-backed candor. Dismisses vague or overly softened concerns.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 4",
    measurableObjective: "The user states the uncomfortable truth directly with specific evidence, maintains their position when challenged, and pivots to a forward-looking recommendation within the same conversation.",
    anchorPhrases: [
      "I want to share something important — I'm sharing it because I want us to succeed...",
      "Specifically: [data point 1] and [data point 2]...",
      "I'm not here to look backward — here's what I'd recommend we do from here...",
    ],
    methodology: {
      name: "Courageous Candor",
      tagline: "Organizations fail not because people don't know the truth, but because no one with access to leadership has the courage to say it clearly.",
      explanation: `Telling a senior leader something they don't want to hear is one of the most important — and most avoided — professional skills. Organizations fail not because people don't know the truth, but because no one with access to leadership has the courage to say it clearly. The professional who develops this skill becomes indispensable. The one who avoids it becomes complicit.\\n\\nBut courage alone is not enough. Uncomfortable truths delivered poorly create defensiveness, damage relationships, and get dismissed — which means the truth never lands where it needs to. The messenger gets shot and the organization stays on the wrong path. Delivery is not a soft skill here — it's the difference between the truth mattering and the truth being buried.\\n\\nThe core skill of this level is **Courageous Candor**: the combination of saying the hard thing clearly and framing it in a way that makes the leader experience it as loyalty, not betrayal. The invisible first sentence of every uncomfortable truth is: 'I'm telling you this because I'm on your side and I want us to succeed.' Everything that follows has to be consistent with that framing.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "I mean, I hate to say this, and I know it might not be what you want to hear, and I could be wrong about this, but I just feel like maybe the strategy isn't quite working as well as we'd hoped, and I'm not sure if it's just me but I think some people on the team might be feeling a bit uncertain about the direction...",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I want to share something that I think is important, and I'm sharing it because I want us to get this right. The current go-to-market strategy is not working — and I can be specific about why. We've run it for 90 days across three segments and the win rate is 8% in all three. The market is telling us something. I know this is not easy to hear given how much has been invested in this direction. I'm not here to relitigate the past — I want to talk about what we do from here, and I have a specific recommendation.",
        },
      },
      anchorPhrases: [
        "Directness — Do you state the uncomfortable truth clearly, without hedging it into invisibility?",
        "Evidence — Do you back the truth with specific data or observations, not general impressions?",
        "Forward framing — Do you pivot quickly from the problem to a specific recommendation, rather than dwelling on what went wrong?",
      ],
      coachTip: "Deliver the uncomfortable truth using this four-part structure: Intent: 'I want to share something important — I'm sharing it because I want us to succeed.' → Truth: '[The uncomfortable fact, stated directly and without hedging].' → Evidence: 'Specifically: [data point 1] and [data point 2].' → Forward: 'I'm not here to look backward — here's what I'd recommend we do from here.'",
    },
  },
  {
    id: "cs-6",
    level: 6,
    title: "Influencing Without Authority",
    introHeadline: "move people and decisions without relying on a title to do it",
    introValue: "Master Influence Architecture — build alignment before the formal conversation, co-create solutions, and let commitment emerge voluntarily.",
    scenario: "The candidate needs a senior leader to support an initiative that the leader has no obligation to support. The candidate must build alignment by understanding the leader's priorities, framing their idea in terms of those priorities, and creating shared ownership of the solution.",
    interlocutorBehavior: "Not opposed, but not invested. Has their own priorities and sees no reason to take on additional ones. Opens up when someone demonstrates genuine understanding of their constraints. Resists when they feel managed or pitched to. Engages when they feel consulted.",
    interlocutor: "senior_stakeholder",
    unlockRequirement: "Complete Level 5",
    measurableObjective: "The user consults the leader's perspective before presenting their own solution, explicitly connects their goal to the leader's existing priorities, and ends the conversation with the leader making a voluntary commitment — not a pressured one.",
    anchorPhrases: [
      "Before I develop this further, I want your read on [specific question]...",
      "What you're describing aligns with [your goal] — here's how I see them connecting...",
      "How do you want to move forward?",
    ],
    methodology: {
      name: "Influence Architecture",
      tagline: "Authority is the least interesting way to get things done — and the least available one for most of your career.",
      explanation: `Authority is the least interesting way to get things done — and the least available one for most of your career. The professionals who advance fastest are the ones who learn to move people and decisions without relying on a title to do it. This is not manipulation — it's the recognition that people act on their own interests, and alignment happens when you understand those interests well enough to connect your goal to theirs.\\n\\nInfluencing a senior leader without authority requires a different approach than managing up or presenting to them. You're not asking for a decision — you're creating the conditions in which they arrive at a decision themselves. The most effective influence doesn't feel like influence. It feels like a natural conclusion.\\n\\nThe core skill of this level is **Influence Architecture**: the practice of building alignment before the formal conversation happens, framing your ideas in terms of the other person's priorities, and co-creating the solution so that the senior leader feels ownership over it — not pressure from you. People support what they help build. People resist what is done to them.`,
      pattern: {
        bad: {
          label: "What it sounds like when it doesn't work",
          script: "I really think we should move forward with this. I've put a lot of thought into it and I'm confident it's the right direction. I just need you to sign off on it so we can get started. I can send you the full analysis if you want to review it.",
        },
        good: {
          label: "What it sounds like when it works",
          script: "I wanted to get your perspective on something before I went further — I think your view on this is critical because it sits squarely in the territory you know best. I've been looking at [specific problem] and I'm seeing [specific observation]. I have some initial thinking, but I want to understand how you see the constraints before I develop it further. What's your read on what's actually driving this?",
        },
      },
      anchorPhrases: [
        "Co-creation — Do you invite the senior leader's perspective before presenting your solution, or do you present and then ask for approval?",
        "Priority alignment — Do you explicitly connect your goal to something the senior leader already cares about?",
        "Voluntary commitment — Does the conversation end with the leader making a commitment they feel they chose — not one they were maneuvered into?",
      ],
      coachTip: "Use this sequence to build influence instead of asking permission: Consult first: 'Before I develop this further, I want your read on [specific question].' → Listen fully — let them shape the framing. → Connect: 'What you're describing aligns with [your goal] — here's how I see them connecting.' → Co-create: 'What would make this work from your side? I want to build around your constraints.' → Let them close: 'How do you want to move forward?'",
    },
  },
];

/* ── Exported Paths ── */

export const PROGRESSION_PATHS: ProgressionPath[] = [
  { id: "interview", title: "Interview Mastery", icon: "🎯", levels: INTERVIEW_LEVELS },
  { id: "sales", title: "Sales Champion", icon: "💼", levels: SALES_LEVELS },
  { id: "meeting", title: "Remote Meeting Presence", icon: "📹", levels: MEETING_LEVELS },
  { id: "presentation", title: "Presentations", icon: "🎤", levels: PRESENTATION_LEVELS },
  { id: "client", title: "Client-Facing Communication", icon: "🤝", levels: CLIENT_LEVELS },
  { id: "csuite", title: "C-Suite Communication", icon: "👔", levels: CSUITE_LEVELS },
];

/* ── Feature Flag: Visible Paths in Production ──
   Set VITE_ENABLED_SCENARIOS in Vercel env to control which paths
   are shown to users. Comma-separated IDs, e.g. "interview,meeting,presentation".
   When unset (local dev), all paths are visible. */

const _enabledRaw = (import.meta.env.VITE_ENABLED_SCENARIOS as string | undefined) || "";
const ENABLED_SCENARIO_IDS = _enabledRaw.split(",").map(s => s.trim()).filter(Boolean);

/** Paths visible to users — filtered by feature flag in production */
export const VISIBLE_PATHS: ProgressionPath[] = ENABLED_SCENARIO_IDS.length > 0
  ? PROGRESSION_PATHS.filter(p => ENABLED_SCENARIO_IDS.includes(p.id))
  : PROGRESSION_PATHS;

/* ── Helpers ── */

type PathId = "interview" | "sales" | "meeting" | "presentation" | "client" | "csuite";

export function getDefaultProgressionState(): ProgressionState {
  return {
    activeGoal: "interview",
    interview: {
      "int-1": { status: "unlocked" },
      "int-2": { status: "locked" },
      "int-3": { status: "locked" },
      "int-4": { status: "locked" },
      "int-5": { status: "locked" },
      "int-6": { status: "locked" },
    },
    sales: {
      "sal-1": { status: "unlocked" },
      "sal-2": { status: "locked" },
      "sal-3": { status: "locked" },
      "sal-4": { status: "locked" },
      "sal-5": { status: "locked" },
      "sal-6": { status: "locked" },
    },
    meeting: {
      "meet-1": { status: "unlocked" },
      "meet-2": { status: "locked" },
      "meet-3": { status: "locked" },
      "meet-4": { status: "locked" },
      "meet-5": { status: "locked" },
      "meet-6": { status: "locked" },
    },
    presentation: {
      "pres-1": { status: "unlocked" },
      "pres-2": { status: "locked" },
      "pres-3": { status: "locked" },
      "pres-4": { status: "locked" },
      "pres-5": { status: "locked" },
      "pres-6": { status: "locked" },
    },
    client: {
      "cli-1": { status: "unlocked" },
      "cli-2": { status: "locked" },
      "cli-3": { status: "locked" },
      "cli-4": { status: "locked" },
      "cli-5": { status: "locked" },
      "cli-6": { status: "locked" },
    },
    csuite: {
      "cs-1": { status: "unlocked" },
      "cs-2": { status: "locked" },
      "cs-3": { status: "locked" },
      "cs-4": { status: "locked" },
      "cs-5": { status: "locked" },
      "cs-6": { status: "locked" },
    },
  };
}

export function isLevelUnlocked(state: ProgressionState, pathId: PathId, levelId: string): boolean {
  const pathState = state[pathId];
  if (!pathState) return false;
  const level = pathState[levelId];
  if (!level) return false;
  return level.status !== "locked";
}

export function getLevelState(state: ProgressionState, pathId: PathId, levelId: string): LevelState {
  const pathState = state[pathId];
  return pathState?.[levelId] ?? { status: "locked" as LevelStatus };
}

export function getNextLevelId(pathId: PathId, currentLevelId: string): string | null {
  const path = PROGRESSION_PATHS.find((p) => p.id === pathId);
  if (!path) return null;
  const idx = path.levels.findIndex((l) => l.id === currentLevelId);
  if (idx < 0 || idx >= path.levels.length - 1) return null;
  return path.levels[idx + 1].id;
}

export function getPreviousLevelId(pathId: PathId, currentLevelId: string): string | null {
  const path = PROGRESSION_PATHS.find((p) => p.id === pathId);
  if (!path) return null;
  const idx = path.levels.findIndex((l) => l.id === currentLevelId);
  if (idx <= 0) return null;
  return path.levels[idx - 1].id;
}

export function getLevelDefinition(pathId: PathId, levelId: string): ProgressionLevel | null {
  const path = PROGRESSION_PATHS.find((p) => p.id === pathId);
  if (!path) return null;
  return path.levels.find((l) => l.id === levelId) ?? null;
}

