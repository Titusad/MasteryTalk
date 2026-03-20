/**
 * ==============================================================
 *  inFluentia PRO -- Interview Briefing Prompt Builder
 *
 *  Generates a question-based interview preparation briefing
 *  via GPT-4o. Instead of a narrative coaching script, this
 *  produces a scannable card-per-question format:
 *
 *  - 5-6 anticipated questions the interviewer will ask
 *  - For each: approach framework + key phrases + pivot strategy
 *  - 2-3 strategic questions the user should ASK
 *  - Cultural quick tips (LATAM -> US bridge)
 *
 *  This single call replaces BOTH /generate-script AND
 *  /generate-preparation-toolkit for interview scenarios.
 * ==============================================================
 */

import { resolveLocale } from "./locale-utils.ts";

/* ================================================================
   INTERLOCUTOR QUESTION PROFILES
   What each interviewer type typically asks and WHY
   ================================================================ */

const INTERVIEWER_PROFILES: Record<string, string> = {
    recruiter: `INTERVIEWER: THE RECRUITER
Screening focus: Career narrative clarity, role motivation, salary alignment, communication fluency.
They typically ask: "Walk me through your background", "Why this role?", "What are your salary expectations?", "Why are you leaving your current role?", "What's your timeline?"
Decision they're making: "Can I confidently forward this candidate to the hiring manager?"
Time: 20-30 min screening. First 3 minutes decide everything.`,

    sme: `INTERVIEWER: THE SUBJECT MATTER EXPERT (SME)
Technical focus: Depth of knowledge, hands-on vs. theoretical, problem-solving methodology, intellectual honesty.
They typically ask: Deep technical scenarios, "How would you approach X?", "Tell me about a time you solved Y", "What's the trade-off between A and B?", edge cases.
Decision they're making: "Would I trust this person to ship production code / solve real problems on my team?"
Time: 45-60 min. They probe until they find the edge of your knowledge.`,

    hiring_manager: `INTERVIEWER: THE HIRING MANAGER
Performance focus: Ownership, autonomy, business impact in numbers, team dynamics, first-90-days thinking.
They typically ask: "What's your biggest achievement?", "How do you handle ambiguity?", "Tell me about a time you failed", "What would your first 30 days look like?", "How do you prioritize?"
Decision they're making: "Can this person run with projects without me checking in daily?"
Time: 30-45 min. Direct and pragmatic. They want outcomes, not activities.`,

    hr: `INTERVIEWER: HR / PEOPLE & CULTURE
Culture focus: Soft skills, remote collaboration readiness, conflict resolution, self-awareness, growth mindset.
They typically ask: "Tell me about a conflict at work", "How do you handle feedback?", "Describe your ideal team", "What's your biggest weakness?", behavioral STAR questions.
Decision they're making: "Will this person thrive in our culture and work well with the team?"
Time: 30-45 min. They want authentic stories, not rehearsed corporate answers.`,
};

/* ================================================================
   REGIONAL CONTEXT
   ================================================================ */

const REGIONAL_CONTEXT: Record<string, string> = {
    brazil: `REGIONAL: BRAZIL
Brazilian pros tend to over-contextualize before the point. Coach to LEAD WITH THE CONCLUSION.
Replace hedging ("maybe we could...") with commitment language ("I recommend...").
Leverage Brazil's tech ecosystem credibility (Nubank, VTEX, iFood).`,

    mexico: `REGIONAL: MEXICO
Mexican pros sometimes default to deferential language. Coach for AUTHORITY and executive presence.
NAFTA/USMCA proximity is a selling point. Push ownership language: "I delivered" not "We could try".`,

    colombia: `REGIONAL: COLOMBIA
Colombian pros excel at rapport but may undersell premium rates. Anchor value in OUTCOMES, not hours.
Coach proactive communication about timezone management and delivery cadence.`,

    global: `REGIONAL: GLOBAL LATAM
Coach for directness, quantified impact, and professional confidence.
US execs expect concise answers, data-backed claims, comfort with direct feedback.`,
};

/* ================================================================
   GUIDED FIELDS PROCESSOR
   ================================================================ */

