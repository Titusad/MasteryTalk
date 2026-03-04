/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Service Registry (PROTOTYPE MODE)
 *
 *  All services use MOCK adapters. No Supabase calls.
 *  When ready to connect Supabase, flip USE_MOCK to false
 *  and uncomment the Supabase adapter imports.
 * ══════════════════════════════════════════════════════════════
 */

/* ── Re-export types for convenience ── */
export * from "./types";
export * from "./errors";
export type * from "./interfaces";

/* ── Import mock adapters (no external dependencies) ── */
import { MockAuthService } from "./adapters/mock/auth.mock";
import { MockConversationService } from "./adapters/mock/conversation.mock";
import { MockFeedbackService } from "./adapters/mock/feedback.mock";
import { MockSpeechService } from "./adapters/mock/speech.mock";
import { MockUserService } from "./adapters/mock/user.mock";
import { MockPaymentService } from "./adapters/mock/payment.mock";
import { MockSpacedRepetitionService } from "./adapters/mock/spaced-repetition.mock";

/* ══════════════════════════════════════════════════════════════
   ALL MOCK — no Supabase imports, no race conditions, no blank screen
   ══════════════════════════════════════════════════════════════ */

console.log("[inFluentia] Service Layer initialized — PROTOTYPE MODE (all mocks)");

export const authService = new MockAuthService();
export const conversationService = new MockConversationService();
export const feedbackService = new MockFeedbackService();
export const speechService = new MockSpeechService();
export const userService = new MockUserService();
export const paymentService = new MockPaymentService();
export const spacedRepetitionService = new MockSpacedRepetitionService();
