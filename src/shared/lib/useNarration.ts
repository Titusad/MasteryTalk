import { useEffect, useRef, useState, useCallback } from "react";
import { getNarrationMuted, setNarrationPlaying } from "./useNarrationPreference";

/**
 * Plays a narration audio URL on mount. Fails silently if:
 * - url is null/undefined/empty → isDone immediately true
 * - browser blocks autoplay → isDone immediately true
 * - network error → isDone immediately true
 *
 * When `script` is provided, exposes `isScriptVisible` (true while audio plays,
 * or for a reading-time window when muted) and `dismissCaption` to close it.
 */
export function useNarration(url: string | null | undefined, script?: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDone, setIsDone] = useState(!url);
  const [isScriptVisible, setIsScriptVisible] = useState(!!(script && url));

  useEffect(() => {
    // Reset caption visibility when url/script changes
    setIsScriptVisible(!!(script && url));

    if (!url) {
      setIsDone(true);
      return;
    }

    // When muted: show caption for reading-time, then dismiss; skip audio
    if (getNarrationMuted()) {
      setIsDone(true);
      if (script) {
        const words = script.split(" ").length;
        const ms = Math.max(3000, words * 280);
        const timer = setTimeout(() => setIsScriptVisible(false), ms);
        return () => clearTimeout(timer);
      }
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    const hide = () => setIsScriptVisible(false);

    audio.onplay    = () => { setIsPlaying(true);  setNarrationPlaying(true); };
    audio.onpause   = () => { setIsPlaying(false); setNarrationPlaying(false); };
    audio.onended   = () => { setIsPlaying(false); setNarrationPlaying(false); setIsDone(true); hide(); };
    audio.onerror   = () => { setIsPlaying(false); setNarrationPlaying(false); setIsDone(true); hide(); };

    audio.play().catch(() => { setIsDone(true); hide(); });

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      setNarrationPlaying(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const pause = useCallback(() => { audioRef.current?.pause(); }, []);
  const resume = useCallback(() => { audioRef.current?.play().catch(() => {}); }, []);
  const dismissCaption = useCallback(() => setIsScriptVisible(false), []);

  return { isPlaying, isDone, pause, resume, isScriptVisible, dismissCaption };
}
