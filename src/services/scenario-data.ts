/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Scenario Data Facade
 *
 *  Public API for scenario-specific mock data consumed by UI.
 *  In mock mode: delegates to hardcoded data in adapters/mock/data/.
 *  In production: these will be replaced by real service calls
 *  (GPT-4o for conversations, Gemini for feedback/scripts).
 *
 *  Why this file exists:
 *  UI components must NEVER import directly from adapters/mock/*.
 *  This facade preserves the adapter pattern boundary while
 *  providing convenient access during the mock → production transition.
 *
 *  Usage in components:
 *    import { getStrengthsForScenario } from "../../services/scenario-data";
 * ══════════════════════════════════════════════════════════════
 */

export {
  getTrySaying,
  getBeforeAfterForScenario,
} from "./adapters/mock/data/chat-messages";

export {
  getStrengthsForScenario,
  getOpportunitiesForScenario,
} from "./adapters/mock/data/feedback-data";

export {
  getScriptSectionsForScenario,
} from "./adapters/mock/data/script-sections-by-scenario";

export {
  setMockSpeechScenario,
} from "./adapters/mock/speech.mock";

export {
  getPowerPhrasesForScenario,
} from "./adapters/mock/data/chat-messages";

export {
  getPowerQuestions,
  getCulturalTips,
} from "./adapters/mock/data/cultural-data";