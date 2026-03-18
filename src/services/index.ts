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

/* ── Import interfaces for typed exports ── */
import type { IAuthService } from "./interfaces/auth";

/* ══════════════════════════════════════════════════════════════
   Auto-detect: Supabase auth if configured, mock otherwise.

   IMPORTANT: Even though Supabase credentials exist in the
   Figma Make environment, Google OAuth is not configured in
   the Supabase dashboard. Force mock auth until OAuth is
   properly set up to avoid 403 redirects that break the app.
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

/* ── Mock services (legacy screens: ConversationFeedback, etc.) ── */
export const conversationService = new MockConversationService();
export const feedbackService = new MockFeedbackService();
export const speechService = new MockSpeechService();
export const userService = new MockUserService();
export const paymentService = new MockPaymentService();
export const spacedRepetitionService = new MockSpacedRepetitionService();

/* ══════════════════════════════════════════════════════════════
   REAL Supabase services — used by VoicePractice for:
   - Real GPT-4o conversation via Edge Function
   - Real Whisper STT via Edge Function
   - Real ElevenLabs TTS via Edge Function
   
   Singleton instances — import these directly in VoicePractice:
     import { realConversationService, realSpeechService } from "../../services";
   ══════════════════════════════════════════════════════════════ */
export const realConversationService = new SupabaseConversationService();
export const realSpeechService = new SupabaseSpeechService();