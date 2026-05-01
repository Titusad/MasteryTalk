import { Hono } from "npm:hono";
import { logApiUsage, getAuthUser } from "../_shared.ts";

/* ElevenLabs voice mapping */
const ELEVENLABS_VOICES: Record<string, { voiceId: string; stability: number; similarity: number; style: number }> = {
  coach: {
    voiceId: "Nhs7eitvQWFTQBsf0yiT", // "Sarah" — warm, professional female
    stability: 0.35,      // lower = more expressive/dynamic
    similarity: 0.80,
    style: 0.45,           // higher = more stylistic variation
  },
  user_line: {
    voiceId: "Nhs7eitvQWFTQBsf0yiT", // Same voice for consistency
    stability: 0.40,
    similarity: 0.85,
    style: 0.35,
  },
};

/* ── OpenAI TTS fallback profiles ── */
const TTS_MODEL = "gpt-4o-mini-tts";
const OPENAI_VOICE_PROFILES: Record<string, { voice: string; instructions: string }> = {
  coach: {
    voice: "coral",
    instructions: "You are an enthusiastic and engaging executive English coach. Speak at a brisk, natural conversational pace — the way a sharp, energetic colleague would talk over coffee. Be warm and encouraging with genuine energy in your voice. Vary your intonation naturally: emphasize key words, use rising tones for questions, and let your voice convey real interest and excitement. Do NOT speak slowly or monotonically. Avoid long pauses. Sound like someone who genuinely loves helping people succeed — lively, articulate, and approachable.",
  },
  user_line: {
    voice: "coral",
    instructions: "You are a confident, high-performing business executive delivering lines in a professional setting. Speak at a natural, dynamic pace — not slow or overly deliberate. Project energy and conviction, like someone who is genuinely engaged in the conversation and passionate about their point. Use natural stress patterns and vocal variety. Avoid sounding robotic, flat, or sleepy. Think of a charismatic leader giving a compelling pitch — articulate, direct, and alive with purpose.",
  },
};

const app = new Hono();

app.post("/make-server-08b8658d/tts", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required for TTS" }, 401);
    }

    const { text, role } = await c.req.json();
    if (!text || typeof text !== "string") {
      return c.json({ error: "Missing 'text' field for TTS" }, 400);
    }

    const effectiveRole = role === "user_line" ? "user_line" : "coach";
    const openaiKey = (globalThis as any).Deno.env.get("OPENAI_API_KEY");

    // ━━━ PRIMARY: OpenAI gpt-4o-mini-tts ━━━
    // Used for all dynamic practice content (interlocutor responses, briefing questions, user lines).
    // ElevenLabs is reserved for pre-generated coach narration tracks (stored in R2).
    if (openaiKey) {
      const oaiProfile = OPENAI_VOICE_PROFILES[effectiveRole];
      console.log(`[TTS OpenAI] model=${TTS_MODEL}, voice=${oaiProfile.voice}, role=${effectiveRole}, chars=${text.length}`);

      try {
        const ttsResponse = await fetch(
          "https://api.openai.com/v1/audio/speech",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: TTS_MODEL,
              voice: oaiProfile.voice,
              input: text,
              instructions: oaiProfile.instructions,
              response_format: "mp3",
            }),
          },
        );

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          console.log(`[TTS OpenAI] ✅ Audio generated — voice=${oaiProfile.voice}, size=${audioBuffer.byteLength} bytes`);
          logApiUsage("openai-tts", "/tts", {
            prompt: text.length, completion: 0, total: text.length,
          }, "tts-1").catch(() => {});
          return new Response(audioBuffer, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": String(audioBuffer.byteLength),
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=3600",
            },
          });
        }

        const errBody = await ttsResponse.text();
        console.warn(`[TTS OpenAI] ⚠️ Error ${ttsResponse.status}: ${errBody.slice(0, 200)} — falling back to ElevenLabs`);
      } catch (oaiErr) {
        console.warn(`[TTS OpenAI] ⚠️ Fetch error: ${oaiErr} — falling back to ElevenLabs`);
      }
    }

    // ━━━ FALLBACK: ElevenLabs Streaming ━━━
    const elevenLabsKey = (globalThis as any).Deno.env.get("ELEVENLABS_API_KEY");
    if (!elevenLabsKey) {
      return c.json({ error: "No TTS provider configured (OPENAI_API_KEY and ELEVENLABS_API_KEY both missing)" }, 500);
    }

    const elProfile = ELEVENLABS_VOICES[effectiveRole];
    console.log(`[TTS ElevenLabs Fallback] voice=${elProfile.voiceId}, role=${effectiveRole}, chars=${text.length}`);

    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elProfile.voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: elProfile.stability,
            similarity_boost: elProfile.similarity,
            style: elProfile.style,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!elRes.ok || !elRes.body) {
      const errBody = await elRes.text();
      console.log(`[TTS ElevenLabs Fallback] Error ${elRes.status}: ${errBody}`);
      return c.json({ error: `All TTS providers failed. ElevenLabs: ${elRes.status}` }, 502);
    }

    console.log(`[TTS ElevenLabs Fallback] ✅ Streaming — role=${effectiveRole}`);
    logApiUsage("elevenlabs", "/tts", {
      prompt: text.length, completion: 0, total: text.length,
    }, "elevenlabs").catch(() => {});
    return new Response(elRes.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.log("[TTS Error]", err);
    return c.json({ error: `TTS failed: ${err}` }, 500);
  }
});

export default app;
