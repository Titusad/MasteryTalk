/**
 * ══════════════════════════════════════════════════════════════
 *  SupabaseSpeechService — Real STT via Whisper + TTS via ElevenLabs
 *
 *  transcribeBlob: Sends audio Blob to /transcribe endpoint
 *  speak: Sends text to /tts endpoint, plays audio
 *
 *  Note: The ISpeechService.transcribe() interface takes audioDurationMs
 *  (mock pattern). For real usage, the component calls transcribeBlob()
 *  directly with the recorded audio Blob.
 * ══════════════════════════════════════════════════════════════
 */
import type { ISpeechService } from "@/services/interfaces";
import type {
    TranscriptionResult,
    PronunciationResult,
    ShadowingPhrase,
    AzurePronunciationAssessment,
} from "@/services/types";
import { SpeechError } from "@/services/errors";
import { projectId, publicAnonKey } from "../../../../utils/supabase/info";
import { getAuthToken } from "@/services/supabase";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d`;

/* ─── WAV Conversion Utility ───
   Azure Pronunciation Assessment REST API works most reliably with
   PCM WAV audio. Browser MediaRecorder produces WebM/Opus which Azure
   sometimes rejects or fails to assess. This converts any audio Blob
   to 16kHz mono 16-bit PCM WAV using the Web Audio API.
   ─────────────────────────────────────────────────────────────── */

async function convertBlobToWav(blob: Blob): Promise<Blob> {
    try {
        const arrayBuffer = await blob.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        // Resample to 16kHz mono for Azure
        const targetSampleRate = 16000;
        const offlineCtx = new OfflineAudioContext(1, audioBuffer.duration * targetSampleRate, targetSampleRate);
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start(0);

        const renderedBuffer = await offlineCtx.startRendering();
        const pcmData = renderedBuffer.getChannelData(0);

        // Encode as 16-bit PCM WAV
        const wavBuffer = encodeWav(pcmData, targetSampleRate);

        await audioCtx.close();

        console.log(`[WAV Convert] Converted ${blob.size} bytes (${blob.type}) → ${wavBuffer.byteLength} bytes WAV (16kHz mono PCM)`);

        return new Blob([wavBuffer], { type: "audio/wav" });
    } catch (err) {
        console.warn("[WAV Convert] Conversion failed, falling back to original blob:", err);
        return blob; // Fallback: send original
    }
}

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const numChannels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = samples.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, "WAVE");

    // fmt chunk
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data chunk
    writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // Write PCM samples (float32 → int16)
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return buffer;
}

function writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}

export class SupabaseSpeechService implements ISpeechService {
    /**
     * Transcribe an audio Blob via the server's Whisper endpoint.
     * This is the primary method — called directly from VoicePractice.
     */
    async transcribeBlob(audioBlob: Blob, language: string = "en"): Promise<TranscriptionResult> {
        // Whisper handles WebM/Opus natively — no WAV conversion needed (saves ~500ms)
        const formData = new FormData();
        const ext = audioBlob.type.includes("mp4") ? "mp4" : audioBlob.type.includes("wav") ? "wav" : "webm";
        formData.append("audio", audioBlob, `recording.${ext}`);
        formData.append("language", language);

        console.log(
            `[SupabaseSpeech] Sending ${audioBlob.size} bytes (${audioBlob.type}) to Whisper`
        );

        const res = await fetch(`${BASE_URL}/transcribe`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${publicAnonKey}`,
            },
            body: formData,
        });

        if (!res.ok) {
            const errBody = await res.text();
            console.error(`[SupabaseSpeech] Whisper error ${res.status}:`, errBody);
            throw new SpeechError("STT_NETWORK_ERROR");
        }

        const data = await res.json();
        console.log(
            `[SupabaseSpeech] ✅ Transcription: "${data.text?.slice(0, 80)}..." | duration=${data.duration}s`
        );

        return {
            text: data.text || "",
            confidence: data.confidence || 0.95,
        };
    }

    /**
     * ISpeechService.transcribe() — Interface compatibility.
     * In real mode, this should not be called directly; use transcribeBlob().
     * Falls back to returning a placeholder.
     */
    async transcribe(_audioDurationMs: number): Promise<TranscriptionResult> {
        console.warn(
            "[SupabaseSpeech] transcribe(duration) called — use transcribeBlob() instead for real recordings"
        );
        return { text: "", confidence: 0 };
    }

    /**
     * Play text as speech via ElevenLabs TTS endpoint.
     * Returns a stop function and estimated duration.
     */
    async speak(
        text: string
    ): Promise<{ stop: () => void; duration: number }> {
        const res = await fetch(`${BASE_URL}/tts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ text, role: "coach" }),
        });

        if (!res.ok) {
            const errBody = await res.text();
            console.error(`[SupabaseSpeech] TTS error ${res.status}:`, errBody);
            throw new SpeechError("TTS_NETWORK_ERROR");
        }

        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);

        const duration = text.length * 65; // rough estimate: ~65ms per char

        const playPromise = audio.play();

        return {
            stop: () => {
                audio.pause();
                audio.currentTime = 0;
                URL.revokeObjectURL(audioUrl);
            },
            duration,
        };
    }

    /**
     * Play AI response via TTS and return a Promise that resolves when done.
     * Used by VoicePractice for AI message narration.
     */
    async speakAndWait(text: string): Promise<void> {
        const res = await fetch(`${BASE_URL}/tts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ text, role: "coach" }),
        });

        if (!res.ok) {
            console.error(`[SupabaseSpeech] TTS error: ${res.status}`);
            return; // Don't block conversation on TTS failure
        }

        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);

        return new Promise<void>((resolve) => {
            const audio = new Audio(audioUrl);
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
            };
            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                resolve(); // Don't block on error
            };
            audio.play().catch(() => resolve());
        });
    }

    /**
     * Assess pronunciation of an audio blob via Azure Speech Services.
     * Called in background (parallel to Whisper STT) — does NOT block conversation.
     * Requires the Whisper transcription as referenceText for comparison.
     *
     * Returns null if assessment fails (non-blocking — conversation continues).
     */
    async assessPronunciation(
        audioBlob: Blob,
        referenceText: string
    ): Promise<AzurePronunciationAssessment | null> {
        try {
            if (!referenceText || referenceText.trim().length < 2) {
                console.log("[SupabaseSpeech] Skipping pronunciation assessment — no reference text");
                return null;
            }

            // Convert audio to WAV (PCM 16kHz mono) for reliable Azure compatibility
            // Azure Pronunciation Assessment REST API has known issues with WebM/Opus
            console.log(`%c[SupabaseSpeech] 🔄 Converting ${audioBlob.size} bytes (${audioBlob.type}) to WAV for Azure...`, 'color: #6366f1; font-weight: bold');
            const wavBlob = await convertBlobToWav(audioBlob);

            const formData = new FormData();
            const isWav = wavBlob.type === "audio/wav";
            formData.append("audio", wavBlob, isWav ? "recording.wav" : "recording.webm");
            formData.append("referenceText", referenceText.trim());

            console.log(
                `%c[SupabaseSpeech] 📤 Sending ${wavBlob.size} bytes (${wavBlob.type}) to Azure Pronunciation Assessment | ref="${referenceText.slice(0, 60)}..."`, 'color: #f59e0b; font-weight: bold'
            );

            let authHeader: string;
            try {
                authHeader = `Bearer ${await getAuthToken()}`;
            } catch {
                authHeader = `Bearer ${publicAnonKey}`;
            }

            const res = await fetch(`${BASE_URL}/pronunciation-assess`, {
                method: "POST",
                headers: {
                    Authorization: authHeader,
                    apikey: publicAnonKey,
                },
                body: formData,
            });

            if (!res.ok) {
                const errBody = await res.text();
                console.warn(
                    `%c[SupabaseSpeech] ❌ Azure pronunciation error ${res.status}: ${errBody.slice(0, 200)}`, 'color: #ef4444; font-weight: bold'
                );
                return null; // Non-blocking — don't crash conversation
            }

            const data = await res.json();

            // Check if response contains an error field (server may return 200 with error body)
            if (data.error) {
                console.warn(`[SupabaseSpeech] Azure pronunciation returned error:`, data.error);
                return null;
            }

            const result: AzurePronunciationAssessment = data;
            console.log(
                `%c[SupabaseSpeech] ✅ PRONUNCIATION SUCCESS: accuracy=${result.accuracyScore} fluency=${result.fluencyScore} prosody=${result.prosodyScore} | ${result.wordCount} words, ${result.problemWordCount} problems`, 'color: #22c55e; font-weight: bold; font-size: 13px'
            );
            /* legacy log for compat */
            console.log(
                `[SupabaseSpeech] ✅ Pronunciation: accuracy=${result.accuracyScore} fluency=${result.fluencyScore} prosody=${result.prosodyScore} | ${result.wordCount} words, ${result.problemWordCount} problems`
            );

            return result;
        } catch (err) {
            console.warn("[SupabaseSpeech] Pronunciation assessment failed (non-blocking):", err);
            return null;
        }
    }

    // ── Stubs for unused interface methods ──

    async scorePronunciation(
        _phraseIndex: number,
        _attemptIndex: number
    ): Promise<PronunciationResult> {
        return { score: 0, wordFeedback: { word: "", phonetic: "", tip: "" } };
    }

    async getShadowingPhrases(_sessionId: string): Promise<ShadowingPhrase[]> {
        return [];
    }
}