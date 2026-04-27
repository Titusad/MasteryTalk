import { describe, it, expect } from "vitest";
import { getPresetsForScenario } from "@/features/practice-session/model/scenario-presets";
import type { ScenarioType } from "@/services/types";

const ACTIVE_SCENARIOS: ScenarioType[] = ["interview", "sales", "meeting", "presentation"];

describe("getPresetsForScenario", () => {
  describe("active scenarios return presets", () => {
    it.each(ACTIVE_SCENARIOS)("%s returns at least 2 presets", (scenario) => {
      const presets = getPresetsForScenario(scenario);
      expect(presets.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("edge cases return empty array", () => {
    it("returns [] for null", () => {
      expect(getPresetsForScenario(null)).toEqual([]);
    });

    it("returns [] for undefined", () => {
      expect(getPresetsForScenario(undefined)).toEqual([]);
    });

    it("returns [] for unknown scenario type", () => {
      expect(getPresetsForScenario("csuite" as ScenarioType)).toEqual([]);
    });
  });

  describe("preset data integrity", () => {
    ACTIVE_SCENARIOS.forEach((scenario) => {
      describe(`${scenario} presets`, () => {
        it("each preset has required fields", () => {
          const presets = getPresetsForScenario(scenario);
          presets.forEach((preset) => {
            expect(preset.id).toBeTruthy();
            expect(preset.label).toBeTruthy();
            expect(preset.company).toBeTruthy();
            expect(preset.context).toBeTruthy();
          });
        });

        it("each preset context is substantial (>= 100 chars)", () => {
          const presets = getPresetsForScenario(scenario);
          presets.forEach((preset) => {
            expect(preset.context.length).toBeGreaterThanOrEqual(100);
          });
        });

        it("each preset has a unique id within the scenario", () => {
          const presets = getPresetsForScenario(scenario);
          const ids = presets.map((p) => p.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        });
      });
    });
  });

  describe("no duplicate IDs across all scenarios", () => {
    it("all preset IDs are globally unique", () => {
      const allIds = ACTIVE_SCENARIOS.flatMap((s) =>
        getPresetsForScenario(s).map((p) => p.id)
      );
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });
});
