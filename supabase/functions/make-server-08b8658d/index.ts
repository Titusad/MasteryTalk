/**
 * Edge Function: make-server-08b8658d
 *
 * Thin orchestrator — all business logic lives in route modules.
 * This file handles only: middleware setup + route mounting.
 */
import { Hono } from "npm:hono";
import { logger } from "npm:hono/logger";

// Route modules
import auth from "./routes/auth.ts";
import sessions from "./routes/sessions.ts";
import conversation from "./routes/conversation.ts";
import speech from "./routes/speech.ts";
import tts from "./routes/tts.ts";
import feedback from "./routes/feedback.ts";
import pronunciation from "./routes/pronunciation.ts";
import vocab from "./routes/vocab.ts";
import admin from "./routes/admin.ts";
import progression from "./routes/progression.ts";
import webhook from "./routes/webhook.ts";
import checkout from "./routes/checkout.ts";
import { createRateLimiter } from "./kv_store.ts";
import { getAuthUser } from "./_shared.ts";

// Rate limiter: 20 requests burst, refill 0.5/sec (~30 req/min sustained)
const apiLimiter = createRateLimiter({ maxTokens: 20, refillPerSecond: 0.5 });
// Prune stale buckets every 5 minutes
setInterval(() => apiLimiter.prune(), 5 * 60 * 1000);

const ALLOWED_ORIGINS = [
  "https://masterytalk.pro",
  "https://www.masterytalk.pro",
  "http://localhost:5173",   // Vite dev
  "http://localhost:4173",   // Vite preview
  "http://localhost:3000",
];

function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0]; // fallback to primary domain

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, apikey, x-client-info",
    "Access-Control-Max-Age": "86400",
  };
}

const app = new Hono();

// ── Global error handler ──
app.onError((err, c) => {
  console.error("[Hono] Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// ── Middleware ──
app.use("*", logger(console.log));

// Inject CORS headers on every response (dynamic origin)
app.use("/*", async (c: any, next: any) => {
  await next();
  const corsHeaders = getCorsHeaders(c.req.header("Origin") || null);
  Object.entries(corsHeaders).forEach(([k, v]) => c.res.headers.set(k, v));
});

// ── Rate limiting middleware for API-consuming routes ──
const RATE_LIMITED_PREFIXES = [
  "/make-server-08b8658d/prepare-session",
  "/make-server-08b8658d/process-turn",
  "/make-server-08b8658d/transcribe",
  "/make-server-08b8658d/generate-script",
  "/make-server-08b8658d/generate-preparation-toolkit",
  "/make-server-08b8658d/generate-interview-briefing",
  "/make-server-08b8658d/tts",
  "/make-server-08b8658d/analyze-feedback",
  "/make-server-08b8658d/analyze-cv-match",
  "/make-server-08b8658d/generate-summary",
  "/make-server-08b8658d/create-checkout",
];

app.use("/*", async (c: any, next: any) => {
  const path = new URL(c.req.url).pathname;
  const isRateLimited = RATE_LIMITED_PREFIXES.some(p => path.endsWith(p));
  if (isRateLimited) {
    const user = await getAuthUser(c.req.header("Authorization"));
    const key = user?.id || c.req.header("x-forwarded-for") || "unknown";
    if (!apiLimiter.allow(key)) {
      return c.json({ error: "Too many requests. Please wait a moment." }, 429);
    }
  }
  await next();
});

// ── Mount all routes ──
app.route("", auth);
app.route("", sessions);
app.route("", conversation);
app.route("", speech);
app.route("", tts);
app.route("", feedback);
app.route("", pronunciation);
app.route("", vocab);
app.route("", admin);
app.route("", progression);
app.route("", webhook);
app.route("", checkout);

// ── Start server — intercept OPTIONS before Hono ──
Deno.serve({
  onError(err) {
    const msg = String(err);
    if (msg.includes("connection closed") || msg.includes("broken pipe")) {
      console.log(`[Deno.serve] Client disconnected (non-fatal): ${msg.slice(0, 120)}`);
      return new Response("Client disconnected", { status: 499 });
    }
    console.log(`[Deno.serve] Transport error: ${msg}`);
    return new Response("Internal Server Error", { status: 500 });
  },
}, (req: Request) => {
  // Handle CORS preflight at the transport layer, before Hono
  if (req.method === "OPTIONS") {
    const corsHeaders = getCorsHeaders(req.headers.get("Origin"));
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return app.fetch(req);
});
