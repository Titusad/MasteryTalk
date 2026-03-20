/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Preparation Toolkit Prompt Builder
 *
 *  Generates personalized Power Phrases, Power Questions,
 *  and Cultural Intelligence tips via GPT-4o, contextualized
 *  to the user's scenario, industry, job description, etc.
 *
 *  Called as a separate endpoint (/generate-preparation-toolkit)
 *  in parallel with /generate-script during the "generating-script" step.
 * ══════════════════════════════════════════════════════════════
 */

/* ═══════════════════════════════════════════════════════════════
   REGIONAL CONTEXT for cultural tips
   ═══════════════════════════════════════════════════════════════ */

const REGIONAL_CONTEXT: Record<string, string> = {
    brazil: "The user is a Brazilian professional. Consider Brazilian cultural tendencies: over-contextualizing before the point, hedging with softeners, warmth-first communication style. Bridge from Brazilian norms to US business expectations.",
    mexico: "The user is a Mexican professional. Consider Mexican cultural tendencies: deferential language with US counterparts, formal communication style. Bridge from Mexican norms to US business directness.",
    colombia: "The user is a Colombian professional. Consider Colombian cultural tendencies: strong relationship-building skills, sometimes underselling premium value. Bridge from Colombian warmth to US results-driven communication.",
    global: "The user is a LATAM professional. Bridge from typical LATAM communication patterns (relationship-first, softened language, over-contextualization) to US business expectations (data-first, direct, concise).",
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PROMPT BUILDER
   ═══════════════════════════════════════════════════════════════ */

export interface PreparationToolkitConfig {
    scenario: string;
    interlocutor: string;
    scenarioType: string;
    guidedFields?: Record<string, string> | null;
    marketFocus?: string | null;
}

export function buildPreparationToolkitPrompt(config: PreparationToolkitConfig): {
    systemPrompt: string;
    userMessage: string;
} {
    const { scenario, interlocutor, scenarioType, guidedFields, marketFocus } = config;

    const scenarioLabel: Record<string, string> = {
        sales: "Sales Pitch",
        interview: "Job Interview",
        csuite: "Executive Presentation",
        negotiation: "Negotiation",
        networking: "Networking",
    };

    const label = scenarioLabel[scenarioType] || "Business Conversation";
    const regional = REGIONAL_CONTEXT[marketFocus ?? ""] ?? REGIONAL_CONTEXT.global;

    // Build user context from guided fields
    let userContext = "No specific details provided.";
    if (guidedFields && Object.keys(guidedFields).length > 0) {
        const entries = Object.entries(guidedFields)
            .filter(([_, v]) => v && String(v).trim().length > 0)
            .map(([k, v]) => `${k}: ${v}`);
        if (entries.length > 0) {
            userContext = entries.join("\n");
        }
    }

    const systemPrompt = `You are an elite executive communication strategist specializing in coaching Latin American professionals for high-stakes US business conversations.

Your task: Generate a PREPARATION TOOLKIT — personalized power phrases, strategic questions, and cultural intelligence tips that the user will study BEFORE their practice session. This toolkit must be specific to their scenario, industry, role, and cultural background.

═══════════════════════════════════════════════════════════════
CONTEXT
═══════════════════════════════════════════════════════════════
Scenario type: ${label}
Interlocutor: ${interlocutor}
${scenario ? `Scenario description: ${scenario}` : ""}

USER'S DETAILS:
${userContext}

CULTURAL BACKGROUND:
${regional}

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT (MANDATORY JSON)
═══════════════════════════════════════════════════════════════

Respond with ONLY a valid JSON object. No markdown, no code fences.

{
  "powerPhrases": [
    {
      "id": "pp-1",
      "phrase": "The exact phrase in English the user should memorize and practice",
      "context": "Brief explanation of WHEN and WHY to use this phrase (1 sentence)",
      "category": "opener|data|objection|transition|closing"
    }
  ],
  "powerQuestions": [
    {
      "question": "The strategic question in English",
      "rationale": "Why this question works — what it reveals or achieves (1-2 sentences)",
      "timing": "When to ask it in the conversation (e.g., 'After they mention budget constraints')"
    }
  ],
  "culturalTips": [
    {
      "title": "Short title (5-8 words)",
      "description": "Practical explanation of the cultural bridge — what to DO or AVOID and WHY (1-2 sentences)",
      "type": "do|avoid"
    }
  ]
}

═══════════════════════════════════════════════════════════════
GENERATION RULES
═══════════════════════════════════════════════════════════════

POWER PHRASES (generate 5-6):
- Must be phrases a senior US executive would actually say — boardroom English, not textbook English
- Each phrase must be directly relevant to this specific scenario and industry
- Include a mix of categories: at least 1 opener, 1 data/impact, 1 objection handler, 1 transition, 1 closing
- If the user provided specific details (company, product, metrics), weave them into the phrases
- Each phrase should be 8-20 words — concise and memorable

POWER QUESTIONS (generate 3-4):
- Strategic questions the user should ask their counterpart
- Each question must be specific to this scenario type and interlocutor
- Questions should demonstrate executive-level thinking, not generic curiosity
- Include specific timing guidance based on conversation flow

CULTURAL TIPS (generate 4-5):
- Mix of "do" (3) and "avoid" (2) tips
- Must bridge from LATAM communication norms to US business expectations
- Specific to this scenario type (e.g., interview tips are different from sales tips)
- Actionable — not just "be direct" but HOW to be direct in this specific context
- Reference specific phrases or behaviors the user should adopt or drop

═══════════════════════════════════════════════════════════════
QUALITY GATES
═══════════════════════════════════════════════════════════════
- [ ] Every phrase/question is specific to this scenario, not generic
- [ ] Cultural tips reference the user's regional background
- [ ] Phrases use natural spoken English (contractions, rhythm)
- [ ] Questions demonstrate strategic thinking relevant to the interlocutor
- [ ] Tips provide concrete before/after examples of communication style`;

    const userMessage = `Generate the preparation toolkit for this ${label} scenario with interlocutor "${interlocutor}".

Remember:
- Return ONLY valid JSON. No markdown fences.
- Power phrases must be in first person (what the user will SAY)
- Questions and tips must be specific to this exact scenario
- Everything in English except where noted`;

    return { systemPrompt, userMessage };
}
