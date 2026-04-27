export const INTERVIEW_DUAL_AXIS_BLOCK = `
=== INTERVIEW-SPECIFIC: DUAL-AXIS EVALUATION ===
This was a JOB INTERVIEW practice session. You must evaluate on TWO axes:

**AXIS 1: Language Proficiency** — "How did they SOUND?"
(Vocabulary, Grammar, Fluency, Professional Tone, Persuasion — scored in pillarScores as usual)

**AXIS 2: Content Quality** — "How well did they ANSWER?"
Evaluate these 4 dimensions (0-100 each):
- **Relevance**: Did they actually answer what was asked? Or did they go off-topic, give generic answers, or dodge the question?
- **Structure**: Did they organize their answer with a clear beginning, middle, and end? Was their reasoning easy to follow?
- **Examples**: Did they provide concrete, specific examples with numbers/metrics? Or were answers vague and theoretical?
- **Impact**: Were their answers memorable? Did they sell themselves effectively? Would the interviewer be impressed and want to hire them?

Also provide 3-4 "contentInsights" — one per dimension that needs attention, with an observation and a coaching tip.

The **interviewReadinessScore** combines both axes:
  interviewReadinessScore = (professionalProficiency * 0.4) + (avgContentQuality * 0.6)
Content Quality gets MORE weight because in an interview, WHAT you say matters more than HOW you say it (as long as language is competent).
`;

export const INTERVIEW_OUTPUT_FIELDS = `
  ,
  "contentScores": {
    "Relevance": 0-100,
    "Structure": 0-100,
    "Examples": 0-100,
    "Impact": 0-100
  },
  "interviewReadinessScore": 0-100,
  "preparationUtilization": {
    "score": 0-100,
    "verdict": "Short verdict in English (e.g. 'Strong Alignment', 'Abandoned Preparation')",
    "insights": [
      {
        "aspect": "Framework usage | Key phrases | Pivot execution",
        "observation": "What happened in English",
        "rating": "strong | partial | missed"
      }
    ]
  },
  "contentInsights": [
    {
      "dimension": "Relevance | Structure | Examples | Impact",
      "observation": "What you noticed in English (1 sentence)",
      "tip": "Actionable coaching tip in English (1-2 sentences). Include an English example phrase in single quotes if applicable."
    }
  ]`;

export interface InterviewBriefingData {
  anticipatedQuestions?: Array<{
    id: number;
    question: string;
    approach: string;
    suggestedOpener?: string;
    framework?: { name: string; description: string };
    keyPhrases?: string[];
  }>;
  userDrafts?: Record<number, string>;
}

export function buildInterviewBriefingBlock(
  briefing: InterviewBriefingData | null | undefined
): string {
  if (briefing?.anticipatedQuestions?.length) {
    const questions = briefing.anticipatedQuestions
      .map((q) => {
        const lines = [`Q${q.id}: "${q.question}" — Planned approach: ${q.approach}`];
        if (q.framework) lines.push(`  Expected framework: ${q.framework.name}`);
        if (q.keyPhrases?.length) lines.push(`  Key phrases practiced: ${q.keyPhrases.join(", ")}`);
        const draft = briefing.userDrafts?.[q.id];
        if (draft?.trim()) lines.push(`  Prepared draft: "${draft.trim().slice(0, 200)}"`);
        return lines.join("\n");
      })
      .join("\n\n");

    return `
=== GAP C: BRIEFING-AWARE EVALUATION ===
The candidate prepared for this interview using a structured pre-briefing. Below is what they practiced.
Evaluate whether they ACTUALLY USED their preparation during the live conversation.

PREPARED QUESTIONS & STRATEGIES:
${questions}

BRIEFING EVALUATION CRITERIA:
1. **Preparation Utilization**: Did they use the frameworks, openers, and key phrases they practiced? Or did they forget their preparation under pressure?
2. **Adaptation Quality**: When the interviewer deviated from anticipated questions, did they adapt their prepared material or freeze?
3. **Draft vs. Live Gap**: Compare their prepared drafts (if any) to what they actually said. Did they improve on their drafts, stick to them robotically, or abandon them entirely?

Include these observations in your strengths/opportunities. If they used their preparation well, it's a strength ("Excellent preparation transfer"). If they abandoned it under pressure, it's an opportunity.

=== CRITICAL: METHODOLOGICAL COHERENCE ===
**YOU MUST ONLY REFERENCE FRAMEWORKS THAT WERE EXPLICITLY TAUGHT ABOVE.**
The user was coached with SPECIFIC frameworks for each question (listed in "Expected framework" above).
- If a question had NO framework assigned, do NOT suggest any (not STAR, not PAR, not CAR, not anything).
- If a question had a specific framework (e.g., "Problem-Action-Result"), ONLY reference THAT framework.
- NEVER introduce a framework the user has never seen. This confuses them and undermines their confidence.
- For "Structure" feedback, focus on whether their answer had a clear beginning/middle/end — do NOT name-drop frameworks they weren't taught.
`;
  }

  return `
=== CRITICAL: NO FRAMEWORK ASSUMPTIONS ===
The user did NOT go through a structured briefing with specific frameworks.
- Do NOT suggest specific frameworks by name (e.g., STAR, PAR, CAR).
- Instead, give concrete structural advice: "Start with the situation, then explain what you did, and end with the result."
- Frame advice as actionable steps, not academic framework names.
`;
}

export function getInterviewGapAnalysis(filledKeys: string[]): string[] {
  const gaps: string[] = [];
  if (!filledKeys.some((k) => k.includes("job") || k === "role")) {
    gaps.push("- No job description provided. Infer a realistic senior role from the user's experience.");
  }
  if (!filledKeys.some((k) => k.includes("experience") || k === "strength" || k === "cvsummary")) {
    gaps.push("- No experience details. Focus the script on STRUCTURE and universal interview strategy.");
  }
  return gaps;
}
