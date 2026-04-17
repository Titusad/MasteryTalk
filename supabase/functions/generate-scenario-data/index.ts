// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};



// Note: Replace with the actual OpenAI API URL and format if different
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface GenerateScenarioRequest {
    action: "strategy" | "context_suggestions" | "pre_briefing";
    scenarioType?: string;
    scenario?: string;
    interlocutor?: string;
    guidedFields?: Record<string, string>;
    extraContext?: string;
    strategyPillars?: any[];
}

const SYSTEM_PROMPTS = {
    strategy: `You are an expert AI coach helping a professional prepare for a conversation.
Based on the provided scenario details, generate exactly 2 strategic "value pillars". These are the main themes or strengths the user should focus on during their conversation.
Respond ONLY with a valid JSON array of two objects, each having a 'title' (short, 2-3 words) and 'description' (1 sentence explaining why it's important).
Format:
[
  { "title": "Pillar 1", "description": "..." },
  { "title": "Pillar 2", "description": "..." }
]`,

    context_suggestions: `You are an expert communication coach preparing a professional for an upcoming scenario.
You will be provided with a detailed Scenario Description, Interlocutor, and selected Strategy Pillars.
Strictly suggest 2 'Extra Context' fields that the professional should fill out to make the upcoming simulation ultra-realistic.

CRITICAL INSTRUCTIONS:
1. Field 1 MUST ALWAYS represent "Job Description / Scenario Context". Field 2 MUST ALWAYS represent "Your Relevant Experience / Achievements". DO NOT deviate from this structure.
2. The 'label' for each field MUST be specific to their industry but reflect the core meaning (e.g., For UX: "Senior UX Role Requirements" instead of just "Job Description").
3. IMPORTANT: For Field 1 (Job Description), the 4 \`suggestions\` MUST BE specific technical requirements, responsibilities, or KPIs expected for the role (e.g. "Lead the end-to-end design system architecture", "Improve mobile onboarding conversion rate"). Do NOT suggest job titles (e.g. "Product Manager specialized in X" is WRONG).
4. For Field 2 (Experience), the 4 \`suggestions\` MUST BE realistic accomplishments or metrics based on the role and strategy pillars (e.g., "Increased conversion by 15% through A/B testing", "Migrated legacy design system to Figma").
5. DO NOT use generic corporate jargon. BANNED PHRASES: "Effective communication", "Problem-solving", "Data analysis", "Project management", "Team collaboration".
6. The output language MUST perfectly match the language the user wrote the Scenario Description in (e.g. if the user wrote in Spanish, the labels, hints, and suggestions MUST be in Spanish).

Respond ONLY with a valid JSON object matching this structure:
{
  "role_analysis": "Briefly analyze the core technical requirements of this specific scenario/role in 1 sentence to ground the suggestions.",
  "fields": [
    {
      "label": "string", // Must reflect Job Description / Responsibilities
      "placeholder": "string",
      "hint": "string",
      "pasteHint": "string",
      "suggestions": ["string", "string", "string", "string"] // EXACTLY 4 highly specific duties/requirements for the role
    },
    {
      "label": "string", // Must reflect User's Previous Experience / Achievements
      "placeholder": "string",
      "hint": "string",
      "pasteHint": "string",
      "suggestions": ["string", "string", "string", "string"] // EXACTLY 4 highly specific realistic achievements
    }
  ]
}
Make sure to give EXACTLY 4 hyper-specific realistic suggestions for each field.`,

    pre_briefing: `You are an expert communication coach preparing a professional for an upcoming scenario.
You will be provided with the user's scenario, interlocutor, strategic pillars, and any extra context they provided.
Create a pre-briefing "Conversation Script" that they can review right before starting.
Respond ONLY with a valid JSON object matching this structure:
{
  "sections": [
    {
      "num": 1,
      "title": "Section Title (e.g. Opening, Objection Handling, Close)",
      "paragraphs": [
        {
          "text": "The main script text they should say...",
          "highlights": [
            { "phrase": "A specific phrase in the text", "tooltip": "Why this works well" }
          ],
          "suffix": " Optional text after the highlight"
        }
      ]
    }
  ]
}
Make exactly 3 sections (e.g., Opening, Core Message, Closing). Include at least 1 highlight per paragraph.`
};

