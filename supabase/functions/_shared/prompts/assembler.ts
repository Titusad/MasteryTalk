/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Prompt Assembler
 *
 *  Stitches the 7 blocks into a single system prompt.
 *  This is the core logic that prepare-session uses.
 *  Reference: /docs/SYSTEM_PROMPTS.md §1, §12
 *
 *  Architecture:
 *  ┌───────────────────────────────────────┐
 *  │  BLOCK 1:   MASTER SYSTEM PROMPT      │ ← Immutable rules
 *  │  BLOCK 2:   INTERLOCUTOR PERSONA      │ ← Profile + sub-profile
 *  │  BLOCK 3:   REGIONAL CONTEXT          │ ← Mexico / Colombia / Global
 *  │  BLOCK 4:   USER SCENARIO             │ ← From PracticeWidget input
 *  │  BLOCK 4.5: SCENARIO ADAPTATION       │ ← Sales / Interview / etc.
 *  │  BLOCK 4.7: STRATEGY PILLARS          │ ← From StrategyBuilder
 *  │  BLOCK 5:   EXTRACTED CONTEXT         │ ← From PDF/URL (optional)
 *  │  BLOCK 5.5: TTS TEXT OPTIMIZATION     │ ← Speech-friendly writing
 *  │  BLOCK 6:   OUTPUT FORMAT + RULES     │ ← JSON + isComplete 4-8
 *  │  BLOCK 7:   FIRST MESSAGE INSTRUCTION │ ← Only for prepare-session
 *  └─────────────��─────────────────────────┘
 * ══════════════════════════════════════════════════════════════
 */

import {
  MASTER_SYSTEM_PROMPT,
  OUTPUT_FORMAT_BLOCK,
  FIRST_MESSAGE_BLOCK,
  MINI_TEMPLATE,
} from "./templates.ts";
import {
  getPersonaBlock,
  detectSubProfile,
  type InterlocutorType,
} from "./personas.ts";
import { getRegionalBlock, type MarketFocus } from "./regions.ts";
import { getVoiceId } from "./voice-map.ts";
import type { ScenarioType } from "../types.ts";
import { TTS_TEXT_OPTIMIZATION_BLOCK } from "./tts-sync.ts";

/* ── Block 4: Scenario Template ── */

function buildScenarioBlock(scenario: string): string {
  return `=== SCENARIO ===
The user has described the following situation they want to practice:

"${scenario}"

Stay within this scenario throughout the conversation. Your opening message and all subsequent responses should be grounded in this specific business context. If the scenario is vague, interpret it reasonably and add realistic details to make it feel authentic.`;
}

/* ── Block 5: Extracted Context Template (optional) ── */

function buildExtractedContextBlock(extractedContext: string): string {
  return `=== ADDITIONAL CONTEXT (from user's document) ===
The user provided a document. Key points extracted:

"${extractedContext}"

Incorporate these details naturally into your responses. Reference specific data points, figures, or claims from this context to make the conversation feel grounded in real material. Challenge the user on any weak points you identify.`;
}

/* ── Block 4.5: Scenario Adaptation (NEW — Master Prompt Phase 1) ── */

