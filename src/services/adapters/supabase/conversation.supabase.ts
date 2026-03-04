import { getSupabaseClient } from "../../supabase";
import type { IConversationService } from "../../interfaces/conversation";
import type {
    SessionConfig,
    PreparedSession,
    ChatMessage,
    ConversationTurnResult,
} from "../../types";
import { ConversationError, AuthError } from "../../errors";

export class SupabaseConversationService implements IConversationService {

    async prepareSession(config: SessionConfig): Promise<PreparedSession> {
        try {
            const supabase = getSupabaseClient();
            // Validate auth
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new AuthError("AUTH_UNKNOWN", new Error("Unauthorized"));

            const { data, error } = await supabase.functions.invoke('prepare-session', {
                body: config,
            });

            if (error) {
                throw new ConversationError("SESSION_CREATION_FAILED", new Error(`Edge Function Error: ${error.message}`));
            }

            if (data.error) {
                throw new ConversationError("SESSION_CREATION_FAILED", new Error(data.error));
            }

            return data as PreparedSession;
        } catch (err: any) {
            if (err instanceof ConversationError || err instanceof AuthError) throw err;
            throw new ConversationError("SESSION_CREATION_FAILED", err instanceof Error ? err : new Error(err.message || "Failed to prepare session"));
        }
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
