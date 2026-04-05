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
 *
 *  Reference: MASTER_BLUEPRINT.md §2
 * ══════════════════════════════════════════════════════════════
 */

import { createClient, type SupabaseClient, type Session } from "@supabase/supabase-js";

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

/* ── Client singleton + session cache ── */

let _client: SupabaseClient | null = null;

/**
 * Module-level session cache — populated by onAuthStateChange.
 *
 * Problem this solves: Supabase JS v2's auth.getSession() can deadlock
 * when its internal _initialize() mutex is still pending — even AFTER
 * onAuthStateChange has already fired SIGNED_IN with a valid session.
 * By caching the session at the onAuthStateChange level we get a reliable
 * fast path that bypasses the mutex entirely.
 */
let _cachedSession: Session | null = null;

function _setupSessionCache(client: SupabaseClient) {
  client.auth.onAuthStateChange((_event, session) => {
    _cachedSession = session;
  });
}

/**
 * Eagerly create the Supabase client at module load if credentials exist.
 * This is CRITICAL: the client must be created before React mounts,
 * otherwise `detectSessionInUrl` never sees the #access_token in the
 * URL fragment and the user gets a blank screen after OAuth redirect.
 */
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    _setupSessionCache(_client);
    console.log("[inFluentia] Supabase client created eagerly at module load");
  } catch (err) {
    console.error("[inFluentia] Supabase client creation failed:", err);
    _client = null;
  }
}

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
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  _setupSessionCache(_client);

  return _client;
}

export async function getAuthToken(): Promise<string> {
  const TIMEOUT_MS = 8_000;
  const client = getSupabaseClient();

  /** Race a promise against a timeout, resolving to null on timeout instead of throwing */
  function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
    return Promise.race([
      promise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ]);
  }

  // ── Fast path: use cached session from onAuthStateChange ──
  // onAuthStateChange fires BEFORE auth.getSession() resolves its internal
  // _initialize() mutex. Reading from cache bypasses the race condition entirely.
  if (_cachedSession?.access_token) {
    const expiresAt = _cachedSession.expires_at ?? 0;
    const isValid = expiresAt === 0 || expiresAt * 1000 > Date.now() + 5_000;
    if (isValid) {
      return _cachedSession.access_token;
    }
    // Token expired — fall through to refresh
  }

  // ── Attempt 1: normal getSession() ──
  const sessionResult = await withTimeout(client.auth.getSession(), TIMEOUT_MS);

  if (sessionResult?.data?.session?.access_token) {
    return sessionResult.data.session.access_token;
  }

  // ── Attempt 2: session timed out or missing — try a forced refresh ──
  console.warn("[getAuthToken] ⚠️ getSession() timed out or had no token. Attempting refreshSession()...");
  const refreshResult = await withTimeout(client.auth.refreshSession(), TIMEOUT_MS);

  if (refreshResult?.data?.session?.access_token) {
    console.log("[getAuthToken] ✅ refreshSession() succeeded — session recovered.");
    return refreshResult.data.session.access_token;
  }

  // ── Attempt 3: both failed — clear stale auth state ──
  console.error("[getAuthToken] ❌ Both getSession() and refreshSession() failed. Clearing stale auth state.");
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        localStorage.removeItem(key);
      }
    });
  } catch (_) { /* ignore */ }

  throw new Error("getAuthToken: unable to obtain a valid session. Please sign in again.");
}


/* ── Database type helpers ── */

/**
 * Row types matching the SQL schema in FASE1_MIGRATION.sql.
 * These are used by Supabase adapters to type database responses.
 */
export interface ProfileRow {
  id: string;
  market_focus: "mexico" | "colombia" | null;
  plan: "free" | "path";
  /** ScenarioType[] — scenarios where demo session was used */
  free_sessions_used: string[];
  /** ScenarioType[] — purchased paths (permanent access) */
  paths_purchased: string[];
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

/** @deprecated v9.0 — Credit pack model replaced by path_purchases */
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

/** @deprecated v9.0 — Credit balance model replaced by path access */
export interface CreditBalanceRow {
  user_id: string;
  credits_remaining: number;
  credits_total_purchased: number;
  last_purchase_at: string | null;
  updated_at: string;
}

/** v9.0: Path purchase record */
export interface PathPurchaseRow {
  id: string;
  user_id: string;
  purchase_type: "single_path" | "all_access" | "booster";
  scenario_type: string | null;
  amount_usd: number;
  payment_provider: "mercadopago" | "stripe";
  payment_id: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

/** v9.0: Level progress within a Learning Path */
export interface PathLevelProgressRow {
  id: string;
  user_id: string;
  scenario_type: string;
  level_id: string;
  fresh_attempts: number;
  best_session_id: string | null;
  status: "locked" | "unlocked" | "completed";
  completed_at: string | null;
  created_at: string;
}