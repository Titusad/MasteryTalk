import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    FileText,
    Play,
    TrendingUp,
    Check,
    PenLine,
    Mic,
    ArrowRight,
    Sparkles,
    HelpCircle,
    Globe,
    Zap,
} from "lucide-react";
import { motion } from "motion/react";
import {
    COLORS,
    PastelBlobs,
    MiniFooter,
    HighlightWithTooltip,
    PageTitleBlock,
} from "@/app/components/shared";
import { projectId } from "@/../utils/supabase/info";
import { getAuthToken } from "@/services/supabase";
import type { ScenarioType, ScriptSection } from "@/services/types";
import { SessionProgressBar } from "@/shared/ui/SessionProgressBar";

/* ── Coaching Cue Formatter ──
   Detects coaching directives at the start of paragraph text
   and wraps them in indigo semibold for visual hierarchy. */
const COACHING_CUE_PATTERN = /^(Here's how you[^.:\n]*[:.:]|You'll want to[^.:\n]*[:.:]|Start by[^.:\n]*[:.:]|Lead with[^.:\n]*[:.:]|Open with[^.:\n]*[:.:]|Make sure to[^.:\n]*[:.:]|Try saying[^.:\n]*[:.:]|Your goal here is[^.:\n]*[:.:]|When they[^.:\n]*[:.:]|If they[^.:\n]*[:.:]|Pivot (?:to|by)[^.:\n]*[:.:]|Close by[^.:\n]*[:.:]|Wrap up by[^.:\n]*[:.:]|End with[^.:\n]*[:.:]|This positions you[^.:\n]*[:.:]|This is where you[^.:\n]*[:.:]|Now,?\s+(?:transition|shift|pivot|move)[^.:\n]*[:.:])/i;

function formatCoachingCues(text: string): React.ReactNode {
    const match = text.match(COACHING_CUE_PATTERN);
    if (!match) return text;
    const cue = match[0];
    const rest = text.slice(cue.length);
    return (
        <>
            <span className="text-[#6366f1]" style={{ fontWeight: 600 }}>{cue}</span>
            {rest}
        </>
    );
}

/* ── TTS Narration Hook ──
   Narrates script sections via OpenAI gpt-4o-mini-tts with role-based voice & style.
   Decomposes each section into ordered segments:
     "coach"     → warm, supportive narration (body text, coaching cues, suffixes)
     "user_line" → confident, assertive delivery (highlight phrases the user should say)
   Caches audio blobs in memory keyed by segment — replay is instant.
   Prefetches the next segment while current one plays. */

type NarrationSegment = { text: string; role: "coach" | "user_line"; sectionNum: number; paragraphIdx: number };

