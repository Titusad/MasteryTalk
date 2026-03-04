import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createUserClient } from "../_shared/supabaseClient.ts";
import type { ConversationTurnResult, ChatMessage } from "../_shared/types.ts";

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

        if (!response.ok) {
            throw new Error(`OpenAI error: ${await response.text()}`);
        }

        const result = await response.json();
        const content = result.choices[0].message.content;
        return JSON.parse(content);
    } catch (err) {
        if (retries > 0) {
            console.warn("OpenAI API or JSON parse failed, retrying...", err);
            // Wait a bit before retry
            await new Promise(r => setTimeout(r, 1000));
            return callOpenAI(messages, model, retries - 1);
        }
        throw err;
    }
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("Missing Authorization header");

        const supabase = createUserClient(authHeader);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Unauthorized");

        // Extract payload
        const { sessionId, userMessage } = await req.json();
        if (!sessionId || !userMessage) throw new Error("Missing sessionId or userMessage");

        // Fetch session and profile
        const { data: session, error: sessionError } = await supabase
            .from("sessions")
            .select("system_prompt, history, turn_count, user_id")
            .eq("id", sessionId)
            .single();

        if (sessionError || !session) throw new Error("Session not found");
        if (session.user_id !== user.id) throw new Error("Forbidden"); // RLS usually covers this, but double check

        const { data: profile } = await supabase
            .from("profiles")
            .select("plan")
            .eq("id", user.id)
            .single();

        // Determine model
        const model = profile?.plan === "free" ? "gpt-4o-mini" : "gpt-4o";

        // Build messages array
        const messages = [
            { role: "system", content: session.system_prompt },
            ...session.history.map((h: any) => ({
                role: h.role,
                content: h.text, // The mock stored it as `text`
            })),
            { role: "user", content: userMessage }
        ];

        // Call OpenAI
        let aiResponse;
        try {
            aiResponse = await callOpenAI(messages, model);
        } catch (err: any) {
            // Fallback response if all retries fail
            console.error("OpenAI failed completely:", err);
            aiResponse = {
                aiMessage: "I encountered an error understanding your last message. Could you try rephrasing it?",
                isComplete: false,
                internalAnalysis: "Error fallback triggered",
            };
        }

        // Enforce business logic for isComplete
        let isComplete = aiResponse.isComplete;
        const nextTurnCount = session.turn_count + 1;

        if (nextTurnCount < 4) {
            isComplete = false; // Override to force at least 4 turns
        } else if (nextTurnCount >= 8) {
            isComplete = true; // Override to force closure at turn 8
            if (!aiResponse.isComplete) {
                // Optionally append a closing thought if the AI didn't close it naturally
                aiResponse.aiMessage += " Let's stop here and review how we did.";
            }
        }

        // Append to history
        const updatedHistory = [
            ...session.history,
            { role: "user", text: userMessage, time: new Date().toISOString() },
            { role: "ai", text: aiResponse.aiMessage, time: new Date().toISOString(), _internal: aiResponse.internalAnalysis } // Storing internalAnalysis secretly
        ];

        const { error: updateError } = await supabase
            .from("sessions")
            .update({
                history: updatedHistory,
                turn_count: nextTurnCount,
                status: isComplete ? "completed" : "active",
            })
            .eq("id", sessionId);

        if (updateError) throw updateError;

        // TODO: Audio generation (ElevenLabs integration in Week 3)

        const result: ConversationTurnResult = {
            aiMessage: {
                role: "ai",
                time: new Date().toISOString(),
                text: aiResponse.aiMessage,
            },
            isComplete,
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("process-turn error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
