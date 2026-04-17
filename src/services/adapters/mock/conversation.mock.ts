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
import { getScriptSectionsForScenario } from "./data/script-sections-by-scenario";
import { delay, mockId, shouldSimulateError } from "./utils";
import {
  assembleSystemPrompt,
  getVoiceId,
  DEFAULT_INTERLOCUTOR,
  type InterlocutorType,
} from "../../prompts";

export class MockConversationService implements IConversationService {
  /** Track conversation state per session */
  private sessions: Map<
    string,
    { config: SessionConfig; turnIndex: number; messages: ChatMessage[]; chatMessages: ChatMessage[] }
  > = new Map();

  async generateContextSuggestions(
    scenarioType: string,
    _scenario: string,
    _interlocutor: string
  ): Promise<{ fields: Array<{ label: string; placeholder: string; hint: string; pasteHint: string; suggestions: string[] }> }> {
    await delay(800);
    const isInterview = scenarioType === "interview";
    return {
      fields: isInterview
        ? [
          { label: "Job Description", placeholder: "Paste the job description here...", hint: "Helps tailor your practice", pasteHint: "Paste from LinkedIn", suggestions: ["Senior Product Manager at Google", "VP Engineering at a Series B startup"] },
          { label: "Relevant Experience", placeholder: "Key achievements and experience...", hint: "What makes you qualified", pasteHint: "Paste from resume", suggestions: ["Led a team of 12 engineers", "Grew revenue 3x in 18 months"] },
        ]
        : [
          { label: "Product/Service", placeholder: "Describe what you're selling...", hint: "Be specific about your value prop", pasteHint: "Paste from deck", suggestions: ["B2B SaaS platform for supply chain", "AI-powered analytics dashboard"] },
          { label: "Talking Points", placeholder: "Key points you want to cover...", hint: "Your main arguments", pasteHint: "Paste from notes", suggestions: ["30% cost reduction", "ROI within 3 months"] },
        ],
    };
  }

  async generatePreBriefing(params: {
    scenarioType: string;
    scenario: string;
    interlocutor: string;
    guidedFields?: Record<string, string>;
    marketFocus?: string | null;
    extraContext?: string;
  }): Promise<{ sections: import("../../types").ScriptSection[] }> {
    // Simulate AI generation time
    await delay(2500);
    const sections = getScriptSectionsForScenario(params.scenarioType as any);
    return { sections };
  }

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
    const interlocutor = (config.interlocutor || DEFAULT_INTERLOCUTOR[config.scenarioType ?? "interview"]) as InterlocutorType;
    const { systemPrompt, voiceId, subProfile, estimatedTokens } =
      assembleSystemPrompt({
        interlocutor,
        scenario: config.scenario,
        marketFocus: config.marketFocus ?? undefined,
        extractedContext: config.context,
        includeFirstMessage: true,
        scenarioType: config.scenarioType,
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