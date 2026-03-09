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
import type { ISpeechService } from "../../interfaces";
import type {
    TranscriptionResult,
    PronunciationResult,
    ShadowingPhrase,
} from "../../types";
import { SpeechError } from "../../errors";
import { projectId, publicAnonKey } from "../../../../utils/supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d`;

export class SupabaseSpeechService implements ISpeechService {
    /**
     * Transcribe an audio Blob via the server's Whisper endpoint.
     * This is the primary method — called directly from VoicePractice.
     */
    async transcribeBlob(audioBlob: Blob): Promise<TranscriptionResult> {
        const formData = new FormData();
        // Determine file extension from MIME type
        const ext = audioBlob.type.includes("mp4")
            ? "mp4"
            : audioBlob.type.includes("ogg")
                ? "ogg"
                : "webm";
        formData.append("audio", audioBlob, `recording.${ext}`);

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
