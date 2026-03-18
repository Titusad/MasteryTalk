/**
 * ══════════════════════════════════════════════════════════════
 *  SupabaseConversationService — Real GPT-4o conversation via Edge Functions
 *
 *  Flow:
 *  1. prepareSession: Assembles system prompt locally → sends to /prepare-session
 *     → server stores in KV + calls GPT-4o for first message
 *  2. processTurn: Sends user message to /process-turn
 *     → server retrieves history from KV + calls GPT-4o → returns AI response
 *  3. getSessionMessages: Returns locally cached messages
 *  4. endConversation: Marks session complete
 * ══════════════════════════════════════════════════════════════
 */
import type { IConversationService } from "../../interfaces";
import type {
    SessionConfig,
    PreparedSession,
    ChatMessage,
    ConversationTurnResult,
} from "../../types";
import { ConversationError } from "../../errors";
import {
    assembleSystemPrompt,
    DEFAULT_INTERLOCUTOR,
    type InterlocutorType,
} from "../../prompts";
import { projectId, publicAnonKey } from "../../../../utils/supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d`;

async function serverFetch(path: string, body: Record<string, unknown>) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Server ${res.status}: ${errBody.slice(0, 300)}`);
    }
    return res.json();
}

export class SupabaseConversationService implements IConversationService {
    /** Local cache of messages per session (avoids extra server calls) */
    private localMessages: Map<string, ChatMessage[]> = new Map();

    async prepareSession(config: SessionConfig): Promise<PreparedSession> {
        try {
            // Assemble system prompt locally (uses frontend prompt assembler)
            const interlocutor = (config.interlocutor ||
                DEFAULT_INTERLOCUTOR[config.scenarioType ?? "interview"]) as InterlocutorType;

            // Convert guidedFields to extractedContext for the prompt assembler
            let extractedContext = config.context || "";
            if (config.guidedFields && Object.keys(config.guidedFields).length > 0) {
                const contextParts = Object.entries(config.guidedFields)
                    .filter(([, v]) => v.trim().length > 0)
                    .map(([k, v]) => `${k}: ${v.trim()}`);
                if (contextParts.length > 0) {
                    extractedContext =
                        (extractedContext ? extractedContext + "\n\n" : "") +
                        contextParts.join("\n\n");
                }
            }

            console.log(
                `[SupabaseConversation] assembleSystemPrompt inputs:`,
                {
                    interlocutor,
                    scenario: config.scenario,
                    hasContext: !!extractedContext,
                    scenarioType: config.scenarioType,
                    hasBriefingQuestions: !!config.interviewBriefing?.anticipatedQuestions?.length,
                    hasDrafts: !!config.interviewBriefing?.userDrafts && Object.keys(config.interviewBriefing.userDrafts).length > 0,
                }
            );

            const { systemPrompt, voiceId, subProfile, estimatedTokens } =
                assembleSystemPrompt({
                    interlocutor,
                    scenario: config.scenario,
                    extractedContext: extractedContext || undefined,
                    includeFirstMessage: true,
                    scenarioType: config.scenarioType,
                    // Gap A+B: inject briefing questions + user drafts into interviewer prompt
                    anticipatedQuestions: config.interviewBriefing?.anticipatedQuestions,
                    userDrafts: config.interviewBriefing?.userDrafts,
                });

            console.log(
                `[SupabaseConversation] Preparing session | interlocutor=${interlocutor} | sub-profile=${subProfile ?? "none"} | voice=${voiceId} | prompt tokens=~${estimatedTokens}`
            );

            const data = await serverFetch("/prepare-session", {
                systemPrompt,
                scenario: config.scenario,
                interlocutor,
                scenarioType: config.scenarioType ?? "interview",
                voiceId,
                // Gap C: pass briefing data so it's stored in KV for the analyst
                interviewBriefing: config.interviewBriefing ?? null,
            });

            const sessionId = data.sessionId;
            const firstMessage: ChatMessage = data.firstMessage;

            // Attach coaching hint from server to the first message
            if (data.coachingHint) {
                firstMessage.coachingHint = data.coachingHint;
            }

            // Cache the first message locally
            this.localMessages.set(sessionId, [firstMessage]);

            console.log(
                `[SupabaseConversation] Session ${sessionId} ready — AI: "${firstMessage.text.slice(0, 60)}..."`
            );

            return {
                sessionId,
                systemPrompt,
                firstMessage,
                voiceId,
            };
        } catch (err) {
            console.error("[SupabaseConversation] prepareSession failed — FULL ERROR:", err);
            console.error("[SupabaseConversation] Error message:", err instanceof Error ? err.message : String(err));
            console.error("[SupabaseConversation] Error stack:", err instanceof Error ? err.stack : "no stack");
            throw new ConversationError("SESSION_CREATION_FAILED");
        }
    }

    async processTurn(
        sessionId: string,
        userMessage: string
    ): Promise<ConversationTurnResult> {
        // Add user message to local cache immediately
        const cached = this.localMessages.get(sessionId) ?? [];
        const userMsg: ChatMessage = {
            role: "user",
            label: "You",
            time: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
            text: userMessage,
        };
        cached.push(userMsg);

        try {
            const data = await serverFetch("/process-turn", {
                sessionId,
                userMessage,
            });

            const aiMessage: ChatMessage = data.aiMessage;
            const isComplete: boolean = data.isComplete === true;
            const coachingHint = data.coachingHint || null;

            // Attach coaching hint to the AI message
            if (coachingHint) {
                aiMessage.coachingHint = coachingHint;
            }

            // Cache AI response
            cached.push(aiMessage);
            this.localMessages.set(sessionId, cached);

            if (data._debug) {
                console.log(
                    `[SupabaseConversation] Turn ${data._debug.turnCount} | AI: ${aiMessage.text.length} chars | isComplete=${isComplete}`
                );
            }

            return { aiMessage, isComplete, coachingHint };
        } catch (err) {
            console.error("[SupabaseConversation] processTurn failed:", err);
            throw new ConversationError("TURN_PROCESSING_FAILED");
        }
    }

    async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
        // Return a shallow clone to prevent React state mutation via shared reference
        return [...(this.localMessages.get(sessionId) ?? [])];
    }

    async endConversation(_sessionId: string): Promise<void> {
        // Session state is managed server-side; nothing to do here
    }
}