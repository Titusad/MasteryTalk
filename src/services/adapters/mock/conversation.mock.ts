/**
 * MockConversationService — Simulates Supabase Edge Functions + GPT-4o
 *
 * Preserves current prototype behavior:
 * - prepareSession: 2.5s loading screen with steps
 * - processTurn: Returns next hardcoded AI message after ~1s processing + ~2.2s "typing"
 * - Messages come from scenario-specific CHAT_MESSAGES in sequence
 *
 * Error simulation (when ?simulate_errors=true):
 * - prepareSession → ConversationError("SESSION_CREATION_FAILED")
 * - processTurn → ConversationError("AI_TIMEOUT") or ("TURN_PROCESSING_FAILED")
 */
import type { IConversationService } from "../../interfaces";
import type {
  SessionConfig,
  PreparedSession,
  ChatMessage,
  ConversationTurnResult,
} from "../../types";
import { ConversationError } from "../../errors";
import { getChatMessagesForScenario } from "./data/chat-messages";
import { delay, mockId, shouldSimulateError } from "./utils";
import {
  assembleSystemPrompt,
  getVoiceId,
  type InterlocutorType,
} from "../../prompts";

export class MockConversationService implements IConversationService {
  /** Track conversation state per session */
  private sessions: Map<
    string,
    { config: SessionConfig; turnIndex: number; messages: ChatMessage[]; chatMessages: ChatMessage[] }
  > = new Map();

  async prepareSession(config: SessionConfig): Promise<PreparedSession> {
    // Simulate the session preparation (~500ms for a quick setup)
    await delay(500);

    /* ── Error simulation ── */
    if (shouldSimulateError("conversation")) {
      throw new ConversationError("SESSION_CREATION_FAILED");
    }

    const sessionId = mockId("session");
    const scenarioChatMessages = getChatMessagesForScenario(config.scenarioType);
    const firstMessage = { ...scenarioChatMessages[0] };

    // Use real prompt assembler (same logic as production Edge Function)
    const interlocutor = (config.interlocutor || "client") as InterlocutorType;
    const { systemPrompt, voiceId, subProfile, estimatedTokens } =
      assembleSystemPrompt({
        interlocutor,
        scenario: config.scenario,
        marketFocus: undefined, // Mock doesn't have user profile yet
        extractedContext: config.context,
        includeFirstMessage: true,
        scenarioType: config.scenarioType,
        strategyPillars: config.strategyPillars,
      });

    // Update first message label to match interlocutor
    firstMessage.label =
      interlocutor.charAt(0).toUpperCase() + interlocutor.slice(1);

    this.sessions.set(sessionId, {
      config,
      turnIndex: 1, // First AI message already delivered
      messages: [firstMessage],
      chatMessages: scenarioChatMessages,
    });

    if (import.meta.env.DEV) {
      console.log(
        `[MockConversation] Session ${sessionId} prepared`,
        `| Scenario: ${config.scenarioType ?? "default"}`,
        `| Interlocutor: ${interlocutor}`,
        `| Sub-profile: ${subProfile ?? "none"}`,
        `| Voice: ${voiceId}`,
        `| Prompt tokens: ~${estimatedTokens}`
      );
    }

    return {
      sessionId,
      systemPrompt,
      firstMessage,
      voiceId,
    };
  }

  async processTurn(
    sessionId: string,
    userMessage: string
  ): Promise<ConversationTurnResult> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new ConversationError("SESSION_NOT_FOUND");

    // Add user message to history
    const userMsg: ChatMessage = {
      role: "user",
      label: "T\u00FA",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      text: userMessage,
    };
    session.messages.push(userMsg);

    // Simulate transcription processing (~1s in prototype)
    await delay(1000);

    /* ── Error simulation ── */
    if (shouldSimulateError("conversation")) {
      const codes = ["AI_TIMEOUT", "TURN_PROCESSING_FAILED", "AI_RATE_LIMIT"] as const;
      throw new ConversationError(codes[Math.floor(Math.random() * codes.length)]);
    }

    // Get next AI message from scenario-specific mock data
    const nextIndex = session.turnIndex;
    if (nextIndex >= session.chatMessages.length) {
      return { aiMessage: userMsg, isComplete: true };
    }

    const aiMessage = { ...session.chatMessages[nextIndex] };

    // Simulate AI "typing" delay (~2.2s in prototype)
    await delay(2200);

    session.messages.push(aiMessage);
    session.turnIndex = nextIndex + 1;

    return {
      aiMessage,
      isComplete: session.turnIndex >= session.chatMessages.length,
    };
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const session = this.sessions.get(sessionId);
    return session ? [...session.messages] : [];
  }

  async endConversation(sessionId: string): Promise<void> {
    // In mock, nothing to do — session stays in memory
    await delay(200);
  }
}
