/**
 * MockUserService — v9.0 Learning Path model
 *
 * - Demo session: first session per scenario is free
 * - Path access: mock simulates purchased paths
 * - Dashboard: hardcoded practice history
 */
import type { IUserService, SessionAccessResult } from "../../interfaces";
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
        displayName: "María García",
        email: "maria.garcia@example.com",
        plan: "free",
        freeSessionsUsed: [],
        pathsPurchased: [],
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
    uid: string,
    scenarioType: string
  ): Promise<SessionAccessResult> {
    await delay(100);
    const user = await this.getProfile(uid);

    // Demo: first session of this scenario always allowed
    if (!user.freeSessionsUsed.includes(scenarioType)) {
      return { allowed: true, mode: "demo" };
    }

    // Path purchased: allowed
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
    await delay(100);
    // Mock: always allow fresh attempts
    return { allowed: true, mode: "path" };
  }

  async markDemoSessionUsed(uid: string, scenarioType: string): Promise<void> {
    await delay(100);
    if (mockUserStore[uid]) {
      const used = mockUserStore[uid].freeSessionsUsed;
      if (!used.includes(scenarioType)) {
        used.push(scenarioType);
      }
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
    console.log("[MockUserService] Power phrase saved:", phrase.phrase);
  }
}