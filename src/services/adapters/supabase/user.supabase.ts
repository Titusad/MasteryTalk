/**
 * SupabaseUserService — Real user profile via Edge Function KV (v9.0)
 *
 * Calls /profile and /profile/mark-demo-used endpoints on make-server.
 * For getPracticeHistory and getPowerPhrases, fetches from session data.
 */
import type { IUserService, SessionAccessResult } from "../../interfaces";
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
        freeSessionsUsed: profile.free_sessions_used || [],
        pathsPurchased: profile.paths_purchased || [],
        createdAt: profile.created_at || new Date().toISOString(),
      };
    } catch (err) {
      console.warn("[UserService Supabase] getProfile failed:", err);
      return {
        uid: _uid,
        displayName: "User",
        email: "",
        plan: "free",
        freeSessionsUsed: [],
        pathsPurchased: [],
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
    _uid: string,
    scenarioType: string
  ): Promise<SessionAccessResult> {
    const user = await this.getProfile(_uid);

    // Demo: first session of this scenario always allowed
    if (!user.freeSessionsUsed.includes(scenarioType)) {
      return { allowed: true, mode: "demo" };
    }

    // Path purchased (or all-access): allowed
    if (user.pathsPurchased.includes(scenarioType)) {
      return { allowed: true, mode: "path" };
    }

    return { allowed: false, reason: "PATH_PURCHASE_REQUIRED" };
  }

  async canStartFreshAttempt(
    _uid: string,
    _scenarioType: string,
    _levelId: string
  ): Promise<SessionAccessResult> {
    // TODO: implement via /path-progress endpoint
    // For now, always allow (fresh attempt tracking is MVP phase 4)
    return { allowed: true, mode: "path" };
  }

  async markDemoSessionUsed(_uid: string, scenarioType: string): Promise<void> {
    try {
      await apiFetch("/profile/mark-demo-used", {
        method: "POST",
        body: JSON.stringify({ scenarioType }),
      });
    } catch (err) {
      console.warn("[UserService Supabase] markDemoSessionUsed failed:", err);
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
    return [];
  }

  async savePowerPhrase(_uid: string, phrase: PowerPhrase): Promise<void> {
    console.log("[UserService Supabase] savePowerPhrase not yet implemented:", phrase.phrase);
  }
}
