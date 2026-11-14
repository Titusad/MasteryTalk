/**
 * ══════════════════════════════════════════════════════════════
 *  library.ts — Stage 1 workbooks, library and accounts
 *  (PRODUCT_SPEC §6.5, §10.1)
 *
 *  POST /workbook-download      public  — count a direct download
 *  POST /library/access-link    public  — email a Spanish magic link
 *  GET  /library                JWT     — published catalog + user flags
 *  GET  /library/ebook          JWT     — signed URL (10 min), private bucket
 *  POST /library/tool-interest  JWT     — explicit tool-waitlist action
 *
 *  Creating an account does NOT mean interest in the tool: that is the
 *  separate explicit action `tool-interest` (§6.5.1).
 * ══════════════════════════════════════════════════════════════
 */
import { Hono } from "npm:hono";
import * as kv from "../kv_store.ts";
import { getAdminClient, getAuthUser } from "../_shared.ts";
import { sendEmail } from "../email.ts";
import { libraryAccessEmailHtml } from "../email-templates.ts";
import { loopsFetch } from "./marketing.ts";

const app = new Hono();

const SITE_URL = "https://masterytalk.pro";
const ACCESS_REDIRECT = `${SITE_URL}/#biblioteca`;
const LOOPS_SOURCE = "youtube-waitlist";
const LOOPS_USER_GROUP = "waitlist-es";
const WAITLIST_ORIGIN = "waitlist-es";
const EBOOK_BUCKET = "ebook";
const EBOOK_SIGNED_TTL_SECONDS = 600;
const NEW_ACCOUNT_WINDOW_MS = 10 * 60 * 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

/* ── Catalog (§6.5.3) — one entry per published item ── */

export interface LibraryEntry {
  id: string;
  kind: "workbook" | "ebook";
  /** Video number (workbooks only). */
  video?: number;
  title: string;
  framework?: string;
  /** Public path under /public (workbooks) or object name in the private bucket (e-book). */
  file: string;
  /** Link to the YouTube video, when known. */
  youtubeUrl?: string;
  published: boolean;
}

const LIBRARY: LibraryEntry[] = [
  {
    id: "workbook-01",
    kind: "workbook",
    video: 1,
    title: "The Three-Move Introduction",
    framework: "Presentarte en tres movimientos",
    file: "/workbooks/video-01-workbook.pdf",
    published: true,
  },
  {
    id: "ebook",
    kind: "ebook",
    title: "E-book MasteryTalk",
    file: "ebook.pdf",
    // Flip to true when the e-book exists in the private bucket (after Video 2).
    published: false,
  },
];

/** Published workbook for a video number (string or number), or undefined. */
export function workbookEntry(video: unknown): LibraryEntry | undefined {
  const n = Number(video);
  if (!Number.isInteger(n)) return undefined;
  return LIBRARY.find((e) => e.published && e.kind === "workbook" && e.video === n);
}

/* ── Helpers ── */

function cleanString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanUtm(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  for (const k of UTM_KEYS) {
    const v = cleanString(src[k], 100);
    if (v) out[k] = v;
  }
  return out;
}

function monthKey(d = new Date()): string {
  return d.toISOString().slice(0, 7);
}

/** Approximate counter (KV has no atomic increment) — §6.5.7. */
async function bumpDownloadStats(statKey: string, campaign: string): Promise<void> {
  const raw = await kv.get(statKey);
  const stats = raw && typeof raw === "object"
    ? raw as { total?: number; byCampaign?: Record<string, number> }
    : {};
  const byCampaign = { ...(stats.byCampaign ?? {}) };
  byCampaign[campaign] = (byCampaign[campaign] ?? 0) + 1;
  await kv.set(statKey, { total: (stats.total ?? 0) + 1, byCampaign });
}

async function upsertWaitlistRecord(email: string, patch: Record<string, unknown>): Promise<void> {
  const now = new Date().toISOString();
  const previous = await kv.get(`waitlist:${email}`);
  const prev = previous
    ? (typeof previous === "string" ? JSON.parse(previous) : previous)
    : null;
  await kv.set(`waitlist:${email}`, {
    ...(prev ?? {}),
    email,
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
    ...patch,
  });
}

/* ── POST /workbook-download (public) ── */

app.post("/make-server-08b8658d/workbook-download", async (c: any) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") return c.json({ error: "Invalid body" }, 400);

    const entry = workbookEntry(body.video);
    if (!entry) return c.json({ error: "Unknown workbook" }, 400);

    const utm = cleanUtm(body.utm);
    const campaign = utm.utm_campaign ?? "direct";
    await bumpDownloadStats(`stats:workbook:${entry.video}:${monthKey()}`, campaign);
    return c.json({ status: "counted" });
  } catch (err) {
    console.error("[Library] workbook-download error:", err);
    return c.json({ error: "internal" }, 500);
  }
});

/* ── POST /library/access-link (public) ── */

