/**
 * ══════════════════════════════════════════════════════════════
 *  MasteryTalk PRO — Prompt Assembler
 *
 *  Stitches the 7+ blocks into a single system prompt.
 *  This is the core logic that prepare-session uses.
 *  Reference: /docs/SYSTEM_PROMPTS.md §1, §12
 *
 *  Architecture:
 *  ┌───────────────────────────────────────┐
 *  │  BLOCK 1:   MASTER SYSTEM PROMPT      │ ← Immutable rules + edge cases
 *  │  BLOCK 2:   INTERLOCUTOR PERSONA      │ ← Profile + sub-profile
 *  │  BLOCK 3:   REGIONAL CONTEXT          │ ← Mexico / Colombia / Brazil / Global
 *  │  BLOCK 4:   USER SCENARIO             │ ← From PracticeWidget input
 *  │  BLOCK 4.5: SCENARIO ADAPTATION       │ ← Sales / Interview / etc.
 *  │  BLOCK 5:   EXTRACTED CONTEXT         │ ← From PDF/URL (optional)
 *  │  BLOCK 5.5: TTS TEXT OPTIMIZATION     │ ← Speech-friendly writing
 *  │  BLOCK 6:   OUTPUT FORMAT + RULES     │ ← JSON + isComplete + pattern tracking
 *  │  BLOCK 6.5: ARENA PHASE DIRECTIVE     │ ← Dynamic difficulty (support/guidance/challenge)
 *  │  BLOCK 7:   FIRST MESSAGE INSTRUCTION │ ← Only for prepare-session
 *  └───────────────────────────────────────┘
 *
 *  v2.0 Changes:
 *  - Added arenaPhase to AssemblyConfig for progressive scaffolding
 *  - Added turnNumber to config for mid-session prompt updates
 *  v2.1 MVP Cleanup:
 *  - Removed csuite, negotiation, networking from SCENARIO_ADAPTATION (MVP only uses interview + sales)
 *  - Removed GPT-4o-mini path (mini template + assembleMiniPrompt) — all users get GPT-4o full quality
 * ══════════════════════════════════════════════════════════════
 */

import {
  MASTER_SYSTEM_PROMPT,
  OUTPUT_FORMAT_BLOCK,
  FIRST_MESSAGE_BLOCK,
  ARENA_PHASE_DIRECTIVES,
} from "./templates";
import {
  getPersonaBlock,
  detectSubProfile,
  type InterlocutorType,
} from "./personas";
import { getRegionalBlock } from "./regions";
import { getVoiceId } from "./voice-map";
import type { ScenarioType, ArenaPhase } from "../types";
import { TTS_TEXT_OPTIMIZATION_BLOCK } from "./tts-sync";

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

/* ── Block 4.5: Scenario Adaptation ── */

import { SCENARIO_ADAPTATION } from "./scenarios";

function buildScenarioAdaptationBlock(scenarioType?: ScenarioType | null): string | null {
  if (!scenarioType) return null;
  return SCENARIO_ADAPTATION[scenarioType] ?? null;
}

/* ── Block 4.7: Briefing Questions + User Drafts (Gap A+B) ── */

function buildBriefingQuestionsBlock(
  questions: AssemblyConfig["anticipatedQuestions"],
  drafts?: Record<number, string>
): string | null {
  if (!questions || questions.length === 0) return null;

  const lines: string[] = [
    `=== BRIEFING: ANTICIPATED QUESTIONS (${questions.length} questions) ===`,
    `The candidate prepared for these specific questions during the pre-interview briefing.`,
    `USE THESE as your primary question bank — ask them in a natural order that fits the conversation flow.`,
    `You do NOT need to ask all of them; adapt based on the candidate's answers. But at least 3-4 should appear.`,
    ``,
  ];

  for (const q of questions) {
    lines.push(`--- QUESTION ${q.id}: "${q.question}" ---`);
    lines.push(`Recommended approach: ${q.approach}`);
    if (q.framework) {
      lines.push(`Expected framework: ${q.framework.name} — ${q.framework.description}`);
    }
    if (q.keyPhrases && q.keyPhrases.length > 0) {
      lines.push(`Key phrases candidate practiced: ${q.keyPhrases.join(", ")}`);
    }

    // Gap B: inject user's draft if present
    const draft = drafts?.[q.id];
    if (draft && draft.trim().length > 0) {
      lines.push(`CANDIDATE'S PREPARED DRAFT: "${draft.trim()}"`);
      lines.push(`→ Use this knowledge to probe deeper: ask follow-up questions about specifics they mentioned.`);
      lines.push(`→ If their draft mentions a claim (numbers, achievements, projects), challenge them to elaborate.`);
      lines.push(`→ Do NOT reveal that you've seen their draft — act as if their answer is spontaneous.`);
    }
    lines.push(``);
  }

  lines.push(`IMPORTANT: Evaluate whether the candidate actually uses the frameworks and key phrases they practiced.`);
  lines.push(`If they deviate significantly from their preparation, note this in internalAnalysis.`);

  return lines.join("\n");
}

