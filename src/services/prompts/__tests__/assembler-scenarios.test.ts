import { describe, it, expect } from "vitest";
import { assembleSystemPrompt } from "@/services/prompts/assembler";
import type { ScenarioType } from "@/services/types";

const BASE_CONFIG = {
  interlocutor: "recruiter" as const,
  scenario: "Test scenario for unit testing",
};

function buildPrompt(scenarioType: ScenarioType | null) {
  return assembleSystemPrompt({ ...BASE_CONFIG, scenarioType }).systemPrompt;
}

describe("assembleSystemPrompt — scenario adaptation blocks", () => {
  describe("master prompt is always present", () => {
    const allTypes: Array<ScenarioType | null> = [
      "interview", "sales", "meeting", "presentation", null,
    ];

    it.each(allTypes)("scenarioType=%s includes master system prompt", (type) => {
      const prompt = buildPrompt(type);
      expect(prompt).toContain("=== ROLE ===");
      expect(prompt).toContain("=== INTERACTION RULES ===");
    });
  });

  describe("interview adaptation block", () => {
    it("contains interview-specific vocabulary", () => {
      const prompt = buildPrompt("interview");
      expect(prompt).toContain("SCENARIO ADAPTATION: INTERVIEW");
      expect(prompt).toContain("STAR method");
      expect(prompt).toContain("behavioral questions");
    });

    it("contains interview conversation arc", () => {
      const prompt = buildPrompt("interview");
      expect(prompt).toContain("Rapport → Probing → Deep-dive → Candidate questions");
    });

    it("includes interview boundary guardrails", () => {
      const prompt = buildPrompt("interview");
      expect(prompt).toContain("DO NOT discuss pricing");
    });
  });

  describe("sales adaptation block", () => {
    it("contains sales-specific vocabulary", () => {
      const prompt = buildPrompt("sales");
      expect(prompt).toContain("SCENARIO ADAPTATION: SALES");
      expect(prompt).toContain("ROI");
      expect(prompt).toContain("pipeline");
    });

    it("contains sales conversation arc", () => {
      const prompt = buildPrompt("sales");
      expect(prompt).toContain("Discovery → Value demonstration → Objection handling");
    });

    it("includes sales boundary guardrails", () => {
      const prompt = buildPrompt("sales");
      expect(prompt).toContain("DO NOT use interview language");
    });
  });

  describe("meeting adaptation block", () => {
    it("contains meeting-specific vocabulary", () => {
      const prompt = buildPrompt("meeting");
      expect(prompt).toContain("SCENARIO ADAPTATION: MEETING");
      expect(prompt).toContain("action items");
      expect(prompt).toContain("blockers");
      expect(prompt).toContain("standup");
    });

    it("contains meeting conversation arc", () => {
      const prompt = buildPrompt("meeting");
      expect(prompt).toContain("Check-in → Status updates → Blockers → Decisions → Next steps");
    });

    it("includes meeting boundary guardrails", () => {
      const prompt = buildPrompt("meeting");
      expect(prompt).toContain("DO NOT use sales language");
    });
  });

  describe("presentation adaptation block", () => {
    it("contains presentation-specific vocabulary", () => {
      const prompt = buildPrompt("presentation");
      expect(prompt).toContain("SCENARIO ADAPTATION: PRESENTATION");
      expect(prompt).toContain("executive summary");
      expect(prompt).toContain("call to action");
    });

    it("contains presentation conversation arc", () => {
      const prompt = buildPrompt("presentation");
      expect(prompt).toContain("Hook → Context/Problem → Data/Evidence → Recommendation → Ask");
    });

    it("includes presentation boundary guardrails", () => {
      const prompt = buildPrompt("presentation");
      expect(prompt).toContain("DO NOT use interview language");
    });
  });

  describe("no adaptation block when scenarioType is null", () => {
    it("does not inject any scenario adaptation header", () => {
      const prompt = buildPrompt(null);
      expect(prompt).not.toContain("SCENARIO ADAPTATION:");
    });

    it("still contains the master prompt and output format", () => {
      const prompt = buildPrompt(null);
      expect(prompt).toContain("=== OUTPUT FORMAT (MANDATORY) ===");
    });
  });

  describe("scenarios do not bleed into each other", () => {
    it("meeting prompt does not contain sales vocabulary", () => {
      const prompt = buildPrompt("meeting");
      expect(prompt).not.toContain("SCENARIO ADAPTATION: SALES");
      expect(prompt).not.toContain("SCENARIO ADAPTATION: INTERVIEW");
    });

    it("interview prompt does not contain meeting vocabulary", () => {
      const prompt = buildPrompt("interview");
      expect(prompt).not.toContain("SCENARIO ADAPTATION: MEETING");
      expect(prompt).not.toContain("SCENARIO ADAPTATION: SALES");
    });

    it("presentation prompt does not contain sales vocabulary", () => {
      const prompt = buildPrompt("presentation");
      expect(prompt).not.toContain("SCENARIO ADAPTATION: SALES");
      expect(prompt).not.toContain("SCENARIO ADAPTATION: INTERVIEW");
    });
  });
});
