/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Service Registry (Auto-Detect Mode)
 *
 *  Auth: Uses SupabaseAuthService when Supabase is configured,
 *        falls back to MockAuthService otherwise.
 *  All other services: Mock adapters (conversation, feedback,
 *        speech, user, payment, spaced-repetition).
 *
 *  Next phases will swap mock → real adapters one by one.
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

/* ── Import Supabase adapters + detector ── */
import { isSupabaseConfigured } from "./supabase";
import { SupabaseAuthService } from "./adapters/supabase/auth.supabase";
import { SupabaseConversationService } from "./adapters/supabase/conversation.supabase";

/* ── Import interfaces for typed exports ── */
import type { IAuthService } from "./interfaces/auth";
import type { IConversationService } from "./interfaces/conversation";

/* ══════════════════════════════════════════════════════════════
   Auto-detect: Supabase auth and conversation if configured, mock for rest.
   ══════════════════════════════════════════════════════════════ */

const useSupabase = isSupabaseConfigured();

console.log(
  `[inFluentia] Service Layer initialized — ${useSupabase ? "PRODUCTION MODE (Supabase auth & conversation)" : "PROTOTYPE MODE (all mocks)"
  }`
);

export const authService: IAuthService = useSupabase
  ? new SupabaseAuthService()
  : new MockAuthService();

export const conversationService: IConversationService = useSupabase
  ? new SupabaseConversationService()
  : new MockConversationService();

export const feedbackService = new MockFeedbackService();
export const speechService = new MockSpeechService();
export const userService = new MockUserService();
export const paymentService = new MockPaymentService();
export const spacedRepetitionService = new MockSpacedRepetitionService();