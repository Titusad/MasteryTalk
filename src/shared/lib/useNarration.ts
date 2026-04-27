import { useEffect, useRef, useState, useCallback } from "react";

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

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay    = () => setIsPlaying(true);
    audio.onpause   = () => setIsPlaying(false);
    audio.onended   = () => { setIsPlaying(false); setIsDone(true); };
    audio.onerror   = () => { setIsPlaying(false); setIsDone(true); };

    audio.play().catch(() => { setIsDone(true); });

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [url]);

  const pause = useCallback(() => { audioRef.current?.pause(); }, []);
  const resume = useCallback(() => { audioRef.current?.play().catch(() => {}); }, []);

  return { isPlaying, isDone, pause, resume };
}
