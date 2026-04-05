/**
 * MockAuthService — Simulates Supabase Auth
 *
 * Preserves current prototype behavior:
 * - Social login buttons instantly "authenticate" with a mock user
 * - No real network calls
 *
 * Error simulation (when ?simulate_errors=true):
 * - signIn → AuthError("POPUP_CLOSED") or ("PROVIDER_ERROR")
 */
import type { IAuthService } from "../../interfaces";
import type { User, AuthProvider } from "../../types";
import { AuthError } from "../../errors";
import { delay, shouldSimulateError } from "./utils";

const MOCK_USER: User = {
  uid: "mock-uid-001",
  displayName: "María García",
  email: "maria.garcia@example.com",
  photoURL: undefined,
  plan: "free",
  freeSessionsUsed: [],
  pathsPurchased: [],
  marketFocus: "mexico",
  createdAt: "2026-02-10T08:00:00Z",
};

export class MockAuthService implements IAuthService {
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  async signIn(_provider: AuthProvider): Promise<User> {
    // Simulate brief auth delay (current prototype: instant)
    await delay(300);

    /* ── Error simulation ── */
    if (shouldSimulateError("auth")) {
      const codes = ["POPUP_CLOSED", "PROVIDER_ERROR", "NETWORK_ERROR"] as const;
      throw new AuthError(codes[Math.floor(Math.random() * codes.length)]);
    }

    this.currentUser = { ...MOCK_USER };
    this.notifyListeners();
    return this.currentUser;
  }

  async signOut(): Promise<void> {
    await delay(200);
    this.currentUser = null;
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    // Immediately call with current state
    callback(this.currentUser);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }
}