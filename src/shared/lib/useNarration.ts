import { useEffect, useRef, useState, useCallback } from "react";
import { getNarrationMuted, setNarrationPlaying } from "./useNarrationPreference";

/**
 * Plays a narration audio URL on mount. Fails silently if:
 * - url is null/undefined/empty → isDone immediately true
 * - browser blocks autoplay → isDone immediately true
 * - network error → isDone immediately true
 */
export function useNarration(url: string | null | undefined) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDone, setIsDone] = useState(!url);

  useEffect(() => {
    if (!url) {
      setIsDone(true);
      return;
    }

    // Skip playback if user has muted narration
    if (getNarrationMuted()) {
      setIsDone(true);
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay    = () => { setIsPlaying(true);  setNarrationPlaying(true); };
    audio.onpause   = () => { setIsPlaying(false); setNarrationPlaying(false); };
    audio.onended   = () => { setIsPlaying(false); setNarrationPlaying(false); setIsDone(true); };
    audio.onerror   = () => { setIsPlaying(false); setNarrationPlaying(false); setIsDone(true); };

    audio.play().catch(() => { setIsDone(true); });

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      setNarrationPlaying(false);
    };
  }, [url]);

  const pause = useCallback(() => { audioRef.current?.pause(); }, []);
  const resume = useCallback(() => { audioRef.current?.play().catch(() => {}); }, []);

  return { isPlaying, isDone, pause, resume };
}
