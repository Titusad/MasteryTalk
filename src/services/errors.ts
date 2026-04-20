/**
 * ══════════════════════════════════════════════════════════════
 *  MasteryTalk PRO — Service Layer: Error Protocol
 *
 *  Typed error classes for every service domain.
 *  Each error carries:
 *    - code   : Machine-readable identifier for switch/match
 *    - message: Human-friendly description (Spanish for UI)
 *    - retryable: Whether the operation can be retried automatically
 *    - cause  : Optional original error for logging
 *
 *  Recovery strategies are documented per error code so both
 *  adapters and UI components share the same contract.
 * ══════════════════════════════════════════════════════════════
 */

/* ═══════════════════════════════════════════════════════════
   BASE ERROR
   ═══════════════════════════════════════════════════════════ */

export type ErrorSeverity = "warning" | "error" | "fatal";

export type RecoveryStrategy =
  | "retry"           // Auto-retry with exponential backoff
  | "retry-manual"    // Show retry button to user
  | "user-action"     // User must do something (e.g., enable mic)
  | "degrade"         // Fall back to limited functionality
  | "navigate"        // Navigate to a safe screen (dashboard/landing)
  | "none";           // Informational only, no recovery needed

export class ServiceError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly severity: ErrorSeverity;
  readonly recovery: RecoveryStrategy;
  readonly userMessage: string;
  readonly cause?: Error;

  constructor(opts: {
    code: string;
    message: string;
    userMessage: string;
    retryable?: boolean;
    severity?: ErrorSeverity;
    recovery?: RecoveryStrategy;
    cause?: Error;
  }) {
    super(opts.message);
    this.name = "ServiceError";
    this.code = opts.code;
    this.userMessage = opts.userMessage;
    this.retryable = opts.retryable ?? false;
    this.severity = opts.severity ?? "error";
    this.recovery = opts.recovery ?? "retry-manual";
    this.cause = opts.cause;
  }
}

/* ═══════════════════════════════════════════════════════════
   SPEECH ERRORS  (Azure Speech REST API + ElevenLabs)
   ═══════════════════════════════════════════════════════════
   Scenarios:
   - Microphone permission denied/revoked
   - Azure STT network timeout
   - Azure STT quota exceeded
   - ElevenLabs TTS API failure
   - Pronunciation assessment timeout
   ═══════════════════════════════════════════════════════════ */

export type SpeechErrorCode =
  | "MICROPHONE_DENIED"
  | "MICROPHONE_NOT_FOUND"
  | "STT_NETWORK_ERROR"
  | "STT_TIMEOUT"
  | "STT_QUOTA_EXCEEDED"
  | "TTS_NETWORK_ERROR"
  | "TTS_TIMEOUT"
  | "PRONUNCIATION_TIMEOUT"
  | "PRONUNCIATION_FAILED"
  | "SPEECH_UNKNOWN";

const SPEECH_ERROR_MAP: Record<
  SpeechErrorCode,
  Omit<ConstructorParameters<typeof ServiceError>[0], "code">
