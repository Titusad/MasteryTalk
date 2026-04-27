import { useState, useEffect } from "react";

const STORAGE_KEY = "masterytalk_narration_muted";

// Module-level state — shared across ALL hook instances
let _muted = typeof window !== "undefined"
  ? localStorage.getItem(STORAGE_KEY) === "true"
  : false;
let _playing = false;

const _listeners = new Set<() => void>();

function _notify() { _listeners.forEach((l) => l()); }

export function getNarrationMuted(): boolean { return _muted; }
export function getNarrationPlaying(): boolean { return _playing; }

export function setNarrationMuted(muted: boolean): void {
  _muted = muted;
  try { localStorage.setItem(STORAGE_KEY, String(muted)); } catch (_) {}
  _notify();
}

export function setNarrationPlaying(playing: boolean): void {
  _playing = playing;
  _notify();
}

export function useNarrationPreference() {
  const [muted, setMutedState] = useState(_muted);
  const [playing, setPlayingState] = useState(_playing);

  useEffect(() => {
    const sync = () => { setMutedState(_muted); setPlayingState(_playing); };
    _listeners.add(sync);
    return () => { _listeners.delete(sync); };
  }, []);

  const toggle = () => setNarrationMuted(!_muted);

  return { muted, playing, toggle };
}
