import { getSupabaseClient } from "../../supabase";
import { projectId } from "../../../../utils/supabase/info";
import type { IConversationService } from "../../interfaces/conversation";
import type {
    SessionConfig,
    PreparedSession,
    ChatMessage,
    ConversationTurnResult,
    ScriptSection,
} from "../../types";
import { ConversationError, AuthError } from "../../errors";

export class SupabaseConversationService implements IConversationService {
    async generateContextSuggestions(scenarioType: string, scenario: string, interlocutor: string): Promise<{ fields: Array<{ label: string; placeholder: string; hint: string; pasteHint: string; suggestions: string[] }> }> {
        try {
            const supabase = getSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new AuthError("AUTH_UNKNOWN", new Error("Unauthorized"));

            const { data, error } = await supabase.functions.invoke('generate-scenario-data', {
                body: { action: "context_suggestions", scenarioType, scenario, interlocutor },
            });

            if (error) throw new Error(error.message);
            if (data.error) throw new Error(data.error);

            return data;
        } catch (err: any) {
            console.error("🚨 Supabase Edge Function [generateContextSuggestions] failed:", err);
            throw err instanceof Error ? err : new Error(err.message || 'Unknown error');
        }
    }

    async generatePreBriefing(params: {
        scenarioType: string;
        scenario: string;
        interlocutor: string;
        guidedFields?: Record<string, string>;
        marketFocus?: string | null;
        extraContext?: string;
    }): Promise<{ sections: ScriptSection[] }> {
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const supabase = getSupabaseClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new AuthError("AUTH_UNKNOWN", new Error("Unauthorized"));

                const { data, error } = await supabase.functions.invoke('generate-scenario-data', {
                    body: {
                        action: "pre_briefing",
                        scenario: params.scenario,
                        scenarioType: params.scenarioType,
                        interlocutor: params.interlocutor,
                        guidedFields: params.guidedFields,
                        marketFocus: params.marketFocus,
                    }
                });

                if (error) {
                    throw new Error(`Edge Function error: ${error.message}`);
                }

                if (data?.error) throw new Error(data.error);

                return { sections: data.sections };
            } catch (err: any) {
                const msg = err instanceof Error ? err.message : String(err);
                if ((msg.includes("Lock") || msg.includes("AbortError")) && attempt < 2) {
                    console.warn(`[generatePreBriefing] Lock error, retrying (${attempt + 1}/3)...`);
                    await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
                    continue;
                }
                console.error("🚨 Edge Function [generatePreBriefing → generate-script] failed:", err);
                throw err instanceof Error ? err : new Error(msg || 'Unknown error');
            }
        }
        throw new Error("Failed after retries");
    }

    async prepareSession(config: SessionConfig): Promise<PreparedSession> {
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const supabase = getSupabaseClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new AuthError("AUTH_UNKNOWN", new Error("Unauthorized"));

                const { data, error } = await supabase.functions.invoke('prepare-session', {
                    body: config,
                });

                if (error) {
                    throw new ConversationError("SESSION_CREATION_FAILED", new Error(`Edge Function Error: ${error.message}`));
                }

                if (data?.error) {
                    throw new ConversationError("SESSION_CREATION_FAILED", new Error(data.error));
                }

                return data as PreparedSession;
            } catch (err: any) {
                const msg = err instanceof Error ? err.message : String(err);
                if ((msg.includes("Lock") || msg.includes("AbortError")) && attempt < 2) {
                    console.warn(`[prepareSession] Lock error, retrying (${attempt + 1}/3)...`);
                    await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
                    continue;
                }
                console.error("🚨 Supabase Edge Function [prepare-session] failed:", err);
                if (err instanceof ConversationError || err instanceof AuthError) throw err;
                throw new ConversationError("SESSION_CREATION_FAILED", err instanceof Error ? err : new Error(msg || "Failed to prepare session"));
            }
        }
        throw new ConversationError("SESSION_CREATION_FAILED", new Error("Failed after retries"));
    }

    async processTurn(
        sessionId: string,
        userMessage: string
    ): Promise<ConversationTurnResult> {
        try {
            const supabase = getSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new AuthError("AUTH_UNKNOWN", new Error("Unauthorized"));

            const { data, error } = await supabase.functions.invoke('process-turn', {
                body: { sessionId, userMessage },
            });

            if (error) {
                throw new ConversationError("TURN_PROCESSING_FAILED", new Error(`Edge Function Error: ${error.message}`));
            }

            if (data.error) {
                throw new ConversationError("TURN_PROCESSING_FAILED", new Error(data.error));
            }

            return data as ConversationTurnResult;
        } catch (err: any) {
            console.error("🚨 Supabase Edge Function [process-turn] failed:", err);
            if (err instanceof ConversationError || err instanceof AuthError) throw err;
            throw new ConversationError("TURN_PROCESSING_FAILED", err instanceof Error ? err : new Error(err.message || "Failed to process turn"));
        }
    }

    async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
                .from("sessions")
                .select("history")
                .eq("id", sessionId)
                .single();

            if (error) throw error;

            // Return the history array, filtering out any internal markers if they leaked
            return (data.history || []).map((msg: any) => ({
                role: msg.role,
                text: msg.text,
                time: msg.time,
                label: msg.label,
            }));
        } catch (err: any) {
            throw new ConversationError("CONVERSATION_UNKNOWN", err instanceof Error ? err : new Error(err.message || "Failed to fetch messages"));
        }
    }

    async endConversation(sessionId: string): Promise<void> {
        try {
            const supabase = getSupabaseClient();
            const { error } = await supabase
                .from("sessions")
                .update({ status: "completed" })
                .eq("id", sessionId);

            if (error) throw error;
        } catch (err: any) {
            throw new ConversationError("CONVERSATION_UNKNOWN", err instanceof Error ? err : new Error(err.message || "Failed to end conversation"));
        }
    }
}
