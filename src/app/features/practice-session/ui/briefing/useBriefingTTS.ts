/**
 * ==============================================================
 *  useBriefingTTS — TTS hook for individual phrase playback
 *
 *  Fetches audio from the /tts endpoint, caches blob URLs in
 *  memory, and exposes play/stop per phrase key.
 * ==============================================================
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { projectId } from "../../../../utils/supabase/info";
import { getAuthToken } from "@/services/supabase";

interface UseBriefingTTSReturn {
    /** Currently-playing phrase key (null if idle) */
    playingKey: string | null;
    /** Whether audio is loading (fetching) */
    isLoading: boolean;
    /** Play a phrase by key + text. If already playing this key, stops it. */
    play: (key: string, text: string) => void;
    /** Stop whatever is playing */
    stop: () => void;
}

export function useBriefingTTS(): UseBriefingTTSReturn {
    const [playingKey, setPlayingKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const cacheRef = useRef<Map<string, string>>(new Map());

    const stop = useCallback(() => {
        abortRef.current?.abort();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setPlayingKey(null);
        setIsLoading(false);
    }, []);

    const play = useCallback(
        (key: string, text: string) => {
            // Toggle off if same key
            if (playingKey === key) {
                stop();
                return;
            }

            // Stop any current playback
            stop();

            const controller = new AbortController();
            abortRef.current = controller;

            (async () => {
                try {
                    setIsLoading(true);
                    setPlayingKey(key);

                    let blobUrl = cacheRef.current.get(key);
                    if (!blobUrl) {
                        const url = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/tts`;
                        const token = await getAuthToken();
                        const res = await fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ text, role: "user_line" }),
                            signal: controller.signal,
                        });
                        if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
                        const blob = await res.blob();
                        blobUrl = URL.createObjectURL(blob);
                        cacheRef.current.set(key, blobUrl);
                    }

                    if (controller.signal.aborted) return;
                    setIsLoading(false);

                    await new Promise<void>((resolve, reject) => {
                        const audio = new Audio(blobUrl!);
                        audioRef.current = audio;
                        audio.onended = () => resolve();
                        audio.onerror = () => reject(new Error("Audio playback error"));
                        controller.signal.addEventListener("abort", () => {
                            audio.pause();
                            resolve();
                        }, { once: true });
                        audio.play().catch(reject);
                    });

                    if (!controller.signal.aborted) {
                        setPlayingKey(null);
                    }
                } catch (err: any) {
                    if (err.name !== "AbortError") {
                        console.error("[BriefingTTS] Playback failed:", err);
                    }
                    if (!controller.signal.aborted) {
                        setPlayingKey(null);
                        setIsLoading(false);
                    }
                }
            })();
        },
        [playingKey, stop]
    );

    /* Cleanup on unmount */
    useEffect(() => {
        const cache = cacheRef.current;
        return () => {
            abortRef.current?.abort();
            audioRef.current?.pause();
            cache.forEach((url) => URL.revokeObjectURL(url));
            cache.clear();
        };
    }, []);

    return { playingKey, isLoading, play, stop };
}
