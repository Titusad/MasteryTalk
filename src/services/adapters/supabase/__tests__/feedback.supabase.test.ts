/**
 * ══════════════════════════════════════════════════════════════
 *  Unit Tests — SupabaseFeedbackService (serverFetch pattern)
 *
 *  Tests the authenticated API call pattern + response mapping
 *  that ALL Supabase service adapters use.
 * ══════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/* ── Mock dependencies ── */

vi.mock("../../../supabase", () => ({
  getAuthToken: vi.fn().mockResolvedValue("mock-jwt-token-123"),
  SUPABASE_URL: "https://test.supabase.co",
}));

vi.mock("../../../../../../utils/supabase/info", () => ({
  projectId: "test-project-id",
  publicAnonKey: "test-anon-key",
}));

vi.mock("../../../errors", () => ({
  FeedbackError: class FeedbackError extends Error {
    code: string;
    constructor(code: string, cause?: Error) {
      super(cause?.message || code);
      this.code = code;
    }
  },
}));

vi.mock("../../mock/feedback.mock", () => ({
  MockFeedbackService: class {
    async generateImprovedScript() { return { sections: [] }; }
    async getCompletedSummary() { return []; }
    async generateResultsSummary() { return { totalPhrases: 0, totalTime: "—", overallSentiment: "", pronunciationNotes: [], improvementAreas: [] }; }
  },
}));

/* ── Import after mocks ── */

import { SupabaseFeedbackService } from "../feedback.supabase";
import { getAuthToken } from "../../../supabase";

/* ── Test setup ── */

const mockFetch = vi.fn();
const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = mockFetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

/* ═══════════════════════════════════════════════════════════════
   analyzeFeedback — Response Mapping
   ═══════════════════════════════════════════════════════════════ */

describe("SupabaseFeedbackService.analyzeFeedback", () => {
  const service = new SupabaseFeedbackService();

  it("should call /analyze-feedback with correct headers", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        strengths: ["Good pace"],
        opportunities: ["Work on intonation"],
      }),
    });

    await service.analyzeFeedback("session-123");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/analyze-feedback");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer mock-jwt-token-123");
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("should use getAuthToken for authorization", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ strengths: [], opportunities: [] }),
    });

    await service.analyzeFeedback("session-456");

    expect(getAuthToken).toHaveBeenCalledOnce();
  });

  it("should map API response to SessionFeedbackResult", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        strengths: ["Clarity", "Confidence"],
        opportunities: ["Intonation"],
        beforeAfter: [{ before: "old", after: "new" }],
        pillarScores: { fluency: 85 },
        interviewReadinessScore: 78,
      }),
    });

    const result = await service.analyzeFeedback("session-789");

    expect(result.strengths).toEqual(["Clarity", "Confidence"]);
    expect(result.opportunities).toEqual(["Intonation"]);
    expect(result.beforeAfter).toEqual([{ before: "old", after: "new" }]);
    expect(result.pillarScores).toEqual({ fluency: 85 });
    expect(result.interviewReadinessScore).toBe(78);
    expect(result.duration).toBe("10 mins");
    expect(result.scenarioType).toBe("Interview");
  });

  it("should default missing fields to empty arrays/objects", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}), // empty response
    });

    const result = await service.analyzeFeedback("session-empty");

    expect(result.strengths).toEqual([]);
    expect(result.opportunities).toEqual([]);
    expect(result.beforeAfter).toEqual([]);
    expect(result.pillarScores).toEqual({});
  });

  it("should throw FeedbackError on non-200 response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    await expect(service.analyzeFeedback("session-fail")).rejects.toThrow();
  });
});

/* ═══════════════════════════════════════════════════════════════
   generateResultsSummary
   ═══════════════════════════════════════════════════════════════ */

describe("SupabaseFeedbackService.generateResultsSummary", () => {
  const service = new SupabaseFeedbackService();

  it("should map API response to ResultsSummary", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        totalPhrases: 15,
        totalTime: "12:30",
        overallSentiment: "Excellent progress!",
        pronunciationNotes: ["Focus on th sounds"],
        improvementAreas: ["Vocabulary range"],
      }),
    });

    const result = await service.generateResultsSummary("session-sum");

    expect(result.totalPhrases).toBe(15);
    expect(result.totalTime).toBe("12:30");
    expect(result.overallSentiment).toBe("Excellent progress!");
    expect(result.pronunciationNotes).toHaveLength(1);
    expect(result.improvementAreas).toHaveLength(1);
  });

  it("should fall back to mock on API failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await service.generateResultsSummary("session-fallback");

    // Should NOT throw — falls back to mock
    expect(result).toBeDefined();
    expect(result.totalPhrases).toBeDefined();
  });
});
