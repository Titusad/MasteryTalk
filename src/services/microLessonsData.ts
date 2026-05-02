/**
 * ══════════════════════════════════════════════════════════════
 *  MasteryTalk PRO — Micro-Lessons Library
 *
 *  Static content for personalized skill development.
 *  Dual-axis recommendation: weakness (pillar scores) + context (path/level).
 *  50 lessons across 6 pillars + path-specific deep dives.
 * ══════════════════════════════════════════════════════════════
 */

export interface MicroLesson {
  id: string;
  pillar: string;
  title: string;
  subtitle: string;
  duration: string;
  icon: string;
  /** Paths where this lesson is contextually relevant */
  pathIds?: string[];
  /** Specific level IDs where most relevant (int-1…int-6, sal-1…sal-6, etc.) */
  levelIds?: string[];
  /** Pre-generated ElevenLabs audio, stored in R2 (optional) */
  audioUrl?: string;
  content: {
    intro: string;
    keyConcept: string;
    example: {
      context: string;
      text: string;
    };
    proTip: string;
    practicePrompt: string;
  };
  challenge: {
    instruction: string;
    weakSentence: string;
    modelAnswer: string;
  };
  recallQuestions?: Array<{ question: string; answer: string }>;
}

export const MICRO_LESSONS: MicroLesson[] = [

  /* ═══════════════════════════════════════════
     GRAMMAR  (9 lessons)
     ═══════════════════════════════════════════ */

  {
    id: "grammar-conditionals",
    pillar: "Grammar",
    title: "Conditionals for Negotiations",
    subtitle: "Sound more strategic with hypothetical framing",
    duration: "2 min",
    icon: "",
    pathIds: ["sales", "meeting"],
    content: {
      intro:
        "In executive conversations, conditionals let you propose ideas without sounding pushy. They signal strategic thinking and create space for collaboration.",
      keyConcept:
        "Use 'If we were to...' or 'Had we considered...' to frame proposals as explorations rather than demands. This shifts the dynamic from confrontation to partnership.",
      example: {
        context: "Proposing a new market expansion in a board meeting",
        text: "If we were to allocate 15% of Q3 budget to the Brazilian market, we could potentially capture the segment before competitors establish presence. Would that be worth exploring?",
      },
      proTip:
        "Mix conditional types for sophistication: 'If we launch now (Type 1), we'd gain first-mover advantage (Type 2), much like we would have in 2023 had we acted sooner (Type 3).'",
      practicePrompt:
        "In your next session, propose at least one idea using 'If we were to...' instead of 'We should...'",
    },
    challenge: {
      instruction: "Rewrite this sentence using conditional structures:",
      weakSentence: "We should invest in the Asian market because it will give us more revenue.",
      modelAnswer: "If we were to invest in the Asian market, we could potentially increase revenue by 30% within the first two years. Would that be an avenue worth exploring?",
    },
    recallQuestions: [
      { question: "What two structures frame proposals as explorations rather than demands?", answer: "'If we were to...' and 'Had we considered...' — both shift the dynamic from confrontation to collaborative exploration." },
      { question: "How do you combine conditional types for strategic sophistication?", answer: "Mix Type 1 (likely future), Type 2 (present/future hypothetical), and Type 3 (past hypothetical) in a single sentence to signal strategic depth." },
    ],
  },

  {
    id: "grammar-passive-voice",
    pillar: "Grammar",
    title: "Passive Voice for Diplomacy",
    subtitle: "Deliver tough messages without pointing fingers",
    duration: "2 min",
    icon: "",
    pathIds: ["meeting", "presentation", "culture"],
    content: {
      intro:
        "Passive voice gets a bad reputation in writing, but in executive speech it's a powerful tool for delivering difficult messages diplomatically — especially when assigning blame would be counterproductive.",
      keyConcept:
        "Use passive constructions to focus on outcomes and solutions rather than who caused the problem. 'The deadline was missed' is far more diplomatic than 'Your team missed the deadline.'",
      example: {
        context: "Addressing a project delay in a cross-functional meeting",
        text: "It appears the timeline was impacted by the scope changes introduced in Sprint 3. Moving forward, it's recommended that scope adjustments be reviewed by both teams before implementation.",
      },
      proTip:
        "Pair passive voice with forward-looking language: 'The issue has been identified, and a solution is being implemented.' This shows leadership without assigning blame.",
      practicePrompt:
        "Next session, when discussing a problem, describe it using passive voice before transitioning to active voice for the solution.",
    },
    challenge: {
      instruction: "Rewrite this sentence using passive voice to remove blame:",
      weakSentence: "Your team missed the deadline and caused the client to complain.",
      modelAnswer: "The deadline was missed, which led to some client concerns. A revised timeline has been proposed to ensure alignment going forward.",
    },
    recallQuestions: [
      { question: "What is the main strategic use of passive voice in executive communication?", answer: "It focuses on outcomes and solutions rather than who caused the problem — it removes blame while keeping the message constructive." },
      { question: "What is the recommended two-part structure when addressing a problem with passive voice?", answer: "Passive for the problem ('The deadline was missed'), then active for the solution ('A revised timeline has been proposed'). This shows leadership without assigning blame." },
    ],
  },

  {
    id: "grammar-reported-speech",
    pillar: "Grammar",
    title: "Reported Speech for Summaries",
    subtitle: "Relay decisions and quotes with authority",
    duration: "3 min",
    icon: "",
    pathIds: ["meeting", "presentation"],
    content: {
      intro:
        "In executive settings, you often need to summarize what others said — in meetings, emails, or status updates. Reported speech lets you convey information accurately without sounding like you're reading a transcript.",
      keyConcept:
        "Shift tenses back one step: 'We will launch' → 'They said they would launch.' Use reporting verbs strategically: 'suggested' (soft), 'insisted' (strong), 'confirmed' (neutral), 'recommended' (advisory).",
      example: {
        context: "Summarizing a stakeholder meeting for your team",
        text: "The VP confirmed that the budget had been approved and recommended we begin Phase 1 immediately. She suggested that we prioritize the European market, as the data indicated stronger demand there.",
      },
      proTip:
        "Choose your reporting verb carefully — it frames perception. 'She mentioned' minimizes; 'She emphasized' amplifies. The verb does the persuasion work for you.",
      practicePrompt:
        "In your next session, summarize a hypothetical meeting using at least three different reporting verbs.",
    },
    challenge: {
      instruction: "Convert these direct quotes into professional reported speech:",
      weakSentence: "The CEO said: 'We will cut 10% of the budget.' The CFO said: 'I don't agree with this decision.'",
      modelAnswer: "The CEO announced that they would reduce the budget by 10%. The CFO expressed reservations about the decision, suggesting that alternative cost-saving measures be explored first.",
    },
    recallQuestions: [
      { question: "What is the tense shift rule in reported speech?", answer: "Shift back one tense: 'will' → 'would', 'is' → 'was', 'have done' → 'had done'. The present moves into the past." },
      { question: "Name three reporting verbs with different force levels and what each signals.", answer: "'Mentioned' (minimal weight), 'confirmed' (neutral authority), 'insisted' (strong emphasis). The reporting verb does the persuasion work — choose it deliberately." },
    ],
  },

  {
    id: "grammar-relative-clauses",
    pillar: "Grammar",
    title: "Relative Clauses for Precision",
    subtitle: "Add detail without losing clarity",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "presentation"],
    content: {
      intro:
        "Relative clauses (who, which, that, where) let you pack more information into a single sentence without sounding wordy. They're the secret to sounding articulate under pressure.",
      keyConcept:
        "Use defining clauses (no commas) for essential info: 'The team that led the migration...' Use non-defining clauses (with commas) for extra context: 'Our CTO, who joined last year, proposed...' The comma changes meaning entirely.",
      example: {
        context: "Introducing a team member's achievement in a review",
        text: "Sarah, who spearheaded the cloud migration last quarter, has been nominated for the innovation award. The framework that she developed has since been adopted by three other departments.",
      },
      proTip:
        "When speaking, pause briefly where the commas are in non-defining clauses. This natural rhythm helps listeners process the extra information without getting lost.",
      practicePrompt:
        "In your next session, add context to at least two statements using 'which' or 'who' clauses.",
    },
    challenge: {
      instruction: "Combine these choppy sentences using relative clauses:",
      weakSentence: "We hired a new director. She has 15 years of experience. She will lead the expansion. The expansion targets Southeast Asia.",
      modelAnswer: "We hired a new director who has 15 years of experience and who will lead the expansion that targets Southeast Asia.",
    },
    recallQuestions: [
      { question: "What is the key difference between a defining and a non-defining relative clause?", answer: "Defining (no commas) gives essential info: 'The team that led the migration.' Non-defining (with commas) adds extra context: 'Our CTO, who joined last year...' The comma changes the meaning entirely." },
      { question: "How do you signal a non-defining relative clause in spoken English?", answer: "Pause briefly where the commas would appear in writing. This rhythm helps listeners process the additional information without losing the main point." },
    ],
  },

  {
    id: "grammar-modals",
    pillar: "Grammar",
    title: "Modal Verbs for Professional Requests",
    subtitle: "Choose the right level of politeness every time",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "meeting", "sales", "presentation", "culture"],
    content: {
      intro:
        "Modal verbs (would, could, might, should) are the key to sounding professional without being either too aggressive or too passive. In English, choosing the wrong modal can make a polite request sound like a demand — or a confident statement sound like a question.",
      keyConcept:
        "Politeness scale — from softest to firmest: 'Might we consider...' → 'Could you possibly...' → 'Would you be able to...' → 'Should we...' → 'We need to...' Match the modal to your relationship with the listener and the stakes of the request.",
      example: {
        context: "Asking a senior colleague to review your work before a deadline",
        text: "Would you be able to take a look at the proposal before Thursday? I'd really value your perspective on the executive summary. If the timing doesn't work, I could also send it to you Friday morning — whatever works best for your schedule.",
      },
      proTip:
        "Spanish speakers often over-use 'can' ('Can you do this?') which sounds abrupt in formal English. Swap 'Can you...' for 'Could you...' or 'Would you mind...' — the meaning is the same, the tone is completely different.",
      practicePrompt:
        "In your next session, make at least two requests using 'would' or 'could' instead of 'can'. Notice how it changes the dynamic.",
    },
    challenge: {
      instruction: "Rewrite these requests using appropriate modal verbs to sound more professional:",
      weakSentence: "Can you send me the report? Can you schedule a meeting? We need to talk about this.",
      modelAnswer: "Could you send me the report when you get a chance? Would it be possible to schedule a meeting this week? I'd like to discuss this — would you have 20 minutes tomorrow?",
    },
    recallQuestions: [
      { question: "Put these in order from softest to firmest: 'Would you be able to...', 'We need to...', 'Could you possibly...', 'Might we consider...'", answer: "'Might we consider...' → 'Could you possibly...' → 'Would you be able to...' → 'We need to...' Match the modal to the stakes and the relationship." },
      { question: "What is the most common modal error Spanish speakers make, and what should you use instead?", answer: "Over-using 'Can you...?' which sounds abrupt. Replace with 'Could you...?' or 'Would you mind...?' — same meaning, significantly more professional tone." },
    ],
  },

  {
    id: "grammar-articles",
    pillar: "Grammar",
    title: "Articles in Business English",
    subtitle: "Master a/an/the — the #1 pain point for Spanish speakers",
    duration: "3 min",
    icon: "",
    pathIds: ["interview", "meeting", "sales", "presentation", "culture"],
    content: {
      intro:
        "Articles (a, an, the) don't exist in Spanish the same way they do in English. This makes them the most common grammatical error for LATAM professionals — and one that native speakers notice immediately. The good news: there are clear rules that cover 90% of cases.",
      keyConcept:
        "Three rules to memorize: (1) First mention = 'a/an': 'I have a proposal.' (2) Second mention = 'the': 'The proposal covers three scenarios.' (3) Unique things = 'the': 'the CEO', 'the Q3 budget', 'the strategy.' No article for general concepts: 'Business is competitive.' Not: 'The business is competitive.'",
      example: {
        context: "Introducing a project proposal in a meeting",
        text: "I'd like to present a proposal for the Q3 initiative. The proposal focuses on three key markets. I believe the approach we're recommending will give us a competitive advantage in the region. Market conditions are favorable right now — this is the right moment to act.",
      },
      proTip:
        "When in doubt about 'a' vs 'the': ask yourself 'does the listener know which specific one I mean?' If yes → 'the'. If it's any one of many → 'a'. If it's a concept in general → no article.",
      practicePrompt:
        "Record yourself speaking for 30 seconds about a work topic. Listen back specifically for article usage. Did you add 'the' where it wasn't needed? Did you omit 'a' at first mentions?",
    },
    challenge: {
      instruction: "Add the correct articles (a, an, the, or nothing) to complete this paragraph:",
      weakSentence: "We had ___ meeting yesterday with ___ CEO of ___ startup. ___ startup is developing ___ AI platform for ___ healthcare industry. ___ platform could transform how ___ hospitals manage ___ patient data.",
      modelAnswer: "We had a meeting yesterday with the CEO of a startup. The startup is developing an AI platform for the healthcare industry. The platform could transform how hospitals manage patient data.",
    },
    recallQuestions: [
      { question: "What are the three core rules for using a/an, the, or no article?", answer: "First mention = 'a/an'. Second mention of the same thing = 'the'. Unique or specific things = 'the'. General concepts (no specific referent) = no article." },
      { question: "How do you decide in real time between 'the' and 'a'?", answer: "Ask: 'Does my listener know which specific one I mean?' Yes → 'the'. No (any one of many) → 'a'. It's a general concept → no article." },
    ],
  },

  {
    id: "grammar-questions",
    pillar: "Grammar",
    title: "Question Forms: Direct vs. Indirect",
    subtitle: "Ask questions that open doors, not put people on the spot",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "meeting", "sales"],
    content: {
      intro:
        "In professional English, HOW you ask is as important as WHAT you ask. Direct questions ('What's your budget?') can feel abrupt or aggressive. Indirect questions ('Could you give me a sense of the budget range?') are perceived as more collaborative and tactful.",
      keyConcept:
        "Transform direct questions into indirect ones with these openers: 'Could you tell me...', 'Would you mind clarifying...', 'I was wondering if you could...', 'Do you happen to know...' Note: after these openers, use statement word order — NOT question order. ✅ 'Could you tell me what the timeline is?' ❌ 'Could you tell me what is the timeline?'",
      example: {
        context: "Gathering information from a potential client during a discovery call",
        text: "I was wondering if you could give me a sense of your current process. Could you tell me what's working well and what's creating friction? And would you be able to share what success would look like for you in the next 6 months?",
      },
      proTip:
        "The word order mistake is the most common error: after indirect openers, Spanish speakers instinctively use question order. Drill this pattern: 'Could you tell me + subject + verb' (not 'Could you tell me + verb + subject').",
      practicePrompt:
        "In your next session, ask at least three questions using indirect forms. Avoid starting with 'What is...', 'Why are...', or 'How does...' — convert them to indirect.",
    },
    challenge: {
      instruction: "Convert these direct questions into professional indirect questions:",
      weakSentence: "What is your budget? Why did you choose this approach? How many people are in your team?",
      modelAnswer: "Could you give me a sense of the budget range? I was wondering if you could walk me through why you chose this approach. Would you mind telling me how many people are on your team?",
    },
    recallQuestions: [
      { question: "What word order error must you avoid after indirect question openers like 'Could you tell me...'?", answer: "After those openers, use statement order (subject + verb), NOT question order. ✅ 'Could you tell me what the timeline is?' ❌ 'Could you tell me what is the timeline?'" },
      { question: "Name three indirect question openers you can use instead of starting directly with 'What is...?'", answer: "'Could you tell me...', 'Would you mind clarifying...', 'I was wondering if you could...' — any opener that softens the question into a collaborative request." },
    ],
  },

  {
    id: "grammar-tense",
    pillar: "Grammar",
    title: "Tense Consistency in Professional Speech",
    subtitle: "Keep your narrative clear by staying in the right time frame",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "presentation"],
    content: {
      intro:
        "One of the most common errors among non-native English speakers is switching tenses mid-sentence or mid-story. This creates confusion about what happened when, and makes you sound less credible — even when your content is excellent.",
      keyConcept:
        "Set your time frame at the start and stay in it: Past narrative (interview stories): use simple past throughout — 'I led... we decided... the outcome was...' Present situation: use present simple/continuous — 'The team is working on... we focus on...' Future plans: use 'will' or 'going to' consistently — don't mix them.",
      example: {
        context: "Telling a STAR story in an interview (all past tense)",
        text: "✅ Consistent: 'I was leading a product launch when the main vendor failed to deliver. I decided to bring production in-house, assembled a team of five, and we shipped on time. The launch exceeded targets by 22%.' ❌ Inconsistent: 'I was leading the launch and the vendor fails to deliver. I decided to bring it in-house and we ship on time.'",
      },
      proTip:
        "Before any presentation or interview story, decide your time frame: 'This is a PAST story' or 'This is PRESENT situation.' Write it on a mental sticky note. Every verb must match that frame.",
      practicePrompt:
        "In your next interview practice session, tell one STAR story. Record it and listen back specifically for tense shifts. Did you accidentally switch to present tense mid-story?",
    },
    challenge: {
      instruction: "Fix the tense inconsistencies in this interview story (make it all past tense):",
      weakSentence: "I was managing the project when the client changes the requirements. I have to reorganize the team and we work through the weekend. In the end, we deliver the project on time.",
      modelAnswer: "I was managing the project when the client changed the requirements. I had to reorganize the team, and we worked through the weekend. In the end, we delivered the project on time.",
    },
    recallQuestions: [
      { question: "What is the most common tense error in STAR-format interview stories?", answer: "Switching from past to present mid-story: 'I was leading the project when the client changes the requirements.' Every verb in a past narrative must stay in simple past throughout." },
      { question: "What is the 'mental sticky note' technique for tense consistency?", answer: "Before any story, decide your time frame ('This is a PAST story') and commit every verb to it. Every verb must match that frame before it comes out." },
    ],
  },

  {
    id: "grammar-prepositions",
    pillar: "Grammar",
    title: "Prepositions in Business English",
    subtitle: "Avoid the most common interference errors from Spanish",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "meeting", "sales", "presentation", "culture"],
    content: {
      intro:
        "Prepositions (in, on, at, for, with, to) are the most unpredictable part of English — and the most affected by Spanish interference. There's no perfect logic; these must be memorized as fixed phrases.",
      keyConcept:
        "High-frequency business prepositions: Time: 'in the morning/afternoon', 'on Monday', 'at 3pm', 'in Q3', 'by the deadline'. Business phrases: 'responsible FOR', 'experienced IN', 'in charge OF', 'result IN', 'depend ON', 'agree WITH', 'invest IN', 'focus ON'. ❌ Spanish interference: 'responsible OF', 'agree TO this', 'invest ON'.",
      example: {
        context: "Describing your role and responsibilities in an interview",
        text: "In my previous role, I was responsible for the product roadmap and in charge of a team of eight. I focused on growth metrics and worked closely with the engineering team. By the end of Q3, we had invested in three new features that resulted in a 30% increase in retention.",
      },
      proTip:
        "When you're unsure of a preposition, choose the whole phrase, not just the word. Don't think 'what preposition goes here?' — think 'what is the fixed phrase?' 'interested IN something' is one phrase. Learn it as a unit.",
      practicePrompt:
        "In your next session, use at least five of these phrases: responsible for, focused on, in charge of, experienced in, result in, depend on, agree with.",
    },
    challenge: {
      instruction: "Fix the incorrect prepositions in these business sentences:",
      weakSentence: "I'm responsible of the strategy. We depend of the client's approval. I agree to your proposal. The change resulted on a 20% improvement.",
      modelAnswer: "I'm responsible for the strategy. We depend on the client's approval. I agree with your proposal. The change resulted in a 20% improvement.",
    },
    recallQuestions: [
      { question: "Fix these four preposition errors: 'responsible OF', 'depend OF', 'agree TO', 'result ON'", answer: "'Responsible FOR', 'depend ON', 'agree WITH', 'result IN' — these are fixed phrases. The preposition is part of the phrase, not a separate word choice." },
      { question: "What strategy helps you remember prepositions instead of guessing each time?", answer: "Learn the whole fixed phrase as a unit, not the preposition alone. Don't think 'what preposition?' — think 'what is the complete phrase?' 'Interested IN something' is one chunk. Learn it as a unit." },
    ],
  },

  /* ═══════════════════════════════════════════
     VOCABULARY  (6 lessons)
     ═══════════════════════════════════════════ */

  {
    id: "vocab-power-verbs",
    pillar: "Vocabulary",
    title: "Power Verbs for Leadership",
    subtitle: "Replace weak verbs with executive-level language",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "presentation", "sales"],
    content: {
      intro:
        "The verbs you choose signal your level of authority. Leaders don't 'do things' — they spearhead, orchestrate, and drive results. Swapping basic verbs for power verbs instantly elevates your presence.",
      keyConcept:
        "Replace generic verbs with high-impact alternatives: 'made' → 'engineered', 'helped' → 'empowered', 'did' → 'executed', 'started' → 'spearheaded', 'changed' → 'transformed'.",
      example: {
        context: "Describing your role in a successful project during an interview",
        text: "I spearheaded the digital transformation initiative, orchestrating a cross-functional team of 12 and driving a 40% reduction in operational costs within the first quarter.",
      },
      proTip:
        "Keep a mental 'power verb palette': Spearhead, Orchestrate, Drive, Champion, Cultivate, Architect. Pick one you haven't used and deliberately work it into your next conversation.",
      practicePrompt:
        "In your next practice, ban the words 'do', 'make', 'help', and 'start'. Force yourself to use stronger alternatives.",
    },
    challenge: {
      instruction: "Rewrite this sentence replacing weak verbs with power verbs:",
      weakSentence: "I helped my team do the project on time and we started a new process that made things better.",
      modelAnswer: "I empowered my team to deliver the project ahead of schedule and spearheaded a new process that transformed our operational efficiency.",
    },
    recallQuestions: [
      { question: "Replace these weak verbs with power verbs: 'started a project', 'helped the team', 'made things better'", answer: "'Spearheaded a project', 'empowered the team', 'transformed performance' — power verbs signal authority and specificity without adding words." },
      { question: "Name the six verbs from the power verb palette in this lesson.", answer: "Spearhead, Orchestrate, Drive, Champion, Cultivate, Architect. Pick one you haven't used and deliberately work it into your next conversation." },
    ],
  },

  {
    id: "vocab-hedging",
    pillar: "Vocabulary",
    title: "Hedging Language for Diplomacy",
    subtitle: "Express opinions confidently without sounding aggressive",
    duration: "2 min",
    icon: "",
    pathIds: ["meeting", "culture"],
    content: {
      intro:
        "Hedging language softens assertions while maintaining authority. In multicultural business settings, it's essential for building consensus without alienating colleagues.",
      keyConcept:
        "Use modal verbs and softening phrases: 'might consider', 'it seems that', 'from my perspective', 'I'd suggest we explore'. These show confidence while inviting input.",
      example: {
        context: "Disagreeing with a senior colleague's strategy proposal",
        text: "That's an interesting approach. From my perspective, we might also consider the impact on our existing client base. It seems that a phased rollout could mitigate that risk while still capturing the opportunity.",
      },
      proTip:
        "The strongest executives hedge strategically — they use soft language for opinions but direct language for facts and data. 'Revenue dropped 12% (direct). I'd suggest this indicates we need to reconsider our approach (hedged).'",
      practicePrompt:
        "Practice disagreeing with the AI interlocutor using 'I see your point, however...' or 'From my perspective...' instead of 'No, I think...'",
    },
    challenge: {
      instruction: "Rewrite this direct disagreement using hedging language:",
      weakSentence: "No, you're wrong. We need to focus on retention, not acquisition.",
      modelAnswer: "That's an interesting perspective. From my standpoint, we might want to consider prioritizing retention, as it seems our churn rate could be impacting growth more than acquisition gaps.",
    },
    recallQuestions: [
      { question: "When should you hedge, and when should you be direct?", answer: "Hedge for opinions and suggestions. Be direct for facts and data. 'Revenue dropped 12%' (direct) + 'I'd suggest this indicates we need to reconsider' (hedged) is the executive pattern." },
      { question: "Why is 'and' more powerful than 'but' when introducing a counterpoint diplomatically?", answer: "'But' negates everything before it. 'And' keeps both ideas alive and signals you're adding to the conversation rather than rejecting the other view." },
    ],
  },

  {
    id: "vocab-collocations",
    pillar: "Vocabulary",
    title: "Business Collocations",
    subtitle: "Sound natural with word partnerships",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "meeting", "sales", "presentation", "culture"],
    content: {
      intro:
        "Native speakers use fixed word combinations called collocations. Saying 'make a decision' (not 'do a decision') or 'reach an agreement' (not 'arrive to an agreement') instantly signals fluency.",
      keyConcept:
        "Master the top 20 business collocations: 'conduct research', 'implement a strategy', 'meet a deadline', 'raise concerns', 'allocate resources', 'launch an initiative', 'drive results', 'submit a proposal', 'address an issue', 'generate revenue'.",
      example: {
        context: "Discussing project progress in a leadership meeting",
        text: "We've conducted extensive market research and are ready to submit our proposal. The team met the Q3 deadline ahead of schedule, and we've already allocated resources to launch the next initiative.",
      },
      proTip:
        "When learning a new business word, always learn what goes WITH it. Don't just learn 'deadline' — learn 'meet a deadline', 'miss a deadline', 'extend a deadline', 'set a deadline'.",
      practicePrompt:
        "Pick 5 collocations from the list above and use each one naturally in your next session.",
    },
    challenge: {
      instruction: "Fix the incorrect collocations in this paragraph:",
      weakSentence: "We need to do a decision about the budget. The team should make research on this topic and arrive to an agreement before the meeting.",
      modelAnswer: "We need to make a decision about the budget. The team should conduct research on this topic and reach an agreement before the meeting.",
    },
    recallQuestions: [
      { question: "Fix these collocations: 'do a decision', 'make research', 'arrive to an agreement'", answer: "'Make a decision', 'conduct research', 'reach an agreement' — these are fixed word partnerships that native speakers use automatically." },
      { question: "What is the most effective strategy for learning collocations?", answer: "Learn the whole phrase as a unit, not just the noun. Don't just learn 'deadline' — learn 'meet a deadline', 'miss a deadline', 'extend a deadline', 'set a deadline.'" },
    ],
  },

  {
    id: "vocab-transition-phrases",
    pillar: "Vocabulary",
    title: "Transition Phrases for Flow",
    subtitle: "Connect ideas like a seasoned speaker",
    duration: "2 min",
    icon: "",
    pathIds: ["presentation", "meeting"],
    content: {
      intro:
        "Transitions are the glue between ideas. Without them, even good points sound disconnected. Executive speakers use transitions to guide listeners through their logic seamlessly.",
      keyConcept:
        "Build a toolkit: Adding ('Furthermore', 'Moreover'), Contrasting ('However', 'That said'), Consequencing ('As a result', 'Consequently'), Sequencing ('To begin with', 'Moving forward'), Emphasizing ('In fact', 'What's critical here is').",
      example: {
        context: "Building a case for a new product line in a strategy meeting",
        text: "Our core market is plateauing. However, our brand recognition gives us a unique advantage. Furthermore, our R&D team has already prototyped two viable options. As a result, I believe this is the ideal window to diversify. What's critical here is that we move before Q2.",
      },
      proTip:
        "Don't use the same transition twice in a row. Vary between 'However', 'That said', 'On the other hand', and 'Nevertheless' to sound polished, not repetitive.",
      practicePrompt:
        "In your next session, use at least 4 different transition phrases to connect your ideas.",
    },
    challenge: {
      instruction: "Add appropriate transition phrases to connect these abrupt statements:",
      weakSentence: "Revenue grew 15%. Costs increased 20%. We need to act. I suggest reducing vendor expenses.",
      modelAnswer: "Revenue grew 15% last quarter. However, costs increased by 20% in the same period. Consequently, we need to act decisively. To that end, I'd suggest we begin by reducing vendor expenses.",
    },
    recallQuestions: [
      { question: "Give one transition phrase for each function: adding information, showing contrast, expressing consequence.", answer: "Adding: 'Furthermore' or 'Moreover'. Contrasting: 'However' or 'That said'. Consequence: 'As a result' or 'Consequently'." },
      { question: "Why should you avoid using the same transition phrase twice in a row?", answer: "It sounds repetitive and signals limited vocabulary range. Vary between synonyms — 'However', 'That said', 'On the other hand', 'Nevertheless' — for a polished, professional flow." },
    ],
  },

  {
    id: "vocab-numbers",
    pillar: "Vocabulary",
    title: "Numbers, Data & Statistics Language",
    subtitle: "Present figures naturally and persuasively",
    duration: "2 min",
    icon: "",
    pathIds: ["presentation", "sales", "meeting"],
    content: {
      intro:
        "How you say a number matters as much as the number itself. Native speakers frame data with specific language that adds context, credibility, and persuasion. 'Sales went up' is forgettable. 'Sales surged by roughly 40% — nearly double our Q2 target' is not.",
      keyConcept:
        "Five data framing patterns: (1) Approximation: 'roughly', 'approximately', 'nearly', 'around', 'just under'. (2) Comparison: 'double', 'triple', 'half', 'four times'. (3) Trend: 'surged', 'plummeted', 'plateaued', 'rebounded'. (4) Context: 'beating the industry average by...', 'ahead of schedule by...'. (5) Implication: 'which means...', 'which translates to...'",
      example: {
        context: "Presenting quarterly results to leadership",
        text: "Customer acquisition cost dropped by roughly 28% — nearly a third lower than our Q2 figures and well below the industry average. This translates to approximately $400K in recovered margin, which positions us to reinvest in growth without increasing the budget.",
      },
      proTip:
        "You don't need exact numbers to sound credible. 'Roughly 30%' said confidently outperforms '27.3%' said hesitantly. The framing communicates authority; the precision is secondary.",
      practicePrompt:
        "In your next session, present at least one data point using an approximation word AND a trend verb ('surged', 'dropped', 'grew', 'declined').",
    },
    challenge: {
      instruction: "Rewrite this flat data statement using framing language (approximation + comparison + implication):",
      weakSentence: "We got 500 new users. Last quarter we had 300.",
      modelAnswer: "We acquired roughly 500 new users this quarter — nearly double our Q3 figures. That growth translates to a significantly stronger pipeline heading into the new year.",
    },
    recallQuestions: [
      { question: "Name the five data framing patterns from this lesson.", answer: "(1) Approximation: 'roughly', 'nearly'. (2) Comparison: 'double', 'triple'. (3) Trend: 'surged', 'plummeted'. (4) Context: 'beating the industry average by...'. (5) Implication: 'which means...', 'which translates to...'" },
      { question: "Why does 'roughly 30%' said confidently outperform '27.3%' said hesitantly?", answer: "The framing and delivery communicate authority — the precision of the number is secondary. Approximate with confidence rather than hedge with false precision." },
    ],
  },

  {
    id: "vocab-action-verbs",
    pillar: "Vocabulary",
    title: "Action Verbs for Impact",
    subtitle: "Verbs that make reports, emails, and updates land harder",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "presentation", "sales"],
    content: {
      intro:
        "In written-to-spoken communication — presenting a report, summarizing an update, discussing results — the verbs you choose determine whether your message sounds passive or authoritative. Most non-native speakers default to 'we did', 'we had', 'we made'. These are invisible verbs. High-impact verbs are memorable.",
      keyConcept:
        "Replace these invisible verbs: 'had results' → 'delivered results', 'made progress' → 'advanced the initiative', 'did the analysis' → 'completed/executed the analysis', 'showed growth' → 'demonstrated/achieved growth', 'worked on' → 'drove/led/managed', 'tried to' → 'pursued/aimed to/sought to'.",
      example: {
        context: "Presenting a project update to the executive team",
        text: "This quarter, we executed a full competitive analysis, identified three high-potential segments, and secured partnerships with two strategic vendors. We delivered the platform migration ahead of schedule, which accelerated our go-to-market timeline by six weeks.",
      },
      proTip:
        "Build a 'verb upgrade list' specific to your role. If you work in product: swap 'made a feature' for 'shipped', 'launched', 'deployed'. In sales: 'talked to clients' → 'engaged', 'qualified', 'closed'.",
      practicePrompt:
        "In your next session, avoid 'we did', 'we had', and 'we made'. Replace every instance with a specific action verb.",
    },
    challenge: {
      instruction: "Replace every weak verb in this update with a high-impact action verb:",
      weakSentence: "We did a market analysis and had good results. We also made a new partnership and worked on improving our retention rate.",
      modelAnswer: "We executed a market analysis and delivered strong results. We also secured a new strategic partnership and drove a significant improvement in our retention rate.",
    },
    recallQuestions: [
      { question: "Replace these invisible verbs: 'we had results', 'we worked on it', 'we tried to improve'", answer: "'We delivered results', 'we drove/led/managed it', 'we pursued improvement' — specific action verbs signal ownership and are memorable to listeners." },
      { question: "What is a 'verb upgrade list' and why should you build a role-specific one?", answer: "A personalized list of strong verbs for your field. Generic upgrades don't stick — role-specific ones do. In product: 'shipped', 'launched', 'deployed'. In sales: 'engaged', 'qualified', 'closed'." },
    ],
  },

  /* ═══════════════════════════════════════════
     FLUENCY  (6 lessons)
     ═══════════════════════════════════════════ */

  {
    id: "fluency-fillers",
    pillar: "Fluency",
    title: "Eliminating Filler Words",
    subtitle: "Replace 'um' and 'like' with strategic pauses",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "presentation", "meeting", "sales", "culture"],
    content: {
      intro:
        "Filler words ('um', 'uh', 'like', 'you know', 'basically') undermine your authority. Research shows that speakers who pause instead of filling silence are perceived as more confident and thoughtful.",
      keyConcept:
        "The fix isn't to speak faster — it's to embrace the pause. A 1-2 second silence feels natural to listeners and gives you time to formulate your next point. Replace every filler with a deliberate breath.",
      example: {
        context: "Answering 'What's your management style?' in an interview",
        text: "My approach centers on empowerment. [pause] I set clear expectations and then give my team the autonomy to execute. [pause] The results speak for themselves — my last team exceeded targets by 23%.",
      },
      proTip:
        "Record yourself for 30 seconds answering any question. Count your fillers. Most people average 5-8 per minute. Aim for under 2. The awareness alone reduces them by 50%.",
      practicePrompt:
        "In your next session, consciously pause for 1 second before answering each question. Notice how it reduces filler words naturally.",
    },
    challenge: {
      instruction: "Rewrite this response removing all filler words and adding strategic pauses (use [pause]):",
      weakSentence: "So basically, um, my management style is like, you know, I try to help people and, uh, give them space to do their thing.",
      modelAnswer: "My management style centers on empowerment. [pause] I set clear expectations upfront, then give my team the autonomy to execute. The results speak for themselves.",
    },
    recallQuestions: [
      { question: "What is the correct replacement for 'um', 'uh', and 'like' in professional speech?", answer: "A deliberate 1–2 second pause. Silence signals confidence and thoughtfulness; filler words signal hesitation and undermine authority." },
      { question: "What is the fastest way to become aware of your filler word frequency?", answer: "Record yourself for 30 seconds answering any question and count them. Most people average 5–8 per minute. The awareness alone typically reduces fillers by 50%." },
    ],
  },

  {
    id: "fluency-thought-grouping",
    pillar: "Fluency",
    title: "Thought Grouping & Pausing",
    subtitle: "Structure your speech for maximum clarity",
    duration: "2 min",
    icon: "",
    pathIds: ["presentation", "interview"],
    content: {
      intro:
        "Native speakers naturally group words into 'thought groups' — meaningful chunks separated by micro-pauses. This rhythm makes speech easier to follow and more persuasive.",
      keyConcept:
        "Break sentences into 3-5 word groups separated by brief pauses. Each group should contain one idea unit: 'Our revenue increased | by twenty percent | in the last quarter | driven by expansion | into three new markets.'",
      example: {
        context: "Presenting quarterly results to stakeholders",
        text: "What we've seen this quarter | is significant momentum | across all key metrics. | Revenue grew by eighteen percent, | customer retention improved, | and we successfully launched | in two new regions.",
      },
      proTip:
        "Use 'landmark pauses' before key numbers and after important claims. 'We achieved... [pause] a forty percent improvement.' The pause creates anticipation and emphasis.",
      practicePrompt:
        "Read this example aloud three times, pausing where the | marks are. Then try the same rhythm with your own content in your next session.",
    },
    challenge: {
      instruction: "Add thought group markers (|) to break this long sentence into natural speaking chunks:",
      weakSentence: "Our revenue increased by twenty percent in the last quarter driven by expansion into three new markets and improved customer retention.",
      modelAnswer: "Our revenue increased | by twenty percent | in the last quarter | driven by expansion | into three new markets | and improved customer retention.",
    },
    recallQuestions: [
      { question: "What is a thought group, and how many words should it typically contain?", answer: "A meaningful chunk of speech separated by micro-pauses — typically 3–5 words per group. Each group should carry one idea unit." },
      { question: "What is a 'landmark pause' and when do you use it?", answer: "A deliberate pause before a key number or after an important claim: 'We achieved... [pause] a forty percent improvement.' It creates anticipation and emphasis." },
    ],
  },

  {
    id: "fluency-rhythm",
    pillar: "Fluency",
    title: "Speech Rhythm & Cadence",
    subtitle: "Vary your pace to hold attention",
    duration: "3 min",
    icon: "",
    pathIds: ["presentation", "interview"],
    content: {
      intro:
        "Monotone delivery is the fastest way to lose an audience. Great speakers vary their speed, volume, and emphasis to create a rhythm that keeps listeners engaged.",
      keyConcept:
        "Use three speeds: Normal pace for context, Slow pace for key points (this signals importance), Fast pace for lists and supporting details (this builds energy). The contrast between speeds is what creates impact.",
      example: {
        context: "Presenting a quarterly initiative to the board",
        text: "[Normal] Our team analyzed three potential markets this quarter. [Slow] The most promising opportunity... is Brazil. [Fast] The data shows growing demand, lower competition, and strong brand awareness in the region. [Normal] Here's what I'm proposing we do next.",
      },
      proTip:
        "Before important phrases, drop your speed AND your pitch slightly. Then deliver the key phrase slowly. 'After months of analysis... [slow, lower pitch] we found our answer.' This creates a dramatic effect that commands attention.",
      practicePrompt:
        "In your next practice, deliberately speed up for supporting details and slow down for your main points.",
    },
    challenge: {
      instruction: "Mark this text with [slow], [normal], or [fast] to create engaging rhythm:",
      weakSentence: "We need to enter the European market. Our research shows demand is growing. Germany, France, and Spain all show potential. The window of opportunity is closing.",
      modelAnswer: "[Normal] We need to enter the European market. [Normal] Our research shows demand is growing. [Fast] Germany, France, and Spain all show strong potential. [Slow] But the window of opportunity... is closing.",
    },
    recallQuestions: [
      { question: "Name the three speaking speeds and when you should use each.", answer: "Normal pace for context and background, slow pace for key points (signals importance), fast pace for lists and supporting details (builds energy)." },
      { question: "What two things should you do just before delivering a key phrase for maximum impact?", answer: "Drop your speed AND lower your pitch slightly before the phrase, then deliver it slowly. The combination of reduced speed and lower pitch commands attention more effectively than volume alone." },
    ],
  },

  {
    id: "fluency-self-repair",
    pillar: "Fluency",
    title: "Graceful Self-Correction",
    subtitle: "Recover from mistakes without losing credibility",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "meeting", "sales", "presentation", "culture"],
    content: {
      intro:
        "Every speaker makes mistakes. What separates professionals from amateurs is how they handle them. Graceful self-correction can actually increase your credibility by showing awareness and honesty.",
      keyConcept:
        "Three repair strategies: (1) Quick replace: 'We saw a 20 — sorry — 30% increase.' (2) Reframe: 'Let me rephrase that...' (3) Clarify forward: 'What I mean is...' Never apologize excessively or draw attention to minor slips.",
      example: {
        context: "Correcting yourself during a board presentation",
        text: "We're expecting to close 15 — actually, let me be precise — 18 new accounts this quarter. What I mean is, the pipeline is stronger than initially projected, and our conversion rate has improved significantly.",
      },
      proTip:
        "The magic phrase is 'Let me put that differently.' It buys you time, sounds intentional, and resets listener expectations. Use it instead of 'Sorry, I made a mistake.'",
      practicePrompt:
        "Intentionally make a 'mistake' in your next session and practice recovering with 'Let me rephrase that' or 'What I mean is...'",
    },
    challenge: {
      instruction: "Rewrite this panicked correction to sound confident and natural:",
      weakSentence: "Our revenue was — oh wait, sorry, I said that wrong. I'm sorry. Let me start over. So, um, revenue was actually $3M, not $2M. Sorry about that confusion.",
      modelAnswer: "Our revenue came in at — let me be precise — $3M this quarter, exceeding our initial projection of $2M. What this means for us is a significantly stronger position going into Q4.",
    },
    recallQuestions: [
      { question: "Name the three repair strategies from this lesson for correcting yourself mid-speech.", answer: "(1) Quick replace: 'We saw a 20 — sorry — 30% increase.' (2) Reframe: 'Let me rephrase that...' (3) Clarify forward: 'What I mean is...'" },
      { question: "What is the 'magic phrase' from this lesson, and why is it better than apologizing?", answer: "'Let me put that differently.' It buys thinking time, sounds intentional rather than reactive, and resets the listener's attention — without drawing attention to a mistake." },
    ],
  },

  {
    id: "fluency-thinking",
    pillar: "Fluency",
    title: "Managing Thinking Time Gracefully",
    subtitle: "Buy time without sounding lost",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "meeting", "sales", "presentation", "culture"],
    content: {
      intro:
        "Every professional needs thinking time — even native speakers. The difference is HOW you buy that time. Silence can signal confidence. Filler-filled hesitation signals panic. The right bridging phrases let you think while sounding composed.",
      keyConcept:
        "Three levels of buying time: (1) Quick bridge (1-2 sec): 'That's a great question.', 'Let me think about that for a moment.' (2) Strategic redirect (3-5 sec): 'I want to make sure I give you a complete answer — could you clarify what aspect you're most interested in?' (3) Honest bridge: 'I don't have that number off the top of my head — I'll confirm and follow up. What I can tell you now is...'",
      example: {
        context: "Answering an unexpected question in an interview",
        text: "'What's your greatest professional failure?' [pause] That's a question I want to answer thoughtfully. [pause] Let me think of the most instructive example... [pause] About two years ago, I led a product launch that missed the mark significantly. Here's what happened and what I learned from it.",
      },
      proTip:
        "Silence is not the enemy. A 3-second pause before answering a hard question looks like careful thought, not confusion. Practice pausing without filling the silence — it's harder than it sounds.",
      practicePrompt:
        "In your next session, when the AI asks a difficult question, pause for 2 seconds before answering. Use one bridging phrase. Do NOT say 'um' or 'uh' during the pause.",
    },
    challenge: {
      instruction: "Rewrite this panicked stall using a professional thinking-time strategy:",
      weakSentence: "Uh, well, I'm not sure, um... I mean, I guess... let me think... I don't really know how to answer that.",
      modelAnswer: "That's a question I want to answer carefully. [pause] Let me make sure I give you the most relevant example. [pause] I'd say the most significant challenge I've faced was...",
    },
    recallQuestions: [
      { question: "Name the three levels of buying thinking time in professional speech.", answer: "(1) Quick bridge (1–2 sec): 'Let me think about that.' (2) Strategic redirect (3–5 sec): ask a clarifying question to buy time. (3) Honest bridge: 'I don't have that number off the top of my head — what I can tell you now is...'" },
      { question: "Why does a 3-second pause before a hard answer look like confidence rather than confusion?", answer: "It signals that you're considering your answer carefully — that it deserves thought. Filling the silence immediately signals anxiety. Listeners interpret deliberate pauses as depth." },
    ],
  },

  {
    id: "fluency-reformulate",
    pillar: "Fluency",
    title: "Reformulating When You Lose the Thread",
    subtitle: "Recover confidently when your train of thought derails",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "meeting", "presentation", "sales"],
    content: {
      intro:
        "Every speaker loses their train of thought sometimes — especially in a second language under pressure. The professionals who handle it best don't try to pick up exactly where they left off. They pivot cleanly and keep moving.",
      keyConcept:
        "Four recovery moves: (1) Anchor back: 'Let me step back — my main point was...' (2) Summarize and continue: 'In short, what I'm getting at is...' (3) Bridge forward: 'The important thing here is...' (4) Ask for help: 'I want to make sure I'm addressing what you need — what's most important to you about this?'",
      example: {
        context: "Mid-presentation when you realize you've gone off-track",
        text: "...and the vendor selection process involved — actually, let me step back. My main point is that the timeline is achievable. The key factors supporting that are: vendor readiness, team capacity, and the phase-gate approach we've designed. Let me address each of those.",
      },
      proTip:
        "The fastest recovery is also the most honest: 'I want to make sure I'm being clear — let me put it more directly.' This sounds intentional, not lost. It also resets the listener's attention.",
      practicePrompt:
        "In your next session, deliberately start an answer, let yourself 'get lost', then use one of the four recovery moves to land cleanly.",
    },
    challenge: {
      instruction: "Rewrite this rambling recovery using a clean reformulation strategy:",
      weakSentence: "So we were talking about the process and then we had the budget issue and... um... I forgot where I was going with this... anyway, we also had some other things...",
      modelAnswer: "Let me step back — my main point is that the project had two key challenges: the budget constraint and the timeline. Let me take those one at a time.",
    },
    recallQuestions: [
      { question: "Name the four recovery moves for when you lose your train of thought.", answer: "(1) Anchor back: 'Let me step back — my main point was...' (2) Summarize: 'In short, what I'm getting at is...' (3) Bridge forward: 'The important thing here is...' (4) Ask for direction: 'What's most important to you about this?'" },
      { question: "What is the 'fastest recovery' phrase from this lesson, and why does it work?", answer: "'I want to make sure I'm being clear — let me put it more directly.' It sounds intentional rather than lost, and frames the restart as precision rather than confusion." },
    ],
  },

  /* ═══════════════════════════════════════════
     PRONUNCIATION  (4 lessons)
     ═══════════════════════════════════════════ */

  {
    id: "pron-stress-patterns",
    pillar: "Pronunciation",
    title: "Word Stress in Business English",
    subtitle: "Sound natural by stressing the right syllables",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "presentation", "meeting", "sales", "culture"],
    content: {
      intro:
        "Incorrect word stress is one of the most common markers of non-native speech. Stressing the wrong syllable can make familiar words sound unrecognizable to native speakers.",
      keyConcept:
        "Business English has predictable stress patterns: words ending in '-tion' stress the syllable before (preSENtation, negoTIAtion). Words ending in '-ity' do the same (opporTUNity, producTIVity). Verbs and nouns from the same root often shift stress (to preSENT → a PREsent).",
      example: {
        context: "Key business words with correct stress (capitals = stressed)",
        text: "Let me share our straTEgic reCOMmendations. The opporTUNity for develOPment in this market is sigNIFicant, and our preSENtation deMONstrates the poTENtial return on inVESTment.",
      },
      proTip:
        "Before a big meeting, identify 5 key words you'll use and verify their stress pattern. Practice saying them in sentences, not isolation. Stress errors in context sound much worse than when practicing single words.",
      practicePrompt:
        "In your next session, pay attention to words ending in -tion, -ity, and -ment. Exaggerate the stressed syllable slightly to build the habit.",
    },
    challenge: {
      instruction: "Mark the stressed syllable in CAPS for each business word:",
      weakSentence: "presentation, opportunity, development, significant, demonstrate, investment",
      modelAnswer: "preSENtation, opporTUNity, develOPment, sigNIFicant, deMONstrate, inVESTment",
    },
    recallQuestions: [
      { question: "What stress pattern do words ending in '-tion', '-ity', and '-ic' follow?", answer: "The syllable immediately before the suffix gets the stress: preSENtation, opporTUNity, straTEgic. This is consistent and predictable once you know the rule." },
      { question: "How does stress sometimes shift between the verb and noun forms of the same word?", answer: "The verb often stresses a later syllable; the noun stresses an earlier one. Example: to preSENT (verb) → a PREsent (noun). The grammatical category changes the stress." },
    ],
  },

  {
    id: "pron-connected-speech",
    pillar: "Pronunciation",
    title: "Connected Speech & Linking",
    subtitle: "Flow between words like a native speaker",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "presentation", "meeting", "sales", "culture"],
    content: {
      intro:
        "Native speakers don't pronounce each word separately. They link words together, creating a flowing rhythm. Mastering connected speech is what transforms 'clear but foreign' into 'natural and fluent.'",
      keyConcept:
        "Three key linking rules: (1) Consonant-to-vowel linking: 'look_at_it' sounds like 'loo-ka-tit'. (2) Same consonant linking: 'first_time' becomes 'firs-time'. (3) Vowel-to-vowel linking: add a soft 'w' or 'y' sound: 'go_on' → 'go-won', 'see_it' → 'see-yit'.",
      example: {
        context: "Common business phrases with natural linking",
        text: "Let me walk_you through_our analysis_of the market_opportunity. We've put_together_a comprehensive plan_and_I'd like to get_your input_on the next steps.",
      },
      proTip:
        "Listen to any TED Talk at 0.75x speed and notice how speakers link words. Then try reading the same transcript aloud, imitating their linking patterns.",
      practicePrompt:
        "In your next session, focus on linking 'at', 'it', 'and', 'of' to the surrounding words instead of pronouncing them as separate units.",
    },
    challenge: {
      instruction: "Mark the linking points with underscores (_) where words should connect:",
      weakSentence: "I would like to walk you through our analysis of the current market opportunity.",
      modelAnswer: "I would like_to walk_you through_our analysis_of the current market_opportunity.",
    },
    recallQuestions: [
      { question: "Name the three key linking rules in connected speech.", answer: "(1) Consonant-to-vowel: 'look_at_it' → 'loo-ka-tit'. (2) Same-consonant linking: 'first_time' → 'firs-time'. (3) Vowel-to-vowel: insert a soft 'w' or 'y': 'go_on' → 'go-won', 'see_it' → 'see-yit'." },
      { question: "Which common short words have the biggest impact when you practice linking first?", answer: "'At', 'it', 'and', 'of' — they appear constantly in business speech and their linking has the biggest immediate effect on natural flow." },
    ],
  },

  {
    id: "pron-intonation",
    pillar: "Pronunciation",
    title: "Intonation for Authority",
    subtitle: "Use pitch patterns to sound confident",
    duration: "3 min",
    icon: "",
    pathIds: ["interview", "presentation"],
    content: {
      intro:
        "Intonation — the rise and fall of your voice — communicates more than your words do. Rising intonation at the end of statements (upspeak) makes you sound uncertain. Falling intonation signals authority.",
      keyConcept:
        "Statements should end with falling intonation ↘: 'This is our best option ↘.' Questions rise ↗: 'Would you agree ↗?' The most common non-native error is turning statements into questions with rising intonation, which undermines authority.",
      example: {
        context: "Comparing confident vs uncertain delivery",
        text: "❌ Uncertain: 'We should launch in March ↗?' (sounds like you're asking permission)\n✅ Confident: 'We should launch in March ↘.' (sounds like a decision)\n✅ Strategic question: 'What if we launched in March ↗?' (intentional question)",
      },
      proTip:
        "Record yourself making a recommendation. Listen for upspeak at the end. If your pitch rises on statements, practice by exaggerating the downward pitch on your last word until falling intonation becomes natural.",
      practicePrompt:
        "In your next session, focus on ending every recommendation with a clear falling tone. Exaggerate slightly to build the habit.",
    },
    challenge: {
      instruction: "Mark each sentence with ↗ (rising/question) or ↘ (falling/statement) for confident delivery:",
      weakSentence: "I think we should expand to Brazil? Our data supports this? The market is ready?",
      modelAnswer: "I think we should expand to Brazil ↘. Our data supports this ↘. The market is ready ↘.",
    },
    recallQuestions: [
      { question: "What is 'upspeak' and why does it undermine authority?", answer: "Rising intonation ↗ at the end of statements — it makes declarations sound like questions, signaling uncertainty or seeking permission rather than presenting a position with confidence." },
      { question: "What is the correct intonation pattern for confident statements vs. genuine questions?", answer: "Statements end with falling intonation ↘ (signals certainty). Questions rise ↗ (signals you want a response). Using falling intonation for recommendations is the single most impactful fix." },
    ],
  },

  {
    id: "pron-minimal-pairs",
    pillar: "Pronunciation",
    title: "Minimal Pairs in Business",
    subtitle: "Avoid confusion between similar-sounding words",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "meeting", "sales", "presentation", "culture"],
    content: {
      intro:
        "Minimal pairs are words that differ by only one sound: 'ship/sheep', 'live/leave', 'price/prize'. In business contexts, confusing these can change your message entirely.",
      keyConcept:
        "Key business minimal pairs: 'coast/cost' (región vs precio), 'debt/date' (deuda vs fecha), 'sheet/shit' (!), 'focus/folk us', 'price/prize', 'work/walk', 'leave/live'. Practice the specific vowel or consonant that distinguishes each pair.",
      example: {
        context: "Business sentences where minimal pair confusion can cause problems",
        text: "Careful with: 'We need to cut costs' (not coasts). 'The team will leave at 5' (not live). 'Check the balance sheet' (not... well). 'Let me walk you through this' (not work you through this).",
      },
      proTip:
        "Identify your personal trouble pairs based on your native language. Spanish speakers often mix 'ship/sheep' and 'leave/live'. Portuguese speakers struggle with 'think/sink'. Focus on YOUR specific pairs, not all of them.",
      practicePrompt:
        "Before your next session, practice saying 'sheet' vs 'seat', 'live' vs 'leave', and 'cost' vs 'coast' aloud 5 times each.",
    },
    challenge: {
      instruction: "Choose the correct word for each business sentence:",
      weakSentence: "(1) We need to reduce [costs/coasts]. (2) The team will [leave/live] the office at 6. (3) Please check the balance [sheet/seat]. (4) Let me [walk/work] you through the report.",
      modelAnswer: "(1) costs (2) leave (3) sheet (4) walk",
    },
    recallQuestions: [
      { question: "Why are minimal pair errors especially risky in business settings?", answer: "A single-sound difference can change the message entirely — 'cost' vs 'coast', 'leave' vs 'live', or far more embarrassing pairs. Confusion in high-stakes conversations undermines credibility." },
      { question: "What is the most effective strategy for improving your minimal pair pronunciation?", answer: "Identify YOUR specific trouble pairs based on your native language — don't practice all pairs equally. Spanish speakers often mix 'ship/sheep' and 'leave/live'. Focus on your personal weak spots first." },
    ],
  },

  /* ═══════════════════════════════════════════
     PROFESSIONAL TONE  (6 lessons)
     ═══════════════════════════════════════════ */

  {
    id: "tone-diplomatic-disagreement",
    pillar: "Professional Tone",
    title: "Diplomatic Disagreement",
    subtitle: "Push back on ideas while preserving relationships",
    duration: "2 min",
    icon: "",
    pathIds: ["meeting", "culture"],
    content: {
      intro:
        "The ability to disagree without creating conflict is the hallmark of executive communication. It requires acknowledging the other person's perspective before introducing your counterpoint.",
      keyConcept:
        "Use the 'Acknowledge → Bridge → Redirect' pattern: First validate what was said, then bridge to your concern, then redirect to your alternative. Never start with 'No' or 'But'.",
      example: {
        context: "Your manager proposes cutting the R&D budget to meet quarterly targets",
        text: "I can see why that would address the short-term gap — it's a logical first move. One thing I'd want us to consider is the impact on our product pipeline. What if we looked at optimizing vendor contracts first? That could free up a similar amount without compromising innovation.",
      },
      proTip:
        "The word 'and' is more powerful than 'but'. 'I agree with your timeline AND I think we could strengthen the execution plan' keeps both ideas alive. 'But' negates everything before it.",
      practicePrompt:
        "In your next session, disagree with the interlocutor at least once using 'I can see why... One thing I'd want us to consider is...'",
    },
    challenge: {
      instruction: "Rewrite this blunt disagreement using the Acknowledge → Bridge → Redirect pattern:",
      weakSentence: "That won't work. We need to hire more people instead of cutting costs.",
      modelAnswer: "I can see the logic behind cost reduction — it's a pragmatic first step. One thing I'd want us to consider is whether investing in two key hires could actually drive the revenue growth that solves the budget gap organically.",
    },
    recallQuestions: [
      { question: "What is the 'Acknowledge → Bridge → Redirect' pattern?", answer: "(1) Validate what was said ('I can see why...'). (2) Bridge to your concern ('One thing I'd want us to consider...'). (3) Redirect to your alternative. Never open with 'No' or 'But' — both trigger defensiveness." },
      { question: "Why is 'and' more strategic than 'but' when introducing a counterpoint?", answer: "'But' negates everything before it. 'And' keeps both ideas alive and signals you're building on the conversation, not rejecting it — maintaining collaborative tone while introducing your position." },
    ],
  },

  {
    id: "tone-executive-register",
    pillar: "Professional Tone",
    title: "Executive Register in Speech",
    subtitle: "Adjust your language level for C-suite conversations",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "presentation"],
    content: {
      intro:
        "Executive register isn't about using big words — it's about precision, brevity, and signaling that you think at a strategic level. C-suite leaders speak in outcomes, impacts, and decisions — not tasks and processes.",
      keyConcept:
        "Shift from operational language to strategic language: Instead of 'We finished the project' → 'We delivered ahead of schedule.' Instead of 'The team is working on it' → 'We're tracking toward completion by Q2.' Frame everything in terms of outcomes, timelines, and business impact.",
      example: {
        context: "Giving a status update to the VP of Operations",
        text: "We're on track to deliver the platform migration by March 15th, two weeks ahead of schedule. This positions us to capture the Q2 integration window, which could accelerate revenue recognition by approximately $2M.",
      },
      proTip:
        "Count your 'we did' vs 'this means' ratio. Executives care less about what you did and more about what it means for the business. Always end with the 'so what.'",
      practicePrompt:
        "In your next session, after every statement about an action, add a 'which means...' or 'this positions us to...' to elevate to strategic language.",
    },
    challenge: {
      instruction: "Rewrite this operational update using executive register (focus on outcomes + 'so what'):",
      weakSentence: "We finished the website redesign last week. The team worked hard on it. We also fixed some bugs.",
      modelAnswer: "We delivered the website redesign ahead of schedule, which positions us to capture 15% more conversions during the Q2 campaign. All critical issues have been resolved, ensuring a seamless launch.",
    },
    recallQuestions: [
      { question: "What is the fundamental difference between operational and strategic language?", answer: "Operational: describes what you did ('We finished the project'). Strategic: describes outcomes + 'so what' ('We delivered ahead of schedule, positioning us to capture the Q2 window'). Executives care about impact, not tasks." },
      { question: "What is the 'so what' test, and how do you apply it?", answer: "After any statement about an action, add 'which means...' or 'this positions us to...' If you can't complete that sentence with a business impact, your statement isn't at executive register yet." },
    ],
  },

  {
    id: "tone-assertive-softening",
    pillar: "Professional Tone",
    title: "Assertive Softening",
    subtitle: "Be firm without being aggressive",
    duration: "2 min",
    icon: "",
    pathIds: ["sales", "meeting"],
    content: {
      intro:
        "There's a sweet spot between pushover and aggressive. Assertive softening lets you hold your ground while maintaining professional warmth. It's the hallmark of emotionally intelligent leaders.",
      keyConcept:
        "The pattern: State your position clearly + acknowledge the other side + stay firm. 'I understand the pressure to ship early, and I appreciate the urgency. That said, launching without QA would put our reputation at risk, so I'd recommend we hold to the original timeline.'",
      example: {
        context: "A client is pushing to reduce the project scope but keep the same price",
        text: "I completely understand the budget constraints — they're real and I respect that. What I'd want to ensure is that the reduced scope still delivers meaningful ROI for your team. I'd suggest we prioritize the three highest-impact features rather than spreading thin across all eight.",
      },
      proTip:
        "Replace 'I can't do that' with 'What I can do is...' This shifts from refusal to solution. 'We can't deliver by Friday, but what I can commit to is a working prototype by Monday with full delivery Wednesday.'",
      practicePrompt:
        "In your next session, set a boundary using 'I understand... That said...' or 'What I can do is...'",
    },
    challenge: {
      instruction: "Rewrite this aggressive response using assertive softening:",
      weakSentence: "No, we're not going to do that. Your request is unreasonable and I won't budge on this.",
      modelAnswer: "I understand where you're coming from, and I appreciate you raising this. That said, adjusting the timeline at this stage would compromise the quality we've committed to. What I can do is explore whether we can accelerate one specific deliverable to address your most urgent need.",
    },
    recallQuestions: [
      { question: "What is the assertive softening pattern?", answer: "State your position clearly + acknowledge the other side + stay firm. 'I understand the urgency, and I appreciate the pressure. That said, [firm position].' The key is acknowledging without yielding." },
      { question: "How do you transform 'I can't do that' into assertive softening?", answer: "Replace with 'What I can do is...' — this shifts from refusal to solution. It maintains your boundary while offering a constructive path forward, which preserves the relationship." },
    ],
  },

  {
    id: "tone-meeting-language",
    pillar: "Professional Tone",
    title: "Meeting Power Phrases",
    subtitle: "Control conversations with strategic language",
    duration: "2 min",
    icon: "",
    pathIds: ["meeting"],
    content: {
      intro:
        "Executive meetings are won or lost with specific phrases. Knowing how to steer, redirect, summarize, and close discussions gives you outsized influence — even when you're not the most senior person in the room.",
      keyConcept:
        "Master five meeting moves: (1) Open: 'To set the stage...' (2) Redirect: 'Let's table that and circle back after...' (3) Summarize: 'So what I'm hearing is...' (4) Challenge: 'I'd like to stress-test that assumption...' (5) Close: 'What I'd like us to walk away with is...'",
      example: {
        context: "Guiding a meeting that's going off-track",
        text: "These are all valid points. Let me suggest we table the vendor discussion for now and circle back in our Thursday sync. What I'd like us to walk away with today is alignment on the Q2 priorities. So what I'm hearing is we agree on expanding the sales team — is that right?",
      },
      proTip:
        "'So what I'm hearing is...' is the most powerful phrase in any meeting. It lets you reframe the discussion, check alignment, and subtly steer toward your preferred outcome — all while appearing collaborative.",
      practicePrompt:
        "In your next session, use 'So what I'm hearing is...' at least once to summarize or redirect.",
    },
    challenge: {
      instruction: "Rewrite this awkward meeting intervention using professional meeting phrases:",
      weakSentence: "Hey, we're getting off topic. Can we stop talking about this? I want to talk about the budget. Does everyone agree with me?",
      modelAnswer: "These are all important points. Let's table this discussion for now and circle back next week. What I'd like us to focus on today is the budget allocation. So what I'm hearing from the team is general alignment on the revenue targets — shall we confirm that and move forward?",
    },
    recallQuestions: [
      { question: "Name the five meeting power moves from this lesson.", answer: "(1) Open: 'To set the stage...' (2) Redirect: 'Let's table that and circle back...' (3) Summarize: 'So what I'm hearing is...' (4) Challenge: 'I'd like to stress-test that assumption...' (5) Close: 'What I'd like us to walk away with is...'" },
      { question: "Why is 'So what I'm hearing is...' the most powerful phrase in a meeting?", answer: "It lets you reframe the discussion, check alignment, and subtly steer toward your preferred outcome — all while appearing collaborative and making others feel heard." },
    ],
  },

  {
    id: "tone-smalltalk",
    pillar: "Professional Tone",
    title: "Small Talk & Relationship Building",
    subtitle: "Navigate casual conversation with American colleagues",
    duration: "2 min",
    icon: "",
    pathIds: ["culture", "meeting", "interview"],
    content: {
      intro:
        "In American business culture, small talk is not optional — it's a relationship-building tool. The minutes before a meeting starts or the first exchanges on a call are opportunities to create connection. LATAM professionals who skip straight to business can unintentionally seem cold or transactional.",
      keyConcept:
        "Three layers of American small talk: (1) Universal openers: weather, weekend, sports, recent news. (2) Work-related: 'How's the project going?', 'Busy week?', 'How was the conference?' (3) Connection builders: remembering personal details — 'How was your daughter's graduation?' Safe to ask about: work, travel, food, weekend plans, sports. Avoid: politics, salary, religion, personal problems.",
      example: {
        context: "Starting a video call with an American colleague before the meeting begins",
        text: "Hey David, good to see you! How's the week treating you? [pause for response] I hear you — it's been a sprint on our end too. We finally shipped the integration we've been working on. Anyway, I think we're good to get started — ready when you are.",
      },
      proTip:
        "Mirror energy level. Americans on calls tend to be warm and upbeat. Match their tone — not forced, but present. A flat 'yes, let's begin' after friendly small talk signals discomfort, not professionalism.",
      practicePrompt:
        "In your next culture session, open with 30 seconds of small talk before getting to the main topic. Use a question + one personal share + a smooth transition.",
    },
    challenge: {
      instruction: "Rewrite this cold meeting opener to include natural small talk:",
      weakSentence: "Hello. I am ready for the meeting. Let us begin the agenda.",
      modelAnswer: "Hey Sarah! Good to see you — how's the week going? [pause] Glad to hear it. We've been in sprint mode here too, but things are looking good. Alright, I think we're all here — should we jump in?",
    },
    recallQuestions: [
      { question: "Name the three layers of American small talk in order from lightest to most connective.", answer: "(1) Universal openers: weather, weekend, sports, news. (2) Work-related: project updates, busy-week questions. (3) Connection builders: remembering personal details from previous conversations." },
      { question: "Which topics are safe in American professional small talk, and which should you avoid?", answer: "Safe: work, travel, food, weekend plans, sports. Avoid: politics, salary, religion, personal problems. When in doubt, keep it positive and work-adjacent." },
    ],
  },

  {
    id: "tone-register",
    pillar: "Professional Tone",
    title: "Written vs. Spoken Register",
    subtitle: "Sound natural in calls, not like you're reading an email",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "meeting", "presentation", "sales", "culture"],
    content: {
      intro:
        "Non-native speakers often speak in 'email voice' — formal, complete sentences that sound perfectly correct but oddly stiff in live conversation. The spoken register of English is more informal, contracted, and conversational than written English.",
      keyConcept:
        "Written → Spoken transformations: 'I would like to' → 'I'd like to', 'We are going to' → 'We're gonna / We're going to', 'I have not received' → 'I haven't gotten', 'In accordance with' → 'Based on', 'Regarding the matter of' → 'About', 'Please be advised that' → 'Just so you know'. In speech: use contractions, shorter sentences, and conversational connectors ('so', 'look', 'honestly', 'here's the thing').",
      example: {
        context: "Same message — written register vs spoken register",
        text: "Written: 'I am following up regarding the proposal submitted last Tuesday. I would appreciate confirmation of receipt and your initial assessment.' Spoken: 'Hey, I wanted to follow up on the proposal I sent Tuesday. Did you get a chance to look it over? Just wanted to get your initial thoughts.'",
      },
      proTip:
        "Before a live conversation, mentally switch from 'email mode' to 'phone call mode.' Ask: how would I say this to a colleague in the hallway? That's your spoken register. Start there.",
      practicePrompt:
        "In your next session, use at least 5 contractions (I'd, we've, it's, don't, can't). Notice how it changes your rhythm and sounds more natural.",
    },
    challenge: {
      instruction: "Convert this written-register statement into natural spoken English:",
      weakSentence: "I am writing to inform you that we have completed the analysis and we would like to present our findings at your earliest convenience.",
      modelAnswer: "Hey — we've finished the analysis and I'd love to walk you through the findings. When works best for you this week?",
    },
    recallQuestions: [
      { question: "Give two examples of written-register phrases and their natural spoken equivalents.", answer: "'I would like to' → 'I'd like to'. 'In accordance with' → 'Based on'. Written English is formal and complete; spoken English uses contractions, shorter sentences, conversational connectors." },
      { question: "What is the 'hallway test' for checking if your spoken register is too formal?", answer: "Ask: 'How would I say this to a colleague in the hallway?' If it sounds like an email, simplify it. That casual, direct version IS the correct spoken register." },
    ],
  },

  /* ═══════════════════════════════════════════
     PERSUASION  (7 lessons)
     ═══════════════════════════════════════════ */

  {
    id: "persuasion-prep",
    pillar: "Persuasion",
    title: "The PREP Framework",
    subtitle: "Structure any argument in 30 seconds",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "presentation", "sales", "meeting"],
    content: {
      intro:
        "PREP (Point, Reason, Example, Point) is the most versatile persuasion framework for business. It works for interview answers, meeting contributions, and elevator pitches.",
      keyConcept:
        "Start with your conclusion (Point), explain why (Reason), prove it with evidence (Example), then reinforce (Point). This 'answer-first' structure respects busy executives' time and makes your argument impossible to lose.",
      example: {
        context: "Arguing for a remote-first policy in a leadership meeting",
        text: "I believe we should adopt a remote-first model. (Point) Our data shows that remote teams have 18% higher productivity and 35% lower turnover. (Reason) For example, our engineering team's output increased by 22% after going remote last year, while reducing facility costs by $400K. (Example) A remote-first policy isn't just a perk — it's a competitive advantage. (Point)",
      },
      proTip:
        "Practice 'PREP in 30 seconds' — set a timer and deliver your argument in under 30 seconds. If you can't, your Point isn't sharp enough. Sharpen it until it's one sentence.",
      practicePrompt:
        "Pick any opinion from your next session and structure it as PREP. Start with your conclusion, not your reasoning.",
    },
    challenge: {
      instruction: "Restructure this rambling opinion using the PREP framework (Point → Reason → Example → Point):",
      weakSentence: "Well, I've been thinking and, you know, there are benefits to flexible hours. Some companies do it. I think maybe we should consider it because people seem to like it.",
      modelAnswer: "We should implement flexible working hours. (Point) Research shows flexible schedules increase productivity by 20% and reduce turnover by 25%. (Reason) For instance, Salesforce reported a 30% boost in employee satisfaction after introducing flex-time last year. (Example) Flexible hours aren't just a perk — they're a proven driver of performance and retention. (Point)",
    },
    recallQuestions: [
      { question: "What does PREP stand for, and in what order do you use it?", answer: "Point (your conclusion upfront), Reason (why), Example (evidence or story), Point (restate the conclusion). Always lead with the answer — executives don't want to wait for your reasoning." },
      { question: "What does it mean when your PREP argument takes more than 30 seconds?", answer: "Your Point isn't sharp enough. It should be one clear sentence. If you can't state your conclusion in one sentence, sharpen it before adding the reasoning." },
    ],
  },

  {
    id: "persuasion-data-backed",
    pillar: "Persuasion",
    title: "Data-Backed Arguments",
    subtitle: "Turn opinions into evidence-based proposals",
    duration: "2 min",
    icon: "",
    pathIds: ["presentation", "sales", "meeting"],
    content: {
      intro:
        "In executive settings, opinions without data are just noise. Learning to anchor your arguments in numbers, benchmarks, and evidence transforms you from a participant into an authority.",
      keyConcept:
        "The 'Claim + Number + Source + Implication' pattern: Make a claim, back it with a specific number, cite the source (even informally), and explain what it means. 'Based on our Q3 analysis, customer acquisition cost dropped 28%, which means we can reinvest in growth without additional budget.'",
      example: {
        context: "Proposing a new hiring strategy to the HR director",
        text: "I'd recommend we shift 40% of our recruiting budget to employee referrals. According to LinkedIn's latest workforce report, referred candidates are hired 55% faster and stay 45% longer. For us, that could mean filling our 8 open positions by Q2 instead of Q3, saving approximately $120K in agency fees.",
      },
      proTip:
        "You don't need to memorize exact numbers. Approximate with confidence: 'roughly 30%', 'nearly double', 'a 3x improvement.' The specificity of the structure matters more than decimal precision.",
      practicePrompt:
        "In your next session, support at least one argument with a number — even if you approximate. 'Studies suggest roughly 40% of...' is far more persuasive than 'A lot of companies do this.'",
    },
    challenge: {
      instruction: "Rewrite this vague opinion adding specific data points (you can approximate):",
      weakSentence: "I think we should use employee referrals more because they're better and a lot of companies do it.",
      modelAnswer: "I'd recommend shifting roughly 40% of our recruiting budget to employee referrals. Industry data suggests referred candidates are hired approximately 55% faster and stay nearly 45% longer. For our 8 open roles, that could mean filling positions a full quarter earlier.",
    },
    recallQuestions: [
      { question: "What is the 'Claim + Number + Source + Implication' pattern?", answer: "State a claim, back it with a specific number, cite the source informally, then state the business implication: 'which means...' or 'which translates to...'" },
      { question: "What should you do when you don't have an exact number handy?", answer: "Approximate confidently: 'roughly 30%', 'nearly double', 'a 3x improvement.' The structure of the argument communicates authority; decimal precision is less important than confident framing." },
    ],
  },

  {
    id: "persuasion-storytelling",
    pillar: "Persuasion",
    title: "Storytelling in Business",
    subtitle: "Make your arguments unforgettable with narrative",
    duration: "3 min",
    icon: "",
    pathIds: ["presentation", "sales", "interview"],
    content: {
      intro:
        "Data convinces the rational brain. Stories convince the emotional brain. The most persuasive executives combine both. A well-placed 30-second story can be more memorable than 10 slides of data.",
      keyConcept:
        "Use the 'Mini-Story' format: Situation (set the scene in one sentence) → Complication (the problem or challenge) → Resolution (what happened / what we learned). Keep it under 30 seconds. Always end with a business lesson.",
      example: {
        context: "Arguing for better customer onboarding in a product review",
        text: "Last month, I spoke with a customer who signed up with enthusiasm — they'd seen our demo and were excited. (Situation) Within two weeks, they'd stopped using the product entirely. When I called, they said the setup was so confusing they gave up. (Complication) We redesigned their onboarding in one afternoon, and they became our highest-usage account within a month. (Resolution) That's one customer. Imagine scaling that fix across our entire user base.",
      },
      proTip:
        "Start stories with a specific detail: 'Last Tuesday...', 'A customer in São Paulo...', 'During our Q2 launch...' Specificity creates credibility, even in hypothetical scenarios.",
      practicePrompt:
        "In your next session, support one argument with a brief story using the Situation → Complication → Resolution structure.",
    },
    challenge: {
      instruction: "Transform this dry fact into a 3-sentence mini-story (Situation → Complication → Resolution):",
      weakSentence: "Employee training reduces turnover by 40%.",
      modelAnswer: "When I joined my previous company, our onboarding was a single-day orientation. (Situation) Within six months, we'd lost 30% of new hires — they felt unsupported and disconnected. (Complication) We introduced a 90-day structured training program, and turnover dropped by 40% within a year. (Resolution)",
    },
    recallQuestions: [
      { question: "What is the Mini-Story format and how long should it run?", answer: "Situation (set the scene, 1 sentence) → Complication (the problem) → Resolution (what happened or what you learned). Keep it under 30 seconds. Always end with a business lesson." },
      { question: "What makes a story opening credible, even in a hypothetical scenario?", answer: "A specific detail at the start: 'Last Tuesday...', 'A customer in São Paulo...', 'During our Q2 launch...' Specificity creates credibility and makes the story feel real rather than generic." },
    ],
  },

  {
    id: "persuasion-objection-handling",
    pillar: "Persuasion",
    title: "Handling Objections Like a Pro",
    subtitle: "Turn pushback into opportunities",
    duration: "3 min",
    icon: "",
    pathIds: ["sales", "interview"],
    content: {
      intro:
        "Objections aren't attacks — they're buying signals. When someone pushes back, it means they're engaged enough to think critically. How you handle objections determines whether you close or lose.",
      keyConcept:
        "Use the 'Feel, Felt, Found' framework: 'I understand how you feel. Others have felt the same way. What they found was...' This validates the concern, normalizes it, and redirects to a positive outcome — all without being confrontational.",
      example: {
        context: "A stakeholder objects that your proposal is too expensive",
        text: "I completely understand that concern — the initial investment is significant. Several of our enterprise clients felt the same way when they first saw the numbers. What they found was that the solution paid for itself within 8 months through operational savings, and most saw a 3x return by the end of year one.",
      },
      proTip:
        "Never say 'You're wrong' or 'Actually...' when facing an objection. Instead, start with 'That's a great point' or 'I appreciate you raising that.' Validation disarms resistance before you redirect.",
      practicePrompt:
        "In your next practice, when the AI pushes back on your idea, use 'I understand... Others felt the same... What they found was...'",
    },
    challenge: {
      instruction: "Rewrite this defensive response to an objection using the 'Feel, Felt, Found' framework:",
      weakSentence: "No, you're wrong about the timeline. It's actually very realistic if you look at the data properly.",
      modelAnswer: "I understand the timeline feels ambitious — that's a fair concern. Several teams I've worked with felt the same hesitation initially. What they found was that by front-loading the critical milestones and running two workstreams in parallel, it was not only achievable but actually reduced overall risk.",
    },
    recallQuestions: [
      { question: "What does the 'Feel, Felt, Found' framework mean?", answer: "'I understand how you feel' (validate). 'Others have felt the same way' (normalize). 'What they found was...' (redirect to positive outcome). This handles objections without confrontation." },
      { question: "Why should you never start an objection response with 'You're wrong' or 'Actually...'?", answer: "Both phrases trigger defensiveness immediately. Starting with validation ('I appreciate you raising that') disarms resistance before you redirect — the person feels heard, not attacked." },
    ],
  },

  {
    id: "persuasion-elevator",
    pillar: "Persuasion",
    title: "Elevator Pitch Framework",
    subtitle: "Introduce yourself compellingly in 60 seconds",
    duration: "2 min",
    icon: "",
    pathIds: ["interview", "sales"],
    levelIds: ["int-1", "int-2", "sal-1"],
    content: {
      intro:
        "Whether it's the first 60 seconds of an interview or a chance encounter with an executive, your elevator pitch is your most rehearsed professional asset. Most people wing it — and it shows. A structured pitch makes you memorable, relevant, and in control of the narrative.",
      keyConcept:
        "The 4-part pitch: (1) WHO you are (title + context, 1 sentence). (2) WHAT you do best (your core strength + one proof point, 1-2 sentences). (3) WHY it matters (the business impact, 1 sentence). (4) HOOK (a question or statement that invites the conversation forward). Total: under 60 seconds.",
      example: {
        context: "Introducing yourself at the start of a job interview",
        text: "I'm a product designer with 7 years focused on SaaS platforms for the financial sector. What I do best is translate complex regulatory requirements into clean, intuitive experiences — most recently leading the redesign of a trading platform used by 200K+ professionals, which reduced onboarding time by 40%. I'm drawn to this role because you're scaling into markets where that kind of design precision really matters. What aspects of the product are you most focused on improving right now?",
      },
      proTip:
        "The HOOK at the end is optional but powerful. Ending with a question flips the dynamic — you go from candidate being evaluated to professional having a conversation. It signals confidence and curiosity simultaneously.",
      practicePrompt:
        "Write your own 4-part pitch before your next interview session. Time it. If it's over 60 seconds, cut the WHO and WHY down to one sentence each.",
    },
    challenge: {
      instruction: "Restructure this flat self-introduction using the 4-part elevator pitch framework (Who + What + Why + Hook):",
      weakSentence: "Hi, I'm Carlos. I work in marketing and I have 5 years of experience. I've worked for several companies and I know a lot about digital marketing. I'm very passionate about this field.",
      modelAnswer: "I'm Carlos, a digital marketing strategist with 5 years scaling B2B SaaS brands in LATAM. My specialty is demand generation — in my last role, I built a content engine that grew organic leads by 120% in 18 months. I'm excited about this opportunity because you're expanding into markets where I've built campaigns from scratch. What are your biggest acquisition challenges right now?",
    },
    recallQuestions: [
      { question: "Name the four parts of a professional elevator pitch.", answer: "(1) WHO you are: title + context (1 sentence). (2) WHAT you do best: core strength + one proof point. (3) WHY it matters: the business impact. (4) HOOK: a question or statement that invites conversation forward." },
      { question: "What is the purpose of the HOOK at the end, and why is it optional but powerful?", answer: "It flips the dynamic from 'candidate being evaluated' to 'professional having a conversation.' Ending with a question signals confidence and curiosity simultaneously — it puts you in control." },
    ],
  },

  {
    id: "persuasion-hook",
    pillar: "Persuasion",
    title: "Opening Hook Structures",
    subtitle: "Start presentations and pitches with instant impact",
    duration: "2 min",
    icon: "",
    pathIds: ["presentation", "interview"],
    levelIds: ["pres-1", "pres-2", "int-3"],
    content: {
      intro:
        "You have 30 seconds to earn the next 30 minutes of your audience's attention. Most presenters start with 'Good morning, today I'm going to talk about...' — and immediately lose the room. A strong hook makes your audience lean forward instead of checking their phones.",
      keyConcept:
        "Five proven hook structures: (1) Provocative question: 'What if I told you we're losing $2M a year to a problem we could fix in a week?' (2) Striking statistic: '67% of deals are lost before the first meeting because of a bad first impression.' (3) Mini-story: 'Last Tuesday, I got a call from a customer who was about to leave us. Here's why she stayed.' (4) Bold statement: 'Everything you think you know about B2B retention is wrong.' (5) Relevant scenario: 'Imagine you have 90 seconds with the CEO in an elevator. What do you say?'",
      example: {
        context: "Opening a product strategy presentation to the board",
        text: "I want to start with a number: 34. That's the percentage of our churned customers who said, in exit surveys, they left not because of price or features — but because they never got a reply within 24 hours. Thirty-four percent. That's a $1.8M annual problem. And it's completely fixable. Here's how.",
      },
      proTip:
        "The best hooks create a 'knowledge gap' — they make the audience feel they're missing something important. Questions and striking statistics do this better than stories or bold statements. Test your hook: does it make someone want to know what comes next?",
      practicePrompt:
        "For your next presentation session, prepare THREE different hook options for the same topic. Try each and feel which lands best. Variety builds intuition.",
    },
    challenge: {
      instruction: "Replace this weak opening with a strong hook using one of the 5 structures:",
      weakSentence: "Good morning everyone. Today I'm going to present our Q3 results and talk about our plans for Q4. I hope you find this information useful.",
      modelAnswer: "Thirty-two percent. That's how much our conversion rate grew in Q3 — and not because we spent more. Because we fixed one thing. Let me show you what we changed and why it worked.",
    },
    recallQuestions: [
      { question: "Name the five hook structures for opening presentations and pitches.", answer: "(1) Provocative question. (2) Striking statistic. (3) Mini-story. (4) Bold statement. (5) Relevant scenario. Each creates a 'knowledge gap' — a feeling that the audience is missing something important." },
      { question: "What is a 'knowledge gap' in a hook, and which two hook types create it most effectively?", answer: "A feeling that the audience is missing something important — it makes them lean in. Questions and striking statistics create this gap most effectively because they imply an answer the audience doesn't yet have." },
    ],
  },

  {
    id: "persuasion-ask",
    pillar: "Persuasion",
    title: "The Art of the Confident Ask",
    subtitle: "Make requests and close conversations without hesitation",
    duration: "2 min",
    icon: "",
    pathIds: ["sales", "meeting"],
    levelIds: ["sal-4", "sal-5", "sal-6"],
    content: {
      intro:
        "Many professionals — especially those raised in cultures where directness feels aggressive — struggle with making clear asks. They soften requests to the point of invisibility. 'Maybe if it's not too much trouble...' The result: the ask doesn't land. A confident ask is clear, direct, and respectful — not aggressive.",
      keyConcept:
        "The anatomy of a confident ask: (1) Context (1 sentence): 'Based on what we've discussed...' (2) Clear request (1 sentence): 'I'd like to propose we move forward with Phase 1.' (3) Specific next step: 'Can we schedule a kickoff for next week?' Avoid: 'I was wondering if maybe...' and 'I don't know if this is possible but...' These signal uncertainty before the request even lands.",
      example: {
        context: "Closing a sales conversation with a decision-maker",
        text: "Based on everything we've covered today, it sounds like our solution addresses both the compliance gap and the reporting bottleneck. I'd like to propose we move to a pilot with your operations team — 90 days, defined success metrics, no long-term commitment until you've seen results. Does that feel like the right next step?",
      },
      proTip:
        "After the ask — stop talking. The most common mistake is filling the silence after an ask with qualifications: 'Of course if you're not ready, no pressure, I understand if...' Silence after an ask is the other person thinking. Let them think.",
      practicePrompt:
        "In your next sales session, end with a confident ask. Use the structure: context + clear request + specific next step. Then stop talking and wait for the response.",
    },
    challenge: {
      instruction: "Transform this hesitant ask into a confident, clear request:",
      weakSentence: "I was wondering if maybe, I don't know, if it's not too much trouble, perhaps we could possibly schedule a follow-up meeting sometime next week if you're available?",
      modelAnswer: "I'd like to schedule a follow-up to walk through the proposal in detail. Are you available Thursday or Friday this week?",
    },
    recallQuestions: [
      { question: "What are the three components of a confident ask?", answer: "(1) Context: 'Based on what we've discussed...' (2) Clear request: state exactly what you want in one sentence. (3) Specific next step with a timeline. Never start with 'I was wondering if maybe...'" },
      { question: "What is the most common mistake people make immediately after asking?", answer: "Filling the silence with qualifications: 'Of course if you're not ready, no pressure...' Silence after an ask is the other person thinking. Stop talking and let them think." },
    ],
  },

  /* ═══════════════════════════════════════════
     PATH-SPECIFIC DEEP DIVES  (12 lessons)
     Pillar assigned to best-fit existing category.
     pathIds + levelIds enable context-axis matching.
     ═══════════════════════════════════════════ */

  /* — Interview — */
  {
    id: "interview-star",
    pillar: "Professional Tone",
    title: "STAR Method: Structure Your Stories",
    subtitle: "Turn experiences into compelling interview answers",
    duration: "3 min",
    icon: "⭐",
    pathIds: ["interview"],
    levelIds: ["int-2", "int-3", "int-4"],
    content: {
      intro:
        "Behavioral interview questions ('Tell me about a time when...') are designed to predict future performance from past behavior. The STAR framework (Situation, Task, Action, Result) is the gold standard for answering them — and most candidates use it wrong.",
      keyConcept:
        "STAR breakdown: Situation (10%) — brief context, just enough to understand the scenario. Task (10%) — your specific role and responsibility. Action (60%) — what YOU did, not the team. Use 'I' not 'we'. Result (20%) — quantified outcome + optional lesson. The most common mistake: spending 80% on situation and task, leaving no time for action and result.",
      example: {
        context: "Answering 'Tell me about a time you led through uncertainty'",
        text: "Our company was pivoting its product strategy mid-year, and my team of six was left without clear direction for three weeks. (S) My task was to keep the team productive and morale high while leadership finalized the new roadmap. (T) I set up daily 15-minute standups, created a 'quick wins' backlog of high-value tasks we could execute immediately, and maintained weekly 1:1s to address individual concerns. (A) The team stayed fully productive — zero attrition during the transition — and two of the quick-win features we shipped during that period became core to the new product direction. (R)",
      },
      proTip:
        "Prepare 5 versatile STAR stories before any interview. Great stories can answer multiple question types: leadership, failure, conflict, collaboration, innovation. The key is having strong Actions with measurable Results.",
      practicePrompt:
        "Before your next interview session, write one STAR story using the exact format: S (1 sentence), T (1 sentence), A (3-4 specific actions), R (quantified outcome). Time it — aim for 90 seconds.",
    },
    challenge: {
      instruction: "Restructure this weak interview answer using the STAR framework (S → T → A → R):",
      weakSentence: "We had a difficult project with a tight deadline. It was stressful but we worked as a team and finished on time. Everyone contributed and the client was happy.",
      modelAnswer: "We had a critical product launch with a deadline moved up by three weeks. (S) I was the lead engineer responsible for delivery. (T) I restructured the sprint plan, ran daily syncs to unblock the team, and personally took on the two highest-risk components. I also negotiated a scope reduction with the PM on features that could ship post-launch. (A) We delivered on the new deadline with zero major bugs. The client rated the launch 9/10 and extended our contract. (R)",
    },
    recallQuestions: [
      { question: "What is the correct proportion of time to spend on each STAR component?", answer: "Situation (10%), Task (10%), Action (60%), Result (20%). Most people spend 80% on S and T, leaving almost no time for A and R — which are the parts that actually matter." },
      { question: "What is the most common STAR execution error regarding pronouns?", answer: "Using 'we' instead of 'I' in the Action section. The interviewer is evaluating YOUR specific contribution, not the team's. Use 'I led', 'I decided', 'I resolved.'" },
    ],
  },

  {
    id: "interview-salary",
    pillar: "Vocabulary",
    title: "Salary & Compensation Language",
    subtitle: "Navigate compensation conversations without discomfort",
    duration: "2 min",
    icon: "💼",
    pathIds: ["interview"],
    levelIds: ["int-5", "int-6"],
    content: {
      intro:
        "For many LATAM professionals, salary negotiation in English adds a layer of discomfort to an already tense conversation. The vocabulary is specific, the stakes are high, and there's a cultural dimension too — Americans are generally more direct about money than LATAM norms. Knowing the language reduces the anxiety significantly.",
      keyConcept:
        "Key compensation vocabulary: 'base salary', 'total compensation', 'OTE (On-Target Earnings)', 'equity / RSUs / stock options', 'signing bonus', 'performance bonus', 'benefits package', 'PTO (Paid Time Off)'. Useful phrases: 'I'm targeting a range of...', 'Based on my research and experience, I'd expect...', 'Is there flexibility on...', 'What does the total comp package look like?', 'I'd like to take 24 hours to review the offer.'",
      example: {
        context: "Responding to 'What are your salary expectations?'",
        text: "Based on my research into market rates for this role and location, and considering my 7 years of experience in the field, I'm targeting a base salary in the range of $95K to $110K. That said, I'm also interested in understanding the full compensation package — including equity and bonus structure. Is there flexibility in that range?",
      },
      proTip:
        "Always give a range, not a single number. The bottom of your range should be your minimum acceptable offer. Research the role on Glassdoor, LinkedIn Salary, and Levels.fyi before quoting numbers — being anchored in data gives you confidence.",
      practicePrompt:
        "In your salary negotiation session, practice three scenarios: (1) answering the salary question, (2) asking about total comp, (3) countering a low offer. Use the vocabulary above.",
    },
    challenge: {
      instruction: "Rewrite this vague salary response using professional compensation language:",
      weakSentence: "I don't know, maybe something around what you usually pay? I'm flexible. I just want something fair.",
      modelAnswer: "Based on market research and my background, I'm targeting a total compensation in the range of $85K to $100K base. I'd also love to understand the full package — equity, bonus structure, and benefits. Is there flexibility in that range?",
    },
    recallQuestions: [
      { question: "Name three key compensation terms you should know before any salary negotiation.", answer: "Any three from: base salary, total compensation, OTE (On-Target Earnings), equity/RSUs, signing bonus, performance bonus, benefits package, PTO. Knowing the vocabulary gives you credibility." },
      { question: "Why should you always give a salary range rather than a single number?", answer: "The bottom of your range is your minimum acceptable offer. A range anchors the conversation, shows market research, and gives room for negotiation while protecting your floor." },
    ],
  },

  {
    id: "interview-close",
    pillar: "Persuasion",
    title: "Closing the Interview with Confidence",
    subtitle: "Leave a strong final impression and take control of next steps",
    duration: "2 min",
    icon: "🎯",
    pathIds: ["interview"],
    levelIds: ["int-4", "int-5", "int-6"],
    content: {
      intro:
        "Most candidates mentally relax when the interviewer asks 'Do you have any questions?' — and that's a mistake. The last 5 minutes of an interview are as important as the first. How you close determines whether you're remembered as confident and prepared, or as passive and forgettable.",
      keyConcept:
        "The strong close has three parts: (1) Ask a high-quality question that shows strategic thinking. (2) Reaffirm your interest clearly and specifically. (3) Clarify next steps proactively. Avoid: 'What's the salary?', 'How many vacation days do you offer?', 'When will you decide?' — these signal that the job is a commodity, not a mission.",
      example: {
        context: "Closing a senior product role interview",
        text: "[Question] What would you say is the biggest challenge the team is navigating right now — and how does this role contribute to solving it? [Reaffirm] I want to say that I'm genuinely excited about this opportunity. The intersection of design and data at scale is exactly where I want to be building. [Next steps] What does the process look like from here, and is there anything I can send your way in the meantime — a portfolio piece, a case study — that would be helpful?",
      },
      proTip:
        "Prepare 3 questions and use only the ones that haven't been answered. 'Actually, you covered that earlier — could I ask instead about...' shows you were listening, which is itself impressive.",
      practicePrompt:
        "Before your next interview session, write 3 closing questions that demonstrate strategic thinking. Practice the 3-part close: question + reaffirmation + next steps. Time it under 90 seconds.",
    },
    challenge: {
      instruction: "Rewrite this weak interview close using the 3-part structure (Question + Reaffirm + Next Steps):",
      weakSentence: "Um, I think I'm good. Do you know when you'll make a decision? Also, what's the salary range?",
      modelAnswer: "[Question] What does success look like for this role in the first 90 days? [Reaffirm] I want to be direct — I'm very interested in this position. The combination of the product challenge and the team dynamic really resonates with me. [Next Steps] What does the process look like from here? And is there anything else I can share to help the decision?",
    },
    recallQuestions: [
      { question: "Name the three parts of a strong interview close.", answer: "(1) Ask a high-quality question that demonstrates strategic thinking. (2) Reaffirm your genuine interest clearly and specifically. (3) Clarify next steps proactively — don't wait to be told." },
      { question: "Which closing questions should you avoid, and why?", answer: "'What's the salary?', 'How many vacation days?', 'When will you decide?' — these signal that the job is a commodity you're evaluating, not a mission you're committed to. Save compensation for after an offer." },
    ],
  },

  /* — Sales — */
  {
    id: "sales-discovery",
    pillar: "Professional Tone",
    title: "Discovery Questions That Reveal Pain",
    subtitle: "Ask questions that make prospects want to solve the problem today",
    duration: "3 min",
    icon: "🔍",
    pathIds: ["sales"],
    levelIds: ["sal-1", "sal-2"],
    content: {
      intro:
        "The best salespeople talk less than their prospects. Discovery is the phase where you diagnose before you prescribe. The quality of your questions determines the quality of your deal — and the commission that follows.",
      keyConcept:
        "Four tiers of discovery questions: (1) Situation: 'Walk me through how you currently handle X.' (2) Problem: 'What's the biggest friction you experience with that process?' (3) Implication: 'How does that impact your team's output / your Q4 targets / your relationship with customers?' (4) Need-payoff: 'If you could solve that, what would change for you?' This sequence moves the prospect from describing a problem to feeling the urgency of solving it.",
      example: {
        context: "Discovery call with an operations director at a mid-size company",
        text: "Walk me through how your team currently manages the vendor approval process. [pause] When that falls behind, how does it affect your ability to hit project timelines? [pause] And if timelines slip — what does that mean for your relationship with the leadership team? [pause] If that bottleneck were gone, what would become possible for your team?",
      },
      proTip:
        "Silence after a discovery question is your best tool. When you ask 'How does that impact your team?' — don't add more words. The prospect will fill the silence, and what they say is your most valuable selling information.",
      practicePrompt:
        "In your next sales session, prepare 4 discovery questions (one at each tier) before the AI starts. Use them in sequence. Don't jump to your pitch until you've completed all four.",
    },
    challenge: {
      instruction: "Convert these feature pitches into discovery questions that reveal need:",
      weakSentence: "Our platform automates your reporting. It saves time and is very easy to use. You should definitely try it.",
      modelAnswer: "How does your team currently handle reporting — is it mostly manual? [pause] When that takes longer than expected, how does it affect your ability to meet deadlines? [pause] If reporting took half the time, what would your team do with those hours?",
    },
    recallQuestions: [
      { question: "Name the four tiers of discovery questions in order.", answer: "(1) Situation: 'How do you currently handle X?' (2) Problem: 'What's the biggest friction?' (3) Implication: 'How does that impact your Q4 targets?' (4) Need-payoff: 'If that were solved, what would change?' This sequence builds urgency." },
      { question: "What should you do after asking a discovery question, and why?", answer: "Stop talking. Silence is your best tool — the prospect fills it, and what they say is your most valuable selling information. Asking a follow-up immediately cuts off their answer." },
    ],
  },

  {
    id: "sales-objections",
    pillar: "Persuasion",
    title: "Sales Objection Scripts",
    subtitle: "Handle 'too expensive', 'bad timing', and 'let me think about it'",
    duration: "3 min",
    icon: "🛡️",
    pathIds: ["sales"],
    levelIds: ["sal-3", "sal-4"],
    content: {
      intro:
        "Every sales objection is a request for more information in disguise. 'It's too expensive' usually means 'I don't see the value yet.' 'Let me think about it' usually means 'I'm not convinced.' Knowing the real meaning behind each objection — and having a prepared response — transforms rejection into conversation.",
      keyConcept:
        "Three-objection playbook: (1) Price: 'I hear you — can I ask what you're comparing it against? / What would it need to deliver for it to be worth it?' (2) Timing: 'What's driving the timing? Is this something you want to solve in the next quarter, or is it lower priority right now?' (3) 'Let me think': 'Of course. To help me think through this with you — what's the main thing you want to think through?'",
      example: {
        context: "Responding to 'Your pricing is too high'",
        text: "I completely understand — the number matters. Can I ask what you're comparing it against? [pause for response] Got it. And if I could show you that the ROI pays for itself in the first 6 months — based on the time savings you mentioned — would the investment feel different? Let me walk you through the numbers.",
      },
      proTip:
        "Never defend the price immediately. The instinct is to justify ('but our solution is better because...'). Instead, get curious: 'Too high compared to what?' The comparison reveals the real objection.",
      practicePrompt:
        "In your next sales session, the AI will raise at least one price or timing objection. Respond using the 3-step approach: acknowledge → get curious → reframe with value.",
    },
    challenge: {
      instruction: "Rewrite this defensive price objection response using the acknowledge → curious → reframe approach:",
      weakSentence: "Well, actually our product is worth the price because we have more features than anyone else and our support is excellent.",
      modelAnswer: "I hear you — the investment is significant. Can I ask what you're comparing it against? [pause] Got it. And based on the volume you mentioned, if this saves your team 8 hours a week, what does that translate to in cost savings per month? Because I think the math might look different when you run it that way.",
    },
    recallQuestions: [
      { question: "What does 'It's too expensive' almost always really mean?", answer: "'I don't see the value yet.' A price objection is almost always a value objection in disguise — your response should reveal more value, not defend the price." },
      { question: "When a prospect says 'Let me think about it,' what should you ask?", answer: "'To help me think through this with you — what's the main thing you want to think through?' This surfaces the real objection without pressure and opens the door to addressing the actual concern." },
    ],
  },

  {
    id: "sales-closing",
    pillar: "Persuasion",
    title: "The Language of Closing Deals",
    subtitle: "Move conversations to commitment without pressure",
    duration: "2 min",
    icon: "🤝",
    pathIds: ["sales"],
    levelIds: ["sal-5", "sal-6"],
    content: {
      intro:
        "Closing is not a trick — it's a natural next step when the value has been established and the fit is clear. Most salespeople either avoid closing (too passive) or close too hard (too pushy). The professional close is direct, respectful, and specific.",
      keyConcept:
        "Four close types: (1) Assumptive: 'Should we start with the standard onboarding or the accelerated track?' (2) Summary: 'Based on what we've discussed, it sounds like X, Y, Z are your top priorities. Our solution addresses all three — does it make sense to move forward?' (3) Trial: 'If the pricing worked for you, is there anything else that would prevent us from moving forward?' (4) Urgency: 'We have onboarding slots available in the first two weeks of next month — would it make sense to secure one now?'",
      example: {
        context: "Closing a B2B software deal after a strong demo",
        text: "Based on everything we've covered — the reporting automation, the integration with your existing stack, and the ROI timeline — it sounds like this is a strong fit. Is there anything that would prevent you from moving forward this quarter? [pause] Great. Should we start with the 10-seat pilot or go straight to the enterprise rollout?",
      },
      proTip:
        "The most powerful close is a question, not a statement. 'Does this make sense as a next step?' is lighter than 'You should sign now.' And after the question — silence. Never fill the space after a close.",
      practicePrompt:
        "In your next sales session, practice two different close types in the same conversation: a trial close early ('If the pricing worked, is there anything else...') and a summary close at the end.",
    },
    challenge: {
      instruction: "Convert this vague, passive close into a professional, specific closing move:",
      weakSentence: "So, I don't know, maybe if you want we could do something? Let me know if you're interested.",
      modelAnswer: "Based on what you've shared, it sounds like we've got a strong fit — particularly around the reporting and the compliance piece. Is there anything that would prevent you from moving forward this quarter? [pause] Great. Should we start with the pilot or go straight to the full rollout?",
    },
    recallQuestions: [
      { question: "Name the four close types from this lesson.", answer: "(1) Assumptive: offer two ways forward. (2) Summary: recap priorities, ask if it makes sense to proceed. (3) Trial: 'If pricing worked, is there anything else preventing us?' (4) Urgency: reference a real constraint." },
      { question: "What must you do immediately after asking a closing question?", answer: "Stop talking. Never fill the space after a close with qualifications or softening. The silence is the other person deciding — interrupting it with reassurances undermines the close." },
    ],
  },

  /* — Meeting — */
  {
    id: "meeting-facilitate",
    pillar: "Professional Tone",
    title: "Facilitating Meetings Like a Pro",
    subtitle: "Open, manage, and close meetings with authority",
    duration: "3 min",
    icon: "🎙️",
    pathIds: ["meeting"],
    levelIds: ["meet-2", "meet-3"],
    content: {
      intro:
        "The person who facilitates a meeting has more influence than the person who calls it. Facilitation isn't about being the loudest voice — it's about managing the flow, keeping focus, and driving decisions. In remote meetings especially, a strong facilitator is the difference between a productive hour and 60 minutes of drift.",
      keyConcept:
        "Five facilitation moves: (1) Open with clarity: 'We have 45 minutes. Today's goal is to leave with a decision on X.' (2) Parking lot: 'Good point — let's put that in the parking lot and come back.' (3) Time-check: 'We're at the 20-minute mark. Let's make sure we get to the main decision.' (4) Synthesis: 'What I'm hearing from the group is...' (5) Action close: 'Before we wrap, let's confirm: what's the decision, who owns it, and by when?'",
      example: {
        context: "Opening and running a 45-minute strategy session",
        text: "Alright, we've got 45 minutes. Our goal today is to align on the Q2 launch date and confirm who owns the three major workstreams. Let's start there — [name], can you give us a 2-minute summary of where the timeline stands? [after update] Thanks. I'm hearing two perspectives: accelerate for competitive reasons, or hold for quality. Let's take 5 minutes on that and then land on a decision. Who wants to go first?",
      },
      proTip:
        "'Let's put that in the parking lot' is one of the most useful phrases in any meeting. It validates the point, prevents derailment, and signals that you're the one managing the agenda. Use it confidently — it's a sign of leadership, not dismissal.",
      practicePrompt:
        "In your next meeting session, open with a clear agenda statement, use the parking lot at least once, and close with the action/owner/deadline formula.",
    },
    challenge: {
      instruction: "Rewrite this weak meeting opening using the 5 facilitation moves framework:",
      weakSentence: "OK, so, everyone is here I think. So, we need to talk about some stuff. Does anyone have anything to say first?",
      modelAnswer: "Thanks everyone for joining. We have 40 minutes today — our goal is to leave with a decision on the vendor selection and clear owners for the next steps. I'd like to start by quickly hearing where each team stands, then we'll align on the decision. [Name], can you kick us off?",
    },
    recallQuestions: [
      { question: "Name the five facilitation moves from this lesson.", answer: "(1) Open with clarity: goal + time. (2) Parking lot: table tangents gracefully. (3) Time-check. (4) Synthesis: 'What I'm hearing from the group is...' (5) Action close: decision + owner + deadline." },
      { question: "Why is 'Let's put that in the parking lot' a sign of leadership rather than dismissal?", answer: "It validates the point (person feels heard), prevents derailment (protects the agenda), and signals that YOU are managing the meeting's flow. Used confidently, it positions you as the person in charge." },
    ],
  },

  {
    id: "meeting-crosscultural",
    pillar: "Professional Tone",
    title: "Cross-Cultural Meeting Dynamics",
    subtitle: "Navigate cultural differences in how people communicate at work",
    duration: "3 min",
    icon: "🌎",
    pathIds: ["meeting", "culture"],
    levelIds: ["meet-5", "meet-6"],
    content: {
      intro:
        "Working in nearshoring means navigating between LATAM communication norms and North American or European expectations — often in the same meeting. What feels direct and efficient in one culture can feel aggressive or cold in another. Understanding these dynamics prevents misreads and builds stronger working relationships.",
      keyConcept:
        "Key cultural contrasts in meetings: Directness — Americans give negative feedback directly ('This isn't working'); LATAM typically softens ('There's an opportunity to improve this'). Silence — In American meetings, silence often signals agreement or thinking; don't rush to fill it. Hierarchy — Americans often expect junior team members to speak up; waiting for seniors to speak first may be read as disengagement. Disagreement — American professionals often disagree openly in meetings; this is expected, not confrontational.",
      example: {
        context: "An American manager gives feedback that feels blunt in a team meeting",
        text: "American: 'This approach isn't scalable. We need to rethink it.' [What it means: I have a concern, let's fix it together. It's not personal.] Professional LATAM response: 'Fair point — what specifically would you want to see change? I want to make sure we're aligned on the direction.' [Acknowledges the feedback, asks for specifics, shows collaboration.]",
      },
      proTip:
        "If you're unsure whether silence in a meeting means agreement or confusion — ask directly: 'Does that work for everyone, or are there concerns I'm not hearing?' This shows leadership and ensures alignment without putting anyone on the spot.",
      practicePrompt:
        "In your next meeting session, practice two things: (1) Give direct feedback without softening it into invisibility. (2) Respond to direct feedback from the interlocutor without becoming defensive.",
    },
    challenge: {
      instruction: "Rewrite this over-softened feedback so it's clear and direct, while still professional:",
      weakSentence: "Well, I'm not sure, it's just my opinion, but maybe the timeline could perhaps be a little bit... I don't know, maybe a bit more realistic? I don't want to cause any problems.",
      modelAnswer: "I want to flag a concern on the timeline — based on the current scope, I don't think it's realistic for a Q2 delivery. I'd recommend we either reduce scope or push to Q3. Happy to walk through the specifics.",
    },
    recallQuestions: [
      { question: "Name three key differences between American and LATAM communication norms in meetings.", answer: "(1) Directness: Americans say exactly what they mean — negative feedback is not an attack. (2) Silence: may signal agreement or thinking; don't rush to fill it. (3) Initiative: waiting for seniors to speak is read as disengagement, not respect." },
      { question: "When an American colleague gives you direct feedback, what is the strongest type of response?", answer: "'Fair point — I'll fix that.' Brief acknowledgment + immediate action. Long justifications or excessive apologies signal insecurity. Speed of response communicates confidence and professionalism." },
    ],
  },

  /* — Presentation — */
  {
    id: "pres-executive",
    pillar: "Professional Tone",
    title: "Executive Presence in Presentations",
    subtitle: "Own the room before you say a word",
    duration: "3 min",
    icon: "✨",
    pathIds: ["presentation"],
    levelIds: ["pres-4", "pres-5", "pres-6"],
    content: {
      intro:
        "Executive presence is the combination of how you look, how you move, and how you speak before, during, and after a presentation. It's not confidence — it's the visible expression of preparation and self-assurance. The good news: it can be trained.",
      keyConcept:
        "Three presence signals: (1) Pause before you start — don't begin while people are still settling. Stand still, make eye contact, pause 3 seconds. This commands attention before your first word. (2) Claim physical space — in video calls, fill the frame; in person, don't shrink. Plant your feet, don't rock or sway. (3) Deliver the first and last sentence from memory — these are the two most important moments. Read everything else if needed, but not these.",
      example: {
        context: "Opening a board-level presentation after being introduced",
        text: "[Walk to position. Pause. Make eye contact with 2-3 people. Take a breath.] 'What I'm about to show you changes how we think about our competitive position in this market.' [pause, let it land] 'Let me walk you through why.' [then continue with content]",
      },
      proTip:
        "Record yourself on video presenting for 60 seconds. Watch without sound first. Do you fill the space? Do you fidget? Do you look at the camera (eye contact in video) or at your notes? What you see without sound IS what your audience experiences.",
      practicePrompt:
        "In your next presentation session, practice the 3-second pause before you begin. Deliver your first and last sentences from memory. Notice how it changes the energy of the room.",
    },
    challenge: {
      instruction: "Rewrite this weak presentation opening to demonstrate executive presence (add the pause, a strong hook, and a confident frame):",
      weakSentence: "Um, OK so, hi everyone. So today I'm going to talk about our Q3 results. Sorry, let me just get my slides. OK, so here we go.",
      modelAnswer: "[Pause. Eye contact.] 'Q3 was a turning point for this business.' [pause] 'Here's what changed — and what it means for where we go next.' [advance to slide]",
    },
    recallQuestions: [
      { question: "Name the three executive presence signals from this lesson.", answer: "(1) Pause 3 seconds before you start — stand still, make eye contact. (2) Claim physical space — fill the frame, plant your feet. (3) Deliver the first and last sentences from memory — these are the two most critical moments." },
      { question: "What is the most revealing self-assessment for executive presence, and why watch without sound first?", answer: "Record yourself presenting for 60 seconds. Watch without sound first — what you see (posture, stillness, eye contact) IS what your audience experiences. Sound fills gaps; visuals create first impressions." },
    ],
  },

  {
    id: "pres-datastory",
    pillar: "Persuasion",
    title: "Data Storytelling That Persuades",
    subtitle: "Turn charts and numbers into decisions",
    duration: "3 min",
    icon: "📊",
    pathIds: ["presentation"],
    levelIds: ["pres-3", "pres-4"],
    content: {
      intro:
        "Most people present data wrong. They show a chart and say 'As you can see here...' and let the audience interpret it. Executive communicators don't show data — they tell the story the data is telling. The chart is evidence; you are the narrator.",
      keyConcept:
        "The data narrative framework: (1) Context: 'This chart shows our monthly churn rate over 12 months.' (2) Headline: 'The key insight is that churn spiked 40% in September — and then recovered.' (3) Explanation: 'The spike was driven by X. The recovery happened because of Y.' (4) Implication: 'What this means for us is Z.' (5) Decision point: 'The question in front of us is whether we...' Don't let the audience interpret — tell them exactly what to take away.",
      example: {
        context: "Presenting a churn analysis chart to the leadership team",
        text: "This chart shows our monthly churn over the last year. [headline] The key insight is September — churn jumped 40% in a single month. [explanation] That spike correlates directly with the pricing change we rolled out on August 31st. The recovery in October came after we introduced the retention offer. [implication] What this tells us is that we're price-sensitive at exactly the segment we're targeting. [decision] The question is whether to revisit the pricing tier, or double down on the retention offer.",
      },
      proTip:
        "The single most powerful thing you can do with a slide: add a headline that states the conclusion. Not 'Q3 Churn Rate' — but 'Churn Peaked in September, Then Recovered.' The headline tells the story; the chart proves it.",
      practicePrompt:
        "In your next presentation session, present one data point using all five steps: context → headline → explanation → implication → decision. Time it: this should take 45-90 seconds per data point.",
    },
    challenge: {
      instruction: "Rewrite this data presentation using the 5-step narrative framework:",
      weakSentence: "So here you can see the sales numbers. As you can see they went up and then down. These are our results for the year.",
      modelAnswer: "This chart shows our annual sales by quarter. [headline] The key story is Q3: sales dropped 22% — our steepest quarterly decline in two years. [explanation] That drop coincides with the product issues we experienced in July. Q4 shows recovery, but we haven't fully closed the gap. [implication] This means we're entering the new year with a deficit we need to address in H1. [decision] The question is: do we accelerate sales hiring, or do we focus on improving the conversion rate from our existing pipeline?",
    },
    recallQuestions: [
      { question: "Name the five steps of the data narrative framework.", answer: "(1) Context: what the data shows. (2) Headline: the key insight. (3) Explanation: why/how it happened. (4) Implication: what it means for the business. (5) Decision point: what action this calls for." },
      { question: "What one change makes a slide headline dramatically more powerful?", answer: "Make it state the conclusion, not just the topic. Not 'Q3 Churn Rate' — but 'Churn Peaked in September, Then Recovered.' The headline tells the story; the chart proves it." },
    ],
  },

  /* — Culture — */
  {
    id: "culture-direct",
    pillar: "Professional Tone",
    title: "Decoding American Business Directness",
    subtitle: "Understand why Americans communicate the way they do",
    duration: "3 min",
    icon: "🇺🇸",
    pathIds: ["culture"],
    levelIds: ["cult-1", "cult-2"],
    content: {
      intro:
        "American business communication is often described as 'direct' — and to LATAM professionals, it can feel abrupt, blunt, or even rude at first. Understanding the cultural logic behind this communication style helps you interpret feedback correctly, respond professionally, and build credibility faster.",
      keyConcept:
        "Three American communication norms: (1) Low-context communication — Americans tend to say exactly what they mean. 'I need this by 5pm' means 5pm, not 'sometime today.' (2) Positive framing of criticism — 'This report needs work' is direct feedback, not an attack. The expectation is that you take the feedback, fix it, and move on. (3) Initiative over deference — waiting to be told what to do is seen as a lack of ownership. 'I saw an issue and I took care of it' is respected; 'I waited to see if you'd ask' is not.",
      example: {
        context: "American manager gives what feels like harsh feedback",
        text: "American: 'This presentation isn't landing. The data is there but the story isn't clear.' [Feels blunt. But subtext: I trust you to fix this and I want you to succeed.] Professional response: 'Got it — I'll restructure the narrative and add clearer takeaways for each section. Can I send you a revised version before tomorrow's meeting?' [Takes ownership, proposes action, shows initiative.]",
      },
      proTip:
        "When an American colleague gives you direct feedback, resist the instinct to over-explain or apologize. A simple 'Good point — I'll fix that' is a stronger response than a long justification. Speed of implementation signals confidence.",
      practicePrompt:
        "In your culture session, practice receiving direct feedback from the interlocutor without becoming defensive or over-apologizing. Respond with a brief acknowledgment and an action.",
    },
    challenge: {
      instruction: "Rewrite this over-apologetic response to direct feedback into a professional, confident reaction:",
      weakSentence: "Oh, I'm so sorry. I didn't know it wasn't clear. I tried to make it good but maybe I didn't understand what you wanted. I apologize for any confusion.",
      modelAnswer: "Fair point — the narrative structure isn't landing the way it should. I'll restructure it with clearer headlines for each section and send you a revised version this afternoon. Does that work?",
    },
    recallQuestions: [
      { question: "Name the three American communication norms explained in this lesson.", answer: "(1) Low-context communication: say exactly what you mean. (2) Positive framing of criticism: feedback is not an attack; take it, fix it, move on. (3) Initiative over deference: taking action without being asked is respected; waiting is not." },
      { question: "When receiving direct feedback from an American colleague, what is the strongest type of response?", answer: "'Good point — I'll fix that.' Brief acknowledgment + immediate action. Long justifications or apologies signal insecurity. Speed and directness of response communicate confidence." },
    ],
  },

  {
    id: "culture-network",
    pillar: "Fluency",
    title: "Networking Small Talk Formula",
    subtitle: "Start and sustain professional conversations at events and online",
    duration: "2 min",
    icon: "🤝",
    pathIds: ["culture"],
    levelIds: ["cult-3", "cult-4"],
    content: {
      intro:
        "Networking in English at a conference, on LinkedIn, or in an after-work event feels high-stakes for non-native speakers. The good news: small talk follows a predictable structure — and knowing that structure removes most of the anxiety.",
      keyConcept:
        "The networking conversation formula: (1) Open: situational comment or simple question ('How are you finding the event?', 'First time at this conference?') (2) Bridge: share something about yourself briefly ('I'm here from [company] — we work on...') (3) Hook: a curious, open-ended question about them ('What's keeping your team busy right now?', 'What's the biggest challenge you're seeing in the industry?') (4) Active listen + follow-up (5) Graceful exit: 'It was great meeting you — I'll connect with you on LinkedIn. Enjoy the rest of the event.'",
      example: {
        context: "Starting a conversation at a tech industry networking event",
        text: "[Open] 'Great venue for this — is this your first time at Summit?' [Bridge] 'I'm Diego, I work in product at a fintech startup here in Bogotá — we're expanding into the US market.' [Hook] 'What brings you here — are you exploring partnerships or more focused on the content?' [Listen, follow up] 'Interesting — what's the main obstacle you've hit with that?' [Exit] 'This has been a great conversation — I'd love to stay in touch. What's the best way to connect with you?'",
      },
      proTip:
        "The most powerful networking question is 'What are you working on right now?' It's open-ended, non-threatening, and gives the other person full control of the direction. People love talking about their current projects — and you learn more in one minute than in ten questions about their resume.",
      practicePrompt:
        "In your next culture session, simulate a 3-minute networking conversation using all 5 steps. Practice the graceful exit — it's harder than the opening.",
    },
    challenge: {
      instruction: "Rewrite this awkward networking opening into a natural, professional conversation starter:",
      weakSentence: "Hello. My name is Ana. I work in marketing. Do you work in marketing too? What is your job?",
      modelAnswer: "Hey — I'm Ana. First time at this event, or have you been before? [pause] Nice. I work in marketing at a SaaS company — we're in the middle of a product launch, so this conference came at the perfect time. What about you — what's keeping you busy lately?",
    },
    recallQuestions: [
      { question: "Name the five steps of the networking conversation formula.", answer: "(1) Open: situational comment or simple question. (2) Bridge: share something about yourself briefly. (3) Hook: a curious, open-ended question about them. (4) Active listen + follow-up. (5) Graceful exit." },
      { question: "What is the most powerful networking question from this lesson, and why?", answer: "'What are you working on right now?' — it's open-ended, non-threatening, gives full control to the other person, and makes them want to talk. You learn more in one minute than from ten resume-style questions." },
    ],
  },
];
