/**
 * ==============================================================
 *  inFluentia PRO - Session Cache (localStorage)
 *
 *  Persists AI-generated content to localStorage so it survives
 *  page refreshes. Keyed by scenario signature (pre-session) or
 *  sessionId (post-session). Auto-expires entries after 24 hours.
 *
 *  Cached data:
 *  - Pre-session:  generated script, preparation toolkit
 *  - Post-session: feedback, summary, pronunciation data, shadowing scores
 * ==============================================================
 */

const PREFIX = "influentia_cache_";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/* ── Simple hash for scenario-based keys ── */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

export function scenarioKey(scenario: string, interlocutor: string, scenarioType?: string): string {
    return simpleHash(`${scenario}|${interlocutor}|${scenarioType || ""}`);
}

/* ── Core get / set with TTL ── */

interface CacheEntry<T> {
    data: T;
    ts: number; // timestamp
}

function getItem<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(PREFIX + key);
        if (!raw) return null;
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (Date.now() - entry.ts > TTL_MS) {
            localStorage.removeItem(PREFIX + key);
            return null;
        }
        return entry.data;
    } catch {
        return null;
    }
}

function setItem<T>(key: string, data: T): void {
    try {
        const entry: CacheEntry<T> = { data, ts: Date.now() };
        localStorage.setItem(PREFIX + key, JSON.stringify(entry));
    } catch (err) {
        // localStorage full or unavailable — fail silently
        console.warn("[SessionCache] Failed to cache:", key, err);
    }
}

function removeItem(key: string): void {
    try {
        localStorage.removeItem(PREFIX + key);
    } catch { /* ignore */ }
}

/* ── Pre-session cache (keyed by scenario signature) ── */

export const scriptCache = {
    get: (sKey: string) => getItem<any[]>(`script_${sKey}`),
    set: (sKey: string, sections: any[]) => setItem(`script_${sKey}`, sections),
    clear: (sKey: string) => removeItem(`script_${sKey}`),
};

export const interviewBriefingCache = {
    get: (sKey: string) => getItem<any>(`ibriefing_${sKey}`),
    set: (sKey: string, data: any) => setItem(`ibriefing_${sKey}`, data),
    clear: (sKey: string) => removeItem(`ibriefing_${sKey}`),
};

export const toolkitCache = {
    get: (sKey: string) => getItem<{
        powerPhrases: any[];
        powerQuestions: any[];
        culturalTips: any[];
    }>(`toolkit_${sKey}`),
    set: (sKey: string, toolkit: {
        powerPhrases: any[];
        powerQuestions: any[];
        culturalTips: any[];
    }) => setItem(`toolkit_${sKey}`, toolkit),
    clear: (sKey: string) => removeItem(`toolkit_${sKey}`),
};

export const cvMatchCache = {
    get: (sKey: string) => getItem<any>(`cvmatch_${sKey}`),
    set: (sKey: string, data: any) => setItem(`cvmatch_${sKey}`, data),
    clear: (sKey: string) => removeItem(`cvmatch_${sKey}`),
};

/* ── Post-session cache (keyed by sessionId) ── */

export const feedbackCache = {
    get: (sessionId: string) => getItem<any>(`feedback_${sessionId}`),
    set: (sessionId: string, feedback: any) => setItem(`feedback_${sessionId}`, feedback),
    clear: (sessionId: string) => removeItem(`feedback_${sessionId}`),
};

export const summaryCache = {
    get: (sessionId: string) => getItem<any>(`summary_${sessionId}`),
    set: (sessionId: string, summary: any) => setItem(`summary_${sessionId}`, summary),
    clear: (sessionId: string) => removeItem(`summary_${sessionId}`),
};

export const pronDataCache = {
    get: (sessionId: string) => getItem<any[]>(`prondata_${sessionId}`),
    set: (sessionId: string, data: any[]) => setItem(`prondata_${sessionId}`, data),
    clear: (sessionId: string) => removeItem(`prondata_${sessionId}`),
};

export const shadowingScoresCache = {
    get: (sessionId: string) => getItem<Record<string, any>>(`shadowing_${sessionId}`),
    set: (sessionId: string, scores: Record<string, any>) => setItem(`shadowing_${sessionId}`, scores),
    clear: (sessionId: string) => removeItem(`shadowing_${sessionId}`),
};

/* ── Cleanup: remove expired entries ── */
export function cleanupExpiredCache(): void {
    try {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            if (key.startsWith(PREFIX)) {
                try {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const entry = JSON.parse(raw);
                        if (entry.ts && Date.now() - entry.ts > TTL_MS) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch {
                    // Corrupt entry — remove
                    localStorage.removeItem(key);
                }
            }
        }
    } catch { /* ignore */ }
}