/* ── Assembly Configuration ── */

export interface AssemblyConfig {
  /** The interlocutor selected by the user */
  interlocutor: InterlocutorType;
  /** The scenario text from PracticeWidget */
  scenario: string;
  /** Context extracted from uploaded PDF/URL by Gemini Flash (optional) */
  extractedContext?: string | null;
  /** Whether this is the initial prepare-session call (includes Block 7) */
  includeFirstMessage?: boolean;
  /** Scenario type for adaptation block */
  scenarioType?: ScenarioType | null;
  /** Market focus / target geography (optional) */
  marketFocus?: string;
  /**
   * Current Arena phase for progressive scaffolding.
   * Injected as Block 6.5 to modulate AI difficulty level.
   * - "support":   Warm-up, straightforward questions
   * - "guidance":  Mid-pressure, follow-ups, mild curveballs
   * - "challenge": High-pressure, skepticism, time constraints
   * If undefined, no phase directive is injected (backward compatible).
   */
  arenaPhase?: ArenaPhase | null;
  /**
   * Current user turn number (0-based).
   * Used for mid-session prompt updates where the Edge Function
   * re-assembles with updated arenaPhase.
   */
  turnNumber?: number;
  /**
   * Anticipated interview questions from the Briefing screen (Gap A).
   * When present, the interviewer AI will use these as its question bank
   * instead of generating generic questions.
   */
  anticipatedQuestions?: Array<{
    id: number;
    question: string;
    approach: string;
    suggestedOpener: string;
    framework?: { name: string; description: string };
    keyPhrases: string[];
  }>;
  /**
   * User-drafted responses from the "Your Response" tab (Gap B).
   * Keyed by question index. The AI will probe deeper on topics
   * the user prepared, testing their ability to elaborate under pressure.
   */
  userDrafts?: Record<number, string>;
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
 * Assemble the complete system prompt from the 7+ blocks.
 *
 * This function is the heart of prepare-session.
 * It produces a deterministic prompt for the same inputs.
 */
export function assembleSystemPrompt(config: AssemblyConfig): AssemblyResult {
  const {
    interlocutor,
    scenario,
    extractedContext,
    includeFirstMessage = false,
    scenarioType,
    arenaPhase,
    anticipatedQuestions,
    userDrafts,
  } = config;

  // Detect sub-profile from scenario keywords
  const subProfile = detectSubProfile(scenario, interlocutor);
  const voiceId = getVoiceId(interlocutor);

  // ── Assemble full prompt (7+ blocks) ──

  const blocks: string[] = [];

  // Block 1: Master System Prompt (includes edge case handling)
  blocks.push(MASTER_SYSTEM_PROMPT);

  // Block 2: Interlocutor Persona (+ sub-profile if detected)
  blocks.push(getPersonaBlock(interlocutor, subProfile));

  // Block 3: Regional Context (always GLOBAL — region selection removed)
  blocks.push(getRegionalBlock());

  // Block 4: User Scenario
  blocks.push(buildScenarioBlock(scenario));

  // Block 4.5: Scenario Adaptation (modulates vocabulary/behavior per scenario type)
  const adaptationBlock = buildScenarioAdaptationBlock(scenarioType);
  if (adaptationBlock) {
    blocks.push(adaptationBlock);
  }

  // Block 4.7: Briefing Questions + User Drafts (Gap A+B)
  const briefingQuestionsBlock = buildBriefingQuestionsBlock(anticipatedQuestions, userDrafts);
  if (briefingQuestionsBlock) {
    blocks.push(briefingQuestionsBlock);
  }

  // Block 5: Extracted Context (only if present)
  if (extractedContext && extractedContext.trim().length > 0) {
    blocks.push(buildExtractedContextBlock(extractedContext));
  }

  // Block 5.5: TTS Text Optimization (ensures aiMessage is speech-friendly)
  blocks.push(TTS_TEXT_OPTIMIZATION_BLOCK);

  // Block 6: Output Format + isComplete Rules (includes pattern tracking)
  blocks.push(OUTPUT_FORMAT_BLOCK);

  // Block 6.5: Arena Phase Directive (progressive scaffolding)
  if (arenaPhase && ARENA_PHASE_DIRECTIVES[arenaPhase]) {
    blocks.push(ARENA_PHASE_DIRECTIVES[arenaPhase]);
  }

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

/* ── Token Estimation ── */

/**
 * Rough token estimation (~4 chars per token for English text).
 * This is for logging/audit purposes, not billing.
 * The actual token count comes from the OpenAI API response.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}