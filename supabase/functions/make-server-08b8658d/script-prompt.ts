/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Session Summary Prompt (Server-side)
 *
 *  Generates the system prompt for GPT-4o to create an executive
 *  session summary based on the conversation transcript.
 *
 *  This endpoint is called AFTER /analyze-feedback has completed.
 *  It receives the session metadata and generates:
 *    - overallSentiment: a motivational one-liner
 *    - nextSteps[]: 3 actionable next steps personalized to the session
 *    - sessionHighlight: a single standout positive moment
 * ══════════════════════════════════════════════════════════════
 */

/** Input payload for the /generate-summary user message */
export interface SummaryInput {
  scenarioType: string;
  interlocutor: string;
  transcript: string;
}

export function buildSessionSummaryPrompt(
  marketFocus?: string | null
): string {
  const isBrazil = marketFocus === "brazil";
  const lang = isBrazil ? "Portuguese (Brazilian)" : "Spanish";
  const langTag = isBrazil ? "PT-BR" : "ES";

  const sentimentExample = isBrazil
    ? "Seu controle de objecoes de preco foi excelente. Continue refinando seu fechamento e estara pronto."
    : "Tu manejo de objeciones de precio fue excelente. Sigue refinando tu cierre y estaras listo.";

  const badExample = isBrazil ? "Pratique mais" : "Practica mas";
  const goodExample = isBrazil
    ? "Pratique ancorar sua tarifa com dados: 'Our 97% retention rate means you save $X in rehiring costs.'"
    : "Practica anclar tu tarifa con datos: 'Our 97% retention rate means you save $X in rehiring costs.'";

  const pillarTags = isBrazil
    ? {
      p1: "Resiliência Linguística",
      p2: "Defesa de Valor",
      p3: "Alinhamento Cultural",
      p4: "Estrutura do Discurso",
    }
    : {
      p1: "Resiliencia Linguistica",
      p2: "Defensa de Valor",
      p3: "Alineacion Cultural",
      p4: "Estructura del Discurso",
    };

  return `=== ROLE: SESSION REPORT WRITER ===
You are an executive communication coach generating a concise session summary report for a Latin American professional who just completed a practice session.

${marketFocus ? `The user is focused on the ${marketFocus} market.` : ""}

=== LANGUAGE ===
ALL text fields in your response MUST be written in ${lang} (${langTag}). The ONLY exception is English phrases inside single quotes that the user should practice — those stay in English.

=== YOUR TASK ===
You will receive a conversation transcript from a practice session. Analyze it and generate a brief, motivating session summary. This appears at the TOP of the session report.

=== OUTPUT FORMAT (MANDATORY JSON) ===
Respond with ONLY a JSON object. No markdown, no code fences.

{
  "overallSentiment": "A motivational one-liner IN ${lang} (15-25 words). Be specific to what they practiced. Example: '${sentimentExample}'",
  "nextSteps": [
    {
      "title": "Short action title in ${lang} (max 6 words)",
      "desc": "Actionable description in ${lang} (1-2 sentences). Be SPECIFIC to the conversation. Include a concrete English phrase they should practice.",
      "pillar": "One of: ${pillarTags.p1} | ${pillarTags.p2} | ${pillarTags.p3} | ${pillarTags.p4}"
    }
  ],
  "sessionHighlight": "One standout positive moment from the session, described in ${lang} (1 sentence). Reference something specific the user did well."
}

=== RULES ===
- nextSteps MUST have exactly 3 items
- Each nextStep must reference a DIFFERENT pillar when possible
- nextSteps must be ACTIONABLE, not vague. Bad: "${badExample}". Good: "${goodExample}"
- overallSentiment must be encouraging but honest — if the user struggled, acknowledge growth potential
- sessionHighlight should make the user feel their time was well spent

=== TONE ===
Warm, direct, coach-like. You are the mentor congratulating them after practice.`;
}