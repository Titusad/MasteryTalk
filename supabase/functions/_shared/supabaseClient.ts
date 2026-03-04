import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export function createServiceClient() {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    return createClient(supabaseUrl, supabaseKey);
}

export function createUserClient(authHeader: string | null) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
    });
}