const SCENARIO_ADAPTATION: Record<string, string> = {
  sales: `=== SCENARIO ADAPTATION: SALES ===
This is a SALES scenario. Adapt your behavior accordingly:
- VOCABULARY FOCUS: ROI, pipeline, close rate, competitive differentiation, implementation timeline, total cost of ownership
- SIMULATION STYLE: Be a skeptical buyer. You've been burned by vendors before. Push for hard numbers.
- QUESTIONS TO ASK: "What's the ROI timeline?", "How does this compare to [competitor]?", "What happens if adoption fails?"
- CLOSURE STYLE: End with a concrete next step (send one-pager, schedule demo, loop in stakeholder)
- DO NOT use interview language ("Tell me about yourself", "Why this role")
- DO NOT use negotiation anchoring tactics — you are evaluating a purchase, not bargaining`,

  interview: `=== SCENARIO ADAPTATION: INTERVIEW ===
This is a JOB INTERVIEW scenario. Adapt your behavior accordingly:
- VOCABULARY FOCUS: leadership, cross-functional collaboration, growth trajectory, culture fit, technical depth
- SIMULATION STYLE: Be evaluative but not hostile. Probe for authenticity over rehearsed answers.
- QUESTIONS TO ASK: STAR-format behavioral questions, "Tell me about a time when...", dig into gaps or transitions
- CLOSURE STYLE: End with "Do you have any questions for us?" — evaluate the quality of THEIR questions
- DO NOT discuss pricing or ROI — this is about the candidate's fit and capability
- DO NOT use sales objection-handling language`,

  csuite: `=== SCENARIO ADAPTATION: C-SUITE REPORT ===
This is an EXECUTIVE BRIEFING scenario. Adapt your behavior accordingly:
- VOCABULARY FOCUS: strategic impact, market position, board-level metrics, risk mitigation, resource allocation
- SIMULATION STYLE: You are time-constrained and impatient. You want the bottom line first, details second.
- QUESTIONS TO ASK: "What's your recommendation?", "What's the risk if we don't act?", "Give me the number."
- CLOSURE STYLE: End with a decision or directive: "I'll take this to the board" or "Rethink this and come back Friday"
- DO NOT ask basic discovery questions — you already know the context
- DO NOT be encouraging — be demanding and strategic`,

  negotiation: `=== SCENARIO ADAPTATION: NEGOTIATION ===
This is a CONTRACT NEGOTIATION scenario. Adapt your behavior accordingly:
- VOCABULARY FOCUS: terms, concessions, BATNA, walk-away point, value exchange, mutual benefit
- SIMULATION STYLE: Be firm but professional. Use strategic silence. Counter-offer everything.
- QUESTIONS TO ASK: "What flexibility do you have on [term]?", "What if we restructure the deal as...?"
- CLOSURE STYLE: End with a conditional agreement or request for revised proposal
- DO NOT accept first offers — always counter or ask for justification
- USE tactical pauses after price statements`,

  networking: `=== SCENARIO ADAPTATION: NETWORKING ===
This is a NETWORKING / ELEVATOR PITCH scenario. Adapt your behavior accordingly:
- VOCABULARY FOCUS: value proposition, collaboration, mutual interest, follow-up, introduction
- SIMULATION STYLE: You're friendly but time-constrained. You meet 20 people at every event. Be curious but move on if the pitch isn't clear.
- QUESTIONS TO ASK: "What specifically are you working on?", "How is that different from [alternative]?", "Who should I connect you with?"
- CLOSURE STYLE: Exchange contacts or suggest a concrete follow-up ("Send me an email Tuesday with...")
- DO NOT get into deep technical discussions — keep it high-level and memorable
- DO NOT spend more than 3-4 turns — networking conversations are brief`,
};

function buildScenarioAdaptationBlock(scenarioType?: ScenarioType | null): string | null {
  if (!scenarioType) return null;
  return SCENARIO_ADAPTATION[scenarioType] ?? null;
}

/* ── Block 4.7: Strategy Pillars (injected from StrategyBuilder) ── */

function buildStrategyPillarsBlock(pillars?: Array<{ summary: string; why: string; how: string; result: string }> | null): string | null {
  if (!pillars || pillars.length === 0) return null;

  const pillarText = pillars
    .map((p, i) => `  Pillar ${i + 1}: ${p.summary}\n    Why: ${p.why}\n    How: ${p.how}\n    Result: ${p.result}`)
    .join("\n\n");

  return `=== USER'S STRATEGY PILLARS (from pre-session coaching) ===
The user prepared these value pillars before the simulation. Reference them naturally during the conversation — challenge them, ask for proof, or build on them:

${pillarText}

Use these pillars to:
- Ask targeted follow-up questions based on their claims
- Challenge weak assertions ("You said [pillar claim] — walk me through those numbers")
- Create realistic pressure that tests their preparation`;
}

/* ── Assembly Configuration ── */

export interface AssemblyConfig {
  /** The interlocutor selected by the user */
  interlocutor: InterlocutorType;
  /** The scenario text from PracticeWidget */
  scenario: string;
  /** User's market focus from their profile */
  marketFocus?: MarketFocus | null;
  /** Context extracted from uploaded PDF/URL by Gemini Flash (optional) */
  extractedContext?: string | null;
  /** Whether this is the initial prepare-session call (includes Block 7) */
  includeFirstMessage?: boolean;
  /** Whether to use the simplified GPT-4o-mini template */
  mini?: boolean;
  /** Scenario type for adaptation block (Phase 1 of Master Prompt) */
  scenarioType?: ScenarioType | null;
  /** Strategy pillars from StrategyBuilder (Phase 2 of Master Prompt) */
  strategyPillars?: Array<{ summary: string; why: string; how: string; result: string }> | null;
}

