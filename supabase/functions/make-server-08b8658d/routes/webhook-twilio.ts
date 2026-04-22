/**
 * ══════════════════════════════════════════════════════════════
 *  webhook-twilio.ts — WhatsApp incoming message handler
 *
 *  POST /webhook/twilio
 *  - Receives incoming WhatsApp audio from Twilio
 *  - Matches audio to a pending SR card via wa_pending_reviews
 *  - Sends audio to Azure Pronunciation Assessment
 *  - Replies with score and actionable feedback
 *  - Updates SR card interval progression
 *
 *  ⚠️ No auth required — Twilio calls this directly.
 * ══════════════════════════════════════════════════════════════
 */
import { Hono } from "npm:hono";
import { getAdminClient } from "../_shared.ts";
import { sendWhatsAppMessage, downloadTwilioMedia } from "../twilio.ts";

const app = new Hono();

// SR interval steps: 1=24h, 2=3d, 3=7d, 4=14d (graduated/mastered)
const INTERVAL_DAYS = [1, 3, 7, 14];
const PASS_THRESHOLD = 70;

/* ── i18n feedback ── */
type WaLang = "es" | "pt" | "en";

function getLangFromMarket(market?: string | null): WaLang {
  if (market === "brazil") return "pt";
  if (market === "mexico" || market === "colombia") return "es";
  return "es";
}

const FB_COPY: Record<WaLang, {
  sendAudioHint: string;
  noAccount: string;
  noPending: string;
  tooShort: string;
  noRecognition: string;
  mastered: (score: number, acc: number, flu: number) => string;
  passed: (score: number, weak: string, wScore: number, days: number) => string;
  failed: (score: number, weak: string, wScore: number) => string;
}> = {
  es: {
    sendAudioHint: 'Envía un audio pronunciando la frase. Escribe "repetir" para escuchar el audio de nuevo.',
    noAccount: "Este número no está vinculado a ninguna cuenta. Activa WhatsApp desde tu Dashboard en masterytalk.pro",
    noPending: "No tienes ninguna frase pendiente. Recibirás tu próximo ejercicio mañana.",
    tooShort: "El audio es demasiado corto. Intenta grabar la frase completa.",
    noRecognition: "No pudimos reconocer el audio. Graba en un ambiente silencioso.",
    mastered: (s, acc, flu) => `Score: ${s}/100. Frase dominada. Ya no la recibirás.\nAccuracy: ${acc} / Fluency: ${flu}`,
    passed: (s, w, ws, d) => `Score: ${s}/100. Bien.${w && ws < 80 ? ` Punto débil: "${w}" (${ws}).` : ""}\nPróxima revisión en ${d} días.`,
    failed: (s, w, ws) => `Score: ${s}/100.${w ? ` Tu punto débil: "${w}" (${ws}).` : ""}\nEn alta gerencia, la duda genera desconfianza.\nInténtalo una vez más.`,
  },
  pt: {
    sendAudioHint: 'Envie um áudio pronunciando a frase. Escreva "repetir" para ouvir o áudio novamente.',
    noAccount: "Este número não está vinculado a nenhuma conta. Ative o WhatsApp no seu Dashboard em masterytalk.pro",
    noPending: "Você não tem frases pendentes. Receberá seu próximo exercício amanhã.",
    tooShort: "O áudio está muito curto. Tente gravar a frase completa.",
    noRecognition: "Não conseguimos reconhecer o áudio. Grave em um ambiente silencioso.",
    mastered: (s, acc, flu) => `Score: ${s}/100. Frase dominada. Você não a receberá mais.\nAccuracy: ${acc} / Fluency: ${flu}`,
    passed: (s, w, ws, d) => `Score: ${s}/100. Bem.${w && ws < 80 ? ` Ponto fraco: "${w}" (${ws}).` : ""}\nPróxima revisão em ${d} dias.`,
    failed: (s, w, ws) => `Score: ${s}/100.${w ? ` Seu ponto fraco: "${w}" (${ws}).` : ""}\nNa alta gerência, a dúvida gera desconfiança.\nTente mais uma vez.`,
  },
  en: {
    sendAudioHint: 'Send an audio recording of the phrase. Type "repeat" to hear the audio again.',
    noAccount: "This number is not linked to any account. Activate WhatsApp from your Dashboard at masterytalk.pro",
    noPending: "You have no pending phrases. You'll receive your next exercise tomorrow.",
    tooShort: "The audio is too short. Try recording the full phrase.",
    noRecognition: "We couldn't recognize the audio. Record in a quiet environment.",
    mastered: (s, acc, flu) => `Score: ${s}/100. Phrase mastered. You won't receive it again.\nAccuracy: ${acc} / Fluency: ${flu}`,
    passed: (s, w, ws, d) => `Score: ${s}/100. Good.${w && ws < 80 ? ` Weak point: "${w}" (${ws}).` : ""}\nNext review in ${d} days.`,
    failed: (s, w, ws) => `Score: ${s}/100.${w ? ` Your weak point: "${w}" (${ws}).` : ""}\nIn senior management, hesitation erodes trust.\nTry again.`,
  },
};

