/**
 * Shared utilities for the Edge Function routes.
 * Single source for auth, OpenAI, cost tracking, and display helpers.
 */
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.ts";

/* ── Supabase admin client (service role) ── */
export function getAdminClient() {
  return createClient(
    (globalThis as any).Deno.env.get("SUPABASE_URL")!,
    (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/* ── Helper: extract user from Authorization header ── */
export async function getAuthUser(authHeader: string | undefined) {
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const supabase = getAdminClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

/* ── Interlocutor display names ── */
export const INTERLOCUTOR_DISPLAY: Record<string, string> = {
  recruiter: "Recruiter",
  sme: "SME Expert",
  hiring_manager: "Hiring Manager",
  hr: "HR",
  gatekeeper: "Gatekeeper",
  technical_buyer: "Technical Buyer",
  champion: "Champion",
  decision_maker: "Decision Maker",
  meeting_facilitator: "Meeting Facilitator",
  senior_stakeholder: "Senior Stakeholder",
};

export function displayLabel(interlocutor: string | null | undefined): string {
  if (!interlocutor) return "AI";
  return INTERLOCUTOR_DISPLAY[interlocutor] || interlocutor.charAt(0).toUpperCase() + interlocutor.slice(1).replace(/_/g, " ");
}

/* ── API Cost Tracking ── */
export const API_COST_RATES: Record<string, { input: number; output: number }> = {
  "gpt-4o":        { input: 0.0025, output: 0.01 },
  "gpt-4o-mini":   { input: 0.00015, output: 0.0006 },
  "whisper-1":     { input: 0.006, output: 0 },
  "tts-1":         { input: 0.015, output: 0 },
  "tts-1-hd":      { input: 0.030, output: 0 },
  "elevenlabs":    { input: 0.0003, output: 0 },
};

export async function logApiUsage(
  service: string,
  endpoint: string,
  tokens: { prompt: number; completion: number; total: number },
  model: string,
  userId?: string,
) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const key = `api_usage:${today}`;

    const rate = API_COST_RATES[model] || { input: 0, output: 0 };
    const cost = (tokens.prompt * rate.input / 1000) + (tokens.completion * rate.output / 1000);

    const existing = await kv.get(key);
    const daily: any = existing || { date: today, calls: [], totals: {}, byUser: {} };

    if (!daily.calls) daily.calls = [];
    if (daily.calls.length < 500) {
      daily.calls.push({
        ts: Date.now(),
        service,
        endpoint,
        model,
        tokens,
        cost: +cost.toFixed(6),
        userId: userId || "anonymous",
      });
    }

    if (!daily.totals) daily.totals = {};
    if (!daily.totals[service]) daily.totals[service] = { calls: 0, tokens: 0, cost: 0, chars: 0 };
    daily.totals[service].calls++;
    daily.totals[service].tokens += tokens.total;
    daily.totals[service].cost = +(daily.totals[service].cost + cost).toFixed(6);
    if (service === "elevenlabs" || service === "openai-tts") {
      daily.totals[service].chars = (daily.totals[service].chars || 0) + tokens.prompt;
    }

    if (userId) {
      if (!daily.byUser) daily.byUser = {};
      if (!daily.byUser[userId]) daily.byUser[userId] = { calls: 0, tokens: 0, cost: 0 };
      daily.byUser[userId].calls++;
      daily.byUser[userId].tokens += tokens.total;
      daily.byUser[userId].cost = +(daily.byUser[userId].cost + cost).toFixed(6);
    }

    await kv.set(key, daily);
  } catch (e) {
    console.warn("[API Usage Log] Failed to log:", e);
  }
}

/* ── OpenAI Chat Completions (with usage logging) ── */
export async function callOpenAIChat(
  messages: Array<{ role: string; content: string }>,
  options: { model?: string; temperature?: number; max_tokens?: number; jsonMode?: boolean; endpoint?: string; userId?: string } = {},
) {
  const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) throw new Error("OPENAI_API_KEY not configured on server");

  const body: Record<string, unknown> = {
    model: options.model || "gpt-4o",
    messages,
    temperature: options.temperature ?? 0.85,
    max_tokens: options.max_tokens ?? 500,
  };
  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errBody.slice(0, 300)}`);
  }
  const data = await res.json();

  const usage = data.usage || {};
  logApiUsage("openai-chat", options.endpoint || "chat-completions", {
    prompt: usage.prompt_tokens || 0,
    completion: usage.completion_tokens || 0,
    total: usage.total_tokens || 0,
  }, (body.model as string) || "gpt-4o", options.userId).catch(() => {});

  return data.choices?.[0]?.message?.content || "";
}
