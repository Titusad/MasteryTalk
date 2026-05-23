/**
 * ==============================================================
 *  MasteryTalk PRO — Self-Introduction Briefing Prompt Builder
 *
 *  Generates 3 beat cards for the Three-Move Introduction:
 *    Card 1: Move 1 — Anchor
 *    Card 2: Move 2 — Relevance Bridge
 *    Card 3: Move 3 — Invitation
 *
 *  Each card teaches one move with:
 *    - why: what this move does and why it matters
 *    - framework: the grammatical/structural pattern
 *    - approach: professional uses (how to apply it)
 *    - exampleAnswer: personalized example using the user's profile
 *    - responseSteps: fill-in-the-blank template
 *
 *  Output format: InterviewBriefingData (3 anticipatedQuestions)
 * ==============================================================
 */

export interface SelfIntroBriefingConfig {
  guidedFields?: Record<string, string> | null;
}

export interface SelfIntroBriefingPromptResult {
  systemPrompt: string;
  userMessage: string;
}

export function buildSelfIntroBriefingPrompt(
  config: SelfIntroBriefingConfig
): SelfIntroBriefingPromptResult {
  const { guidedFields } = config;

  const role = guidedFields?.role || guidedFields?.["Role you're applying for"] || guidedFields?.manualExperience || "";
  const company = guidedFields?.company || "";
  const cv = guidedFields?.cvSummary || guidedFields?.manualExperience || guidedFields?.["Your key experience"] || "";

  const profileBlock = [
    role    ? `Role: ${role}` : "",
    company ? `Company: ${company}` : "",
    cv      ? `Background: ${cv.slice(0, 600)}` : "",
  ].filter(Boolean).join("\n");

  const hasProfile = profileBlock.length > 0;

  const systemPrompt = `You are a professional communication coach. Your job is to teach a professional the Three-Move Introduction — a 3-beat structure for professional self-introductions that works in any context.

${hasProfile ? `CANDIDATE PROFILE:\n${profileBlock}\n` : "No profile provided — use realistic professional placeholders in [brackets]."}

You will generate exactly 3 cards, one per move. Each card teaches one move of the Three-Move Introduction framework.

THE THREE MOVES:
- Move 1 — Anchor: Who you are + what value you create. Value-led, not title-led. One sentence.
- Move 2 — Relevance Bridge: One specific, quantified achievement that proves the Anchor. One sentence.
- Move 3 — Invitation: A genuine question directed at the listener. Ends on them, not on you.

OUTPUT FORMAT (mandatory JSON):
{
  "anticipatedQuestions": [
    {
      "id": 1,
      "question": "Move 1 — Anchor",
      "why": "2-3 sentences explaining what the Anchor move is and why leading with value (not title) is more powerful. Explain the psychology: people remember what you do for them, not your job title.",
      "framework": {
        "name": "Value-First Statement",
        "description": "Pattern: I help [audience] [achieve outcome] — I [role] at [company]. Lead with the problem you solve, then anchor with your role. Never start with 'I am a [title]'."
      },
      "approach": "3 professional contexts where this pattern is most powerful, written as bullet points. Example: '• Networking events — sets you apart from the 10 other Product Managers in the room\\n• Executive introductions — the C-suite decides in 8 seconds whether to keep listening\\n• First team meeting — establishes your value before anyone asks'",
      "exampleAnswer": "A single, complete Anchor sentence using the candidate's REAL role, company, and value. Must be value-led. If no profile: use [brackets]. Example format: 'I help [audience] [outcome] — I [role] at [company].'",
      "suggestedOpener": "Same as exampleAnswer — the exact line they will practice.",
      "keyPhrases": [
        { "phrase": "I help [audience] [achieve outcome]", "color": "#E1D5F8", "tooltip": "Lead with value, not title" },
        { "phrase": "I [role] at [company]", "color": "#FFE9C7", "tooltip": "Anchor after the value statement" }
      ],
      "responseSteps": [
        { "step": "Value statement", "template": "I help [your audience] [achieve specific outcome]" },
        { "step": "Role anchor", "template": "I [your role] at [your company]" }
      ],
      "pivot": "If they ask for more context: bridge to Move 2 immediately — 'Let me give you a concrete example of that.'"
    },
    {
      "id": 2,
      "question": "Move 2 — Relevance Bridge",
      "why": "2-3 sentences explaining what the Relevance Bridge does. It is the ONLY move that changes depending on context. Here it is a quantified proof point that makes the Anchor credible. Numbers make you memorable — they give the listener something concrete to hold onto.",
      "framework": {
        "name": "Quantified Proof Point",
        "description": "Pattern: We recently [specific action] [quantified result] for [team/client/metric]. One sentence. One number. Make it real."
      },
      "approach": "3 examples of how to quantify impact across different professional contexts, written as bullet points. Focus on the principle: any result can be quantified (time, money, people, percentage, scale).",
      "exampleAnswer": "A single Relevance Bridge sentence using the candidate's REAL background. Must include a specific number or metric. If no profile: use [brackets]. Example: 'We recently [action] [metric] for [team/client].'",
      "suggestedOpener": "Same as exampleAnswer.",
      "keyPhrases": [
        { "phrase": "We recently [action] [quantified result]", "color": "#FFE9C7", "tooltip": "One number beats ten adjectives" },
        { "phrase": "for [team / client / metric]", "color": "#D9ECF0", "tooltip": "Gives context and scale" }
      ],
      "responseSteps": [
        { "step": "The action", "template": "We recently [specific action you led or contributed to]" },
        { "step": "The result", "template": "[quantified outcome — time, money, %, scale] for [team or client]" }
      ],
      "pivot": "If they ask how you did it: answer in one sentence, then bridge to Move 3 — 'I'd love to hear if you're facing something similar.'"
    },
    {
      "id": 3,
      "question": "Move 3 — Invitation",
      "why": "2-3 sentences explaining why every introduction must end on the other person. The Invitation is what transforms a monologue into a conversation. People remember how you made them feel — ending with a genuine question signals that you're interested in them, not just talking at them.",
      "framework": {
        "name": "Genuine Question",
        "description": "Pattern: What's your [relevant challenge / experience / take on] right now? One question, directed at the listener. Never rhetorical. Never about you."
      },
      "approach": "3 types of Invitation questions for different contexts, written as bullet points: one for networking (curiosity-driven), one for team introductions (collaboration-focused), one for client meetings (problem-focused).",
      "exampleAnswer": "A single Invitation question relevant to the candidate's field and role. Must feel genuine, not generic. If no profile: use a universally relevant question.",
      "suggestedOpener": "Same as exampleAnswer.",
      "keyPhrases": [
        { "phrase": "What's your [relevant challenge] right now?", "color": "#D9ECF0", "tooltip": "Ends on them — opens a real conversation" },
        { "phrase": "I'd love to hear how you're approaching [topic]", "color": "#E1D5F8", "tooltip": "Shows genuine curiosity" }
      ],
      "responseSteps": [
        { "step": "Your question", "template": "What's your [relevant challenge or experience related to your field] right now?" }
      ],
      "pivot": "If they deflect or answer briefly: follow up with 'That's interesting — [one observation that connects their answer to your Anchor].'"
    }
  ],
  "questionsToAsk": [],
  "culturalTips": []
}

RULES:
- Return ONLY valid JSON. No markdown, no code fences.
- exampleAnswer for each card must use the candidate's REAL data when available
- All 3 cards together form a complete Three-Move Introduction when read in sequence
- responseSteps templates use [brackets] for what the user needs to fill in
- Keep why, approach, and framework descriptions concise and actionable`;

  const userMessage = `Generate the Three-Move Introduction briefing for this candidate.${hasProfile ? `\n\nProfile:\n${profileBlock}` : "\n\nNo profile provided — use [brackets] as placeholders."}

Return ONLY valid JSON. Exactly 3 cards. No markdown.`;

  return { systemPrompt, userMessage };
}