app.post("/make-server-08b8658d/library/access-link", async (c: any) => {
  // Identical response for every valid email — no account enumeration.
  const accepted = { status: "queued" };
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") return c.json({ error: "Invalid body" }, 400);

    // Honeypot: pretend success so bots learn nothing.
    if (cleanString(body.website, 200)) return c.json(accepted);

    const email = cleanString(body.email, 254).toLowerCase();
    if (!EMAIL_RE.test(email)) return c.json({ error: "Valid email required" }, 400);

    const name = cleanString(body.name, 100);
    const utm = cleanUtm(body.utm);
    const supabase = getAdminClient();

    // generateLink creates the auth user when it does not exist yet.
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: ACCESS_REDIRECT },
    });
    if (error || !data?.properties?.action_link) {
      console.error("[Library] generateLink failed:", error?.message);
      return c.json({ error: "Could not create the access link" }, 502);
    }

    // Tag a brand-new account right away (the DB trigger already created the row).
    // Existing accounts — beta users, admin — are never modified.
    const createdMs = data.user?.created_at ? Date.parse(data.user.created_at) : NaN;
    if (data.user?.id && Number.isFinite(createdMs) && Date.now() - createdMs < NEW_ACCOUNT_WINDOW_MS) {
      const { error: originError } = await supabase
        .from("profiles")
        .update({ origin: WAITLIST_ORIGIN })
        .eq("id", data.user.id)
        .is("origin", null);
      if (originError) console.error("[Library] Failed to set origin:", originError);
    }

    try {
      await upsertWaitlistRecord(email, {
        name: name || undefined,
        utm: Object.keys(utm).length ? utm : undefined,
        libraryAccessRequestedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[Library] KV backup failed:", err);
    }

    // Same segmentation as §9.2 so English lifecycle flows keep excluding these contacts.
    loopsFetch("/contacts/update", {
      email,
      ...(name ? { firstName: name } : {}),
      source: LOOPS_SOURCE,
      userGroup: LOOPS_USER_GROUP,
    }).catch((err: unknown) => console.error("[Library] Loops upsert failed:", err));

    const sent = await sendEmail({
      to: email,
      subject: "Tu acceso a la biblioteca de MasteryTalk",
      html: libraryAccessEmailHtml(data.properties.action_link),
    });
    if (!sent) return c.json({ error: "Could not send the email" }, 502);

    return c.json(accepted);
  } catch (err) {
    console.error("[Library] access-link error:", err);
    return c.json({ error: "internal" }, 500);
  }
});

/* ── GET /library (JWT) ── */

app.get("/make-server-08b8658d/library", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { data: profile } = await getAdminClient()
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const ebook = LIBRARY.find((e) => e.kind === "ebook");
    const items = LIBRARY
      .filter((e) => e.published && e.kind === "workbook")
      .map(({ id, video, title, framework, file, youtubeUrl }) => ({
        id,
        video,
        title,
        framework: framework ?? null,
        file,
        youtubeUrl: youtubeUrl ?? null,
      }));

    return c.json({
      workbooks: items,
      ebookAvailable: ebook?.published === true,
      toolInterest: !!profile?.tool_interest_at,
    });
  } catch (err) {
    console.error("[Library] GET /library error:", err);
    return c.json({ error: "internal" }, 500);
  }
});

/* ── GET /library/ebook (JWT) ── */

app.get("/make-server-08b8658d/library/ebook", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const ebook = LIBRARY.find((e) => e.kind === "ebook");
    if (!ebook?.published) return c.json({ error: "E-book not available yet" }, 404);

    const { data, error } = await getAdminClient()
      .storage.from(EBOOK_BUCKET)
      .createSignedUrl(ebook.file, EBOOK_SIGNED_TTL_SECONDS);
    if (error || !data?.signedUrl) {
      console.error("[Library] signed URL failed:", error?.message);
      return c.json({ error: "E-book unavailable" }, 502);
    }

    bumpDownloadStats(`stats:ebook:${monthKey()}`, "library").catch((err) =>
      console.error("[Library] ebook counter failed:", err)
    );

    return c.json({ url: data.signedUrl, expiresIn: EBOOK_SIGNED_TTL_SECONDS });
  } catch (err) {
    console.error("[Library] GET /library/ebook error:", err);
    return c.json({ error: "internal" }, 500);
  }
});

/* ── POST /library/tool-interest (JWT) ── */

app.post("/make-server-08b8658d/library/tool-interest", async (c: any) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user || !user.email) return c.json({ error: "Unauthorized" }, 401);

    const now = new Date().toISOString();
    const supabase = getAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profile?.tool_interest_at) return c.json({ status: "already" });

    const { error } = await supabase
      .from("profiles")
      .update({ tool_interest_at: now })
      .eq("id", user.id);
    if (error) {
      console.error("[Library] Failed to set tool_interest_at:", error);
      return c.json({ error: "Could not save" }, 500);
    }

    const email = user.email.toLowerCase();
    try {
      await upsertWaitlistRecord(email, { toolInterest: true, toolInterestAt: now });
    } catch (err) {
      console.error("[Library] KV backup failed:", err);
    }

    loopsFetch("/events/send", {
      email,
      eventName: "tool_interest",
      eventProperties: { source: LOOPS_SOURCE },
    }).catch((err: unknown) => console.error("[Library] Loops event failed:", err));

    return c.json({ status: "saved" });
  } catch (err) {
    console.error("[Library] tool-interest error:", err);
    return c.json({ error: "internal" }, 500);
  }
});

export default app;
