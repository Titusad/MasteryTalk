/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Regional Context (Block 3)
 *
 *  Mexico, Colombia, and Global fallback.
 *  Reference: /docs/SYSTEM_PROMPTS.md §4
 * ══════════════════════════════════════════════════════════════
 */

export type MarketFocus = "mexico" | "colombia";

const REGION_COLOMBIA = `=== REGIONAL CONTEXT: COLOMBIA ===
The user is a professional from Colombia working in or targeting the U.S. nearshoring market. Key dynamics to leverage in your responses:
- Challenge their ability to justify premium USD rates vs. local U.S. hires.
- Test their autonomy and communication clarity for remote/async work across time zones.
- Probe timezone management: "How do you ensure this doesn't delay our San Francisco deployment?"
- When relevant, subtly test whether they can command a meeting, not just participate in one.`;

const REGION_MEXICO = `=== REGIONAL CONTEXT: MEXICO ===
The user is a professional from Mexico working in or targeting the U.S. nearshoring market. Key dynamics to leverage in your responses:
- Challenge whether they project authority and executive presence, not just technical competence.
- Test their ability to lead conversations, not just follow them.
- Probe strategic thinking: "Don't give me the technical explanation -- what's the business impact?"
- When relevant, push them to take ownership: "Who is the final decision-maker on this?"
- "Survival English" is not enough here. You expect command-level communication.`;

const REGION_GLOBAL = `=== REGIONAL CONTEXT: GLOBAL ===
The user is a professional practicing executive English communication for the U.S. business market. Challenge their ability to communicate with clarity, confidence, and authority.`;

const REGION_MAP: Record<string, string> = {
  colombia: REGION_COLOMBIA,
  mexico: REGION_MEXICO,
};

/**
 * Get the regional context block.
 * Returns the GLOBAL fallback if market_focus is null/undefined.
 * For GPT-4o-mini (mini=true), always returns GLOBAL to save tokens.
 */
export function getRegionalBlock(
  marketFocus?: MarketFocus | null,
  mini = false
): string {
  if (mini) return REGION_GLOBAL;
  if (marketFocus && REGION_MAP[marketFocus]) {
    return REGION_MAP[marketFocus];
  }
  return REGION_GLOBAL;
}
