/**
 * Mock completed phrase summaries — scenario-specific, aligned with shadowing phrases
 *
 * Each scenario's completed phrases match the shadowing-by-scenario.ts phrases
 * so the pronunciation feedback screen shows coherent results.
 */
import type { CompletedPhraseSummary, ScenarioType } from "../../../types";

const COMPLETED_PHRASES_BY_SCENARIO: Record<string, CompletedPhraseSummary[]> = {
  /* ── Sales (default) ── */
  sales: [
    {
      num: 1,
      text: "Good morning! I understand you're ",
      highlight: { word: "evaluating", phonetic: "/\u026A\u02C8v\u00E6ljue\u026At\u026A\u014B/" },
      suffix: " automation platforms for your marketing team.",
      hasActions: true,
    },
    {
      num: 2,
      text: "The main ",
      highlight: { word: "differentiator", phonetic: "/\u02CCd\u026Af\u0259\u02C8ren\u0283ie\u026At\u0259r/" },
      suffix: " is bilingual support and seamless integrations with local payment processors.",
      hasActions: true,
    },
    {
      num: 3,
      text: "Our platform is ",
      highlight: { word: "specifically", phonetic: "/sp\u0259\u02C8s\u026Af\u026Akli/" },
      suffix: " designed for mid-sized companies in Latin America.",
      hasActions: true,
    },
  ],

  /* ── Interview ── */
  interview: [
    {
      num: 1,
      text: "In my previous role, I led a ",
      highlight: { word: "cross-functional", phonetic: "/kr\u0254\u02D0s \u02C8f\u028C\u014Bk\u0283\u0259n\u0259l/" },
      suffix: " team that delivered a thirty percent increase in retention.",
      hasActions: true,
    },
    {
      num: 2,
      text: "The approach I would take in your environment would be to ",
      highlight: { word: "prioritize", phonetic: "/pra\u026A\u02C8\u0252r\u026Ata\u026Az/" },
      suffix: " stakeholder alignment.",
      hasActions: true,
    },
    {
      num: 3,
      text: "What attracted me to this role ",
      highlight: { word: "specifically", phonetic: "/sp\u0259\u02C8s\u026Af\u026Akli/" },
      suffix: " is the opportunity to scale operations across emerging markets.",
      hasActions: true,
    },
  ],

  /* ── C-Suite ── */
  csuite: [
    {
      num: 1,
      text: "My ",
      highlight: { word: "recommendation", phonetic: "/\u02CCrek\u0259men\u02C8de\u026A\u0283\u0259n/" },
      suffix: " is to reallocate twenty percent of acquisition spend to retention.",
      hasActions: true,
    },
    {
      num: 2,
      text: "I've modeled three ",
      highlight: { word: "scenarios", phonetic: "/s\u026A\u02C8n\u025B\u0259rio\u028Az/" },
      suffix: ". Even in the conservative case, we break even by month four.",
      hasActions: true,
    },
    {
      num: 3,
      text: "The cost of inaction here is ",
      highlight: { word: "approximately", phonetic: "/\u0259\u02C8pr\u0252ks\u026Am\u0259tli/" },
      suffix: " two point three million in annual savings forgone.",
      hasActions: true,
    },
  ],

  /* ── Negotiation ── */
  negotiation: [
    {
      num: 1,
      text: "Based on the market data, a fair range would be ",
      highlight: { word: "between", phonetic: "/b\u026A\u02C8twi\u02D0n/" },
      suffix: " eighty and ninety thousand.",
      hasActions: true,
    },
    {
      num: 2,
      text: "I'm ",
      highlight: { word: "flexible", phonetic: "/\u02C8fleks\u0259b\u0259l/" },
      suffix: " on the timeline if we can agree on the core terms of the engagement.",
      hasActions: true,
    },
    {
      num: 3,
      text: "Let me be ",
      highlight: { word: "transparent", phonetic: "/tr\u00E6ns\u02C8p\u00E6r\u0259nt/" },
      suffix: " about my constraints so we can find a solution that works for both sides.",
      hasActions: true,
    },
  ],

  /* ── Networking ── */
  networking: [
    {
      num: 1,
      text: "I help Latin American companies break into the U.S. market using AI-powered ",
      highlight: { word: "communication", phonetic: "/k\u0259\u02CCmju\u02D0n\u026A\u02C8ke\u026A\u0283\u0259n/" },
      suffix: " coaching.",
      hasActions: true,
    },
    {
      num: 2,
      text: "I'd love to explore whether there's a way we could ",
      highlight: { word: "collaborate", phonetic: "/k\u0259\u02C8l\u00E6b\u0259re\u026At/" },
      suffix: " on something mutually beneficial.",
      hasActions: true,
    },
    {
      num: 3,
      text: "Can I grab your email? I'll ",
      highlight: { word: "follow up", phonetic: "/\u02C8f\u0252lo\u028A \u028Cp/" },
      suffix: " Tuesday with that case study and a coffee invite.",
      hasActions: true,
    },
  ],
};

/** Default export for backward compatibility */
export const MOCK_COMPLETED_PHRASES: CompletedPhraseSummary[] =
  COMPLETED_PHRASES_BY_SCENARIO.sales;

/** Get completed phrase summaries for a given scenario type */
export function getCompletedPhrasesForScenario(
  scenarioType?: ScenarioType | string | null
): CompletedPhraseSummary[] {
  if (scenarioType && COMPLETED_PHRASES_BY_SCENARIO[scenarioType]) {
    return COMPLETED_PHRASES_BY_SCENARIO[scenarioType];
  }
  return COMPLETED_PHRASES_BY_SCENARIO.sales;
}
