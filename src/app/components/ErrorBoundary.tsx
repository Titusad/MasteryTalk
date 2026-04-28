/**
 * Global ErrorBoundary — catches unhandled React errors and displays
 * a user-friendly fallback instead of a blank screen.
 *
 * This is critical for debugging the "blank preview" issue:
 * without it, any uncaught error during render crashes the
 * entire React tree silently.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Sentry } from "@/app/sentry";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("[MasteryTalk ErrorBoundary] Caught error:", error);
    console.error("[MasteryTalk ErrorBoundary] Component stack:", errorInfo.componentStack);
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "'Inter', system-ui, sans-serif",
            background: "#0f172b",
            color: "#e2e8f0",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              width: "100%",
              textAlign: "center",
            }}
          >
            {/* Brand */}
            <div style={{ marginBottom: "1.5rem" }}>
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                <span style={{ color: "#22d3ee" }}>in</span>
                <span style={{ color: "#ffffff" }}>Fluentia</span>
                <span
                  style={{
                    color: "#50C878",
                    fontSize: "0.75rem",
                    marginLeft: "4px",
                    verticalAlign: "super",
                  }}
                >
                  PRO
                </span>
              </span>
            </div>

            <h1
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#f87171",
                marginBottom: "0.75rem",
              }}
            >
              Algo salio mal / Something went wrong
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#94a3b8",
                marginBottom: "1.5rem",
              }}
            >
              Un error inesperado impidio que la app se cargara. La informacion
              de abajo ayuda a diagnosticar el problema.
            </p>

            {/* Error details */}
            <div
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "0.5rem",
                padding: "1rem",
                textAlign: "left",
                marginBottom: "1rem",
                overflow: "auto",
                maxHeight: "300px",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#f87171",
                  fontFamily: "monospace",
                  wordBreak: "break-word",
                  margin: 0,
                }}
              >
                <strong>Error:</strong> {error?.message || "Unknown error"}
              </p>
              {error?.stack && (
                <pre
                  style={{
                    fontSize: "0.65rem",
                    color: "#64748b",
                    marginTop: "0.5rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {error.stack}
                </pre>
              )}
              {errorInfo?.componentStack && (
                <pre
                  style={{
                    fontSize: "0.65rem",
                    color: "#475569",
                    marginTop: "0.5rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>

            {/* Reload button */}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.625rem 1.5rem",
                background: "linear-gradient(135deg, #22d3ee, #50C878)",
                color: "#0f172b",
                border: "none",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Recargar App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
