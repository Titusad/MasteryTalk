import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createUserClient } from "../_shared/supabaseClient.ts";
import { assembleSystemPrompt } from "../_shared/prompts/index.ts";
import type { SessionConfig, PreparedSession, ChatMessage } from "../_shared/types.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

async function callOpenAI(messages: any[], model: string, retries = 1): Promise<any> {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages,
                response_format: { type: "json_object" },
                temperature: 0.7,
            }),
        });
        if (!response.ok) throw new Error(`OpenAI error: ${await response.text()}`);
        const result = await response.json();
        return JSON.parse(result.choices[0].message.content);
    } catch (err) {
        if (retries > 0) {
            await new Promise(r => setTimeout(r, 1000));
            return callOpenAI(messages, model, retries - 1);
        }
        throw err;
    }
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("Missing Authorization header");

        const supabase = createUserClient(authHeader);
        const jwt = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
        if (authError || !user) throw new Error(`Unauthorized: ${authError?.message || "User is null"}`);

        // We also need the user's profile to know `marketFocus` and `plan`
        const { data: profile } = await supabase
            .from("profiles")
            .select("market_focus, plan")
            .eq("id", user.id)
            .single();

        const config: SessionConfig = await req.json();

        // Assemble the prompt using shared prompt engineering module
        const assemblyConfig = {
            interlocutor: (config.interlocutor || "client").toLowerCase() as any,
            scenario: config.scenario,
            marketFocus: (profile?.market_focus as any) || "colombia",
            extractedContext: config.context,
            includeFirstMessage: true,
            scenarioType: config.scenarioType,
            strategyPillars: config.strategyPillars,
            mini: profile?.plan === "free" ? true : false,
        };

        const result = assembleSystemPrompt(assemblyConfig);
        const model = profile?.plan === "free" ? "gpt-4o-mini" : "gpt-4o";

        let aiResponse;
        try {
            aiResponse = await callOpenAI([{ role: "system", content: result.systemPrompt }], model);
        } catch (err: any) {
            console.error("OpenAI failed to generate first message:", err);
            aiResponse = {
                aiMessage: "Hello. I'm ready to begin whenever you are.",
                isComplete: false,
                internalAnalysis: "Fallback first message due to OpenAI error"
            };
        }

        // Initial message
        const firstMessage: ChatMessage = {
            role: "ai",
            time: new Date().toISOString(),
            text: aiResponse.aiMessage,
        };

        // Let's create the session in the DB and put the first message in the history
        const { data: sessionDoc, error: insertError } = await supabase
            .from("sessions")
            .insert({
                user_id: user.id,
                scenario_config: config,
                system_prompt: result.systemPrompt,
                history: [firstMessage],
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
            firstMessage: firstMessage,
            voiceId: result.voiceId,
        };

        return new Response(JSON.stringify(preparedSession), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("prepare-session error:", error);
        return new Response(JSON.stringify({ error: error.message || JSON.stringify(error) || "Unknown error inside prepare-session" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200, // Temporarily 200 so Supabase JS client doesn't swallow the error message
        });
    }
});