app.post("/make-server-08b8658d/webhook/twilio", async (c) => {
  try {
    // Twilio sends form-urlencoded data
    const formData = await c.req.parseBody();
    const from = (formData["From"] as string || "").replace("whatsapp:", "");
    const numMedia = parseInt(formData["NumMedia"] as string || "0", 10);
    const body = (formData["Body"] as string || "").trim();

    console.log(`[WA Webhook] Message from ${from} | media=${numMedia} | body="${body.slice(0, 50)}"`);

    // If no audio — check if user is asking to repeat
    if (numMedia === 0) {
      const lowerBody = body.toLowerCase();
      const isRepeat = ["repetir", "repeat", "otra vez", "again", "audio"].some(kw => lowerBody.includes(kw));

      if (isRepeat) {
        // Find their pending review and resend the phrase with audio
        const supabase = getAdminClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("whatsapp_number", from)
          .eq("whatsapp_verified", true)
          .single();

        if (profile) {
          const { data: pendingReview } = await supabase
            .from("wa_pending_reviews")
            .select("sr_card_id, sr_cards(id, phrase, problem_word)")
            .eq("user_id", profile.id)
            .eq("status", "pending")
            .order("sent_at", { ascending: false })
            .limit(1)
            .single();

          if (pendingReview) {
            const card = (pendingReview as any).sr_cards;
            // Check if TTS audio exists in storage
            const { data: urlData } = supabase.storage
              .from("wa-tts-audio")
              .getPublicUrl(`sr-${card.id}.mp3`);

            await sendWhatsAppMessage({
              to: from,
              body: `[MasteryTalk PRO] Escucha y repite:\n\n"${card.phrase}"`,
              mediaUrl: urlData?.publicUrl || undefined,
            });

            return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", 200, {
              "Content-Type": "text/xml",
            });
          }
        }
      }

      await sendWhatsAppMessage({
        to: from,
        body: "[MasteryTalk PRO] Envía un audio pronunciando la frase que te pedimos. Escribe \"repetir\" para volver a escuchar el audio.",
      });
      return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", 200, {
        "Content-Type": "text/xml",
      });
    }

    // Get media URL (first attachment)
    const mediaUrl = formData["MediaUrl0"] as string;
    const mediaType = formData["MediaContentType0"] as string || "audio/ogg";

    if (!mediaUrl) {
      console.warn("[WA Webhook] NumMedia > 0 but no MediaUrl0");
      return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", 200, {
        "Content-Type": "text/xml",
      });
    }

    // 1. Find the pending review for this phone number
    const supabase = getAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, whatsapp_number, whatsapp_verified, market_focus")
      .eq("whatsapp_number", from)
      .eq("whatsapp_verified", true)
      .single();

    const lang = getLangFromMarket(profile?.market_focus);
    const fb = FB_COPY[lang];

    if (!profile) {
      console.warn(`[WA Webhook] No verified profile for ${from}`);
      await sendWhatsAppMessage({
        to: from,
        body: `[MasteryTalk PRO] ${fb.noAccount}`,
      });
      return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", 200, {
        "Content-Type": "text/xml",
      });
    }

    // 2. Find the most recent pending review for this user
    const { data: pendingReview } = await supabase
      .from("wa_pending_reviews")
      .select("id, sr_card_id, sr_cards(phrase, problem_word, phonetic, interval_step)")
      .eq("user_id", profile.id)
      .eq("status", "pending")
      .order("sent_at", { ascending: false })
      .limit(1)
      .single();

    if (!pendingReview) {
      await sendWhatsAppMessage({
        to: from,
        body: `[MasteryTalk PRO] ${fb.noPending}`,
      });
      return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", 200, {
        "Content-Type": "text/xml",
      });
    }

    const card = (pendingReview as any).sr_cards;
    if (!card) {
      console.error(`[WA Webhook] SR card not found for review ${pendingReview.id}`);
      return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", 200, {
        "Content-Type": "text/xml",
      });
    }

    // 3. Download audio from Twilio
    console.log(`[WA Webhook] Downloading audio: ${mediaUrl} (${mediaType})`);
    const audioBuffer = await downloadTwilioMedia(mediaUrl);

    if (audioBuffer.byteLength < 1000) {
      await sendWhatsAppMessage({
        to: from,
        body: `[MasteryTalk PRO] ${fb.tooShort}`,
      });
      return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", 200, {
        "Content-Type": "text/xml",
      });
    }

    // 4. Send to Azure Pronunciation Assessment
    const azureKey = Deno.env.get("AZURE_SPEECH_KEY");
    const azureRegion = Deno.env.get("AZURE_SPEECH_REGION");

    if (!azureKey || !azureRegion) {
      console.error("[WA Webhook] Missing Azure credentials");
      return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", 200, {
        "Content-Type": "text/xml",
      });
    }

    const pronConfig = {
      ReferenceText: card.phrase,
      GradingSystem: "HundredMark",
      Granularity: "Word",
      Dimension: "Comprehensive",
    };
    const pronConfigBytes = new TextEncoder().encode(JSON.stringify(pronConfig));
    let binaryStr = "";
    for (let i = 0; i < pronConfigBytes.length; i++) {
      binaryStr += String.fromCharCode(pronConfigBytes[i]);
    }
    const pronConfigBase64 = btoa(binaryStr);

    // Determine content type for Azure
    let azureContentType = "audio/ogg; codecs=opus";
    if (mediaType.includes("wav")) azureContentType = "audio/wav";
    else if (mediaType.includes("mp4") || mediaType.includes("m4a")) azureContentType = "audio/mp4";

    const azureUrl = `https://${azureRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`;

    const azureRes = await fetch(azureUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": azureKey,
        "Content-Type": azureContentType,
        "Pronunciation-Assessment": pronConfigBase64,
        Accept: "application/json",
      },
      body: audioBuffer,
    });

    if (!azureRes.ok) {
      const errBody = await azureRes.text();
      console.error(`[WA Webhook] Azure error ${azureRes.status}: ${errBody.slice(0, 200)}`);
      await sendWhatsAppMessage({
        to: from,
        body: "[MasteryTalk PRO] No pudimos procesar tu audio. Intenta de nuevo con una grabación más clara.",
      });
      return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", 200, {
        "Content-Type": "text/xml",
      });
    }

    const azureResult = await azureRes.json();
    console.log(`[WA Webhook] Azure result: ${azureResult.RecognitionStatus}`);

    if (azureResult.RecognitionStatus !== "Success") {
      await sendWhatsAppMessage({
        to: from,
        body: `[MasteryTalk PRO] ${fb.noRecognition}`,
      });
      return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", 200, {
        "Content-Type": "text/xml",
      });
    }

    // 5. Extract scores (same strictness curve as main app)
    const STRICTNESS = 1.6;
    const adjust = (raw: number) => Math.round(100 * Math.pow(Math.max(0, Math.min(100, raw)) / 100, STRICTNESS));

    const nBest = azureResult.NBest?.[0];
    const pronAssessment = nBest?.PronunciationAssessment || {};
    const getScore = (field: string) => pronAssessment[field] ?? nBest?.[field] ?? 0;

    const overallScore = adjust(getScore("PronScore"));
    const accuracyScore = adjust(getScore("AccuracyScore"));
    const fluencyScore = adjust(getScore("FluencyScore"));

    // Find the weakest word
    const words = (nBest?.Words || []).map((w: any) => ({
      word: w.Word,
      score: adjust(w.PronunciationAssessment?.AccuracyScore ?? w.AccuracyScore ?? 0),
    }));
    const weakestWord = words.reduce(
      (min: any, w: any) => (w.score < min.score ? w : min),
      { word: "", score: 100 },
    );

    console.log(`[WA Webhook] Scores: overall=${overallScore} accuracy=${accuracyScore} fluency=${fluencyScore} | weakest="${weakestWord.word}" (${weakestWord.score})`);

    // 6. Update SR card progression
    const passed = overallScore >= PASS_THRESHOLD;
    const currentStep = card.interval_step || 1;
    const newStep = passed ? Math.min(currentStep + 1, 4) : Math.max(currentStep - 1, 1);
    const nextReviewDays = INTERVAL_DAYS[newStep - 1];
    const nextReviewAt = new Date(Date.now() + nextReviewDays * 24 * 60 * 60 * 1000).toISOString();

    await supabase
      .from("sr_cards")
      .update({
        interval_step: newStep,
        next_review_at: nextReviewAt,
        last_score: overallScore,
      })
      .eq("id", pendingReview.sr_card_id);

    // 7. Mark pending review as completed
    await supabase
      .from("wa_pending_reviews")
      .update({ status: "completed" })
      .eq("id", pendingReview.id);

    // 8. Build and send feedback message
    let feedbackMsg: string;

    if (passed && newStep >= 4) {
      feedbackMsg = `[MasteryTalk PRO] ${fb.mastered(overallScore, accuracyScore, fluencyScore)}`;
    } else if (passed) {
      feedbackMsg = `[MasteryTalk PRO] ${fb.passed(overallScore, weakestWord.word, weakestWord.score, nextReviewDays)}`;
    } else {
      feedbackMsg = `[MasteryTalk PRO] ${fb.failed(overallScore, weakestWord.word, weakestWord.score)}`;
    }

    await sendWhatsAppMessage({ to: from, body: feedbackMsg });

    console.log(`[WA Webhook] ✅ Processed: user=${profile.id} card=${pendingReview.sr_card_id} score=${overallScore} passed=${passed} newStep=${newStep}`);

    return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", 200, {
      "Content-Type": "text/xml",
    });
  } catch (err) {
    console.error("[WA Webhook] Error:", err);
    return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", 200, {
      "Content-Type": "text/xml",
    });
  }
});

export default app;