function useBriefingNarration(sections: ScriptSection[]) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<number | null>(null);
    const [activeParagraph, setActiveParagraph] = useState<{ sectionNum: number; paraIdx: number } | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const queueIndexRef = useRef(0);
    /* In-memory audio cache: cacheKey → blob URL */
    const cacheRef = useRef<Map<string, string>>(new Map());

    /* Decompose all sections into a flat ordered list of segments with roles */
    const allSegments = useMemo((): NarrationSegment[] => {
        const segs: NarrationSegment[] = [];
        for (const section of sections) {
            // Section title → coach narration (paragraphIdx -1 = title, not a real paragraph)
            segs.push({ text: `Section ${section.num}: ${section.title}.`, role: "coach", sectionNum: section.num, paragraphIdx: -1 });
            for (const [pi, p] of section.paragraphs.entries()) {
                // Body text → coach (includes coaching cues naturally)
                if (p.text?.trim()) {
                    segs.push({ text: p.text.trim(), role: "coach", sectionNum: section.num, paragraphIdx: pi });
                }
                // Highlight phrases → user_line (what the user should say)
                if (p.highlights?.length) {
                    const userText = p.highlights.map((h) => h.phrase).join(". ");
                    if (userText.trim()) {
                        segs.push({ text: userText.trim(), role: "user_line", sectionNum: section.num, paragraphIdx: pi });
                    }
                }
                // Suffix text → coach
                if (p.suffix?.trim()) {
                    segs.push({ text: p.suffix.trim(), role: "coach", sectionNum: section.num, paragraphIdx: pi });
                }
            }
        }
        return segs;
    }, [sections]);

    const fetchAudio = useCallback(async (text: string, role: string, signal: AbortSignal): Promise<string> => {
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/tts`;
        const token = await getAuthToken();
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text, role }),
            signal,
        });
        if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    }, []);

    /* Cache key for a segment */
    const segKey = useCallback((seg: NarrationSegment, idx: number) =>
        `${seg.sectionNum}-${idx}-${seg.role}`, []);

    /* Get audio URL — from cache or fetch (and cache) */
    const getSegAudio = useCallback(async (seg: NarrationSegment, idx: number, signal: AbortSignal): Promise<string> => {
        const key = segKey(seg, idx);
        const cached = cacheRef.current.get(key);
        const blobUrl = await fetchAudio(seg.text, seg.role, signal);
        cacheRef.current.set(key, blobUrl);
        return blobUrl;
    }, [fetchAudio, segKey]);

    /* Prefetch next segment while current one plays */
    const prefetch = useCallback((seg: NarrationSegment, idx: number) => {
        if (cacheRef.current.has(segKey(seg, idx))) return;
        const c = new AbortController();
        getSegAudio(seg, idx, c.signal).catch(() => { });
    }, [getSegAudio, segKey]);

    const playFromIndex = useCallback(async (startIndex: number) => {
        const controller = new AbortController();
        abortRef.current = controller;
        for (let i = startIndex; i < allSegments.length; i++) {
            if (controller.signal.aborted) break;
            queueIndexRef.current = i;
            const seg = allSegments[i];
            setActiveSection(seg.sectionNum);
            if (seg.paragraphIdx >= 0) {
                setActiveParagraph({ sectionNum: seg.sectionNum, paraIdx: seg.paragraphIdx });
            }
            try {
                const isCached = cacheRef.current.has(segKey(seg, i));
                if (!isCached) setIsLoading(true);
                const audioUrl = await getSegAudio(seg, i, controller.signal);
                if (controller.signal.aborted) break;
                setIsLoading(false);
                /* Prefetch the NEXT segment while this one plays */
                if (i + 1 < allSegments.length) prefetch(allSegments[i + 1], i + 1);
                await new Promise<void>((resolve, reject) => {
                    const audio = new Audio(audioUrl);
                    audioRef.current = audio;
                    audio.onended = () => { resolve(); };
                    audio.onerror = () => { reject(new Error("Audio playback error")); };
                    controller.signal.addEventListener("abort", () => { audio.pause(); resolve(); }, { once: true });
                    audio.play().catch(reject);
                });
            } catch (err: any) {
                if (err.name === "AbortError" || controller.signal.aborted) break;
                console.error("[TTS Narration]", err);
                break;
            }
        }
        setIsPlaying(false);
        setIsLoading(false);
        setActiveSection(null);
        setActiveParagraph(null);
        audioRef.current = null;
    }, [allSegments, getSegAudio, prefetch, segKey]);

    const play = useCallback(() => { setIsPlaying(true); playFromIndex(0); }, [playFromIndex]);
    const pause = useCallback(() => {
        abortRef.current?.abort();
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        setIsPlaying(false); setIsLoading(false); setActiveSection(null); setActiveParagraph(null);
    }, []);
    const togglePlayPause = useCallback(() => { isPlaying ? pause() : play(); }, [isPlaying, play, pause]);

    /* Skip to next SECTION (jumps all remaining segments in current section) */
    const skipNext = useCallback(() => {
        if (!isPlaying) return;
        const curNum = allSegments[queueIndexRef.current]?.sectionNum;
        const nextIdx = allSegments.findIndex((s, i) => i > queueIndexRef.current && s.sectionNum !== curNum);
        if (nextIdx === -1) { pause(); return; }
        abortRef.current?.abort();
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        setIsLoading(false);
        playFromIndex(nextIdx);
    }, [isPlaying, allSegments, pause, playFromIndex]);

    const skipPrev = useCallback(() => {
        if (!isPlaying) return;
        const curNum = allSegments[queueIndexRef.current]?.sectionNum;
        let prevStart = 0;
        for (let i = queueIndexRef.current - 1; i >= 0; i--) {
            if (allSegments[i].sectionNum !== curNum) {
                const prevNum = allSegments[i].sectionNum;
                prevStart = allSegments.findIndex((s) => s.sectionNum === prevNum);
                break;
            }
        }
        abortRef.current?.abort();
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        setIsLoading(false);
        playFromIndex(prevStart);
    }, [isPlaying, allSegments, playFromIndex]);

    /* Cleanup: revoke all cached blob URLs on unmount */
    useEffect(() => {
        const cache = cacheRef.current;
        return () => {
            abortRef.current?.abort();
            audioRef.current?.pause();
            cache.forEach((url) => URL.revokeObjectURL(url));
            cache.clear();
        };
    }, []);

    return { isPlaying, isLoading, activeSection, activeParagraph, togglePlayPause, skipNext, skipPrev };
}

/* ═══════════════════════════════════════════════════════════
   PRE-BRIEFING: Narrative script / conversation strategy
   ═══════════════════════════════════════════════════════════ */

function PreBriefingScreen({
    scenarioType,
    interlocutor,
    onStartSimulation,
    onBack,
    generatedSections,
    preparationToolkit,
}: {
    scenarioType?: ScenarioType;
    interlocutor: string;
    onStartSimulation: () => void;
    onBack: () => void;
    generatedSections: ScriptSection[];
    preparationToolkit?: {
        powerPhrases: Array<{ id: string; phrase: string; context: string; category: string }>;
        powerQuestions: Array<{ question: string; rationale: string; timing: string }>;
        culturalTips: Array<{ title: string; description: string; type: "do" | "avoid" }>;
    } | null;
}) {
    /* Always use AI-generated sections — no mock fallback */
    const scriptSections = generatedSections;
    const [isEditing, setIsEditing] = useState(false);

    /* TTS Narration */
    const narration = useBriefingNarration(scriptSections);

    /* Narrative structure label per scenario */
    const narrativeLabels: Record<string, string> = {
        sales: "Opening → Objection handling → Close with value",
        interview: "Personal pitch → STAR Story → Strategic close",
        csuite: "Executive summary → Data-backed support → Call to decision",
        negotiation: "Position → Counter-offer → Conditional close",
        networking: "Elevator pitch → Value exchange → Follow-up hook",
    };
    const narrativeStructure = scenarioType
        ? narrativeLabels[scenarioType] ?? "Apertura → Desarrollo → Cierre"
        : "Apertura → Desarrollo → Cierre";

    return (
        <div
            className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <PastelBlobs />

            <main className="relative w-full max-w-[800px] mx-auto px-6 pt-6 pb-20">
                <div className="w-full mb-5">
                    <SessionProgressBar currentStep="pre-briefing" />
                </div>
                {/* Title */}
                <PageTitleBlock
                    title="Your Game Plan"
                    subtitle="Here's the strategy I've built for you. Read it, own it — then we'll put it to the test."
                />

                {/* 1. Narrative Structure Badge */}
                <motion.div
                    className="flex items-center gap-3 mb-8"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.03 }}
                >
                    <div className="w-8 h-8 rounded-xl bg-[#0f172b] flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-[#45556c]" style={{ fontWeight: 500 }}>Your play-by-play</p>
                        <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                            {narrativeStructure}
                        </p>
                    </div>
                </motion.div>

                {/* 2. Highlight Legend */}
                <motion.div
                    className="flex items-center gap-4 mb-8 flex-wrap"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                >
                    {[
                        { color: COLORS.softPurple, label: "Structure" },
                        { color: COLORS.peach, label: "Impact" },
                        { color: COLORS.blue, label: "Engagement" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-[#45556c]" style={{ fontWeight: 500 }}>{item.label}</span>
                        </div>
                    ))}
                    <span className="text-sm text-[#62748e] italic">— Hover over text for tips</span>
                </motion.div>

                {/* 2.5 Narration Player */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.06 }}
                >
                    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${narration.isPlaying
                        ? "bg-[#eef2ff] border-[#6366f1]/30 shadow-sm"
                        : "bg-white border-[#e2e8f0] hover:border-[#c7d2e0]"
                        }`}>
                        {/* Play / Pause */}
                        <button
                            onClick={narration.togglePlayPause}
                            disabled={narration.isLoading && !narration.isPlaying}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${narration.isPlaying
                                ? "bg-[#6366f1] text-white shadow-md"
                                : "bg-[#0f172b] text-white hover:bg-[#1d293d]"
                                }`}
                        >
                            {narration.isLoading && !narration.isPlaying ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : narration.isPlaying ? (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="0" width="4" height="14" rx="1" /><rect x="9" y="0" width="4" height="14" rx="1" /></svg>
                            ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                            )}
                        </button>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#0f172b] truncate" style={{ fontWeight: 600 }}>
                                {narration.isPlaying
                                    ? `Coaching you — Section ${narration.activeSection} of ${scriptSections.length}`
                                    : "Hear your coach walk you through it"
                                }
                            </p>
                            <p className="text-xs text-[#62748e]">
                                {narration.isPlaying
                                    ? narration.isLoading ? "Loading audio..." : "Listen carefully..."
                                    : "Sit back — I'll break it down for you"
                                }
                            </p>
                        </div>

                        {/* Skip Controls (only when playing) */}
                        {narration.isPlaying && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={narration.skipPrev}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#45556c] hover:bg-[#f1f5f9] transition-colors"
                                    title="Previous section"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" /></svg>
                                </button>
                                <button
                                    onClick={narration.skipNext}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#45556c] hover:bg-[#f1f5f9] transition-colors"
                                    title="Next section"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></svg>
                                </button>
                            </div>
                        )}

                        {/* Waveform indicator when playing */}
                        {narration.isPlaying && !narration.isLoading && (
                            <div className="flex items-end gap-[3px] h-5 shrink-0">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-[3px] bg-[#6366f1] rounded-full animate-speaking-bar"
                                        style={{ animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 3. Script Sections */}
                <motion.div
                    className="bg-white rounded-3xl border border-[#e2e8f0] p-8 mb-8 space-y-10 relative"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                >
                    {/* Edit toggle */}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`absolute -top-4 right-6 z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm shadow-sm transition-all ${isEditing
                            ? "bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]"
                            : "bg-white border border-[#e2e8f0] text-[#45556c] hover:bg-[#f8fafc]"
                            }`}
                        style={{ fontWeight: 500 }}
                    >
                        {isEditing ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                Save changes
                            </>
                        ) : (
                            <>
                                <PenLine className="w-3.5 h-3.5" />
                                Edit script
                            </>
                        )}
                    </button>

                    {scriptSections.map((section, si) => {
                        const isSpeaking = narration.activeSection === section.num;
                        return (
                            <motion.div
                                key={section.num}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.15 + si * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                className={`rounded-2xl transition-all duration-500 ${isSpeaking
                                    ? "border-l-[3px] border-l-[#6366f1] pl-5 bg-[#f5f3ff]/40"
                                    : "border-l-[3px] border-l-transparent pl-5"
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-5">
                                    <span
                                        className="w-8 h-8 rounded-xl bg-[#6366f1]/10 flex items-center justify-center text-sm text-[#6366f1]"
                                        style={{ fontWeight: 700 }}
                                    >
                                        {section.num}
                                    </span>
                                    <h3
                                        className="text-xl text-[#0f172b]"
                                        style={{ fontWeight: 600 }}
                                    >
                                        {section.title}
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {section.paragraphs.map((p, pi) => {
                                        const isActivePara = narration.isPlaying &&
                                            narration.activeParagraph?.sectionNum === section.num &&
                                            narration.activeParagraph?.paraIdx === pi;
                                        const isDimmed = narration.isPlaying && !isActivePara;
                                        return (
                                            <p
                                                key={pi}
                                                className={`text-[#314158] leading-relaxed transition-all duration-500 ${isEditing
                                                    ? "bg-[#f8fafc] rounded-xl px-4 py-3 border border-[#e2e8f0] focus:outline-none focus:border-[#6366f1] transition-colors"
                                                    : isActivePara
                                                        ? "bg-[#eef2ff]/60 rounded-xl px-4 py-3 ring-2 ring-[#6366f1]/30 shadow-sm"
                                                        : isDimmed
                                                            ? "opacity-40"
                                                            : ""
                                                    }`}
                                                contentEditable={isEditing}
                                                suppressContentEditableWarning
                                            >
                                                {formatCoachingCues(p.text)}
                                                {p.highlights?.map((h, hi) => (
                                                    <HighlightWithTooltip
                                                        key={hi}
                                                        phrase={h.phrase}
                                                        color={h.color}
                                                        tooltip={h.tooltip}
                                                    />
                                                ))}
                                                {p.suffix}
                                            </p>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════════════════════════════════════════════
           PREPARATION TOOLKIT — AI-generated, contextual
           Power Phrases + Power Questions + Cultural Intelligence
           ═══════════════════════════════════════════════ */}
                {preparationToolkit ? (
                    <motion.div
                        className="space-y-6 mb-10"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.12 }}
                    >
                        {/* Section header */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl text-[#0f172b]" style={{ fontWeight: 600 }}>
                                    Your Preparation Toolkit
                                </h2>
                                <p className="text-sm text-[#45556c]">
                                    AI-generated resources tailored to your scenario
                                </p>
                            </div>
                            <span className="ml-auto text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2.5 py-1 rounded-full" style={{ fontWeight: 600 }}>
                                AI-Personalized
                            </span>
                        </div>

                        {/* Power Phrases */}
                        {preparationToolkit.powerPhrases.length > 0 && (
                            <motion.div
                                className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-3xl p-6 md:p-8"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.15 }}
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <Zap className="w-4 h-4 text-[#fbbf24]" />
                                    <p className="text-sm text-white/80" style={{ fontWeight: 600 }}>Power Phrases</p>
                                    <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full ml-auto">
                                        {preparationToolkit.powerPhrases.length} phrases
                                    </span>
                                </div>
                                <div className="space-y-2.5">
                                    {preparationToolkit.powerPhrases.map((p, i) => (
                                        <motion.div
                                            key={p.id || i}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + i * 0.04 }}
                                        >
                                            <p className="text-white text-sm" style={{ fontWeight: 500 }}>
                                                "{p.phrase}"
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] bg-[#fbbf24]/20 text-[#fbbf24] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                                                    {p.category}
                                                </span>
                                                <p className="text-white/40 text-xs">{p.context}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Power Questions */}
                        {preparationToolkit.powerQuestions.length > 0 && (
                            <motion.div
                                className="bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-8"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <HelpCircle className="w-4 h-4 text-[#6366f1]" />
                                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>Power Questions</p>
                                    <p className="text-xs text-[#62748e] ml-1">Strategic questions to ask your counterpart</p>
                                </div>
                                <div className="space-y-3">
                                    {preparationToolkit.powerQuestions.map((q, i) => (
                                        <motion.div
                                            key={i}
                                            className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4"
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.25 + i * 0.05 }}
                                        >
                                            <p className="text-[#0f172b] text-sm" style={{ fontWeight: 500 }}>
                                                "{q.question}"
                                            </p>
                                            <p className="text-xs text-[#45556c] mt-1.5 leading-relaxed">
                                                {q.rationale}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <span className="text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                                                    {q.timing}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Cultural Intelligence */}
                        {preparationToolkit.culturalTips.length > 0 && (
                            <motion.div
                                className="bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-8"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.25 }}
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <Globe className="w-4 h-4 text-[#50C878]" />
                                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>Cultural Intelligence</p>
                                    <span className="text-[10px] bg-[#50C878]/15 text-[#16a34a] px-2.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                                        LATAM → US
                                    </span>
                                </div>
                                <div className="space-y-2.5">
                                    {preparationToolkit.culturalTips
                                        .filter((t) => t.type === "do")
                                        .map((tip, i) => (
                                            <div
                                                key={`do-${i}`}
                                                className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-5 py-4 flex items-start gap-3"
                                            >
                                                <span
                                                    className="text-[10px] bg-[#16a34a]/15 text-[#16a34a] rounded-full px-2 py-0.5 shrink-0 mt-0.5"
                                                    style={{ fontWeight: 600 }}
                                                >
                                                    DO
                                                </span>
                                                <div>
                                                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                                                        {tip.title}
                                                    </p>
                                                    <p className="text-xs text-[#45556c] mt-0.5">{tip.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    {preparationToolkit.culturalTips
                                        .filter((t) => t.type === "avoid")
                                        .map((tip, i) => (
                                            <div
                                                key={`avoid-${i}`}
                                                className="bg-[#fef2f2] border border-[#fecaca] rounded-xl px-5 py-4 flex items-start gap-3"
                                            >
                                                <span
                                                    className="text-[10px] bg-red-500/15 text-red-600 rounded-full px-2 py-0.5 shrink-0 mt-0.5"
                                                    style={{ fontWeight: 600 }}
                                                >
                                                    AVOID
                                                </span>
                                                <div>
                                                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                                                        {tip.title}
                                                    </p>
                                                    <p className="text-xs text-[#45556c] mt-0.5">{tip.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    /* Skeleton loader while toolkit is loading */
                    <motion.div
                        className="mb-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                    >
                        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] animate-pulse" />
                                <div className="space-y-1.5">
                                    <div className="w-40 h-4 bg-[#f1f5f9] rounded animate-pulse" />
                                    <div className="w-56 h-3 bg-[#f1f5f9] rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-[#f8fafc] rounded-xl px-5 py-4 animate-pulse">
                                        <div className="w-3/4 h-4 bg-[#e2e8f0] rounded mb-2" />
                                        <div className="w-1/2 h-3 bg-[#e2e8f0] rounded" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-[#94a3b8] text-center mt-4">
                                Generating your personalized toolkit...
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* CTA: Start Simulation */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="bg-gradient-to-br from-[#f0f9ff] to-[#eef2ff] rounded-3xl border border-[#bfdbfe]/50 p-10 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#0f172b] flex items-center justify-center mx-auto mb-6">
                            <Mic className="w-8 h-8 text-white" />
                        </div>
                        <h3
                            className="text-2xl md:text-[28px] text-[#0f172b] mb-3"
                            style={{ fontWeight: 300, lineHeight: 1.3 }}
                        >
                            Ready to put this to the test?
                        </h3>
                        <p className="text-[#45556c] text-lg max-w-md mx-auto mb-8">
                            I'm going to simulate a real conversation — you'll respond as if it's the real thing. Let's see what you've got.
                        </p>
                        <button
                            onClick={onStartSimulation}
                            className="bg-[#0f172b] text-white px-10 py-5 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors text-xl mx-auto"
                            style={{ fontWeight: 500 }}
                        >
                            <Play className="w-5 h-5" />
                            Let's do this
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onBack}
                            className="mt-4 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors mx-auto block"
                        >
                            ← Back to game plan
                        </button>
                    </div>
                    <p className="text-sm text-[#45556c]/70">
                        Estimated reading time:{" "}
                        <span style={{ fontWeight: 500 }}>
                            {Math.max(2, Math.ceil(scriptSections.reduce((acc, s) => acc + s.paragraphs.length, 0) * 0.8))} min
                        </span>
                    </p>
                </motion.div>
            </main>
            <MiniFooter />
        </div>
    );
}

export { PreBriefingScreen };
