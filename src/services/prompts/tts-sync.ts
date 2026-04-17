/**
 * ======================================================================
 *  inFluentia PRO -- TTS Synchronization & Voice Delivery Spec
 *
 *  Production instructions for synchronizing AI text with ElevenLabs
 *  streaming TTS audio. This file serves as:
 *
 *    1. System prompt additions for LLM text optimization (for TTS)
 *    2. Architecture spec for frontend text-voice sync
 *    3. ElevenLabs streaming API integration guide
 *
 *  In the MVP prototype, the typewriter effect simulates this at
 *  ~187 WPM (320ms/word). In production, word timestamps from
 *  ElevenLabs replace the typewriter entirely.
 *
 *  Reference: /docs/SYSTEM_PROMPTS.md (append as section 11)
 * ======================================================================
 */

/* ── Block: TTS-Optimized Text Generation ──
   Appended to the system prompt so the LLM writes text that
   sounds natural when spoken aloud via TTS. */

export const TTS_TEXT_OPTIMIZATION_BLOCK = `=== TTS-OPTIMIZED WRITING (MANDATORY) ===
Your aiMessage will be converted to speech via text-to-speech and played to the user in real time. Write accordingly:

1. SENTENCE LENGTH: Keep sentences between 8-18 words. Sentences over 20 words sound breathless when spoken. Break long ideas into two sentences.
2. PUNCTUATION AS PACING:
   - Use periods for full stops (natural pause ~400ms).
   - Use em-dashes for mid-sentence pauses ("We reviewed the data -- and frankly, it's concerning.").
   - Use commas sparingly; prefer shorter sentences over comma-heavy ones.
   - NEVER use semicolons -- they produce unnatural TTS pacing.
3. CONTRACTIONS: Always use contractions (don't, we'll, I'd, that's). Uncontracted forms sound robotic in speech.
4. AVOID TTS TRAPS:
   - No abbreviations (write "versus" not "vs.", "approximately" not "approx.").
   - No parenthetical asides -- TTS can't convey parenthetical tone.
   - No URLs, email addresses, or alphanumeric codes in the spoken text.
   - Write numbers as words for 1-10, digits for 11+ ("three" not "3", but "15" not "fifteen").
   - Avoid homograph ambiguity: "read" (present vs. past) -- rephrase to be unambiguous.
5. VOCAL TEXTURE: Vary sentence openings. Don't start consecutive sentences the same way.
   Bad: "We need to focus on revenue. We need to hire faster. We need a new strategy."
   Good: "Revenue is the priority. Hiring needs to accelerate. And your team needs a fresh strategy."
6. EMPHASIS MARKERS (optional, for ElevenLabs SSML-like control):
   - Wrap a word in *asterisks* to signal emphasis: "This is *exactly* what we discussed."
   - The TTS integration layer will convert these to prosody emphasis.
   - Use sparingly -- maximum one emphasis per sentence.`;

/* ── Architecture: Streaming TTS + Word-Level Sync ──
   Implementation spec for the Edge Function + frontend. */

