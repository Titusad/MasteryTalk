/**
 * ══════════════════════════════════════════════════════════════
 *  cron-daily-sr.ts — Daily Spaced Repetition dispatcher
 *
 *  POST /cron/daily-sr
 *  - Triggered by pg_cron every day at 9 AM
 *  - Queries sr_cards where next_review_at <= now()
 *  - Generates TTS audio of each phrase (ElevenLabs → OpenAI fallback)
 *  - Uploads audio to Supabase Storage
 *  - Sends WhatsApp message with audio attachment for shadowing
 *  - Creates wa_pending_reviews records to match incoming audio
 * ══════════════════════════════════════════════════════════════
 */
import { Hono } from "npm:hono";
import { getAdminClient } from "../_shared.ts";
import { sendWhatsAppMessage } from "../twilio.ts";

const app = new Hono();

const MAX_CARDS_PER_DAY = 3;
const STORAGE_BUCKET = "wa-tts-audio";

/* ── i18n copy for WhatsApp messages ── */
type WaLang = "es" | "pt" | "en";

const WA_COPY: Record<WaLang, {
  greeting: (name: string) => string;
  weakPoint: (word: string, phonetic?: string) => string;
  withAudio: string;
  withoutAudio: string;
  repeatHint: string;
}> = {
  es: {
    greeting: (name) => `Hola ${name}, aquí está tu práctica de hoy.`,
    weakPoint: (word, phonetic) => `Tu punto débil anterior: "${word}"${phonetic ? ` (${phonetic})` : ""}.`,
    withAudio: "Escucha el audio y repite la frase. Envía tu audio para recibir tu score.",
    withoutAudio: "Envía un audio diciendo esta frase.",
    repeatHint: 'Escribe "repetir" para escuchar de nuevo.',
  },
  pt: {
    greeting: (name) => `Olá ${name}, aqui está sua prática de hoje.`,
    weakPoint: (word, phonetic) => `Seu ponto fraco anterior: "${word}"${phonetic ? ` (${phonetic})` : ""}.`,
    withAudio: "Ouça o áudio e repita a frase. Envie seu áudio para receber seu score.",
    withoutAudio: "Envie um áudio dizendo esta frase.",
    repeatHint: 'Escreva "repetir" para ouvir novamente.',
  },
  en: {
    greeting: (name) => `Hi ${name}, here is your practice for today.`,
    weakPoint: (word, phonetic) => `Your previous weak point: "${word}"${phonetic ? ` (${phonetic})` : ""}.`,
    withAudio: "Listen to the audio and repeat the phrase. Send your audio to get your score.",
    withoutAudio: "Send an audio saying this phrase.",
    repeatHint: 'Type "repeat" to listen again.',
  },
};

function getLangFromMarket(market?: string | null): WaLang {
  if (market === "brazil") return "pt";
  if (market === "mexico" || market === "colombia") return "es";
  return "es"; // default to Spanish
}

/* ── TTS Generation (ElevenLabs primary, OpenAI fallback) ── */
async function generateTTSAudio(phrase: string): Promise<ArrayBuffer | null> {
  // Try ElevenLabs first
  const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
  if (elevenLabsKey) {
    try {
      const res = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/Nhs7eitvQWFTQBsf0yiT",
        {
          method: "POST",
          headers: {
            "xi-api-key": elevenLabsKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text: phrase,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.40,
              similarity_boost: 0.85,
              style: 0.35,
              use_speaker_boost: true,
            },
          }),
        },
      );
      if (res.ok) {
        console.log(`[Cron TTS] ElevenLabs OK — ${phrase.slice(0, 30)}...`);
        return res.arrayBuffer();
      }
      console.warn(`[Cron TTS] ElevenLabs ${res.status}, falling back to OpenAI`);
    } catch (err) {
      console.warn(`[Cron TTS] ElevenLabs error: ${err}, falling back`);
    }
  }

  // Fallback: OpenAI TTS
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    console.error("[Cron TTS] No TTS provider available");
    return null;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "coral",
        input: phrase,
        instructions:
          "You are a confident business executive. Speak at a natural, dynamic pace with energy and conviction. Clear articulation, professional tone.",
        response_format: "mp3",
      }),
    });

    if (res.ok) {
      console.log(`[Cron TTS] OpenAI OK — ${phrase.slice(0, 30)}...`);
      return res.arrayBuffer();
    }
    console.error(`[Cron TTS] OpenAI ${res.status}`);
  } catch (err) {
    console.error(`[Cron TTS] OpenAI error: ${err}`);
  }

  return null;
}

