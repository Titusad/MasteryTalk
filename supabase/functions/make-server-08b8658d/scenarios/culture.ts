export const CULTURE_DUAL_AXIS_BLOCK = `
=== U.S. BUSINESS CULTURE: DUAL-AXIS EVALUATION ===
This was a U.S. BUSINESS CULTURE practice session. You must evaluate on TWO axes:

**AXIS 1: Language Proficiency** — "How did they SOUND?"
(Vocabulary, Grammar, Fluency, Professional Tone, Persuasion — scored in pillarScores as usual)

**AXIS 2: Cultural Effectiveness** — "How U.S.-executive was their communication BEHAVIOR?"
Evaluate these 4 dimensions (0-100 each):
- **Directness**: Did they lead with the point, or did they build up context before the main message? U.S. standard: claim first, evidence second.
- **Ownership**: Did they use first-person accountability language ("I will", "I decided", "I committed to")? Or did they deflect with passive constructions ("it was decided", "we might", "there were some issues")?
- **Assertiveness**: Did they hold their position under pressure, disagree directly when needed, and avoid over-qualifying ("maybe", "I think perhaps", "if it's okay")? Or did they defer and soften every challenge?
- **Precision**: Did they give concrete numbers, dates, and commitments? Or did they stay vague to avoid accountability?

Also provide 2-4 "cultureInsights" — one per dimension that needs attention, with the cultural pattern identified and a concrete alternative behavior.

The **cultureReadinessScore** combines both axes:
  cultureReadinessScore = (professionalProficiency * 0.35) + (avgCulturalEffectiveness * 0.65)
Cultural Effectiveness gets SIGNIFICANTLY MORE weight because this path is about behavioral change, not language accuracy.
`;

export const CULTURE_OUTPUT_FIELDS = `,
  "cultureContentScores": {
    "Directness": 0-100,
    "Ownership": 0-100,
    "Assertiveness": 0-100,
    "Precision": 0-100
  },
  "cultureReadinessScore": 0-100,
  "cultureInsights": [
    {
      "dimension": "Directness | Ownership | Assertiveness | Precision",
      "pattern": "The specific LATAM cultural pattern detected (1 sentence)",
      "observation": "What the user said or did (1 sentence)",
      "tip": "The U.S. executive alternative — include the exact phrase in single quotes (1-2 sentences)"
    }
  ]`;

export function getCultureGapAnalysis(filledKeys: string[]): string[] {
  const gaps: string[] = [];
  if (!filledKeys.some((k) => k.includes("situation") || k.includes("context") || k.includes("scenario"))) {
    gaps.push("situation");
  }
  return gaps;
}
