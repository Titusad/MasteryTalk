export const PRESENTATION_DUAL_AXIS_BLOCK = `
=== PRESENTATION-SPECIFIC: DUAL-AXIS EVALUATION ===
This was an INTERNAL PRESENTATION / BUSINESS PITCH practice session. You must evaluate on TWO axes:

**AXIS 1: Language Proficiency** — "How did they SOUND?"
(Vocabulary, Grammar, Fluency, Professional Tone, Persuasion — scored in pillarScores as usual)

**AXIS 2: Presentation Effectiveness** — "How well did they PRESENT?"
Evaluate these 4 dimensions (0-100 each):
- **Hook & Framing**: Did they open with a compelling hook that established context, stakes, and their point of view upfront? Or did they bury the lead with background nobody asked for?
- **Data Storytelling**: Did they use data, evidence, or concrete examples to support their narrative? Did the data connect logically to their recommendation? Or were claims vague and unsupported?
- **Q&A Handling**: When challenged with questions or pushback, did they answer directly and confidently? Did they hold their position under pressure, or did they cave or deflect?
- **Closing Ask**: Did they end with a specific, clear ask or call to action? Did they make it easy for the audience to say yes? Or did the presentation fizzle without a clear next step?

Also provide 2-4 "presentationInsights" — one per dimension that needs attention, with an observation and a coaching tip.

The **presentationReadinessScore** combines both axes:
  presentationReadinessScore = (professionalProficiency * 0.35) + (avgPresentationEffectiveness * 0.65)
Presentation Effectiveness gets MORE weight because in a business presentation, narrative clarity and persuasion matter more than perfect grammar.
`;

export const PRESENTATION_OUTPUT_FIELDS = `,
  "presentationContentScores": {
    "Hook & Framing": 0-100,
    "Data Storytelling": 0-100,
    "Q&A Handling": 0-100,
    "Closing Ask": 0-100
  },
  "presentationReadinessScore": 0-100,
  "presentationInsights": [
    {
      "dimension": "Hook & Framing | Data Storytelling | Q&A Handling | Closing Ask",
      "observation": "What you noticed in English (1 sentence)",
      "tip": "Actionable coaching tip in English (1-2 sentences). Include an English example phrase in single quotes if applicable."
    }
  ]`;

export function getPresentationGapAnalysis(filledKeys: string[]): string[] {
  const gaps: string[] = [];
  if (!filledKeys.some((k) => k.includes("topic") || k.includes("presentation") || k.includes("subject"))) {
    gaps.push("- No presentation topic provided. Create a generic business case structure the user can fill with their real content.");
  }
  if (!filledKeys.some((k) => k.includes("audience") || k.includes("stakeholder") || k.includes("who"))) {
    gaps.push("- No audience information. Focus on universal executive presentation techniques: lead with the ask, support with data, close with a specific next step.");
  }
  if (!filledKeys.some((k) => k.includes("ask") || k.includes("recommendation") || k.includes("goal"))) {
    gaps.push("- No recommendation or ask provided. The script must model how to end a presentation with a clear, specific call to action.");
  }
  return gaps;
}