> = {
  MICROPHONE_DENIED: {
    message: "Microphone access was denied by the user or browser.",
    userMessage:
      "Necesitamos acceso a tu micrófono para practicar. Habilítalo en la configuración de tu navegador.",
    retryable: false,
    severity: "error",
    recovery: "user-action",
  },
  MICROPHONE_NOT_FOUND: {
    message: "No microphone device detected.",
    userMessage:
      "No detectamos un micrófono. Conecta uno y vuelve a intentar.",
    retryable: false,
    severity: "error",
    recovery: "user-action",
  },
  STT_NETWORK_ERROR: {
    message: "Azure Speech STT request failed due to network error.",
    userMessage:
      "Error de conexión al transcribir tu audio. Verifica tu internet e intenta de nuevo.",
    retryable: true,
    severity: "error",
    recovery: "retry",
  },
  STT_TIMEOUT: {
    message: "Azure Speech STT request timed out after 15s.",
    userMessage:
      "La transcripción tardó demasiado. Intenta hablar de nuevo.",
    retryable: true,
    severity: "warning",
    recovery: "retry-manual",
  },
  STT_QUOTA_EXCEEDED: {
    message: "Azure Speech free-tier quota exceeded.",
    userMessage:
      "Se alcanzó el límite de uso temporal. Intenta de nuevo en unos minutos.",
    retryable: false,
    severity: "error",
    recovery: "degrade",
  },
  TTS_NETWORK_ERROR: {
    message: "ElevenLabs TTS request failed.",
    userMessage:
      "No pudimos reproducir el audio. Puedes leer el texto mientras se restablece.",
    retryable: true,
    severity: "warning",
    recovery: "degrade",
  },
  TTS_TIMEOUT: {
    message: "ElevenLabs TTS request timed out.",
    userMessage:
      "El audio tardó demasiado en cargar. Puedes leer el texto o intentar de nuevo.",
    retryable: true,
    severity: "warning",
    recovery: "retry-manual",
  },
  PRONUNCIATION_TIMEOUT: {
    message: "Pronunciation assessment timed out.",
    userMessage:
      "El análisis de pronunciación tardó demasiado. Intenta de nuevo.",
    retryable: true,
    severity: "warning",
    recovery: "retry-manual",
  },
  PRONUNCIATION_FAILED: {
    message: "Pronunciation assessment returned an error.",
    userMessage:
      "No pudimos analizar tu pronunciación. Intenta grabar de nuevo.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
  SPEECH_UNKNOWN: {
    message: "Unknown speech service error.",
    userMessage:
      "Ocurrió un error inesperado con el servicio de voz. Intenta de nuevo.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
};

export class SpeechError extends ServiceError {
  declare readonly code: SpeechErrorCode;

  constructor(code: SpeechErrorCode, cause?: Error) {
    const preset = SPEECH_ERROR_MAP[code];
    super({ code, ...preset, cause });
    this.name = "SpeechError";
  }
}

/* ═══════════════════════════════════════════════════════════
   PAYMENT ERRORS  (Mercado Pago / Stripe)
   ═══════════════════════════════════════════════════════════
   Scenarios:
   - Checkout session creation fails
   - Payment declined by processor
   - Payment is pending (Mercado Pago cash/transfer, 24-72h window)
   - Webhook hasn't confirmed yet (async delay)
   - Subscription cancellation fails
   ═══════════════════════════════════════════════════════════ */

export type PaymentErrorCode =
  | "CHECKOUT_CREATION_FAILED"
  | "PAYMENT_DECLINED"
  | "PAYMENT_PENDING"
  | "PAYMENT_EXPIRED"
  | "WEBHOOK_NOT_RECEIVED"
  | "CREDITS_EXHAUSTED"
  | "SUBSCRIPTION_CANCEL_FAILED"
  | "PAYMENT_UNKNOWN";

const PAYMENT_ERROR_MAP: Record<
  PaymentErrorCode,
  Omit<ConstructorParameters<typeof ServiceError>[0], "code">
> = {
  CHECKOUT_CREATION_FAILED: {
    message: "Failed to create checkout session with payment provider.",
    userMessage:
      "No pudimos iniciar el proceso de pago. Intenta de nuevo en unos segundos.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
  PAYMENT_DECLINED: {
    message: "Payment was declined by the processor.",
    userMessage:
      "Tu pago fue rechazado. Verifica tu medio de pago o intenta con otro método.",
    retryable: false,
    severity: "error",
    recovery: "user-action",
  },
  PAYMENT_PENDING: {
    message:
      "Payment is pending confirmation (cash/transfer via Mercado Pago).",
    userMessage:
      "Tu pago está pendiente de confirmación. Esto puede tomar hasta 72 horas para pagos en efectivo o transferencia. Te notificaremos cuando se acredite.",
    retryable: false,
    severity: "warning",
    recovery: "none",
  },
  PAYMENT_EXPIRED: {
    message: "Payment session expired before completion.",
    userMessage:
      "La sesión de pago expiró. Inicia el proceso nuevamente.",
    retryable: true,
    severity: "warning",
    recovery: "retry-manual",
  },
  WEBHOOK_NOT_RECEIVED: {
    message:
      "Payment confirmation webhook has not been received yet. May take up to 30s.",
    userMessage:
      "Estamos confirmando tu pago. Esto puede tomar unos segundos. Si ya pagaste, tu acceso se activará automáticamente.",
    retryable: true,
    severity: "warning",
    recovery: "retry",
  },
  CREDITS_EXHAUSTED: {
    message: "User has no session credits remaining.",
    userMessage:
      "No tienes créditos de sesión disponibles. Compra un paquete para continuar practicando.",
    retryable: false,
    severity: "warning",
    recovery: "user-action",
  },
  SUBSCRIPTION_CANCEL_FAILED: {
    message: "Failed to cancel subscription.",
    userMessage:
      "No pudimos cancelar tu suscripción. Intenta de nuevo o contacta soporte.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
  PAYMENT_UNKNOWN: {
    message: "Unknown payment error.",
    userMessage:
      "Ocurrió un error con el pago. Intenta de nuevo o contacta soporte.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
};

export class PaymentError extends ServiceError {
  declare readonly code: PaymentErrorCode;
  /** For PAYMENT_PENDING: estimated resolution window */
  readonly estimatedWait?: string;

  constructor(code: PaymentErrorCode, opts?: { cause?: Error; estimatedWait?: string }) {
    const preset = PAYMENT_ERROR_MAP[code];
    super({ code, ...preset, cause: opts?.cause });
    this.name = "PaymentError";
    this.estimatedWait = opts?.estimatedWait;
  }
}

/* ═══════════════════════════════════════════════════════════
   CONVERSATION ERRORS  (GPT-4o via Supabase Edge Functions)
   ═══════════════════════════════════════════════════════════ */

export type ConversationErrorCode =
  | "SESSION_CREATION_FAILED"
  | "AI_TIMEOUT"
  | "AI_RATE_LIMIT"
  | "AI_CONTEXT_OVERFLOW"
  | "SESSION_NOT_FOUND"
  | "TURN_PROCESSING_FAILED"
  | "CONVERSATION_UNKNOWN";

const CONVERSATION_ERROR_MAP: Record<
  ConversationErrorCode,
  Omit<ConstructorParameters<typeof ServiceError>[0], "code">
> = {
  SESSION_CREATION_FAILED: {
    message: "Edge Function prepare-session failed.",
    userMessage:
      "No pudimos preparar tu sesión de práctica. Intenta de nuevo.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
  AI_TIMEOUT: {
    message: "GPT-4o API response timed out (>30s).",
    userMessage:
      "La respuesta de la IA está tardando más de lo normal. Intenta de nuevo.",
    retryable: true,
    severity: "warning",
    recovery: "retry-manual",
  },
  AI_RATE_LIMIT: {
    message: "GPT-4o API rate limit reached.",
    userMessage:
      "Hay mucha demanda en este momento. Espera unos segundos e intenta de nuevo.",
    retryable: true,
    severity: "warning",
    recovery: "retry",
  },
  AI_CONTEXT_OVERFLOW: {
    message: "Conversation exceeded maximum context window.",
    userMessage:
      "La conversación alcanzó el límite. Puedes ver tu feedback ahora.",
    retryable: false,
    severity: "warning",
    recovery: "degrade",
  },
  SESSION_NOT_FOUND: {
    message: "Session not found in Supabase.",
    userMessage:
      "No encontramos tu sesión. Esto puede ocurrir si pasó mucho tiempo. Inicia una nueva práctica.",
    retryable: false,
    severity: "error",
    recovery: "navigate",
  },
  TURN_PROCESSING_FAILED: {
    message: "Edge Function process-turn returned an error.",
    userMessage:
      "Error al procesar tu respuesta. Intenta enviarla de nuevo.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
  CONVERSATION_UNKNOWN: {
    message: "Unknown conversation error.",
    userMessage:
      "Ocurrió un error inesperado en la conversación. Intenta de nuevo.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
};

export class ConversationError extends ServiceError {
  declare readonly code: ConversationErrorCode;

  constructor(code: ConversationErrorCode, cause?: Error) {
    const preset = CONVERSATION_ERROR_MAP[code];
    super({ code, ...preset, cause });
    this.name = "ConversationError";
  }
}

/* ═══════════════════════════════════════════════════════════
   FEEDBACK ERRORS  (Gemini 1.5 Flash via Supabase Edge Functions)
   ═══════════════════════════════════════════════════════════ */

export type FeedbackErrorCode =
  | "ANALYSIS_TIMEOUT"
  | "ANALYSIS_FAILED"
  | "SCRIPT_GENERATION_FAILED"
  | "SUMMARY_FAILED"
  | "FEEDBACK_UNKNOWN";

const FEEDBACK_ERROR_MAP: Record<
  FeedbackErrorCode,
  Omit<ConstructorParameters<typeof ServiceError>[0], "code">
> = {
  ANALYSIS_TIMEOUT: {
    message: "Feedback analysis timed out.",
    userMessage:
      "El análisis está tardando más de lo esperado. Intenta de nuevo.",
    retryable: true,
    severity: "warning",
    recovery: "retry-manual",
  },
  ANALYSIS_FAILED: {
    message: "Edge Function analyze-feedback failed.",
    userMessage:
      "No pudimos analizar tu sesión. Intenta de nuevo.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
  SCRIPT_GENERATION_FAILED: {
    message: "Edge Function generate-script failed.",
    userMessage:
      "No pudimos generar tu script mejorado. Intenta de nuevo.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
  SUMMARY_FAILED: {
    message: "Results summary or completed summary failed.",
    userMessage:
      "No pudimos cargar el resumen de tu práctica.",
    retryable: true,
    severity: "warning",
    recovery: "retry-manual",
  },
  FEEDBACK_UNKNOWN: {
    message: "Unknown feedback error.",
    userMessage:
      "Ocurrió un error al generar tu feedback. Intenta de nuevo.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
};

export class FeedbackError extends ServiceError {
  declare readonly code: FeedbackErrorCode;

  constructor(code: FeedbackErrorCode, cause?: Error) {
    const preset = FEEDBACK_ERROR_MAP[code];
    super({ code, ...preset, cause });
    this.name = "FeedbackError";
  }
}

/* ═══════════════════════════════════════════════════════════
   AUTH ERRORS
   ═══════════════════════════════════════════════════════════ */

export type AuthErrorCode =
  | "POPUP_CLOSED"
  | "PROVIDER_ERROR"
  | "NETWORK_ERROR"
  | "AUTH_UNKNOWN";

const AUTH_ERROR_MAP: Record<
  AuthErrorCode,
  Omit<ConstructorParameters<typeof ServiceError>[0], "code">
> = {
  POPUP_CLOSED: {
    message: "Auth popup was closed before completing sign-in.",
    userMessage:
      "Cerraste la ventana de inicio de sesión. Intenta de nuevo cuando estés listo.",
    retryable: true,
    severity: "warning",
    recovery: "retry-manual",
  },
  PROVIDER_ERROR: {
    message: "OAuth provider returned an error.",
    userMessage:
      "Hubo un problema con el proveedor de autenticación. Intenta con otro método.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
  NETWORK_ERROR: {
    message: "Network error during authentication.",
    userMessage:
      "Error de conexión. Verifica tu internet e intenta de nuevo.",
    retryable: true,
    severity: "error",
    recovery: "retry",
  },
  AUTH_UNKNOWN: {
    message: "Unknown auth error.",
    userMessage:
      "Ocurrió un error al iniciar sesión. Intenta de nuevo.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
  },
};

export class AuthError extends ServiceError {
  declare readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, cause?: Error) {
    const preset = AUTH_ERROR_MAP[code];
    super({ code, ...preset, cause });
    this.name = "AuthError";
  }
}

/* ═══════════════════════════════════════════════════════════
   UTILITY: Type guard helpers
   ═══════════════════════════════════════════════════════════ */

export function isServiceError(err: unknown): err is ServiceError {
  return err instanceof ServiceError;
}

export function isSpeechError(err: unknown): err is SpeechError {
  return err instanceof SpeechError;
}

export function isPaymentError(err: unknown): err is PaymentError {
  return err instanceof PaymentError;
}

export function isConversationError(err: unknown): err is ConversationError {
  return err instanceof ConversationError;
}

export function isFeedbackError(err: unknown): err is FeedbackError {
  return err instanceof FeedbackError;
}

export function isAuthError(err: unknown): err is AuthError {
  return err instanceof AuthError;
}

/* ═══════════════════════════════════════════════════════════
   UTILITY: Wrap unknown errors into ServiceError
   ═══════════════════════════════════════════════════════════ */

/**
 * Ensure any thrown value becomes a ServiceError.
 * If it already is one, return as-is. Otherwise wrap it.
 */
export function toServiceError(err: unknown, fallbackCode = "UNKNOWN"): ServiceError {
  if (err instanceof ServiceError) return err;
  const cause = err instanceof Error ? err : new Error(String(err));
  return new ServiceError({
    code: fallbackCode,
    message: cause.message,
    userMessage: "Ocurrió un error inesperado. Intenta de nuevo.",
    retryable: true,
    severity: "error",
    recovery: "retry-manual",
    cause,
  });
}