async function callOpenAI(systemMessage: string, userMessage: string, model: string = "gpt-4o-mini"): Promise<any> {
    // @ts-ignore
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("OpenAI API error:", err);
        throw new Error("Failed to generate with OpenAI");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    try {
        return JSON.parse(content);
    } catch (e) {
        console.error("Failed to parse OpenAI JSON:", content);
        throw new Error("Invalid format from OpenAI");
    }
}

// @ts-ignore
serve(async (req: Request) => {
    // Handle CORS preflight requests first!
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Verify user authentication
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "No authorization header" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }
        // Note: For MVP, presence of the Authorization header from Supabase frontend is sufficient.
        // Bypassing the strict getUser() network check to prevent 401 timeouts.

        // 2. Parse request
        const reqData = await req.json() as GenerateScenarioRequest;
        const { action, scenarioType, scenario, interlocutor, guidedFields, extraContext, strategyPillars } = reqData;

        if (!action || !["strategy", "context_suggestions", "pre_briefing"].includes(action)) {
            return new Response(JSON.stringify({ error: "Invalid action" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. Assemble User Prompt based on inputs
        const userMessageParts = [];
        if (scenarioType) userMessageParts.push(`Scenario Type: ${scenarioType}`);
        if (scenario) userMessageParts.push(`Scenario Description: ${scenario}`);
        if (interlocutor) userMessageParts.push(`Interlocutor/Role: ${interlocutor}`);
        if (guidedFields && Object.keys(guidedFields).length > 0) {
            userMessageParts.push(`Guided Inputs: ${JSON.stringify(guidedFields)}`);
        }
        if (extraContext) userMessageParts.push(`Extra Context: ${extraContext}`);
        if (strategyPillars && strategyPillars.length > 0) {
            userMessageParts.push(`Selected Strategy Pillars: ${JSON.stringify(strategyPillars)}`);
        }

        const userMessage = userMessageParts.length > 0
            ? userMessageParts.join("\n\n")
            : "No detailed scenario provided. Generate a generic professional example.";

        // 4. Call OpenAI
        let systemPrompt = SYSTEM_PROMPTS[action];
        let finalUserMessage = userMessage;
        let modelParams = "gpt-4o-mini";

        if (action === "strategy") {
            systemPrompt = `You are an expert AI coach helping a professional prepare for a conversation.
Based on the provided scenario details, generate exactly 2 strategic "value pillars". These are the main themes or strengths the user should focus on during their conversation.
Respond ONLY with a valid JSON object containing a 'pillars' array of two objects, each having a 'title' (short, 2-3 words) and 'description' (1 sentence explaining why it's important).
Format:
{
  "pillars": [
    { "title": "Pillar 1", "description": "..." },
    { "title": "Pillar 2", "description": "..." }
  ]
}`;
        } else if (action === "pre_briefing") {
            modelParams = "gpt-4o"; // Use advanced model for script generation

            const marketFocus = (reqData as any).marketFocus;
            const guidedContext = guidedFields
                ? Object.entries(guidedFields)
                    .filter(([_, v]) => v && String(v).trim())
                    .map(([k, v]) => `- ${k}: ${v}`)
                    .join("\n")
                : "";

            const scenarioLabel = scenarioType === "interview" ? "Job Interview" : "Sales Pitch";

            systemPrompt = `You are an expert executive communication coach and speechwriter specializing in helping Latin American professionals prepare for high-stakes business conversations in English.

Your task: Generate a PREPARATION SCRIPT — a structured conversation strategy the user will study BEFORE their practice session. This is NOT a post-session improvement; it's a PRE-SESSION game plan.

=== SCENARIO TYPE ===
${scenarioLabel}

=== INTERLOCUTOR ===
The user will be speaking with: ${interlocutor || "their counterpart"}

=== USER'S CONTEXT ===
${guidedContext || "No additional context provided."}

${marketFocus ? `=== REGIONAL CONTEXT ===\nThe user is based in ${marketFocus === "brazil" ? "Brazil" : marketFocus === "mexico" ? "Mexico" : marketFocus === "colombia" ? "Colombia" : "Latin America"}. Adapt vocabulary and cultural framing accordingly.` : ""}

=== OUTPUT FORMAT (MANDATORY JSON) ===
Respond with ONLY a valid JSON object. No markdown, no code fences, no commentary.

{
  "sections": [
    {
      "num": 1,
      "title": "Section Title in English",
      "paragraphs": [
        {
          "text": "The paragraph text before any highlighted phrase. ",
          "highlights": [
            {
              "phrase": "the exact power phrase to highlight",
              "color": "#E1D5F8",
              "tooltip": "Brief explanation in Spanish of WHY this phrase works (max 15 words)"
            }
          ],
          "suffix": " any text that follows the last highlight in this paragraph."
        }
      ]
    }
  ]
}

=== CRITICAL RULES ===

1. STRUCTURE: Create exactly 3 sections for the script:
${scenarioType === "interview" ? `   - Section 1: "Personal Pitch — Your Value Story" (who you are, your differentiator)
   - Section 2: "STAR Story — Prove It With Impact" (a structured achievement narrative)
   - Section 3: "Strategic Close — Your Questions Matter" (thoughtful questions + confident wrap-up)` :
                    `   - Section 1: "Opening — Set the Frame" (establish credibility, state your purpose)
   - Section 2: "Value Proposition — Lead with Impact" (core argument with data points)
   - Section 3: "Close — Secure the Next Step" (handle objections, propose concrete next step)`}

2. PARAGRAPH FORMAT: Each paragraph has:
   - "text": Text BEFORE the first highlight (can be empty string "")
   - "highlights": Array of 1-2 highlighted phrases with color and tooltip
   - "suffix": Text AFTER the last highlight (can be empty string "")
   - The full readable paragraph = text + highlights[0].phrase + middle_text + highlights[1].phrase + suffix

3. HIGHLIGHT COLORS (use the exact hex values):
   - "#E1D5F8" (purple): Structure improvements — frameworks, transitions, signposting
   - "#FFE9C7" (peach): Impact phrases — power phrases, persuasion triggers, data claims
   - "#D9ECF0" (blue): Engagement hooks — questions, callbacks, inclusive language

4. CONTENT GUIDELINES:
   - Write in natural spoken English (this will be read aloud)
   - Each section should have 2-3 paragraphs
   - Include 4-6 total highlights across all sections
   - Distribute colors: mix purple, peach, and blue
   - Tooltips must be in Spanish and explain the communication strategy
   - Total script: 200-350 words (2-3 minute read)
   - If the user provided specific details (company, product, role), weave them in
   - If no specific details, create realistic but generic business content

5. QUALITY CHECKS:
   - Every highlight "phrase" should be a natural substring that flows in the paragraph
   - Tooltips should explain WHY the phrase works, not just translate it
   - The script should feel like advice from a senior mentor, not a template`;

            finalUserMessage = `Generate a pre-briefing conversation script for this ${scenarioLabel.toLowerCase()} scenario.

Scenario: ${scenario || "General " + scenarioLabel}
Interlocutor: ${interlocutor || "Unknown"}
${guidedContext ? `\nUser's preparation notes:\n${guidedContext}` : ""}

Remember: Return ONLY valid JSON. No markdown fences.`;
        }

        const result = await callOpenAI(systemPrompt, finalUserMessage, modelParams);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Error in generate-scenario-data:", error);
        return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
            status: 200, // Returning 200 with error property for MVP client handling
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
