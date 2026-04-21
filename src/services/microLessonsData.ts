/**
 * ══════════════════════════════════════════════════════════════
 *  MasteryTalk PRO — Micro-Lessons Library
 *
 *  Static content for personalized skill development.
 *  Lessons are shown based on the user's weakest pillars.
 *  MVP: 12 lessons (2 per pillar).
 * ══════════════════════════════════════════════════════════════
 */

export interface MicroLesson {
  id: string;
  pillar: string;
  title: string;
  subtitle: string;
  duration: string;
  icon: string;
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
}

export const MICRO_LESSONS: MicroLesson[] = [
  /* ─── Grammar ─── */
  {
    id: "grammar-conditionals",
    pillar: "Grammar",
    title: "Conditionals for Negotiations",
    subtitle: "Sound more strategic with hypothetical framing",
    duration: "2 min",
    icon: "",
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
  },
  {
    id: "grammar-passive-voice",
    pillar: "Grammar",
    title: "Passive Voice for Diplomacy",
    subtitle: "Deliver tough messages without pointing fingers",
    duration: "2 min",
    icon: "",
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
  },

  /* ─── Vocabulary ─── */
  {
    id: "vocab-power-verbs",
    pillar: "Vocabulary",
    title: "Power Verbs for Leadership",
    subtitle: "Replace weak verbs with executive-level language",
    duration: "2 min",
    icon: "",
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
  },
  {
    id: "vocab-hedging",
    pillar: "Vocabulary",
    title: "Hedging Language for Diplomacy",
    subtitle: "Express opinions confidently without sounding aggressive",
    duration: "2 min",
    icon: "",
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
  },

  /* ─── Fluency ─── */
  {
    id: "fluency-fillers",
    pillar: "Fluency",
    title: "Eliminating Filler Words",
    subtitle: "Replace 'um' and 'like' with strategic pauses",
    duration: "2 min",
    icon: "",
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
  },
  {
    id: "fluency-thought-grouping",
    pillar: "Fluency",
    title: "Thought Grouping & Pausing",
    subtitle: "Structure your speech for maximum clarity",
    duration: "2 min",
    icon: "",
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
  },

  /* ─── Pronunciation ─── */
  {
    id: "pron-stress-patterns",
    pillar: "Pronunciation",
    title: "Word Stress in Business English",
    subtitle: "Sound natural by stressing the right syllables",
    duration: "2 min",
    icon: "",
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
  },
  {
    id: "pron-connected-speech",
    pillar: "Pronunciation",
    title: "Connected Speech & Linking",
    subtitle: "Flow between words like a native speaker",
    duration: "2 min",
    icon: "",
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
  },

  /* ─── Professional Tone ─── */
  {
    id: "tone-diplomatic-disagreement",
    pillar: "Professional Tone",
    title: "Diplomatic Disagreement",
    subtitle: "Push back on ideas while preserving relationships",
    duration: "2 min",
    icon: "",
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
  },
  {
    id: "tone-executive-register",
    pillar: "Professional Tone",
    title: "Executive Register in Speech",
    subtitle: "Adjust your language level for C-suite conversations",
    duration: "2 min",
    icon: "",
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
  },

  /* ─── Persuasion ─── */
  {
    id: "persuasion-prep",
    pillar: "Persuasion",
    title: "The PREP Framework",
    subtitle: "Structure any argument in 30 seconds",
    duration: "2 min",
    icon: "",
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
  },
  {
    id: "persuasion-data-backed",
    pillar: "Persuasion",
    title: "Data-Backed Arguments",
    subtitle: "Turn opinions into evidence-based proposals",
    duration: "2 min",
    icon: "",
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
  },

  /* ═══════════════════════════════════════════════
     EXPANDED LIBRARY — Lessons 3 & 4 per pillar
     ═══════════════════════════════════════════════ */

  /* ─── Grammar (3 & 4) ─── */
  {
    id: "grammar-reported-speech",
    pillar: "Grammar",
    title: "Reported Speech for Summaries",
    subtitle: "Relay decisions and quotes with authority",
    duration: "3 min",
    icon: "",
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
  },
  {
    id: "grammar-relative-clauses",
    pillar: "Grammar",
    title: "Relative Clauses for Precision",
    subtitle: "Add detail without losing clarity",
    duration: "2 min",
    icon: "",
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
  },

  /* ─── Vocabulary (3 & 4) ─── */
  {
    id: "vocab-collocations",
    pillar: "Vocabulary",
    title: "Business Collocations",
    subtitle: "Sound natural with word partnerships",
    duration: "2 min",
    icon: "",
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
  },
  {
    id: "vocab-transition-phrases",
    pillar: "Vocabulary",
    title: "Transition Phrases for Flow",
    subtitle: "Connect ideas like a seasoned speaker",
    duration: "2 min",
    icon: "",
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
  },

  /* ─── Fluency (3 & 4) ─── */
  {
    id: "fluency-rhythm",
    pillar: "Fluency",
    title: "Speech Rhythm & Cadence",
    subtitle: "Vary your pace to hold attention",
    duration: "3 min",
    icon: "",
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
  },
  {
    id: "fluency-self-repair",
    pillar: "Fluency",
    title: "Graceful Self-Correction",
    subtitle: "Recover from mistakes without losing credibility",
    duration: "2 min",
    icon: "",
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
  },

  /* ─── Pronunciation (3 & 4) ─── */
  {
    id: "pron-intonation",
    pillar: "Pronunciation",
    title: "Intonation for Authority",
    subtitle: "Use pitch patterns to sound confident",
    duration: "3 min",
    icon: "",
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
  },
  {
    id: "pron-minimal-pairs",
    pillar: "Pronunciation",
    title: "Minimal Pairs in Business",
    subtitle: "Avoid confusion between similar-sounding words",
    duration: "2 min",
    icon: "",
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
  },

  /* ─── Professional Tone (3 & 4) ─── */
  {
    id: "tone-assertive-softening",
    pillar: "Professional Tone",
    title: "Assertive Softening",
    subtitle: "Be firm without being aggressive",
    duration: "2 min",
    icon: "",
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
  },
  {
    id: "tone-meeting-language",
    pillar: "Professional Tone",
    title: "Meeting Power Phrases",
    subtitle: "Control conversations with strategic language",
    duration: "2 min",
    icon: "",
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
  },

  /* ─── Persuasion (3 & 4) ─── */
  {
    id: "persuasion-storytelling",
    pillar: "Persuasion",
    title: "Storytelling in Business",
    subtitle: "Make your arguments unforgettable with narrative",
    duration: "3 min",
    icon: "",
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
  },
  {
    id: "persuasion-objection-handling",
    pillar: "Persuasion",
    title: "Handling Objections Like a Pro",
    subtitle: "Turn pushback into opportunities",
    duration: "3 min",
    icon: "",
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
  },
];
