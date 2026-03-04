import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createUserClient } from "../_shared/supabaseClient.ts";
import { assembleSystemPrompt } from "../_shared/prompts/index.ts";
import type { SessionConfig, PreparedSession, ChatMessage } from "../_shared/types.ts";

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("Missing Authorization header");

        const supabase = createUserClient(authHeader);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Unauthorized");

        // We also need the user's profile to know `marketFocus` and `plan`
        const { data: profile } = await supabase
            .from("profiles")
            .select("market_focus, plan")
            .eq("id", user.id)
            .single();

        const config: SessionConfig = await req.json();

        // Assemble the prompt using shared prompt engineering module
        const assemblyConfig = {
            interlocutor: config.interlocutor as any,
            scenario: config.scenario,
            marketFocus: (profile?.market_focus as any) || "colombia",
            extractedContext: config.context,
            includeFirstMessage: true,
            scenarioType: config.scenarioType,
            strategyPillars: config.strategyPillars,
            mini: profile?.plan === "free" ? true : false,
        };

        const result = assembleSystemPrompt(assemblyConfig);

        // Initial message
        const firstMessage: ChatMessage = {
            role: "ai",
            time: new Date().toISOString(),
            text: "Waiting for first message...", // assembleSystemPrompt places opening in system Prompt? usually mock generates opening. Wait, `assembleSystemPrompt` gives us FIRST_MESSAGE_BLOCK which tells AI to start.
        };
        // Wait, the real ConversationService starts with a dummy or empty list? 
        // In mock, prepareSession returns `firstMessage`. We'll use a placeholder or let the UI handle it. 
        // Actually, in the frontend the AI doesn't literally send a first message until the user speaks? Or does it?
        // Let's create the session in the DB
        const { data: sessionDoc, error: insertError } = await supabase
            .from("sessions")
            .insert({
                user_id: user.id,
                scenario_config: config,
                system_prompt: result.systemPrompt,
                // voice_id is passed back for UI reference
                history: [],
                status: "active",
                turn_count: 0,
                voice_id: result.voiceId,
            })
            .select("id")
            .single();

        if (insertError) throw insertError;

        // We just return the id, the system prompt and the voice id.
        const preparedSession: PreparedSession = {
            sessionId: sessionDoc.id,
            systemPrompt: result.systemPrompt,
            firstMessage: firstMessage, // Usually handled by UI in Phase 1?
            voiceId: result.voiceId,
        };

        return new Response(JSON.stringify(preparedSession), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("prepare-session error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
