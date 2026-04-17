/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Service Registry (Auto-Detect Mode)
 *
 *  Auth: Uses SupabaseAuthService when Supabase is configured,
 *        falls back to MockAuthService otherwise.
 *  Conversation + Speech: Real Supabase adapters for VoicePractice,
 *        mock adapters for legacy screens.
 *  Other services: Mock adapters (feedback, user, payment, SR).
 *
 *  Next phases will swap remaining mock → real adapters.
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
import { SupabaseSpeechService } from "./adapters/supabase/speech.supabase";
import { SupabaseFeedbackService } from "./adapters/supabase/feedback.supabase";

/* ── Import interfaces for typed exports ── */
import type { IAuthService } from "./interfaces/auth";

import { SupabaseSpacedRepetitionService } from "./adapters/supabase/spaced-repetition.supabase";
import { SupabaseUserService } from "./adapters/supabase/user.supabase";
import { StripePaymentService } from "./adapters/supabase/payment.stripe";

/* ══════════════════════════════════════════════════════════════
   Auto-detect: Supabase auth if configured, mock otherwise.
   ══════════════════════════════════════════════════════════════ */

const useSupabase = isSupabaseConfigured();
const FORCE_MOCK_AUTH = false; // Google OAuth is configured in Supabase dashboard

console.log(
  `[inFluentia] Service Layer initialized — ${useSupabase && !FORCE_MOCK_AUTH ? "PRODUCTION MODE (Supabase auth)" : "PROTOTYPE MODE (all mocks)"
  }`
);

export const authService: IAuthService = useSupabase && !FORCE_MOCK_AUTH
  ? new SupabaseAuthService()
  : new MockAuthService();

/* ── Conversation & Speech: real adapters when Supabase is configured ── */
export const conversationService = useSupabase
  ? new SupabaseConversationService()
  : new MockConversationService();

export const speechService = useSupabase
  ? new SupabaseSpeechService()
  : new MockSpeechService();

/* ── Other services ── */
export const feedbackService = useSupabase ? new SupabaseFeedbackService() : new MockFeedbackService();
export const userService = useSupabase
  ? new SupabaseUserService()
  : new MockUserService();
export const paymentService = useSupabase
  ? new StripePaymentService()
  : new MockPaymentService();
export const spacedRepetitionService = useSupabase
  ? new SupabaseSpacedRepetitionService()
  : new MockSpacedRepetitionService();

/* ── Backward-compat aliases (used by VoicePractice) ── */
export const realConversationService = conversationService as SupabaseConversationService;
export const realSpeechService = speechService as SupabaseSpeechService;