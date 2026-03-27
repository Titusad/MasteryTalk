/**
 * SupabaseUserService — Real user profile via Edge Function KV
 *
 * Calls /profile and /profile/mark-free-used endpoints on make-server.
 * For getPracticeHistory and getPowerPhrases, fetches from session data.
 */
import type { IUserService } from "../../interfaces";
import type {
  User,
  UserPlan,
  PracticeHistoryItem,
  PowerPhrase,
} from "../../types";
import { projectId } from "../../../../utils/supabase/info";
import { getAuthToken } from "../../supabase";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d`;


async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
}

export class SupabaseUserService implements IUserService {
  async getProfile(_uid: string): Promise<User> {
    try {
      const res = await apiFetch("/profile");
      if (!res.ok) throw new Error(`${res.status}`);
      const profile = await res.json();
      return {
        uid: profile.id || _uid,
        displayName: profile.display_name || profile.id?.slice(0, 8) || "User",
        email: profile.email || "",
        plan: profile.plan || "free",
        freeSessionUsed: profile.free_session_used ?? false,
        sessionsCompleted: profile.stats?.sessions_count || 0,
        createdAt: profile.created_at || new Date().toISOString(),
      };
    } catch (err) {
      console.warn("[UserService Supabase] getProfile failed:", err);
      return {
        uid: _uid,
        displayName: "User",
        email: "",
        plan: "free",
        freeSessionUsed: false,
        sessionsCompleted: 0,
        createdAt: new Date().toISOString(),
      };
    }
  }

  async updateProfile(_uid: string, data: Partial<User>): Promise<void> {
    try {
      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn("[UserService Supabase] updateProfile failed:", err);
    }
  }

  async getPlan(_uid: string): Promise<UserPlan> {
    const user = await this.getProfile(_uid);
    return user.plan;
  }

  async canStartSession(
    _uid: string
  ): Promise<{ allowed: boolean; reason?: string; creditsRemaining?: number }> {
    const user = await this.getProfile(_uid);
    if (user.plan === "free" && user.freeSessionUsed) {
      return {
        allowed: false,
        reason: "Ya usaste tu sesión gratuita. Compra créditos para continuar.",
        creditsRemaining: 0,
      };
    }
    return { allowed: true, creditsRemaining: 1 };
  }

  async markFreeSessionUsed(_uid: string): Promise<void> {
    try {
      await apiFetch("/profile/mark-free-used", { method: "POST" });
    } catch (err) {
      console.warn("[UserService Supabase] markFreeSessionUsed failed:", err);
    }
  }

  async getPracticeHistory(_uid: string): Promise<PracticeHistoryItem[]> {
    try {
      const res = await apiFetch("/sessions");
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const sessions = data.sessions || [];
      return sessions.slice(0, 10).map((s: Record<string, unknown>) => ({
        title: (s.scenario as string) || "Practice Session",
        date: new Date(s.created_at as string).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        duration: (s.duration as string) || "—",
        tag: (s.interlocutor as string) || "AI",
      }));
    } catch (err) {
      console.warn("[UserService Supabase] getPracticeHistory failed:", err);
      return [];
    }
  }

  async getPowerPhrases(_uid: string): Promise<PowerPhrase[]> {
    // Power phrases not yet stored in KV — return empty
    return [];
  }

  async savePowerPhrase(_uid: string, phrase: PowerPhrase): Promise<void> {
    console.log("[UserService Supabase] savePowerPhrase not yet implemented:", phrase.phrase);
  }
}
