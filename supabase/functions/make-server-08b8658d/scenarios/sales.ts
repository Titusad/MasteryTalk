export const SALES_DUAL_AXIS_BLOCK = `
=== SALES-SPECIFIC: DUAL-AXIS EVALUATION ===
This was a SALES PITCH practice session. You must evaluate on TWO axes:

**AXIS 1: Language Proficiency** — "How did they SOUND?"
(Vocabulary, Grammar, Fluency, Professional Tone, Persuasion — scored in pillarScores as usual)

**AXIS 2: Sales Effectiveness** — "How well did they SELL?"
Evaluate these 4 dimensions (0-100 each):
- **Value Articulation**: Did they clearly communicate the value proposition? Did they frame benefits in terms of ROI, cost savings, or competitive advantage? Or did they lead with features and jargon?
- **Objection Handling**: When the buyer pushed back (price, competitors, timing), did they address the objection directly with data/evidence? Or did they deflect, fold, or panic?
- **Closing Strength**: Did they drive toward a concrete next step? Did they create urgency? Or did the conversation fizzle with "I'll send you some materials"?
- **Discovery Quality**: Did they ask smart questions to understand the buyer's pain? Did they listen and adapt, or just deliver a monologue?

Also provide 2-4 "salesInsights" — one per dimension that needs attention, with an observation and a coaching tip.

The **salesReadinessScore** combines both axes:
  salesReadinessScore = (professionalProficiency * 0.35) + (avgSalesEffectiveness * 0.65)
Sales Effectiveness gets MORE weight because in a pitch, persuasion and strategy matter more than perfect grammar.
`;

export const SALES_OUTPUT_FIELDS = `,
  "salesContentScores": {
    "Value Articulation": 0-100,
    "Objection Handling": 0-100,
    "Closing Strength": 0-100,
    "Discovery Quality": 0-100
  },
  "salesReadinessScore": 0-100,
  "salesInsights": [
    {
      "dimension": "Value Articulation | Objection Handling | Closing Strength | Discovery Quality",
      "observation": "What you noticed in English (1 sentence)",
      "tip": "Actionable coaching tip in English (1-2 sentences). Include an English example phrase in single quotes if applicable."
    }
  ]`;

export function getSalesGapAnalysis(filledKeys: string[]): string[] {
  const gaps: string[] = [];
  if (!filledKeys.some((k) => k.includes("prospect") || k.includes("company") || k === "product")) {
    gaps.push("- No prospect information. Create a realistic B2B scenario.");
  }
  if (!filledKeys.some((k) => k.includes("deck") || k.includes("talking") || k === "problem")) {
    gaps.push("- No pitch material. Focus on strategic frameworks the user can fill with their data.");
  }
  return gaps;
}
