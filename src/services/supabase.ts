/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Supabase Client Singleton
 *
 *  Single instance used by all Supabase adapters.
 *  Uses the ANON key (public, safe for client-side).
 *  RLS policies ensure users only access their own data.
 *
 *  Configuration:
 *    1. Create a .env file (or set in Vite config):
 *       VITE_SUPABASE_URL=https://your-project.supabase.co
 *       VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
 *
 *    2. In Supabase Dashboard > Authentication > URL Configuration:
 *       - Site URL: https://your-domain.com
 *       - Redirect URLs: https://your-domain.com (add localhost for dev)
 *
 *    3. In Supabase Dashboard > Authentication > Providers:
 *       - Enable Google (add Client ID + Secret from Google Cloud Console)
 *       - Enable LinkedIn (add Client ID + Secret from LinkedIn Developer Portal)
 *         LinkedIn OIDC scopes (configured automatically by Supabase): openid, profile, email
 *
 *  Reference: MASTER_BLUEPRINT.md §2
 * ══════════════════════════════════════════════════════════════
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ── Environment variables ── */

/**
 * Credential resolution order:
 * 1. VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (env vars — local dev / CI)
 * 2. Figma Make auto-generated info (/utils/supabase/info.tsx)
 *
 * This lets the same code run in both Figma Make and a real repo.
 */
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (projectId ? `https://${projectId}.supabase.co` : undefined);

const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  publicAnonKey ||
  undefined;

/**
 * Returns true if Supabase credentials are configured.
 * Used by the adapter switch in services/index.ts to auto-detect mode.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/* ── Client singleton ── */

let _client: SupabaseClient | null = null;

/**
 * Get the Supabase client singleton.
 * Throws if env vars are not configured (call isSupabaseConfigured() first).
 */
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "[inFluentia] Supabase credentials not found.\n" +
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n" +
      "See /src/services/supabase.ts for setup instructions."
    );
  }

  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      /* Persist session in localStorage for tab persistence (F1-07) */
      persistSession: true,
      /* Auto-refresh JWT before expiry */
      autoRefreshToken: true,
      /* Detect auth changes in other tabs (F1-07: multi-tab logout) */
      detectSessionInUrl: true,
    },
  });

  return _client;
}

/* ── Database type helpers ── */

/**
 * Row types matching the SQL schema in FASE1_MIGRATION.sql.
 * These are used by Supabase adapters to type database responses.
 */
export interface ProfileRow {
  id: string;
  market_focus: "mexico" | "colombia" | null;
  plan: "free" | "per-session";
  plan_status: "active" | "trial" | "expired";
  free_session_used: boolean;
  stats: {
    sessions_count?: number;
    avg_score?: number;
    power_phrases_count?: number;
  };
  achievements: string[];
  created_at: string;
}

export interface SessionRow {
  id: string;
  user_id: string;
  scenario_config: {
    scenario: string;
    interlocutor: string;
    market_focus?: string;
  };
  system_prompt: string | null;
  voice_id: string | null;
  history: unknown[];
  feedback: unknown | null;
  status: "active" | "completed";
  turn_count: number;
  created_at: string;
}

export interface SRCardRow {
  id: string;
  user_id: string;
  session_id: string | null;
  phrase: string;
  problem_word: string | null;
  phonetic: string | null;
  interval_step: number;
  next_review_at: string;
  last_score: number;
  created_at: string;
}

export interface PowerPhraseRow {
  id: string;
  user_id: string;
  phrase: string;
  category: string | null;
  context_usage: string | null;
  source_session_id: string | null;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  function_name: string;
  user_id: string | null;
  session_id: string | null;
  tokens_in: number;
  tokens_out: number;
  elevenlabs_chars: number;
  model: string | null;
  latency_ms: number;
  /** PostgREST returns numeric(10,4) as string to preserve precision. Parse with parseFloat(). */
  cost_estimated: string;
  error_code: string | null;
  created_at: string;
}

/** Credit purchase record (pay-per-session MVP) */
export interface CreditPurchaseRow {
  id: string;
  user_id: string;
  pack: "session_1" | "session_3" | "session_5";
  credits_added: number;
  amount_usd: number;
  payment_provider: "mercadopago" | "stripe";
  payment_id: string | null;
  status: "pending" | "approved" | "rejected" | "expired";
  created_at: string;
}

/** Credit balance (denormalized, updated by triggers) */
export interface CreditBalanceRow {
  user_id: string;
  credits_remaining: number;
  credits_total_purchased: number;
  last_purchase_at: string | null;
  updated_at: string;
}