export const TTS_SYNC_ARCHITECTURE = {
  /**
   * PRODUCTION FLOW:
   *
   * 1. User speaks -> Whisper transcription (already implemented)
   * 2. Transcribed text -> GPT-4o conversation turn
   * 3. GPT-4o returns { aiMessage, isComplete, internalAnalysis }
   * 4. aiMessage -> ElevenLabs Streaming TTS API
   * 5. Edge Function streams audio chunks + word timestamps to client
   * 6. Frontend plays audio and reveals text word-by-word in sync
   *
   * Key: Steps 4-6 happen in parallel via server-sent events (SSE)
   * or WebSocket. The user hears audio AND sees text simultaneously.
   */

  elevenlabs: {
    /** Use the streaming endpoint with word-level timestamps */
    endpoint: "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream",
    method: "POST",

    /** Request body structure */
    requestBody: {
      text: "{{aiMessage}}",
      model_id: "eleven_turbo_v2_5", // Lowest latency model
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
      /** Enable word-level timestamps in the response */
      output_format: "mp3_44100_128",

      /**
       * CRITICAL: Request alignment data for word-level sync.
       * ElevenLabs returns character-level timestamps that we
       * map to word boundaries for text reveal.
       *
       * Use the /with-timestamps variant:
       * POST /v1/text-to-speech/{voice_id}/stream/with-timestamps
       *
       * Response is a stream of JSON chunks:
       * { audio_base64: "...", alignment: { chars: [...], charStartTimesMs: [...], charDurationsMs: [...] } }
       */
      with_timestamps: true,
    },

    /** Latency budget */
    targetFirstByteMs: 300,  // ElevenLabs Turbo v2.5 typically < 300ms
    maxAcceptableLatencyMs: 800,
  },

  frontend: {
    /**
     * WORD-LEVEL TEXT REVEAL
     *
     * Instead of the prototype's setInterval typewriter, production
     * uses timestamps from ElevenLabs alignment data:
     *
     * 1. Parse alignment.charStartTimesMs to find word boundaries
     *    (split on spaces in the original text)
     * 2. For each word, calculate its start time from the audio
     * 3. Use requestAnimationFrame loop:
     *    - currentTime = audioElement.currentTime * 1000
     *    - revealedWords = words where startTimeMs <= currentTime
     * 4. Update React state with revealed word count
     *
     * This gives perfect lip-sync between audio and text display.
     */

    /** If alignment data fails, fall back to estimated timing */
    fallbackWpmEstimate: 155,
    fallbackMsPerWord: 387, // 60000 / 155

    /**
     * VISUAL STATES during AI response:
     *
     * 1. LOADING (isAiTyping = true):
     *    - Show waveform bars animation
     *    - Duration: from API call start to first audio byte
     *
     * 2. SPEAKING (isAiSpeaking = true):
     *    - Play audio
     *    - Reveal text word-by-word via alignment timestamps
     *    - Show subtle waveform visualization synced to audio amplitude
     *
     * 3. COMPLETE (message fully revealed):
     *    - Show "Listen again" button
     *    - Show "Try saying..." coaching hint
     */

    /** Audio playback settings */
    audioPlayback: {
      /** Pre-buffer before starting playback (smoother start) */
      preBufferMs: 150,
      /** Fade-in duration to avoid audio pop */
      fadeInMs: 50,
      /** Fade-out duration at end */
      fadeOutMs: 100,
    },
  },

  /**
   * EDGE FUNCTION: Supabase Edge Function spec
   *
   * Endpoint: POST /functions/v1/conversation-turn
   *
   * Request:  { sessionId, userText }
   * Response: SSE stream with events:
   *   - event: turn_start    { aiMessage, isComplete }
   *   - event: audio_chunk   { base64Audio, alignment }
   *   - event: turn_end      { internalAnalysis }
   *
   * The frontend processes these events as they arrive:
   *   turn_start  -> add AI message bubble, start loading state
   *   audio_chunk -> buffer audio, extract word timestamps
   *   turn_end    -> store coaching data, check isComplete
   */
  edgeFunction: {
    path: "/functions/v1/conversation-turn",
    responseFormat: "sse",
    events: ["turn_start", "audio_chunk", "turn_end"] as const,
  },
} as const;

/* ── Helper: Convert ElevenLabs char-level alignment to word boundaries ── */

export interface WordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
}

/**
 * Converts ElevenLabs character-level alignment data into word-level
 * timestamps for the text reveal system.
 *
 * @param text - The original aiMessage text
 * @param charStartTimesMs - Array of start times per character
 * @param charDurationsMs - Array of durations per character
 * @returns Array of word timestamps
 *
 * NOTE: This is a production-ready utility. In the prototype,
 * we use the fixed-interval typewriter instead.
 */
export function charAlignmentToWordTimestamps(
  text: string,
  charStartTimesMs: number[],
  charDurationsMs: number[],
): WordTimestamp[] {
  const words: WordTimestamp[] = [];
  let wordStart = 0;

  for (let i = 0; i <= text.length; i++) {
    const isEnd = i === text.length || text[i] === " ";
    if (isEnd && i > wordStart) {
      const word = text.slice(wordStart, i);
      const startMs = charStartTimesMs[wordStart] ?? 0;
      const lastCharIdx = i - 1;
      const endMs =
        (charStartTimesMs[lastCharIdx] ?? 0) +
        (charDurationsMs[lastCharIdx] ?? 0);
      words.push({ word, startMs, endMs });
      wordStart = i + 1;
    } else if (text[i] === " ") {
      wordStart = i + 1;
    }
  }

  return words;
}

/**
 * Prototype-mode estimation: generates synthetic word timestamps
 * at a fixed WPM rate. Used when ElevenLabs is not connected.
 */
export function estimateWordTimestamps(
  text: string,
  wpm: number = 155,
): WordTimestamp[] {
  const msPerWord = 60_000 / wpm;
  const words = text.split(/\s+/).filter(Boolean);
  return words.map((word, i) => ({
    word,
    startMs: Math.round(i * msPerWord),
    endMs: Math.round((i + 1) * msPerWord),
  }));
}
