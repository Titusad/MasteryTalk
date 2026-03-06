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
 *    - freeSessionUsed ← profiles.free_session_used
 *    - sessionsCompleted ← profiles.stats.sessions_count
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
import { getSupabaseClient, type ProfileRow } from "../../supabase";
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
    freeSessionUsed: profile.free_session_used,
    sessionsCompleted: profile.stats?.sessions_count ?? 0,
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
            this.ensureServerProfile(session.access_token).catch((err) =>
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
            freeSessionUsed: false,
            sessionsCompleted: 0,
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
   * Try to fetch existing profile, or create one if it doesn't exist.
   * This handles both:
   * - Normal flow: profiles table exists with trigger → fetch works
   * - Figma Make flow: profiles table might not exist → upsert via client
   */
  private async fetchOrCreateProfile(authUser: AuthUser): Promise<ProfileRow> {
    const supabase = getSupabaseClient();

    // Attempt 1: Direct fetch
    try {
      return await this.fetchProfile(authUser.id);
    } catch {
      console.log("[inFluentia Auth] Profile not found, attempting to create...");
    }

    // Attempt 2: Wait for trigger (if exists) and retry
    await new Promise((r) => setTimeout(r, 800));
    try {
      return await this.fetchProfile(authUser.id);
    } catch {
      console.log("[inFluentia Auth] Still no profile after wait, attempting upsert...");
    }

    // Attempt 3: Try to upsert directly via client
    const defaultProfile: Omit<ProfileRow, "created_at"> & { id: string } = {
      id: authUser.id,
      market_focus: null,
      plan: "free",
      plan_status: "active",
      free_session_used: false,
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
      console.warn("[inFluentia Auth] Upsert failed (table may not exist):", upsertErr);
    }

    // Attempt 4: Return a synthetic profile (works even without profiles table)
    console.log("[inFluentia Auth] Using synthetic profile (no DB table)");
    return {
      id: authUser.id,
      market_focus: null,
      plan: "free",
      plan_status: "active",
      free_session_used: false,
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
            access_type: "offline",
            prompt: "consent",
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
     * so this return IS reached briefly. 
     * 
     * We purposefully hang the promise here. If we return immediately, the UI
     * will think auth is "done" and transition to the next screen (flashing it)
     * right before the browser finally navigates away to Google.
     * The hanging promise prevents `AuthModal` from firing `onAuthComplete`.
     */
    await new Promise((resolve) => setTimeout(resolve, 10000));

    return (
      this.currentUser ?? {
        uid: "",
        displayName: "",
        email: "",
        plan: "free" as const,
        freeSessionUsed: false,
        sessionsCompleted: 0,
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
  private async ensureServerProfile(accessToken: string): Promise<void> {
    const serverUrl = `https://${projectId}.supabase.co/functions/v1/server/make-server-4e8a5b39/auth/ensure-profile`;
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
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