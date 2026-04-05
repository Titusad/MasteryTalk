/**
 * ══════════════════════════════════════════════════════════════
 *  SupabaseAuthService — Real Supabase Auth Implementation
 *
 *  Implements IAuthService using Supabase Auth (Google).
 *  Composes the User type from auth.users + profiles table.
 *
 *  User field mapping (no schema changes needed):
 *    - uid          ← auth.users.id
 *    - displayName  ← auth.users.user_metadata.full_name (from OAuth)
 *    - email        ← auth.users.email
 *    - photoURL     ← auth.users.user_metadata.avatar_url (from OAuth)
 *    - plan         ← profiles.plan
 *    - freeSessionsUsed ← profiles.free_sessions_used
 *    - pathsPurchased ← profiles.paths_purchased
 *    - marketFocus  ← profiles.market_focus
 *    - createdAt    ← profiles.created_at
 *
 *  QA Tests: F1-01 through F1-07
 *  Reference: MASTER_BLUEPRINT.md §3.1, interfaces/auth.ts
 * ══════════════════════════════════════════════════════════════
 */

import type { IAuthService } from "../../interfaces/auth";
import type { User, AuthProvider } from "../../types";
import { AuthError } from "../../errors";
import { getSupabaseClient, getAuthToken, type ProfileRow } from "../../supabase";
import type { AuthUser } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../../utils/supabase/info";

/* ── Map Supabase auth.users + profiles row → our User type ── */

function mapToUser(authUser: AuthUser, profile: ProfileRow): User {
  const meta = authUser.user_metadata ?? {};
  return {
    uid: authUser.id,
    displayName:
      meta.full_name ||
      meta.name ||
      authUser.email?.split("@")[0] ||
      "User",
    email: authUser.email || "",
    photoURL: meta.avatar_url || meta.picture || undefined,
    plan: profile.plan,
    freeSessionsUsed: profile.free_sessions_used || [],
    pathsPurchased: profile.paths_purchased || [],
    marketFocus: profile.market_focus ?? undefined,
    createdAt: profile.created_at,
  };
}

/* ── Map AuthProvider to Supabase provider string ── */

function toSupabaseProvider(
  provider: AuthProvider
): "google" {
  switch (provider) {
    case "google":
      return "google";
    default:
      return "google";
  }
}

/* ══════════════════════════════════════════════════════════════ */

