/**
 * ══════════════════════════════════════════════════════════════
 *  useServiceCall — Generic hook for calling service methods
 *  with built-in error handling, retry logic, and loading state.
 *
 *  Usage:
 *    const { data, error, loading, retry } = useServiceCall(
 *      () => feedbackService.analyzeFeedback(sessionId),
 *      { enabled: step === "analyzing" }
 *    );
 *
 *  Features:
 *  - Auto-retry with exponential backoff for retryable errors
 *  - Manual retry function exposed to UI
 *  - Typed ServiceError propagation
 *  - Abort on unmount / dependency change
 * ══════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ServiceError,
  toServiceError,
  type RecoveryStrategy,
} from "../../services/errors";

/* ── Config ── */
const DEFAULT_MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

interface UseServiceCallOptions {
  /** Only fire the call when true (default: true) */
  enabled?: boolean;
  /** Max auto-retries for retryable errors (default: 2) */
  maxRetries?: number;
  /** Called when error.recovery === "navigate" */
  onNavigate?: () => void;
}

interface UseServiceCallResult<T> {
  data: T | null;
  error: ServiceError | null;
  loading: boolean;
  /** Manual retry — works even after max auto-retries exhausted */
  retry: () => void;
  /** Clear error state without retrying */
  dismiss: () => void;
}

export function useServiceCall<T>(
  serviceFn: () => Promise<T>,
  options: UseServiceCallOptions = {}
): UseServiceCallResult<T> {
  const { enabled = true, maxRetries = DEFAULT_MAX_RETRIES, onNavigate } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ServiceError | null>(null);
  const [loading, setLoading] = useState(false);
  const retriesRef = useRef(0);
  const abortRef = useRef(false);

  const execute = useCallback(async () => {
    abortRef.current = false;
    setLoading(true);
    setError(null);
    retriesRef.current = 0;

    const attempt = async (): Promise<void> => {
      try {
        const result = await serviceFn();
        if (!abortRef.current) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (abortRef.current) return;

        const serviceErr = toServiceError(err);

        // Auto-retry for retryable errors with strategy "retry"
        if (
          serviceErr.retryable &&
          serviceErr.recovery === "retry" &&
          retriesRef.current < maxRetries
        ) {
          retriesRef.current += 1;
          const backoff = BASE_DELAY_MS * Math.pow(2, retriesRef.current - 1);
          await new Promise((r) => setTimeout(r, backoff));
          if (!abortRef.current) return attempt();
          return;
        }

        // Navigate recovery
        if (serviceErr.recovery === "navigate" && onNavigate) {
          onNavigate();
        }

        setError(serviceErr);
        setLoading(false);
      }
    };

    await attempt();
  }, [serviceFn, maxRetries, onNavigate]);

  useEffect(() => {
    if (!enabled) return;
    execute();
    return () => {
      abortRef.current = true;
    };
  }, [enabled, execute]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  const dismiss = useCallback(() => {
    setError(null);
  }, []);

  return { data, error, loading, retry, dismiss };
}

/* ═══════════════════════════════════════════════════════════
   useRetry — Standalone retry utility for imperative calls
   (e.g., inside event handlers, not data-fetching)
   ═══════════════════════════════════════════════════════════ */

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries = 2, baseDelay = 1000 } = config;
  let lastErr: ServiceError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = toServiceError(err);
      if (!lastErr.retryable || attempt === maxRetries) break;
      await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, attempt)));
    }
  }

  throw lastErr;
}
