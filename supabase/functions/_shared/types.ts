/**
 * Deno compatible types for Edge Functions
 */

export type UserPlan = "free" | "per-session";

export type AuthProvider = "google";

export type ScenarioType =
    | "interview"
    | "sales";

export type MarketFocus = "mexico" | "colombia" | "brazil";

export interface ChatMessage {
    role: "user" | "ai";
    label?: string;
    time: string;
    text: string;
}

export interface SessionConfig {
    scenario: string;
    interlocutor: string;
    scenarioType?: ScenarioType;
    guidedFields?: Record<string, string>;
    context?: string;
    strategyPillars?: Array<{ summary: string; why: string; how: string; result: string }>;
}

export interface PreparedSession {
    sessionId: string;
    systemPrompt: string;
    firstMessage: ChatMessage;
    voiceId?: string;
}

export interface ConversationTurnResult {
    aiMessage: ChatMessage;
    isComplete: boolean;
}
