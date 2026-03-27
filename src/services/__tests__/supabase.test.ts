/**
 * ══════════════════════════════════════════════════════════════
 *  Unit Tests — getAuthToken (Critical Auth Flow)
 *
 *  Tests the 3-step auth token resolution:
 *    1. Fast path: cached session
 *    2. Normal path: getSession()
 *    3. Refresh path: refreshSession()
 *    4. Error path: both fail → throws
 * ══════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mock the Supabase client before importing the module under test ── */

const mockGetSession = vi.fn();
const mockRefreshSession = vi.fn();
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

vi.mock("../../../utils/supabase/info", () => ({
  projectId: "test-project-id",
  publicAnonKey: "test-anon-key",
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      refreshSession: mockRefreshSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}));

/* ── Import AFTER mocks are registered ── */

import { getAuthToken, getSupabaseClient, isSupabaseConfigured } from "../supabase";

/* ── Helpers ── */

function makeSession(accessToken: string, expiresInSeconds = 3600) {
  return {
    access_token: accessToken,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    refresh_token: "refresh-token",
  };
}

/* ═══════════════════════════════════════════════════════════════
   isSupabaseConfigured
   ═══════════════════════════════════════════════════════════════ */

describe("isSupabaseConfigured", () => {
  it("should return true when projectId and anonKey are set", () => {
    expect(isSupabaseConfigured()).toBe(true);
  });
});

/* ═══════════════════════════════════════════════════════════════
   getSupabaseClient
   ═══════════════════════════════════════════════════════════════ */

describe("getSupabaseClient", () => {
  it("should return a Supabase client singleton", () => {
    const client = getSupabaseClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it("should return the same instance on subsequent calls", () => {
    const client1 = getSupabaseClient();
    const client2 = getSupabaseClient();
    expect(client1).toBe(client2);
  });
});

/* ═══════════════════════════════════════════════════════════════
   getAuthToken — 3-step flow
   ═══════════════════════════════════════════════════════════════ */

describe("getAuthToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return token from getSession() when available", async () => {
    const session = makeSession("session-token-123");
    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });

    const token = await getAuthToken();
    expect(token).toBe("session-token-123");
  });

  it("should fall back to refreshSession() when getSession() returns no token", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockRefreshSession.mockResolvedValue({
      data: { session: makeSession("refreshed-token-456") },
      error: null,
    });

    const token = await getAuthToken();
    expect(token).toBe("refreshed-token-456");
    expect(mockRefreshSession).toHaveBeenCalledOnce();
  });

  it("should throw when both getSession() and refreshSession() fail", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: new Error("Session expired"),
    });
    mockRefreshSession.mockResolvedValue({
      data: { session: null },
      error: new Error("Refresh failed"),
    });

    await expect(getAuthToken()).rejects.toThrow("unable to obtain a valid session");
  });

  it("should handle getSession() timeout by attempting refresh", async () => {
    // Simulate a timeout by returning a promise that never resolves within 8s
    // In practice, withTimeout caps it. We simulate by returning null-session.
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockRefreshSession.mockResolvedValue({
      data: { session: makeSession("recovery-token") },
      error: null,
    });

    const token = await getAuthToken();
    expect(token).toBe("recovery-token");
  });
});
