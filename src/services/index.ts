/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Service Registry
 *
 *  Single entry point for all services. Supports THREE modes:
 *
 *  1. USE_MOCK = true  → All 7 services use mock adapters (Fase 0)
 *  2. USE_MOCK = false → Per-service switching via ADAPTER_MODE map
 *  3. Auto-detect      → If Supabase env vars are set, uses real auth
 *
 *  Usage in components:
 *    import { authService, conversationService } from "../../services";
 *    const user = await authService.signIn("google");
 *
 *  Fase 1 mode (hybrid):
 *    authService = SupabaseAuthService (real)
 *    everything else = Mock (until Fases 2-4)
 * ══════════════════════════════════════════════════════════════
 */

/* ── Re-export types for convenience ── */
export * from "./types";
export * from "./errors";
export type * from "./interfaces";

/* ── Import interfaces (for typing) ── */
import type { IAuthService } from "./interfaces/auth";
import type { IConversationService } from "./interfaces/conversation";
import type { IFeedbackService } from "./interfaces/feedback";
import type { ISpeechService } from "./interfaces/speech";
import type { IUserService } from "./interfaces/user";
import type { IPaymentService } from "./interfaces/payment";
import type { ISpacedRepetitionService } from "./interfaces/spaced-repetition";

/* ── Import mock adapters ── */
import { MockAuthService } from "./adapters/mock/auth.mock";
import { MockConversationService } from "./adapters/mock/conversation.mock";
import { MockFeedbackService } from "./adapters/mock/feedback.mock";
import { MockSpeechService } from "./adapters/mock/speech.mock";
import { MockUserService } from "./adapters/mock/user.mock";
import { MockPaymentService } from "./adapters/mock/payment.mock";
import { MockSpacedRepetitionService } from "./adapters/mock/spaced-repetition.mock";

/* ── Import Supabase adapters (available after Fase 1+) ── */
import { SupabaseAuthService } from "./adapters/supabase/auth.supabase";

/* ── Import Supabase config check ── */
import { isSupabaseConfigured } from "./supabase";

/* ══════════════════════════════════════════════════════════════
   ADAPTER CONFIGURATION
   ══════════════════════════════════════════════════════════════

   USE_MOCK master switch:
   - true  → Forces ALL services to mock (Fase 0 development)
   - false → Uses ADAPTER_MODE per service (Fases 1-4 progressive rollout)

   Control via environment variable:
     VITE_USE_MOCK=false  → Uses ADAPTER_MODE per service
     VITE_USE_MOCK=true   → Forces all mocks (default if not set)

   Auto-detection:
     If VITE_USE_MOCK is not set AND Supabase is configured,
     USE_MOCK defaults to false (allows per-service switching).
     This makes the Figma Make environment work without env vars.

   ══════════════════════════════════════════════════════════════ */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true"
  ? true
  : import.meta.env.VITE_USE_MOCK === "false"
    ? false
    : !isSupabaseConfigured(); // Auto-detect: mock only if Supabase is NOT configured

/**
 * Per-service adapter mode. Only applies when USE_MOCK = false.
 *
 * During Fase 1: only auth is "supabase", rest stay "mock".
 * As you implement each Supabase adapter, flip its mode to "supabase".
 *
 * ┌──────────────────────┬─────────┬─────────────────────────┐
 * │ Service              │ Fase 1  │ Fase 4 (full)           │
 * ├──────────────────────┼─────────┼─────────────────────────┤
 * │ auth                 │ supabase│ supabase                │
 * │ conversation         │ mock    │ supabase                │
 * │ feedback             │ mock    │ supabase                │
 * │ speech               │ mock    │ supabase                │
 * │ user                 │ mock    │ supabase                │
 * │ payment              │ mock    │ supabase                │
 * │ spacedRepetition     │ mock    │ supabase                │
 * └──────────────────────┴─────────┴─────────────────────────┘
 */
type AdapterMode = "mock" | "supabase";

const ADAPTER_MODE: Record<string, AdapterMode> = {
  auth: "supabase",           // ← Fase 1: first service to go real
  conversation: "mock",       // ← Fase 2: Edge Functions + GPT-4o
  feedback: "mock",           // ← Fase 3: Gemini + Azure
  speech: "mock",             // ← Fase 3: Azure Speech + ElevenLabs
  user: "mock",               // ← Fase 4: Profile + history queries
  payment: "mock",            // ← Fase 4: Mercado Pago + Stripe
  spacedRepetition: "mock",   // ← Fase 4: SR logic
};

