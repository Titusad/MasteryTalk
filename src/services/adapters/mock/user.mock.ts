/**
 * MockUserService — Simulates Supabase user operations
 *
 * Preserves current prototype behavior:
 * - Dashboard shows hardcoded practice history
 * - Power phrases are from mock data
 * - Plan logic: free session available by default
 */
import type { IUserService } from "../../interfaces";
import type { User, UserPlan, PracticeHistoryItem, PowerPhrase } from "../../types";
import {
  MOCK_PRACTICE_HISTORY,
  MOCK_POWER_PHRASES,
} from "./data/dashboard-data";
import { delay } from "./utils";

const mockUserStore: Record<string, User> = {};

export class MockUserService implements IUserService {
  async getProfile(uid: string): Promise<User> {
    await delay(200);

    if (!mockUserStore[uid]) {
      mockUserStore[uid] = {
        uid,
        displayName: "Mar\u00EDa Garc\u00EDa",
        email: "maria.garcia@example.com",
        plan: "free",
        freeSessionUsed: false,
        sessionsCompleted: 3,
        marketFocus: "mexico",
        createdAt: "2026-02-10T08:00:00Z",
      };
    }

    return { ...mockUserStore[uid] };
  }

  async updateProfile(uid: string, data: Partial<User>): Promise<void> {
    await delay(150);
    if (mockUserStore[uid]) {
      Object.assign(mockUserStore[uid], data);
    }
  }

  async getPlan(uid: string): Promise<UserPlan> {
    const user = await this.getProfile(uid);
    return user.plan;
  }

  async canStartSession(
    uid: string
  ): Promise<{ allowed: boolean; reason?: string; creditsRemaining?: number }> {
    await delay(100);
    const user = await this.getProfile(uid);

    switch (user.plan) {
      case "free":
        if (user.freeSessionUsed) {
          return {
            allowed: false,
            reason: "Ya usaste tu sesión gratuita. Compra créditos para continuar.",
            creditsRemaining: 0,
          };
        }
        return { allowed: true, creditsRemaining: 0 };

      case "per-session":
        // Per-session: check via paymentService (but mock always allows)
        return { allowed: true, creditsRemaining: 1 };

      default:
        return { allowed: false, reason: "Plan no reconocido.", creditsRemaining: 0 };
    }
  }

  async markFreeSessionUsed(uid: string): Promise<void> {
    await delay(100);
    if (mockUserStore[uid]) {
      mockUserStore[uid].freeSessionUsed = true;
    }
  }

  async getPracticeHistory(_uid: string): Promise<PracticeHistoryItem[]> {
    await delay(300);
    return [...MOCK_PRACTICE_HISTORY];
  }

  async getPowerPhrases(_uid: string): Promise<PowerPhrase[]> {
    await delay(200);
    return [...MOCK_POWER_PHRASES];
  }

  async savePowerPhrase(_uid: string, phrase: PowerPhrase): Promise<void> {
    await delay(150);
    // In mock, just log — phrase is not persisted
    console.log("[MockUserService] Power phrase saved:", phrase.phrase);
  }
}