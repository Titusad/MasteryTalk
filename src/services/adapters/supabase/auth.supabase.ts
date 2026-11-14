import { SUPABASE_URL } from "@/services/supabase";
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
import { LIBRARY_ORIGIN_FLAG_KEY, WAITLIST_ORIGIN } from "../../../shared/config/stage";

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
      console.log(`[MasteryTalk Auth] onAuthStateChange: event=${event}, user=${session?.user?.email ?? "null"}`);

      if (session?.user) {
        try {
          const profile = await this.fetchOrCreateProfile(session.user);
          this.currentUser = mapToUser(session.user, profile);
          console.log(`[MasteryTalk Auth] User loaded: ${this.currentUser.displayName} (${this.currentUser.plan})`);

          // Ensure the server-side profile exists. Awaited (with a timeout) so the
          // Stage 1 `origin` is settled before listeners decide where to route.
          if (event === "SIGNED_IN") {
            try {
              await Promise.race([
                this.ensureServerProfile(),
                new Promise<void>((resolve) => setTimeout(resolve, 5000)),
              ]);
            } catch (err) {
              console.warn("[MasteryTalk Auth] ensure-profile server call failed (non-blocking):", err);
            }
          }
        } catch (err) {
          // All profile fetching/creation failed — use auth data only
          console.warn("[MasteryTalk Auth] Profile fetch/create failed, using auth-only user:", err);
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
   * Return a synthetic profile from auth data only.
   * The profiles table is not used — all subscription/profile data
   * lives in the KV store and is fetched by App.tsx via GET /profile.
   */
  private async fetchOrCreateProfile(authUser: AuthUser): Promise<ProfileRow> {
    return {
      id: authUser.id,
      market_focus: null,
      plan: "free",
      free_sessions_used: [],
      paths_purchased: [],
      stats: {},
      achievements: [],
      created_at: new Date().toISOString(),
    };
  }

  /* ── IAuthService implementation ── */

  async signIn(provider: AuthProvider): Promise<User> {
    const supabase = getSupabaseClient();

    // Flag used ONLY for the auth loading screen (distinct from the practice
    // setup key). Survives the page reload so App.tsx shows the branded loader.
    sessionStorage.setItem("masterytalk_auth_loading", "true");

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
    const serverUrl = `${SUPABASE_URL}/functions/v1/make-server-08b8658d/auth/ensure-profile`;
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: publicAnonKey,
      },
      // Closed-set hint from the Stage 1 library's Google button (§6.5.4).
      body: JSON.stringify(
        sessionStorage.getItem(LIBRARY_ORIGIN_FLAG_KEY) === WAITLIST_ORIGIN
          ? { origin: WAITLIST_ORIGIN }
          : {},
      ),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to ensure server profile: ${response.status} ${body}`);
    }

    const result = await response.json();
    console.log("[MasteryTalk Auth] Server profile ensured:", result.status);
  }
}