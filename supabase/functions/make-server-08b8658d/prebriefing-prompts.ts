/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Pre-Briefing Script Prompt Builder
 *
 *  Generates the system prompt for GPT-4o to create a
 *  personalized pre-briefing conversation strategy.
 *
 *  Architecture: 2-phase prompt (ANALYZE → GENERATE)
 *  - Phase 1: Forces GPT-4o to reason about user profile vs
 *             interlocutor expectations (chain-of-thought)
 *  - Phase 2: Generates the script grounded in that analysis
 *
 *  Key differences from the conversation prompt (assembler.ts):
 *  - assembler.ts = how the AI ACTS during practice
 *  - this file   = how the AI WRITES the preparation strategy
 *
 *  Reference: /docs/SYSTEM_PROMPTS.md, /src/services/prompts/
 * ══════════════════════════════════════════════════════════════
 */

import { resolveLocale } from "./locale-utils.ts";
import { getScenarioGapAnalysis } from "./scenarios/index.ts";

/* ═══════════════════════════════════════════════════════════════
   INTERLOCUTOR INTELLIGENCE
   What each interlocutor EVALUATES and CARES ABOUT.
   This is a condensed strategic map — not the full persona.
   ═══════════════════════════════════════════════════════════════ */

const INTERLOCUTOR_INTEL: Record<string, string> = {
    // ── Interview ──
    recruiter: `INTERLOCUTOR: THE RECRUITER
What they evaluate: Speed of synthesis, verbal fluency, career trajectory clarity, enthusiasm for the role.
What impresses them: A candidate who can summarize their career in 60 seconds with a clear differentiator.
What kills you: Rambling, vagueness about why this role, filler words, inability to synthesize.
Their internal question: "Can I confidently pass this person to the hiring manager?"
Time frame: They have 15-20 interviews today. You get 3 minutes to make an impression.`,

    sme: `INTERLOCUTOR: THE SUBJECT MATTER EXPERT (SME)
What they evaluate: Depth of knowledge, precision in terminology, hands-on vs. theoretical experience, intellectual honesty.
What impresses them: Precise technical answers with real-world examples, honest acknowledgment of knowledge boundaries.
What kills you: Buzzword-heavy answers without substance, claiming expertise you can't defend, marketing language.
Their internal question: "Would I want this person on my team solving real problems?"
Time frame: They'll probe until they find the edge of your knowledge. Prepare for 2-3 deep-dive follow-ups per topic.`,

    hiring_manager: `INTERLOCUTOR: THE HIRING MANAGER
What they evaluate: Ownership, autonomy, business impact (in numbers), ability to represent the team to leadership.
What impresses them: Quantified achievements, first-30-days thinking, ownership language ("I decided", "I delivered").
What kills you: Passive language ("the team decided"), no metrics, inability to articulate impact beyond activities.
Their internal question: "Can this person run with a project without me checking in daily?"
Time frame: Direct and pragmatic. They want outcomes, KPIs, and evidence of autonomous execution.`,

    hr: `INTERLOCUTOR: HR / PEOPLE & CULTURE
What they evaluate: Soft skills, cultural fit for remote cross-cultural work, ability to receive direct feedback, conflict resolution.
What impresses them: Authentic vulnerability, self-awareness about growth areas, real examples of handling difficult feedback.
What kills you: Rehearsed corporate answers, inability to give a "messy" real story, defensiveness about weaknesses.
Their internal question: "Will this person thrive in our culture, or will they need constant hand-holding?"
Time frame: Open-ended behavioral questions. They want the REAL story, not the textbook version.`,

    // ── Sales ──
    gatekeeper: `INTERLOCUTOR: THE GATEKEEPER / SDR
What they evaluate: Immediate value articulation, differentiation from competitors, respect for their time.
What impresses them: A clear, differentiated value prop delivered in under 60 seconds. Answers to "why should my boss care?"
What kills you: Leading with features instead of benefits, rambling, being pushy, inability to differentiate.
Their internal question: "If I pass this to my boss, will she thank me or waste her time?"
Time frame: 5 minutes maximum. They say "no" to 90% of vendors. Your opening 30 seconds decide everything.`,

    technical_buyer: `INTERLOCUTOR: THE TECHNICAL BUYER / EXPERT
What they evaluate: Architecture, integration, scalability, security, real-world resilience, honest limitation awareness.
What impresses them: Technically precise answers with production examples, honest about product limits, peer-level conversation.
What kills you: Marketing language, avoiding specifics, over-promising, not knowing your own product's edge cases.
Their internal question: "Will this actually work in production, or will it break and become my problem?"
Time frame: Detailed and methodical. They'll test every claim. Prepare for architecture deep-dives.`,

    champion: `INTERLOCUTOR: THE CHAMPION / INTERNAL ALLY
What they evaluate: Business case strength, ease of adoption, ROI narrative they can present to THEIR leadership.
What impresses them: Clear ROI with timeline, case studies from similar companies, adoption plan that won't disrupt their team.
What kills you: Features without business impact, no implementation timeline, no ammunition for their internal pitch.
Their internal question: "Can I build a slide from this conversation that makes ME look good to my VP?"
Time frame: Collaborative but results-driven. Help them sell internally — they WANT to buy, but need the data.`,

    decision_maker: `INTERLOCUTOR: THE DECISION MAKER (C-LEVEL)
What they evaluate: ROI, strategic fit, competitive advantage, risk assessment, quality of the person across the table.
What impresses them: Bottom-line framing (cost vs. savings), competitive differentiation, confidence with specificity.
What kills you: Technical details they don't need, generic pitches, hedging instead of committing to numbers.
Their internal question: "Is this a partner I can trust with my organization's budget?"
Time frame: 15 minutes before their next meeting. Executive summary only. They decide based on strategic fit and trust.`,

    // ── Meeting ──
    meeting_facilitator: `INTERLOCUTOR: THE MEETING FACILITATOR
What they evaluate: Conciseness, structure, time-awareness, ability to stay on-topic, collaborative engagement.
What impresses them: A clear "Yesterday → Today → Blockers" update in under 30 seconds. Active listening to teammates' updates.
What kills you: Rambling, going off-topic, passive participation, not flagging blockers until it's too late.
Their internal question: "Can this person communicate efficiently in an async-first remote team?"
Time frame: Standups are 15 minutes for 6-8 people. You get 2 minutes max. Every extra second is stolen from a teammate.`,

    senior_stakeholder: `INTERLOCUTOR: THE SENIOR STAKEHOLDER (VP/DIRECTOR)
What they evaluate: Strategic thinking, ability to "manage up," confidence under pressure, ownership of decisions.
What impresses them: Someone who can redirect a senior leader's tangent diplomatically, disagree with data, and close a meeting with clear next steps.
What kills you: Letting them ramble without redirecting, agreeing just to avoid conflict, vague commitments without owners and deadlines.
Their internal question: "Can this person run a meeting I'd normally run — and do it well enough that I don't need to be there?"
Time frame: They multitask. If you don't engage them in the first 30 seconds, they'll check their phone. Own the room or lose it.`,
};

