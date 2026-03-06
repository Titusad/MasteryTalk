/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Prompts Module
 *
 *  Public API for the prompt engineering system.
 *  Import from here in services and Edge Functions.
 *
 *  Usage:
 *    import { assembleSystemPrompt, type AssemblyConfig } from "../prompts";
 *
 *    const result = assembleSystemPrompt({
 *      interlocutor: "gatekeeper",
 *      scenario: "Sales pitch for SaaS platform",
 *      marketFocus: "colombia",
 *      includeFirstMessage: true,
 *      scenarioType: "sales",
 *    });
 *
 *    // result.systemPrompt  → Full assembled prompt
 *    // result.voiceId       → ElevenLabs voice ID
 *    // result.subProfile    → "NEGOTIATOR" | "LEADERSHIP" | null
 *    // result.estimatedTokens → ~1060
 *
 *  Reference: /docs/SYSTEM_PROMPTS.md
 * ══════════════════════════════════════════════════════════════
 */

/* ── Core Assembler ── */
export {
  assembleSystemPrompt,
  type AssemblyConfig,
  type AssemblyResult,
} from "./assembler";

/* ── Personas (for UI/mock display) ── */
export {
  getPersonaBlock,
  detectSubProfile,
  INTERLOCUTORS_BY_SCENARIO,
  DEFAULT_INTERLOCUTOR,
  type InterlocutorType,
  type SubProfileType,
} from "./personas";

/* ── Regions ── */
export { getRegionalBlock, type MarketFocus } from "./regions";

/* ── Voice Mapping ── */
export {
  getVoiceId,
  getVoiceProfile,
  ELEVENLABS_VOICE_SETTINGS,
  type VoiceProfile,
} from "./voice-map";

/* ── Raw Templates (for testing/inspection) ── */
export {
  MASTER_SYSTEM_PROMPT,
  OUTPUT_FORMAT_BLOCK,
  FIRST_MESSAGE_BLOCK,
  ARENA_PHASE_DIRECTIVES,
} from "./templates";

/* ── Analyst Prompts (Gemini 1.5 Flash — Screens 6 & 7) ── */
export {
  buildFeedbackAnalystPrompt,
  buildScriptGeneratorPrompt,
  OPPORTUNITY_TAGS,
  type OpportunityTag,
} from "./analyst";

/* ── Pronunciation Coach (Gemini 1.5 Flash — Screen 9) ── */
export {
  buildResultsSummaryPrompt,
  PRONUNCIATION_CATEGORIES,
  type PronunciationCategoryTag,
} from "./analyst";

/* ── TTS Synchronization (ElevenLabs — Production) ── */
export {
  TTS_TEXT_OPTIMIZATION_BLOCK,
  TTS_SYNC_ARCHITECTURE,
  charAlignmentToWordTimestamps,
  estimateWordTimestamps,
  type WordTimestamp,
} from "./tts-sync";