export class SupabaseAuthService implements IAuthService {
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.initAuthListener();
  }

  /**
   * Subscribe to Supabase auth state changes on construction.
   * This handles: initial session recovery, login, logout, token refresh,
   * and multi-tab sync (F1-07).
   */
  private initAuthListener(): void {
    const supabase = getSupabaseClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[inFluentia Auth] onAuthStateChange: event=${event}, user=${session?.user?.email ?? "null"}`);

      if (session?.user) {
        try {
          const profile = await this.fetchOrCreateProfile(session.user);
          this.currentUser = mapToUser(session.user, profile);
          console.log(`[inFluentia Auth] User loaded: ${this.currentUser.displayName} (${this.currentUser.plan})`);

          // Fire-and-forget: ensure server-side profile exists too
          if (event === "SIGNED_IN") {
            this.ensureServerProfile().catch((err) =>
              console.warn("[inFluentia Auth] ensure-profile server call failed (non-blocking):", err)
            );
          }
        } catch (err) {
          // All profile fetching/creation failed — use auth data only
          console.warn("[inFluentia Auth] Profile fetch/create failed, using auth-only user:", err);
          this.currentUser = {
            uid: session.user.id,
            displayName:
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "User",
            email: session.user.email || "",
            photoURL: session.user.user_metadata?.avatar_url,
            plan: "free",
            freeSessionsUsed: [],
            pathsPurchased: [],
            createdAt: new Date().toISOString(),
          };
        }
      } else {
        this.currentUser = null;
      }

      this.notifyListeners();
    });

    this.unsubscribe = () => subscription.unsubscribe();
  }

  /**
   * Try to fetch existing profile, or fall back to synthetic.
   * Optimized: if profiles table doesn't exist (Figma Make env),
   * skips cascade of retries and goes straight to synthetic profile.
   */
  private async fetchOrCreateProfile(authUser: AuthUser): Promise<ProfileRow> {
    const supabase = getSupabaseClient();

    // Attempt 1: Direct fetch — works if profiles table exists
    try {
      return await this.fetchProfile(authUser.id);
    } catch (err: any) {
      const msg = String(err?.message || err).toLowerCase();
      // If table doesn't exist, skip all retries → synthetic profile immediately
      const isTableMissing =
        msg.includes("relation") ||
        msg.includes("does not exist") ||
        msg.includes("undefined_table") ||
        msg.includes("42p01");

      if (isTableMissing) {
        console.log("[inFluentia Auth] Profiles table not found — using synthetic profile (fast path)");
        return this.syntheticProfile(authUser.id);
      }

      console.log("[inFluentia Auth] Profile not found, attempting upsert...");
    }

    // Attempt 2: Try to upsert directly (table exists but row doesn't)
    const defaultProfile: Omit<ProfileRow, "created_at"> & { id: string } = {
      id: authUser.id,
      market_focus: null,
      plan: "free",
      free_sessions_used: [],
      paths_purchased: [],
      stats: {},
      achievements: [],
    };

    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert(defaultProfile, { onConflict: "id" })
        .select()
        .single();

      if (data && !error) {
        console.log("[inFluentia Auth] Profile created via upsert");
        return data as ProfileRow;
      }
    } catch (upsertErr) {
      console.warn("[inFluentia Auth] Upsert failed:", upsertErr);
    }

    // Fallback: synthetic profile
    console.log("[inFluentia Auth] Using synthetic profile (fallback)");
    return this.syntheticProfile(authUser.id);
  }

  /** Generate a synthetic profile when no DB table is available */
  private syntheticProfile(uid: string): ProfileRow {
    return {
      id: uid,
      market_focus: null,
      plan: "free",
      free_sessions_used: [],
      paths_purchased: [],
      stats: {},
      achievements: [],
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Fetch the profile row for a given user ID.
   * Called after auth to compose the full User object.
   */
  private async fetchProfile(uid: string): Promise<ProfileRow> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (error || !data) {
      throw new Error(`Profile not found for uid: ${uid}`);
    }

    return data as ProfileRow;
  }

  /* ── IAuthService implementation ── */

  async signIn(provider: AuthProvider): Promise<User> {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: toSupabaseProvider(provider),
      options: {
        /**
         * redirectTo: where Supabase sends the user after OAuth.
         * For SPA: redirect back to the same origin.
         * The auth listener will pick up the session from the URL hash.
         */
        redirectTo: window.location.origin,
        /**
         * queryParams for Google: request profile info.
         */
        ...(provider === "google" && {
          queryParams: {
            prompt: "select_account",
          },
        }),
      },
    });

    if (error) {
      // Map Supabase auth errors to our AuthError codes
      const message = error.message.toLowerCase();

      if (
        message.includes("popup") ||
        message.includes("closed") ||
        message.includes("cancelled")
      ) {
        throw new AuthError("POPUP_CLOSED", error);
      }
      if (
        message.includes("network") ||
        message.includes("fetch") ||
        message.includes("connection")
      ) {
        throw new AuthError("NETWORK_ERROR", error);
      }
      if (
        message.includes("provider") ||
        message.includes("oauth") ||
        message.includes("unauthorized")
      ) {
        throw new AuthError("PROVIDER_ERROR", error);
      }

      throw new AuthError("AUTH_UNKNOWN", error);
    }

    /**
     * IMPORTANT: signInWithOAuth initiates a full-page redirect to the OAuth
     * provider. The promise resolves immediately (before the browser navigates),
     * so this return IS reached briefly. However, the browser navigates away
     * milliseconds later, so any code the caller runs after `await signIn()`
     * is effectively a no-op in redirect flow.
     *
     * After the OAuth redirect completes, the page reloads from scratch.
     * The `onAuthStateChange` listener in the constructor detects the new
     * session and sets `currentUser`. App.tsx subscribes via
     * `authService.onAuthStateChanged()` to react to this (F1-07).
     *
     * In mock mode, signIn() resolves with the user directly, so callers
     * can safely chain `onAuthComplete?.()` — it works for mocks but is
     * harmlessly ignored in redirect flow.
     *
     * For popup-based flow (alternative), use:
     *   supabase.auth.signInWithOAuth({ options: { skipBrowserRedirect: true } })
     * and handle the popup manually.
     */
    return (
      this.currentUser ?? {
        uid: "",
        displayName: "",
        email: "",
        plan: "free" as const,
        freeSessionsUsed: [],
        pathsPurchased: [],
        createdAt: new Date().toISOString(),
      }
    );
  }

  async signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new AuthError("AUTH_UNKNOWN", error);
    }

    // onAuthStateChange listener will set currentUser to null
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    // Immediately fire with current state
    callback(this.currentUser);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /* ── Internal ── */

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }

  /** Cleanup — call when the app unmounts (rarely needed in SPA) */
  destroy(): void {
    this.unsubscribe?.();
    this.listeners.clear();
  }

  /**
   * Ensure the server-side profile exists for the user.
   * This is a fire-and-forget call to ensure the profile is created
   * on the server side, which might not happen immediately due to
   * triggers or other mechanisms.
   */
  private async ensureServerProfile(): Promise<void> {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("ensureServerProfile: no auth token available");
    }
    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/auth/ensure-profile`;
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: publicAnonKey,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to ensure server profile: ${response.status} ${body}`);
    }

    const result = await response.json();
    console.log("[inFluentia Auth] Server profile ensured:", result.status);
  }
}