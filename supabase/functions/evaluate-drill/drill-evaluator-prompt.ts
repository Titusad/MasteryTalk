// supabase/functions/evaluate-drill/drill-evaluator-prompt.ts

export type PillarName = 
  | "Vocabulary" 
  | "Grammar" 
  | "Fluency" 
  | "Pronunciation" 
  | "Professional Tone" 
  | "Persuasion";

export interface DrillContext {
  pillar: PillarName;
  scenarioType: string;
  interlocutorRole: string;
  situationContext: string;
  userOriginal: string;
  userDrillResponse: string;
  analystModelPhrase: string;
  attemptNumber: 1 | 2;
  lang: "es" | "pt" | "en";
}

export function buildDrillEvaluatorPrompt(context: DrillContext): string {
  const isSpanish = context.lang === "es";
  const languageName = isSpanish ? "Español" : context.lang === "pt" ? "Português" : "English";

  let pillarInstructions = "";

  switch (context.pillar) {
    case "Vocabulary":
      pillarInstructions = `
RUBRIC - VOCABULARY
1. Precision (40%): Did they use the correct term instead of a generic or translated one?
2. Register (35%): Is the word appropriate for a corporate C-level/managerial discussion?
3. Natural Fit (25%): Does the word sound native or is it stiff/awkward?
`;
      break;
    case "Grammar":
      pillarInstructions = `
RUBRIC - GRAMMAR
1. Correctness (50%): Is the sentence structurally correct without basic syntax errors?
2. Naturalness (30%): Does it flow smoothly like a native speaker?
3. Pattern Awareness (20%): Did they correctly apply the intended grammatical pattern (e.g., conditionals, indirect questions)?
`;
      break;
    case "Professional Tone":
      pillarInstructions = `
RUBRIC - PROFESSIONAL TONE
1. Register (35%): Is it polite but firm? Avoid overly casual or overly deferential language.
2. Executive Presence (40%): Does it project confidence and ownership?
3. US Cultural Alignment (25%): Is it direct enough for the US market without being aggressive?
`;
      break;
    case "Persuasion":
      pillarInstructions = `
RUBRIC - PERSUASION
1. Position Clarity (35%): Is the core argument or request immediately clear?
2. Evidence Anchor (40%): Do they back up their position with logical reasoning or data?
3. Close/Call to Action (25%): Does it end with a clear next step or strong closing thought?
`;
      break;
    case "Fluency":
    case "Pronunciation":
      // For Fluency and Pronunciation, Azure does the scoring. The LLM only narrates the result.
      pillarInstructions = `
RUBRIC - ORAL COMMUNICATION (${context.pillar})
Note: The score is predetermined by Azure Speech. Your job is to provide specific, actionable phonetic or rhythmic feedback based on the text they provided and the context of the error.
`;
      break;
  }

  const prompt = `
You are an elite Executive Communication Coach evaluating a professional's response in a targeted 'Skill Drill'.
The user originally made a mistake or produced a weak response during a simulation. They are now trying to fix it.

--- CONTEXT ---
Scenario: ${context.scenarioType}
Interlocutor: ${context.interlocutorRole}
Situation: ${context.situationContext}
Original Weak Response: "${context.userOriginal}"
Target Model Phrase (from analyst): "${context.analystModelPhrase}"

--- TASK ---
Evaluate the user's NEW drill response based specifically on the following pillar: ${context.pillar}.
Attempt Number: ${context.attemptNumber} of 2. Focus on whether they fixed the core issue.

User's Drill Response: "${context.userDrillResponse}"

${pillarInstructions}

--- OUTPUT FORMAT (JSON ONLY) ---
You must output a raw, parseable JSON object with the following structure:
{
  "score": number, // 0 to 100 based on the rubric for this pillar
  "passed": boolean, // true if score >= 80
  "badge": string, // "strong" (>=80), "close" (60-79), or "needs-work" (<60)
  "oneLiner": string, // Very short, punchy feedback (e.g., "Much clearer!", "Still a bit too casual.") in ${languageName}.
  "modelPhrase": string, // The target model phrase (return "${context.analystModelPhrase}")
  "narrative": string, // 1-2 sentences explaining WHY they got this score, tied directly to the rubric. In ${languageName}.
  "scoreBreakdown": {
    // Break down the score based on the rubric categories (e.g., "Precision": 35, etc). Must sum to 'score'.
  },
  "attemptNumber": ${context.attemptNumber},
  "pillar": "${context.pillar}"
}
`;

  return prompt;
}