export interface AssemblyResult {
  /** The fully assembled system prompt */
  systemPrompt: string;
  /** The ElevenLabs voice ID for this interlocutor */
  voiceId: string;
  /** The detected sub-profile (for logging/audit) */
  subProfile: string | null;
  /** Estimated token count of the system prompt */
  estimatedTokens: number;
}

/**
 * Assemble the complete system prompt from the 7 blocks.
 *
 * This function is the heart of prepare-session.
 * It produces a deterministic prompt for the same inputs.
 */
export function assembleSystemPrompt(config: AssemblyConfig): AssemblyResult {
  const {
    interlocutor,
    scenario,
    marketFocus,
    extractedContext,
    includeFirstMessage = false,
    mini = false,
    scenarioType,
    strategyPillars,
  } = config;

  // Detect sub-profile from scenario keywords
  const subProfile = detectSubProfile(scenario, interlocutor);
  const voiceId = getVoiceId(interlocutor);

  if (mini) {
    return assembleMiniPrompt(config, subProfile, voiceId);
  }

  // ── Assemble full prompt (7+ blocks) ──

  const blocks: string[] = [];

  // Block 1: Master System Prompt
  blocks.push(MASTER_SYSTEM_PROMPT);

  // Block 2: Interlocutor Persona (+ sub-profile if detected)
  blocks.push(getPersonaBlock(interlocutor, subProfile));

  // Block 3: Regional Context
  blocks.push(getRegionalBlock(marketFocus));

  // Block 4: User Scenario
  blocks.push(buildScenarioBlock(scenario));

  // Block 4.5: Scenario Adaptation (modulates vocabulary/behavior per scenario type)
  const adaptationBlock = buildScenarioAdaptationBlock(scenarioType);
  if (adaptationBlock) {
    blocks.push(adaptationBlock);
  }

  // Block 4.7: Strategy Pillars (from StrategyBuilder pre-coaching)
  const pillarsBlock = buildStrategyPillarsBlock(strategyPillars);
  if (pillarsBlock) {
    blocks.push(pillarsBlock);
  }

  // Block 5: Extracted Context (only if present)
  if (extractedContext && extractedContext.trim().length > 0) {
    blocks.push(buildExtractedContextBlock(extractedContext));
  }

  // Block 5.5: TTS Text Optimization (ensures aiMessage is speech-friendly)
  blocks.push(TTS_TEXT_OPTIMIZATION_BLOCK);

  // Block 6: Output Format + isComplete Rules
  blocks.push(OUTPUT_FORMAT_BLOCK);

  // Block 7: First Message Instruction (only for prepare-session)
  if (includeFirstMessage) {
    blocks.push(FIRST_MESSAGE_BLOCK);
  }

  const systemPrompt = blocks.join("\n\n");

  return {
    systemPrompt,
    voiceId,
    subProfile,
    estimatedTokens: estimateTokens(systemPrompt),
  };
}

/* ── Mini Assembly (GPT-4o-mini) ── */

function assembleMiniPrompt(
  config: AssemblyConfig,
  subProfile: string | null,
  voiceId: string
): AssemblyResult {
  const { interlocutor, scenario, includeFirstMessage } = config;

  const personaMini = getPersonaBlock(interlocutor, null, true);

  let prompt = `${MINI_TEMPLATE}

${personaMini}

Scenario: "${scenario}"

Respond ONLY with JSON:
{"aiMessage": "your response", "isComplete": false, "internalAnalysis": "brief performance note"}

isComplete: true only after 4+ user turns when scenario concludes naturally. Must close by turn 8.`;

  if (includeFirstMessage) {
    prompt += `\n\n${FIRST_MESSAGE_BLOCK}`;
  }

  return {
    systemPrompt: prompt,
    voiceId,
    subProfile,
    estimatedTokens: estimateTokens(prompt),
  };
}

/* ── Token Estimation ── */

/**
 * Rough token estimation (~4 chars per token for English text).
 * This is for logging/audit purposes, not billing.
 * The actual token count comes from the OpenAI API response.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}