/* ── Upload audio to Supabase Storage and return public URL ── */
async function uploadTTSToStorage(
  supabase: ReturnType<typeof getAdminClient>,
  cardId: string,
  audioBuffer: ArrayBuffer,
): Promise<string | null> {
  const fileName = `sr-${cardId}.mp3`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (error) {
    console.error(`[Cron Storage] Upload failed: ${error.message}`);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/* ── Main cron route ── */
app.post("/make-server-08b8658d/cron/daily-sr", async (c) => {
  // Validate cron secret to prevent unauthorized triggers
  const cronSecret = (globalThis as any).Deno.env.get("CRON_SECRET");
  const incomingSecret = c.req.header("x-cron-secret");
  if (!cronSecret || incomingSecret !== cronSecret) {
    console.warn("[Cron Daily SR] Unauthorized attempt — invalid x-cron-secret");
    return c.json({ error: "Unauthorized" }, 401);
  }

  const startTime = Date.now();
  console.log("[Cron Daily SR] Starting daily SR dispatch...");

  try {
    const supabase = getAdminClient();

    // 1. Find all users with verified WhatsApp and pending SR cards
    const now = new Date().toISOString();

    const { data: dueCards, error: cardsError } = await supabase
      .from("sr_cards")
      .select(`
        id,
        user_id,
        phrase,
        problem_word,
        phonetic,
        interval_step,
        profiles!inner(whatsapp_number, whatsapp_verified, market_focus, stats)
      `)
      .lte("next_review_at", now)
      .lt("interval_step", 4)
      .order("next_review_at", { ascending: true });

    if (cardsError) {
      console.error("[Cron Daily SR] Query error:", cardsError);
      return c.json({ error: "Database query failed" }, 500);
    }

    if (!dueCards || dueCards.length === 0) {
      console.log("[Cron Daily SR] No due cards found.");
      return c.json({ status: "ok", dispatched: 0, users: 0 });
    }

    // 2. Group by user and filter to verified WhatsApp users
    const userCards = new Map<string, Array<typeof dueCards[0]>>();
    for (const card of dueCards) {
      const profile = (card as any).profiles;
      if (!profile?.whatsapp_verified || !profile?.whatsapp_number) continue;

      const userId = card.user_id;
      if (!userCards.has(userId)) {
        userCards.set(userId, []);
      }
      const cards = userCards.get(userId)!;
      if (cards.length < MAX_CARDS_PER_DAY) {
        cards.push(card);
      }
    }

    console.log(`[Cron Daily SR] ${dueCards.length} due cards across ${userCards.size} verified users`);

    // 3. Dispatch messages with TTS audio
    let totalDispatched = 0;
    let totalErrors = 0;

    for (const [userId, cards] of userCards) {
      const whatsappNumber = (cards[0] as any).profiles.whatsapp_number;

      for (const card of cards) {
        try {
          // Generate TTS audio
          const audioBuffer = await generateTTSAudio(card.phrase);
          let audioUrl: string | null = null;

          if (audioBuffer) {
            audioUrl = await uploadTTSToStorage(supabase, card.id, audioBuffer);
          }

          // Resolve user's language and name
          const profile = (card as any).profiles;
          const lang = getLangFromMarket(profile.market_focus);
          const copy = WA_COPY[lang];

          // Get first name from auth.users via admin client
          const { data: authUser } = await supabase.auth.admin.getUserById(userId);
          const firstName = authUser?.user?.user_metadata?.full_name?.split(" ")[0]
            || authUser?.user?.email?.split("@")[0]
            || "there";

          // Build the personalized challenge message
          const problemHint = card.problem_word
            ? `\n${copy.weakPoint(card.problem_word, card.phonetic ?? undefined)}`
            : "";

          const instruction = audioUrl ? copy.withAudio : copy.withoutAudio;

          const message =
            `[MasteryTalk PRO] ${copy.greeting(firstName)}` +
            problemHint +
            `\n\n"${card.phrase}"` +
            `\n\n${instruction}`;

          // Send text message first
          const { messageSid } = await sendWhatsAppMessage({
            to: whatsappNumber,
            body: message,
          });

          // Send audio as a separate message
          if (audioUrl) {
            await sendWhatsAppMessage({
              to: whatsappNumber,
              body: `[Audio] ${card.phrase.slice(0, 50)}...`,
              mediaUrl: audioUrl,
            });
          }

          // Create pending review record
          await supabase.from("wa_pending_reviews").insert({
            user_id: userId,
            sr_card_id: card.id,
            message_sid: messageSid,
            status: "pending",
            sent_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          });

          totalDispatched++;
          console.log(`[Cron Daily SR] ✅ Sent to ${whatsappNumber}: "${card.phrase.slice(0, 40)}..." ${audioUrl ? "(with audio)" : "(text only)"}`);
        } catch (sendErr) {
          totalErrors++;
          console.error(`[Cron Daily SR] ❌ Failed for user ${userId}:`, sendErr);
        }
      }
    }

    // 4. Expire old pending reviews
    const { count: expiredCount } = await supabase
      .from("wa_pending_reviews")
      .update({ status: "expired" })
      .eq("status", "pending")
      .lt("expires_at", now)
      .select("id", { count: "exact", head: true });

    const elapsed = Date.now() - startTime;
    console.log(
      `[Cron Daily SR] Done in ${elapsed}ms | dispatched=${totalDispatched} errors=${totalErrors} expired=${expiredCount ?? 0} users=${userCards.size}`,
    );

    return c.json({
      status: "ok",
      dispatched: totalDispatched,
      errors: totalErrors,
      expired: expiredCount ?? 0,
      users: userCards.size,
      elapsedMs: elapsed,
    });
  } catch (err) {
    console.error("[Cron Daily SR] Fatal error:", err);
    return c.json({ error: "Cron job failed" }, 500);
  }
});

export default app;
