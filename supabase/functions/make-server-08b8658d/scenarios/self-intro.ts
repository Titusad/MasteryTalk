export const SELF_INTRO_DUAL_AXIS_BLOCK = `
=== SELF-INTRODUCTION: DUAL-AXIS EVALUATION ===
This was a PROFESSIONAL SELF-INTRODUCTION practice session. You must evaluate on TWO axes:

**AXIS 1: Language Proficiency** — "How did they SOUND?"
(Vocabulary, Grammar, Fluency, Professional Tone, Persuasion — scored in pillarScores as usual)

**AXIS 2: Introduction Quality** — "How effective was their self-introduction?"
Evaluate these 4 dimensions (0-100 each):
- **Hook Strength**: Did they open with something memorable — a specific result, a problem they solve, or a question that creates curiosity? Or did they lead with their job title and company name?
- **Value Communication**: Did they clearly convey what they do and why it matters in 1-2 sentences? Or was it vague, generic, or just role/company with no value signal?
- **Time Discipline**: Was the introduction concise (30-90 seconds equivalent in text)? Or did they ramble, over-explain, or fail to find a natural close before the other person had a chance to respond?
- **Conversation Bridge**: Did they create an opening for the other person — a question, a curiosity signal, or something that invites dialogue? Or did they end on themselves with no bridge?

Also provide 2-4 "introInsights" — one per dimension that needs attention, with an observation and a concrete coaching tip.

The **introductionScore** combines both axes:
  introductionScore = (professionalProficiency * 0.5) + (avgIntroductionQuality * 0.5)
Both axes are weighted equally — for a self-introduction warm-up, language quality AND impact matter equally.
`;

export const SELF_INTRO_OUTPUT_FIELDS = `,
  "introductionScores": {
    "Hook Strength": 0-100,
    "Value Communication": 0-100,
    "Time Discipline": 0-100,
    "Conversation Bridge": 0-100
  },
  "introductionScore": 0-100,
  "introInsights": [
    {
      "dimension": "Hook Strength | Value Communication | Time Discipline | Conversation Bridge",
      "observation": "What you noticed in English (1 sentence)",
      "tip": "Actionable coaching tip in English (1-2 sentences). Include an English example phrase in single quotes if applicable."
    }
  ]`;

export function getSelfIntroGapAnalysis(_filledKeys: string[]): string[] {
  // Self-intro context is always pre-selected by the user in SelfIntroContextScreen
  // — there are no optional fields that can be missing.
  return [];
}
