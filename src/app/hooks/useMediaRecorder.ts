/**
 * ══════════════════════════════════════════════════════════════
 *  useMediaRecorder — Real microphone recording with waveform
 *
 *  Captures audio via MediaRecorder API and provides:
 *  - Real-time waveform data from AnalyserNode (32 bars)
 *  - Audio blob on stop (webm/opus or fallback to mp4)
 *  - Duration tracking
 *  - Error handling for permission denial
 *
 *  Usage:
 *    const recorder = useMediaRecorder();
 *    recorder.start();          // Request mic → start recording
 *    const blob = await recorder.stop();  // Stop → returns Blob
 *    recorder.waveformBars      // number[] (0-1) for visualization
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useRef, useCallback, useEffect } from "react";

const NUM_BARS = 32;
const WAVEFORM_INTERVAL_MS = 60;

interface UseMediaRecorderReturn {
    /** Whether the mic is currently recording */
    isRecording: boolean;
    /** Milliseconds since recording started */
    recordingTime: number;
    /** 32 bars (0-1 range) for waveform visualization */
    waveformBars: number[];
    /** Request mic permission and start recording */
    start: () => Promise<void>;
    /** Stop recording and return the audio Blob */
    stop: () => Promise<Blob | null>;
    /** Error if mic permission denied or other issues */
    error: string | null;
}

export function useMediaRecorder(): UseMediaRecorderReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [waveformBars, setWaveformBars] = useState<number[]>(
        () => Array.from({ length: NUM_BARS }, () => 0.1)
    );
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const startTimeRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const waveformTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null);

    /** Pick best supported MIME type */
    const getMimeType = useCallback((): string => {
        const types = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/mp4",
            "audio/ogg;codecs=opus",
        ];
        for (const t of types) {
            if (MediaRecorder.isTypeSupported(t)) return t;
        }
        return "audio/webm"; // fallback
    }, []);

    /** Read AnalyserNode frequency data → normalized bars */
    const readWaveform = useCallback(() => {
        const analyser = analyserRef.current;
        if (!analyser) return;
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);

        // Map frequency bins → NUM_BARS
        const binSize = Math.floor(data.length / NUM_BARS);
        const bars: number[] = [];
        for (let i = 0; i < NUM_BARS; i++) {
            let sum = 0;
            for (let j = 0; j < binSize; j++) {
                sum += data[i * binSize + j];
            }
            const avg = sum / binSize / 255; // 0-1
            bars.push(Math.max(0.08, avg)); // min bar height
        }
        setWaveformBars(bars);
    }, []);

    const start = useCallback(async () => {
        setError(null);
        chunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100,
                },
            });
            streamRef.current = stream;

            // AudioContext + AnalyserNode for real waveform
            const audioCtx = new AudioContext();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.7;
            source.connect(analyser);
            analyserRef.current = analyser;

            // MediaRecorder
            const mimeType = getMimeType();
            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                console.log(`[MediaRecorder] Recording complete — ${blob.size} bytes, type=${mimeType}`);
                resolveStopRef.current?.(blob);
                resolveStopRef.current = null;
            };

            recorder.onerror = (e: Event) => {
                console.error("[MediaRecorder] Error:", e);
                setError("Recording error");
                resolveStopRef.current?.(null);
                resolveStopRef.current = null;
            };

            recorder.start(250); // collect data every 250ms
            startTimeRef.current = Date.now();
            setIsRecording(true);
            setRecordingTime(0);

            // Timer for elapsed time
            timerRef.current = setInterval(() => {
                setRecordingTime(Date.now() - startTimeRef.current);
            }, 100);

            // Waveform update loop
            waveformTimerRef.current = setInterval(readWaveform, WAVEFORM_INTERVAL_MS);

            console.log(`[MediaRecorder] Started — mimeType=${mimeType}`);
        } catch (err: any) {
            console.error("[MediaRecorder] Failed to start:", err);
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                setError("Microphone permission denied. Please allow access and try again.");
            } else if (err.name === "NotFoundError") {
                setError("No microphone found. Please connect a microphone.");
            } else {
                setError(`Microphone error: ${err.message}`);
            }
        }
    }, [getMimeType, readWaveform]);

    const stop = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            // Clean up timers
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (waveformTimerRef.current) {
                clearInterval(waveformTimerRef.current);
                waveformTimerRef.current = null;
            }

            setIsRecording(false);
            setWaveformBars(Array.from({ length: NUM_BARS }, () => 0.1));

            const recorder = mediaRecorderRef.current;
            if (!recorder || recorder.state === "inactive") {
                resolve(null);
                return;
            }

            resolveStopRef.current = resolve;
            recorder.stop();

            // Clean up stream tracks
            streamRef.current?.getTracks().forEach((t) => t.stop());
            streamRef.current = null;

            // Close AudioContext
            audioContextRef.current?.close().catch(() => { });
            audioContextRef.current = null;
            analyserRef.current = null;
        });
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (waveformTimerRef.current) clearInterval(waveformTimerRef.current);
            mediaRecorderRef.current?.state !== "inactive" && mediaRecorderRef.current?.stop();
            streamRef.current?.getTracks().forEach((t) => t.stop());
            audioContextRef.current?.close().catch(() => { });
        };
    }, []);

    return { isRecording, recordingTime, waveformBars, start, stop, error };
}
