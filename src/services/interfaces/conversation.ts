/**
 * IConversationService — Session preparation & conversation turns
 *
 * Production: Supabase Edge Functions (prepare-session, process-turn)
 *             + GPT-4o for conversation
 * Mock: Returns hardcoded chat messages with simulated delays
 */
import type {
  SessionConfig,
  PreparedSession,
  ChatMessage,
  ConversationTurnResult,
  ScriptSection,
} from "../types";

export interface IConversationService {


  /** Generate suggestions for extra context fields based on scenario type */
  generateContextSuggestions(scenarioType: string, scenario: string, interlocutor: string): Promise<{ fields: Array<{ label: string; placeholder: string; hint: string; pasteHint: string; suggestions: string[] }> }>;

  /** Generate the final pre-briefing script based on all gathered context */
  generatePreBriefing(params: {
    scenarioType: string;
    scenario: string;
    interlocutor: string;
    guidedFields?: Record<string, string>;
    marketFocus?: string | null;
    extraContext?: string;
  }): Promise<{ sections: ScriptSection[] }>;

  /** Prepare a new practice session (creates session doc, generates system prompt) */
  prepareSession(config: SessionConfig): Promise<PreparedSession>;

  /** Send user's transcribed message and get AI response */
  processTurn(
    sessionId: string,
    userMessage: string
  ): Promise<ConversationTurnResult>;

  /** Get all messages for a session */
  getSessionMessages(sessionId: string): Promise<ChatMessage[]>;

  /** End the conversation phase and mark session ready for feedback */
  endConversation(sessionId: string): Promise<void>;
}