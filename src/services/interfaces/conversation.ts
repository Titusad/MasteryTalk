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
} from "../types";

export interface IConversationService {
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