/* ══════════════════════════════════════════════════════════════
   SERVICE FACTORY FUNCTIONS
   ══════════════════════════════════════════════════════════════ */

function shouldUseMock(service: string): boolean {
  if (USE_MOCK) return true;
  if (ADAPTER_MODE[service] === "supabase" && !isSupabaseConfigured()) {
    console.warn(
      `[inFluentia] ${service} adapter set to "supabase" but VITE_SUPABASE_URL/KEY not found. Falling back to mock.`
    );
    return true;
  }
  return ADAPTER_MODE[service] === "mock";
}

function createAuthService(): IAuthService {
  if (shouldUseMock("auth")) return new MockAuthService();
  try {
    return new SupabaseAuthService();
  } catch (err) {
    console.error("[inFluentia] SupabaseAuthService failed, falling back to mock:", err);
    return new MockAuthService();
  }
}

function createConversationService(): IConversationService {
  if (shouldUseMock("conversation")) return new MockConversationService();
  // TODO Fase 2: return new SupabaseConversationService();
  return new MockConversationService();
}

function createFeedbackService(): IFeedbackService {
  if (shouldUseMock("feedback")) return new MockFeedbackService();
  // TODO Fase 3: return new SupabaseFeedbackService();
  return new MockFeedbackService();
}

function createSpeechService(): ISpeechService {
  if (shouldUseMock("speech")) return new MockSpeechService();
  // TODO Fase 3: return new SupabaseSpeechService();
  return new MockSpeechService();
}

function createUserService(): IUserService {
  if (shouldUseMock("user")) return new MockUserService();
  // TODO Fase 4: return new SupabaseUserService();
  return new MockUserService();
}

function createPaymentService(): IPaymentService {
  if (shouldUseMock("payment")) return new MockPaymentService();
  // TODO Fase 4: return new SupabasePaymentService();
  return new MockPaymentService();
}

function createSpacedRepetitionService(): ISpacedRepetitionService {
  if (shouldUseMock("spacedRepetition")) return new MockSpacedRepetitionService();
  // TODO Fase 4: return new SupabaseSpacedRepetitionService();
  return new MockSpacedRepetitionService();
}

/* ══════════════════════════════════════════════════════════════
   EXPORTED SERVICE INSTANCES (singletons)
   ══════════════════════════════════════════════════════════════ */

/* Diagnostic log — visible in browser console */
try {
  console.log(
    `[inFluentia] Service Layer initialized\n` +
    `  Supabase configured: ${isSupabaseConfigured()}\n` +
    `  USE_MOCK: ${USE_MOCK}\n` +
    `  Auth: ${shouldUseMock("auth") ? "MOCK" : "SUPABASE"}\n` +
    `  Conversation: ${shouldUseMock("conversation") ? "MOCK" : "SUPABASE"}\n` +
    `  Feedback: ${shouldUseMock("feedback") ? "MOCK" : "SUPABASE"}\n` +
    `  Speech: ${shouldUseMock("speech") ? "MOCK" : "SUPABASE"}\n` +
    `  User: ${shouldUseMock("user") ? "MOCK" : "SUPABASE"}\n` +
    `  Payment: ${shouldUseMock("payment") ? "MOCK" : "SUPABASE"}\n` +
    `  Spaced Repetition: ${shouldUseMock("spacedRepetition") ? "MOCK" : "SUPABASE"}`
  );
} catch (e) {
  console.error("[inFluentia] Diagnostic log error:", e);
}

let authService: IAuthService;
let conversationService: IConversationService;
let feedbackService: IFeedbackService;
let speechService: ISpeechService;
let userService: IUserService;
let paymentService: IPaymentService;
let spacedRepetitionService: ISpacedRepetitionService;

try {
  authService = createAuthService();
  conversationService = createConversationService();
  feedbackService = createFeedbackService();
  speechService = createSpeechService();
  userService = createUserService();
  paymentService = createPaymentService();
  spacedRepetitionService = createSpacedRepetitionService();
} catch (err) {
  console.error("[inFluentia] CRITICAL: Service creation failed, falling back to all mocks:", err);
  authService = new MockAuthService();
  conversationService = new MockConversationService();
  feedbackService = new MockFeedbackService();
  speechService = new MockSpeechService();
  userService = new MockUserService();
  paymentService = new MockPaymentService();
  spacedRepetitionService = new MockSpacedRepetitionService();
}

export {
  authService,
  conversationService,
  feedbackService,
  speechService,
  userService,
  paymentService,
  spacedRepetitionService,
};