function processGuidedFields(guidedFields: Record<string, string> | null | undefined): {
    userContext: string;
    hasJobDescription: boolean;
    hasExperience: boolean;
} {
    if (!guidedFields || Object.keys(guidedFields).length === 0) {
        return {
            userContext: "No specific details provided. Generate realistic but universal interview questions for the interlocutor type.",
            hasJobDescription: false,
            hasExperience: false,
        };
    }

    const lines: string[] = [];
    let hasJobDescription = false;
    let hasExperience = false;

    for (const [key, value] of Object.entries(guidedFields)) {
        if (!value || !String(value).trim()) continue;
        const k = key.toLowerCase();
        if (k.includes("job") || k.includes("role") || k === "role") {
            lines.push(`TARGET ROLE / JOB DESCRIPTION:\n"""${value}"""`);
            hasJobDescription = true;
        } else if (k.includes("experience") || k.includes("strength") || k === "strength") {
            lines.push(`USER'S KEY EXPERIENCE & STRENGTHS:\n"""${value}"""`);
            hasExperience = true;
        } else if (k === "cvsummary") {
            lines.push(`USER'S CV / RESUME SUMMARY (extracted by AI):\n"""${value}"""`);
            hasExperience = true;
        } else if (k === "company") {
            lines.push(`TARGET COMPANY / EMPLOYER:\n"""${value}"""`);
        } else {
            lines.push(`${key.toUpperCase()}:\n"""${value}"""`);
        }
    }

    return {
        userContext: lines.length > 0 ? lines.join("\n\n") : "No specific details provided.",
        hasJobDescription,
        hasExperience,
    };
}

/* ================================================================
   MAIN PROMPT BUILDER
   ================================================================ */

export interface InterviewBriefingConfig {
    scenario: string;
    interlocutor: string;
    guidedFields?: Record<string, string> | null;
    locale?: string | null;
}

export interface InterviewBriefingPromptResult {
    systemPrompt: string;
    userMessage: string;
}

