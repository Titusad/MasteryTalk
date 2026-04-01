import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createUserClient } from "../_shared/supabaseClient.ts";
import { buildDrillEvaluatorPrompt, DrillContext } from "./drill-evaluator-prompt.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

async function callOpenAI(systemPrompt: string, userMessage: string): Promise<any> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2, // Low temperature for consistent evaluation
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI error: ${await response.text()}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    return JSON.parse(content);
}

serve(async (req) => {
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

        // Extract payload
        const payload: DrillContext = await req.json();
        
        // Basic validation
        if (!payload.pillar || !payload.userDrillResponse || !payload.scenarioType) {
             throw new Error("Missing required drill context fields");
        }

        const systemPrompt = buildDrillEvaluatorPrompt(payload);
        
        // Generate evaluation
        const evaluation = await callOpenAI(systemPrompt, `Evaluate this response: "${payload.userDrillResponse}"`);

        return new Response(JSON.stringify(evaluation), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("evaluate-drill error:", error);
        return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
