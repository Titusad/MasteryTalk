/**
 * ══════════════════════════════════════════════════════════════
 *  waitlist.ts — Stage 1 lead capture (PRODUCT_SPEC §6.4, §9.2)
 *
 *  POST /waitlist   (public, rate-limited, honeypot)
 *
 *  Body: { email, name?, wantsEbook?, video?, utm?, website? }
 *    website — honeypot field; real users never fill it.
 *
 *  What it does, in order:
 *    1. Validates the input.
 *    2. Stores the lead in KV (`waitlist:<email>`) — backup so a lead
 *       is never lost if Loops is down or misconfigured.
 *    3. Upserts the contact in Loops (PUT /contacts/update) with
 *       source/userGroup so the English lifecycle loops can exclude it.
 *    4. Fires the Loops event that triggers the Spanish delivery email:
 *         workbook_requested  → workbook form
 *         waitlist_joined     → e-book + waitlist form
 *
 *  The workbook link sent by email is resolved here from an allow-list,
 *  never taken from the request.
 * ══════════════════════════════════════════════════════════════
 */
import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";

const app = new Hono();
const LOOPS_BASE = "https://app.loops.so/api/v1";

const SITE_URL = "https://masterytalk.pro";
const LOOPS_SOURCE = "youtube-waitlist";
const LOOPS_USER_GROUP = "waitlist-es";

/** Video number → public workbook path. Add one entry per published video. */
const WORKBOOKS: Record<string, string> = {
  "1": "/workbooks/video-01-workbook.pdf",
};
const DEFAULT_VIDEO = "1";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

interface LoopsResult {
  ok: boolean;
  status: number;
}

async function loopsRequest(
  method: "PUT" | "POST",
  path: string,
  body: unknown,
  idempotencyKey?: string,
): Promise<LoopsResult> {
  const key = Deno.env.get("LOOPS_API_KEY");
  if (!key) {
    console.error("[Waitlist] LOOPS_API_KEY not set — lead kept in KV only");
    return { ok: false, status: 0 };
  }
  try {
    const res = await fetch(`${LOOPS_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("[Waitlist] Loops", method, path, res.status, await res.text());
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error("[Waitlist] Loops request failed:", err);
    return { ok: false, status: 0 };
  }
}

/** SHA-256 hex (64 chars) — fits Loops' 100-char Idempotency-Key limit. */
async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function cleanString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

app.post("/make-server-08b8658d/waitlist", async (c: any) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return c.json({ error: "Invalid body" }, 400);
    }

    // Honeypot: pretend success so bots learn nothing.
    if (cleanString(body.website, 200)) {
      return c.json({ status: "queued" });
    }

    const email = cleanString(body.email, 254).toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return c.json({ error: "Valid email required" }, 400);
    }

    const name = cleanString(body.name, 100);
    const wantsEbook = body.wantsEbook === true;
    const requestedVideo = cleanString(body.video, 3);
    const video = requestedVideo in WORKBOOKS ? requestedVideo : DEFAULT_VIDEO;
    const workbookUrl = `${SITE_URL}${WORKBOOKS[video]}`;

    const utm: Record<string, string> = {};
    const rawUtm = body.utm && typeof body.utm === "object" ? body.utm : {};
    for (const k of UTM_KEYS) {
      const v = cleanString(rawUtm[k], 100);
      if (v) utm[k] = v;
    }

    const eventName = wantsEbook ? "waitlist_joined" : "workbook_requested";
    const now = new Date().toISOString();

    // 1) KV backup — never lose a lead.
    try {
      const previous = await kv.get(`waitlist:${email}`);
      const prev = previous
        ? (typeof previous === "string" ? JSON.parse(previous) : previous)
        : null;
      await kv.set(`waitlist:${email}`, {
        email,
        name: name || prev?.name || "",
        wantsEbook: wantsEbook || prev?.wantsEbook === true,
        videos: Array.from(new Set([...(prev?.videos ?? []), video])),
        utm: Object.keys(utm).length ? utm : (prev?.utm ?? {}),
        createdAt: prev?.createdAt ?? now,
        updatedAt: now,
      });
    } catch (err) {
      console.error("[Waitlist] KV backup failed:", err);
    }

    // 2) Loops contact (upsert). Only built-in fields (no custom properties,
    //    which would have to exist in Loops first): e-book interest and the
    //    video are carried by the event below, and filterable there.
    const contact = await loopsRequest("PUT", "/contacts/update", {
      email,
      ...(name ? { firstName: name } : {}),
      source: LOOPS_SOURCE,
      userGroup: LOOPS_USER_GROUP,
    });

    // 3) Event → triggers the Spanish delivery loop. Idempotency-Key makes a
    //    double click (same email + event + video + day) send only once.
    const day = now.slice(0, 10);
    const idempotencyKey = await sha256Hex(`${eventName}:${email}:${video}:${day}`);
    const event = await loopsRequest(
      "POST",
      "/events/send",
      {
        email,
        eventName,
        eventProperties: { video, workbookUrl, ...utm },
      },
      idempotencyKey,
    );

    if (!contact.ok || !event.ok) {
      // The lead is safe in KV; tell the page so it does not promise an email.
      return c.json({ status: "stored", email_sent: false }, 502);
    }

    return c.json({ status: "queued", email_sent: true });
  } catch (err) {
    console.error("[Waitlist] Error:", err);
    return c.json({ error: "internal" }, 500);
  }
});

export default app;
