/**
 * Mock adapter utilities
 */

/** Simulate network latency */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Generate a random mock ID */
export function mockId(prefix: string = "mock"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ═══════════════════════════════════════════════════════════
   ERROR SIMULATION
   ═══════════════════════════════════════════════════════════
   Toggle SIMULATE_ERRORS to true to test error handling UI.
   
   When enabled, each mock adapter has a configurable probability
   of throwing domain-specific errors. This lets you verify:
   - ServiceErrorBanner renders correctly per severity
   - Retry logic works (auto + manual)
   - Recovery strategies fire (navigate, degrade, user-action)
   - Payment pending flow displays correctly
   
   Usage:
     import { SIMULATE_ERRORS, shouldSimulateError } from "./utils";
     if (shouldSimulateError("speech")) throw new SpeechError("STT_TIMEOUT");
   ═══════════════════════════════════════════════════════════ */

/**
 * Master toggle for error simulation in mock adapters.
 * Set to true during development to test error handling UI.
 * 
 * Can also be controlled via URL param: ?simulate_errors=true
 */
export const SIMULATE_ERRORS: boolean =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("simulate_errors") === "true";

/**
 * Per-domain error probability (0-1).
 * Only applies when SIMULATE_ERRORS is true.
 */
const ERROR_PROBABILITY: Record<string, number> = {
  speech: 0.3,     // 30% chance of speech errors
  payment: 0.4,    // 40% chance of payment errors
  conversation: 0.2,
  feedback: 0.2,
  auth: 0.15,
};

/**
 * Returns true if this call should simulate an error.
 * Uses Math.random() so errors are intermittent, not constant.
 */
export function shouldSimulateError(domain: string): boolean {
  if (!SIMULATE_ERRORS) return false;
  const prob = ERROR_PROBABILITY[domain] ?? 0.2;
  return Math.random() < prob;
}
