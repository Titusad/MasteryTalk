import { useState, useEffect } from "react";

const STORAGE_KEY = "masterytalk_narration_muted";

// Module-level state shared across all hook instances
let _muted = typeof window !== "undefined"
  ? localStorage.getItem(STORAGE_KEY) === "true"
  : false;

const _listeners = new Set<() => void>();

export function getNarrationMuted(): boolean {
  return _muted;
}

export function setNarrationMuted(muted: boolean): void {
  _muted = muted;
  try { localStorage.setItem(STORAGE_KEY, String(muted)); } catch (_) {}
  _listeners.forEach((l) => l());
}

export function useNarrationPreference() {
  const [muted, setMutedState] = useState(_muted);

  useEffect(() => {
    const sync = () => setMutedState(_muted);
    _listeners.add(sync);
    return () => { _listeners.delete(sync); };
  }, []);

  const toggle = () => setNarrationMuted(!_muted);

  return { muted, toggle };
}
