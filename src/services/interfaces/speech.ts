/**
 * ISpeechService — STT, TTS, and pronunciation scoring
 *
 * Production: Azure Speech REST API (STT + pronunciation scoring)
 *             + ElevenLabs (TTS) + Cloudflare R2 (audio cache)
 * Mock: Simulates recording with delays, returns fake transcriptions & scores
 */
import type {
  TranscriptionResult,
  PronunciationResult,
  ShadowingPhrase,
  AzurePronunciationAssessment,
} from "../types";

export interface ISpeechService {
  /**
   * Transcribe user speech to text (STT).
   * In mock: returns a predetermined transcription after delay.
   */
  transcribe(audioDurationMs: number): Promise<TranscriptionResult>;

  /**
   * Play text as speech (TTS).
   * In mock: resolves after a simulated duration based on text length.
   * Returns a cleanup function to stop playback.
   */
  speak(text: string): Promise<{ stop: () => void; duration: number }>;

  /**
   * Score pronunciation of a recorded phrase.
   * In mock: returns score from predetermined progression.
   */
  scorePronunciation(
    phraseIndex: number,
    attemptIndex: number
  ): Promise<PronunciationResult>;

  /**
   * Get all shadowing phrases for the current session's improved script.
   * In mock: returns hardcoded phrases with stress markers.
   */
  getShadowingPhrases(sessionId: string): Promise<ShadowingPhrase[]>;

  /**
   * Assess pronunciation of an audio blob via Azure Speech Services.
   * Returns a full assessment with word-level detail, or null on failure.
   * Non-blocking — conversation continues even if assessment fails.
   */
  assessPronunciation(
    audioBlob: Blob,
    referenceText: string
  ): Promise<AzurePronunciationAssessment | null>;
}