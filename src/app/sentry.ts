import * as Sentry from "@sentry/react";

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export function initSentry() {
  if (!DSN) return; // Skip in dev if DSN not configured

  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE, // "production" | "development"
    // Only send errors in production
    enabled: import.meta.env.PROD,
    // Sample 100% of errors, 10% of performance traces
    tracesSampleRate: 0.1,
    // Capture console.error calls as breadcrumbs
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Session replay: 1% of sessions, 100% on error
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
    // Don't send errors from localhost
    beforeSend(event) {
      if (window.location.hostname === "localhost") return null;
      return event;
    },
  });
}

export { Sentry };