/* ═══════════════════════════════════════════════════════════════
   REGIONAL MARKET INTELLIGENCE
   Cultural coaching nuances for the pre-briefing script.
   ═══════════════════════════════════════════════════════════════ */

const REGIONAL_COACHING: Record<string, string> = {
    brazil: `REGIONAL COACHING — BRAZIL:
- Brazilian professionals often over-contextualize before stating their position. Coach them to LEAD WITH THE CONCLUSION, then provide context.
- Portuguese speakers naturally hedge with softeners ("maybe we could...", "I think perhaps..."). Replace these with commitment language ("I recommend...", "Our data shows...").
- Brazil's tech ecosystem is world-class (Nubank, VTEX, iFood, Mercado Livre). Help them LEVERAGE this credibility as a differentiator, not undersell it.
- Time zone proximity to US East Coast is an advantage — weave it into logistics arguments.
- Write coaching annotations in Portuguese (Brazilian) for Brazilian users — tooltips, suffixes, and coaching notes.`,

    mexico: `REGIONAL COACHING — MEXICO:
- Mexican professionals sometimes default to deferential language with US counterparts. Coach them to project AUTHORITY and executive presence, not just technical competence.
- NAFTA/USMCA proximity and time zone alignment are powerful arguments — incorporate them when relevant.
- "Survival English" is not enough for nearshoring executives. The script should model COMMAND-level communication.
- Push ownership language: "I will deliver" not "We could try".`,

    colombia: `REGIONAL COACHING — COLOMBIA:
- Colombian professionals excel at relationship-building but sometimes struggle to justify premium USD rates. Coach them to anchor their value in OUTCOMES, not hours.
- Remote/async work is the norm for nearshoring — the script should model proactive communication about timezone management and delivery cadence.
- Help them demonstrate they can LEAD a meeting, not just participate in one.`,

    global: `REGIONAL COACHING — GLOBAL:
- The user is a LATAM professional practicing for US business contexts. Coach for directness, quantified impact, and professional confidence.
- US executives expect concise answers, data-backed claims, and comfort with direct feedback.
- The script should model the communication style of a senior professional who BELONGS in the room.`,
};