export function buildInterviewBriefingPrompt(
    config: InterviewBriefingConfig
): InterviewBriefingPromptResult {
    const { scenario, interlocutor, guidedFields, locale } = config;
    const lc = resolveLocale(locale);

    const interviewerProfile =
        INTERVIEWER_PROFILES[interlocutor] ??
        `INTERVIEWER: ${interlocutor}\nA senior professional evaluating the candidate's readiness.`;

    const regional = REGIONAL_CONTEXT[lc.regionalKey] || REGIONAL_CONTEXT.global;
    const userData = processGuidedFields(guidedFields);

    const tooltipLang = lc.isBrazil ? "Portuguese (Brazilian)" : "Spanish";

    const systemPrompt = `You are an elite interview strategist who has coached 500+ Latin American professionals to win job interviews at US companies. You think like a recruiter, write like a coach, and prepare candidates like a strategist.

Your task: Generate an INTERVIEW BRIEFING — a scannable, card-based preparation that answers the candidate's core anxiety: "What will they ask me and how should I answer?"

This is NOT a narrative script. It's a tactical cheat sheet organized by ANTICIPATED QUESTIONS.

${"=".repeat(60)}
INTERVIEWER PROFILE
${"=".repeat(60)}
${interviewerProfile}

${"=".repeat(60)}
CANDIDATE'S ARSENAL
${"=".repeat(60)}
${userData.userContext}

${!userData.hasJobDescription ? "NOTE: No job description provided. Generate questions typical for this interviewer type in a senior tech/business role." : ""}
${!userData.hasExperience ? "NOTE: No experience details provided. Focus approach suggestions on universal frameworks (STAR, etc.) the candidate can fill with their own stories." : ""}

${"=".repeat(60)}
${regional}
${"=".repeat(60)}

${"=".repeat(60)}
OUTPUT FORMAT (MANDATORY JSON)
${"=".repeat(60)}

Respond with ONLY a valid JSON object. No markdown, no code fences.

{
  "anticipatedQuestions": [
    {
      "id": 1,
      "question": "The exact question the interviewer is likely to ask",
      "why": "One sentence: why this interviewer asks this specific question — what they're REALLY evaluating",
      "approach": "Brief strategy (1-2 sentences): which framework to use (STAR, direct pitch, etc.) and what to lead with",
      "keyPhrases": [
        {
          "phrase": "A power phrase in first person the candidate should memorize — 8-20 words",
          "color": "#FFE9C7",
          "tooltip": "Brief tip in ${tooltipLang} explaining WHY this phrase works (max 12 words)"
        }
      ],
      "pivot": "If they follow up or push back: one-sentence redirect strategy with a sample phrase"
    }
  ],
  "questionsToAsk": [
    {
      "question": "A strategic question the candidate should ask the interviewer",
      "why": "Why this question demonstrates executive-level thinking (1 sentence)"
    }
  ],
  "culturalTips": [
    {
      "title": "Short title (4-6 words)",
      "description": "Practical tip: what to DO or AVOID and WHY (1 sentence)",
      "type": "do"
    }
  ]
}

${"=".repeat(60)}
GENERATION RULES
${"=".repeat(60)}

ANTICIPATED QUESTIONS (generate exactly 5):
- Questions must be SPECIFIC to this interviewer type — a recruiter asks differently than an SME
- Order them by likely conversation flow (opening → probing → deep-dive → closing)
- If the user provided a job description, tailor questions to THAT specific role
- If the user provided experience, weave their real details into the approach and key phrases
- Each question card should be scannable in 10 seconds

KEY PHRASES (2-3 per question):
- Must be in FIRST PERSON — these are lines the candidate will say
- Must be boardroom English, not textbook English
- Color coding:
  * "#E1D5F8" (purple): Structure — transitions, framing phrases, signposting
  * "#FFE9C7" (peach): Impact — data claims, achievements, commitment language
  * "#D9ECF0" (blue): Engagement — rapport builders, smart callbacks, questions
- Distribute colors across questions (aim for balance)
- Tooltips in ${tooltipLang}, max 12 words, explain the STRATEGY not the meaning

APPROACH (per question):
- Name the framework: STAR, Direct Pitch, Problem-Solution, etc.
- Tell them what to LEAD WITH — the first thing out of their mouth
- Maximum 2 sentences. No fluff.

PIVOT (per question):
- Start with "If they..." — anticipate the follow-up
- Include a sample redirect phrase the candidate can memorize
- Maximum 1-2 sentences

QUESTIONS TO ASK (generate 2-3):
- Questions that demonstrate the candidate has done research and thinks strategically
- NOT generic questions ("What's the culture like?")
- YES specific probes ("How does the data team collaborate with product — embedded or service model?")
- Each with a brief "why" explaining what it signals

CULTURAL TIPS (generate 3-4):
- Mix of "do" (2-3) and "avoid" (1-2)
- Must bridge from LATAM communication to US interview expectations
- Specific and actionable — not "be direct" but "Replace 'I think maybe...' with 'Based on my experience...'"

${"=".repeat(60)}
QUALITY GATES
${"=".repeat(60)}
- [ ] Questions are specific to THIS interviewer type, not generic
- [ ] If user provided details, EVERY key detail appears somewhere
- [ ] Key phrases sound like a confident professional, not a textbook
- [ ] Approaches are actionable (tell them WHAT to do), not analytical
- [ ] The 5 cards together cover the full interview arc
- [ ] Tooltips are in ${tooltipLang} and explain strategy
- [ ] Total content is scannable in 2-3 minutes`;

    const userMessage = `Generate an interview briefing for a candidate preparing for a ${interlocutor.replace("_", " ")} interview.
${scenario ? `\nScenario context: ${scenario}` : ""}

Remember:
- Return ONLY valid JSON. No markdown fences.
- Exactly 5 anticipated questions, ordered by conversation flow
- 2-3 key phrases per question, in FIRST PERSON
- Each approach: max 2 sentences, name the framework
- Each pivot: starts with "If they...", max 1-2 sentences
- 2-3 questions to ask, with strategic rationale
- 3-4 cultural tips (mix of do/avoid)
- Tooltips in ${tooltipLang}, max 12 words`;

    return { systemPrompt, userMessage };
}