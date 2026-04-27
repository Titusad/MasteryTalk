export const MEETING_DUAL_AXIS_BLOCK = `
=== MEETING-SPECIFIC: DUAL-AXIS EVALUATION ===
This was a TEAM MEETING / STATUS UPDATE practice session. You must evaluate on TWO axes:

**AXIS 1: Language Proficiency** — "How did they SOUND?"
(Vocabulary, Grammar, Fluency, Professional Tone, Persuasion — scored in pillarScores as usual)

**AXIS 2: Meeting Effectiveness** — "How well did they COMMUNICATE in the meeting?"
Evaluate these 4 dimensions (0-100 each):
- **Update Clarity**: Was their status update clear, concise, and structured? Did they follow a Yesterday → Today → Blockers format or equivalent? Or did they ramble without a clear point?
- **Time Awareness**: Did they respect the pace of the meeting? Did they avoid over-explaining or going off-topic? Did they signal clearly when they were done vs. when they needed the floor?
- **Active Listening**: Did they engage with what others said? Did they connect their contributions to the discussion, or did they deliver a monologue disconnected from the conversation?
- **Next Steps Ownership**: Did they commit to concrete next steps with clear ownership and deadlines? Or did they leave commitments vague?

Also provide 2-4 "meetingInsights" — one per dimension that needs attention, with an observation and a coaching tip.

The **meetingReadinessScore** combines both axes:
  meetingReadinessScore = (professionalProficiency * 0.4) + (avgMeetingEffectiveness * 0.6)
Meeting Effectiveness gets MORE weight because in a team meeting, being understood and collaborative matters more than perfect grammar.
`;

export const MEETING_OUTPUT_FIELDS = `,
  "meetingContentScores": {
    "Update Clarity": 0-100,
    "Time Awareness": 0-100,
    "Active Listening": 0-100,
    "Next Steps Ownership": 0-100
  },
  "meetingReadinessScore": 0-100,
  "meetingInsights": [
    {
      "dimension": "Update Clarity | Time Awareness | Active Listening | Next Steps Ownership",
      "observation": "What you noticed in English (1 sentence)",
      "tip": "Actionable coaching tip in English (1-2 sentences). Include an English example phrase in single quotes if applicable."
    }
  ]`;

export function getMeetingGapAnalysis(filledKeys: string[]): string[] {
  const gaps: string[] = [];
  if (!filledKeys.some((k) => k.includes("topic") || k.includes("agenda") || k.includes("meeting"))) {
    gaps.push("- No meeting topic provided. Create a realistic cross-functional team sync scenario (e.g., sprint review, project status update).");
  }
  if (!filledKeys.some((k) => k.includes("role") || k.includes("team") || k.includes("context"))) {
    gaps.push("- No role context provided. Focus the script on STRUCTURE: how to deliver a clear status update, flag blockers, and commit to next steps.");
  }
  return gaps;
}