/* ═══════════════════════════════════════════════════════════════
   GUIDED FIELDS INTELLIGENCE
   Maps raw field keys to semantic labels for the prompt.
   ═══════════════════════════════════════════════════════════════ */

interface ProcessedUserData {
    /** Structured summary of what the user provided */
    userArsenal: string;
    /** What's missing that the model should fill intelligently */
    gaps: string;
}

function processGuidedFields(
    guidedFields: Record<string, string> | null | undefined,
    scenarioType: string
): ProcessedUserData {
    if (!guidedFields || Object.keys(guidedFields).length === 0) {
        return {
            userArsenal: "The user did not provide specific details. Create a realistic but generic script that demonstrates the STRUCTURE and STRATEGY they should follow.",
            gaps: "All details are missing. Generate realistic placeholder content that the user can later customize with their real information.",
        };
    }

    const entries = Object.entries(guidedFields).filter(
        ([_, v]) => v && String(v).trim().length > 0
    );

    if (entries.length === 0) {
        return {
            userArsenal: "The user did not provide specific details.",
            gaps: "All fields were empty.",
        };
    }

    // Build rich structured arsenal
    const arsenalLines: string[] = [];
    const filledKeys: string[] = [];

    for (const [key, value] of entries) {
        const normalizedKey = key.toLowerCase().trim();
        filledKeys.push(normalizedKey);

        // Semantic labeling based on known field keys
        if (normalizedKey === "situationcontext") {
            arsenalLines.push(`SITUATION CONTEXT (pre-defined scenario):\n"""${value}"""`);
        } else if (normalizedKey.includes("job description") || normalizedKey === "role") {
            arsenalLines.push(`TARGET ROLE / JOB DESCRIPTION:\n"""${value}"""`);
        } else if (normalizedKey.includes("key experience") || normalizedKey === "strength" || normalizedKey.includes("professional experience")) {
            arsenalLines.push(`USER'S RELEVANT EXPERIENCE & STRENGTHS:\n"""${value}"""`);
        } else if (normalizedKey === "cvsummary") {
            arsenalLines.push(`USER'S CV / RESUME SUMMARY (extracted by AI):\n"""${value}"""`);
        } else if (normalizedKey === "company" && scenarioType === "interview") {
            arsenalLines.push(`TARGET COMPANY / EMPLOYER:\n"""${value}"""`);
        } else if (normalizedKey.includes("prospect") || normalizedKey.includes("company") || normalizedKey === "product") {
            arsenalLines.push(`PROSPECT / TARGET COMPANY INTELLIGENCE:\n"""${value}"""`);
        } else if (normalizedKey.includes("deck") || normalizedKey.includes("talking points") || normalizedKey === "problem") {
            arsenalLines.push(`PITCH MATERIAL / VALUE PROPOSITION:\n"""${value}"""`);
        } else {
            arsenalLines.push(`${key.toUpperCase()}:\n"""${value}"""`);
        }
    }

    // Identify gaps
    const gapLines = getScenarioGapAnalysis(scenarioType, filledKeys);

    return {
        userArsenal: arsenalLines.join("\n\n"),
        gaps: gapLines.length > 0 ? gapLines.join("\n") : "No significant gaps — the user provided rich context. USE IT ALL.",
    };
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PROMPT BUILDER
   ═══════════════════════════════════════════════════════════════ */

export interface PreBriefingPromptConfig {
    scenario: string;
    interlocutor: string;
    scenarioType: string;
    guidedFields?: Record<string, string> | null;
    locale?: string | null;
}

export interface PreBriefingPromptResult {
    systemPrompt: string;
    fewShotUser: string;
    fewShotAssistant: string;
    userMessage: string;
}

export function buildPreBriefingPrompt(config: PreBriefingPromptConfig): PreBriefingPromptResult {
    const { scenario, interlocutor, scenarioType, guidedFields, locale } = config;
    const lc = resolveLocale(locale);

    // Get interlocutor intelligence
    const interlocutorKey = interlocutor.toLowerCase().replace(/[\s-]+/g, "_");
    const intel = INTERLOCUTOR_INTEL[interlocutorKey] || INTERLOCUTOR_INTEL["recruiter"] || "";

    // Get regional coaching
    const coaching = REGIONAL_COACHING[lc.regionalKey] || REGIONAL_COACHING["global"];

    // Process user data
    const { userArsenal, gaps } = processGuidedFields(guidedFields, scenarioType);

    const lang = lc.lang;
    const langTag = lc.langTag;

    const systemPrompt = `=== ROLE: EXECUTIVE STRATEGY ARCHITECT ===
You are an elite executive communication strategist. You prepare LATAM professionals for high-stakes conversations with U.S. business counterparts.

You do NOT write generic scripts. You create PERSONALIZED CONVERSATION STRATEGIES based on:
1. WHO they're talking to (the interlocutor's psychology and evaluation criteria)
2. WHAT the user brings to the table (their data, experience, context)
3. HOW to structure the conversation for maximum impact

=== LANGUAGE ===
- Write ALL script content, section titles, tooltips, and coaching notes in English (this is what the user will practice saying).
- Write "suffix" coaching annotations in ${lang} (${langTag}) — these are reading aids, not spoken content.

=== THE INTERLOCUTOR ===
${intel}

=== REGIONAL CONTEXT ===
${coaching}

=== THE USER'S ARSENAL ===
${userArsenal}

=== IDENTIFIED GAPS ===
${gaps}

=== OUTPUT FORMAT (MANDATORY JSON) ===
Respond with ONLY a valid JSON object. No markdown, no code fences.

{
  "sections": [
    {
      "num": 1,
      "title": "Section title (English, action-oriented, max 5 words)",
      "paragraphs": [
        {
          "text": "Coaching context in English (1 sentence that sets up the highlights below)",
          "highlights": [
            {
              "phrase": "The exact English phrase the user should say (spoken, natural, executive-level)",
              "color": "#dcfce7 | #dbeafe | #f3e8ff | #fef3c7",
              "tooltip": "Why this phrase works — in ${lang} (1 short sentence)"
            }
          ],
          "suffix": "Optional coaching note in ${lang} — when to pause, body language, tone guidance"
        }
      ]
    }
  ]
}

=== STRUCTURAL RULES ===
- Generate 3-5 sections depending on scenario complexity
- Each section should have 1-2 paragraphs
- Each paragraph should have 1-3 highlighted phrases
- Highlights are the CORE DELIVERABLE — these are what the user practices saying aloud
- Color coding: green (#dcfce7) = key openers, blue (#dbeafe) = data/metrics, purple (#f3e8ff) = strategic phrases, amber (#fef3c7) = closing/transition
- Total word count across all highlights: 200-400 words (this will be spoken via TTS shadowing)

=== QUALITY CHECKLIST ===
- [ ] Every highlight phrase sounds natural when spoken aloud (no written-English artifacts)
- [ ] Phrases use the user's actual data/numbers/context when available
- [ ] The script builds a strategic ARC: opening → build credibility → handle anticipated challenges → close strong
- [ ] Tooltips explain the BUSINESS PSYCHOLOGY, not just grammar
- [ ] Domain vocabulary from the user's input is preserved and elevated`;

    // Few-shot example for consistent output quality
    const fewShotUser = `Scenario: "Technical Interview: Senior React Developer at Toptal"
Interlocutor: recruiter
User arsenal: 5 years React experience, led team of 4, built fintech dashboard
Gaps: No specific role description provided`;

    const fewShotAssistant = JSON.stringify({
        sections: [
            {
                num: 1,
                title: "Opening & Personal Pitch",
                paragraphs: [
                    {
                        text: "Start with a confident self-introduction that positions you as the ideal candidate.",
                        highlights: [
                            {
                                phrase: "Thank you for this opportunity. I'm a senior frontend engineer with five years specializing in React for high-scale fintech applications.",
                                color: "#dcfce7",
                                tooltip: lc.isBrazil
                                    ? "Posiciona voce como especialista, nao como generalista — recrutadores filtram em 30 segundos"
                                    : "Te posiciona como especialista, no generalista — los reclutadores filtran en 30 segundos",
                            },
                        ],
                        suffix: lc.isBrazil
                            ? "Pause de 1 segundo apos 'applications' para que o recrutador absorva."
                            : "Pausa de 1 segundo despues de 'applications' para que el reclutador absorva.",
                    },
                ],
            },
        ],
    });

    const userMessage = `Scenario: "${scenario}"
Interlocutor: ${interlocutor}
Scenario type: ${scenarioType}

=== USER DATA ===
${userArsenal}

=== GAPS ===
${gaps}

Generate the personalized conversation strategy script now. Remember: highlights are the spoken phrases, tooltips are in ${lang}.`;

    return { systemPrompt, fewShotUser, fewShotAssistant, userMessage };
}