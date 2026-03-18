/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Professional Vocabulary Pronunciation Tracker
 *
 *  Longitudinal dashboard widget that shows accumulated pronunciation
 *  data across all sessions with learning/practicing/mastered states,
 *  category filtering (Technical/Business/Leadership/Communication),
 *  and "Words at Risk" declining-trend alerts.
 *  Fetches data from GET /vocab-tracker endpoint.
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useMemo } from "react";
import {
    BookOpen,
    TrendingUp,
    TrendingDown,
    Minus,
    Award,
    AlertTriangle,
    ChevronRight,
    ChevronDown,
    Mic,
    GraduationCap,
    Loader2,
    ShieldAlert,
    Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import type { VocabPronunciationEntry } from "../../services/types";

/* ─── Mastery config ─── */

const MASTERY_CONFIG = {
    mastered: {
        label: "Mastered",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.12)",
        icon: Award,
    },
    practicing: {
        label: "Practicing",
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.12)",
        icon: BookOpen,
    },
    learning: {
        label: "Learning",
        color: "#ef4444",
        bg: "rgba(239,68,68,0.12)",
        icon: AlertTriangle,
    },
} as const;

const TREND_CONFIG = {
    improving: { icon: TrendingUp, color: "#22c55e", label: "Improving" },
    stable: { icon: Minus, color: "#94a3b8", label: "Stable" },
    declining: { icon: TrendingDown, color: "#ef4444", label: "Declining" },
} as const;

const CATEGORY_COLORS: Record<string, string> = {
    Technical: "#6366f1",
    Business: "#0ea5e9",
    Leadership: "#8b5cf6",
    Communication: "#ec4899",
};

const CATEGORY_ICONS: Record<string, string> = {
    Technical: "⚙️",
    Business: "📊",
    Leadership: "👔",
    Communication: "💬",
};

/* ─── Mini spark line for score history ─── */

function SparkLine({ scores, color }: { scores: number[]; color: string }) {
    if (scores.length < 2) return null;
    const max = 100;
    const min = 0;
    const w = 60;
    const h = 20;
    const points = scores.slice(-8).map((s, i, arr) => {
        const x = (i / (arr.length - 1)) * w;
        const y = h - ((s - min) / (max - min)) * h;
        return `${x},${y}`;
    });
    return (
        <svg width={w} height={h} className="shrink-0">
            <polyline
                points={points.join(" ")}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/* ─── At Risk Word type ─── */
interface AtRiskWord {
    word: string;
    currentScore: number;
    category: string;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export interface VocabTrackerProps {
    /** If provided, skips fetching and uses this data directly */
    initialData?: VocabPronunciationEntry[];
}

export function VocabTracker({ initialData }: VocabTrackerProps) {
    const [entries, setEntries] = useState<VocabPronunciationEntry[]>(
        initialData || []
    );
    const [stats, setStats] = useState({
        totalWords: 0,
        mastered: 0,
        practicing: 0,
        learning: 0,
        improving: 0,
        declining: 0,
    });
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
        {}
    );
    const [atRisk, setAtRisk] = useState<AtRiskWord[]>([]);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [masteryFilter, setMasteryFilter] = useState<
        "all" | "learning" | "practicing" | "mastered"
    >("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [expandedWord, setExpandedWord] = useState<string | null>(null);
    const [showAtRisk, setShowAtRisk] = useState(true);

    /* ── Fetch vocab tracker data ── */
    useEffect(() => {
        if (initialData) return;

        const url = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/vocab-tracker`;
        fetch(url, {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(`${res.status}`);
                return res.json();
            })
            .then((data) => {
                setEntries(data.entries || []);
                setStats({
                    totalWords: data.totalWords || 0,
                    mastered: data.mastered || 0,
                    practicing: data.practicing || 0,
                    learning: data.learning || 0,
                    improving: data.improving || 0,
                    declining: data.declining || 0,
                });
                setCategoryCounts(data.categoryCounts || {});
                setAtRisk(data.atRisk || []);
                setLoading(false);
            })
            .catch((err) => {
                console.warn("[VocabTracker] Failed to fetch:", err.message);
                setError(err.message);
                setLoading(false);
            });
    }, [initialData]);

    /* ── Filtered entries ── */
    const filteredEntries = useMemo(() => {
        let result = entries;
        if (masteryFilter !== "all") {
            result = result.filter((e) => e.mastery === masteryFilter);
        }
        if (categoryFilter !== "all") {
            result = result.filter((e) => e.category === categoryFilter);
        }
        return result;
    }, [entries, masteryFilter, categoryFilter]);

    /* ── Available categories ── */
    const availableCategories = useMemo(() => {
        return Object.entries(categoryCounts)
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([cat]) => cat);
    }, [categoryCounts]);

    const hasFilters = masteryFilter !== "all" || categoryFilter !== "all";

    /* ── Loading state ── */
    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Mic className="w-4 h-4 text-[#f59e0b]" />
                    <h3 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                        Pronunciation Tracker
                    </h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-[#94a3b8] animate-spin" />
                    <span className="text-sm text-[#94a3b8] ml-2">Loading...</span>
                </div>
            </div>
        );
    }

    /* ── Empty state ── */
    if (entries.length === 0) {
        return (
            <motion.div
                className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Mic className="w-4 h-4 text-[#f59e0b]" />
                    <h3 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                        Pronunciation Tracker
                    </h3>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <GraduationCap className="w-8 h-8 text-[#cbd5e1] mb-2" />
                    <p className="text-sm text-[#62748e]">
                        Complete a voice practice session to start tracking your
                        pronunciation progress.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#f59e0b]" />
                    <h3 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                        Pronunciation Tracker
                    </h3>
                </div>
                <span
                    className="text-[10px] text-[#62748e] bg-[#f1f5f9] px-2.5 py-1 rounded-full"
                    style={{ fontWeight: 500 }}
                >
                    {stats.totalWords} word{stats.totalWords !== 1 ? "s" : ""} tracked
                </span>
            </div>

            {/* ── Words at Risk Banner ── */}
            {atRisk.length > 0 && showAtRisk && (
                <motion.div
                    className="mb-4 bg-gradient-to-r from-[#fef2f2] to-[#fff7ed] border border-red-200 rounded-xl p-4"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                >
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-[#ef4444]" />
                            <p
                                className="text-xs text-[#dc2626]"
                                style={{ fontWeight: 600 }}
                            >
                                Words at Risk
                            </p>
                            <span className="text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>
                                {atRisk.length}
                            </span>
                        </div>
                        <button
                            onClick={() => setShowAtRisk(false)}
                            className="text-[10px] text-[#94a3b8] hover:text-[#64748b] transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                    <p className="text-[11px] text-[#78716c] mb-3 leading-relaxed">
                        These words are declining in accuracy. Practice them in your next
                        session to prevent skill regression.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {atRisk.map((w) => (
                            <button
                                key={w.word}
                                className="group flex items-center gap-1.5 bg-white border border-red-200 hover:border-red-300 rounded-lg px-3 py-1.5 transition-colors"
                                onClick={() => {
                                    setMasteryFilter("all");
                                    setCategoryFilter("all");
                                    setExpandedWord(expandedWord === w.word ? null : w.word);
                                }}
                            >
                                <TrendingDown className="w-3 h-3 text-red-400" />
                                <span
                                    className="text-xs text-[#0f172b] group-hover:text-red-600 transition-colors"
                                    style={{ fontWeight: 500 }}
                                >
                                    {w.word}
                                </span>
                                <span className="text-[10px] text-red-400">
                                    {Math.round(w.currentScore)}%
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Mastery summary pills */}
            <div className="flex flex-wrap gap-2 mb-3">
                {(
                    [
                        { key: "mastered" as const, count: stats.mastered },
                        { key: "practicing" as const, count: stats.practicing },
                        { key: "learning" as const, count: stats.learning },
                    ] as const
                ).map(({ key, count }) => {
                    const cfg = MASTERY_CONFIG[key];
                    const isActive = masteryFilter === key;
                    return (
                        <button
                            key={key}
                            onClick={() =>
                                setMasteryFilter(isActive ? "all" : key)
                            }
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${isActive ? "ring-2 ring-offset-1" : "hover:opacity-80"
                                }`}
                            style={{
                                backgroundColor: cfg.bg,
                                color: cfg.color,
                                fontWeight: 600,
                                ...(isActive ? { boxShadow: `0 0 0 2px ${cfg.color}40` } : {}),
                            }}
                        >
                            <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: cfg.color }}
                            />
                            {count} {cfg.label}
                        </button>
                    );
                })}
            </div>

            {/* Category filter pills */}
            {availableCategories.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    <div className="flex items-center gap-1 mr-1">
                        <Filter className="w-3 h-3 text-[#94a3b8]" />
                    </div>
                    <button
                        onClick={() => setCategoryFilter("all")}
                        className={`text-[10px] px-2.5 py-1 rounded-full transition-all ${categoryFilter === "all"
                                ? "bg-[#0f172b] text-white"
                                : "bg-[#f1f5f9] text-[#62748e] hover:bg-[#e2e8f0]"
                            }`}
                        style={{ fontWeight: 600 }}
                    >
                        All
                    </button>
                    {availableCategories.map((cat) => {
                        const isActive = categoryFilter === cat;
                        const color = CATEGORY_COLORS[cat] || "#6366f1";
                        const icon = CATEGORY_ICONS[cat] || "📝";
                        return (
                            <button
                                key={cat}
                                onClick={() =>
                                    setCategoryFilter(isActive ? "all" : cat)
                                }
                                className={`text-[10px] px-2.5 py-1 rounded-full transition-all flex items-center gap-1`}
                                style={{
                                    fontWeight: 600,
                                    backgroundColor: isActive ? `${color}20` : "#f1f5f9",
                                    color: isActive ? color : "#62748e",
                                    ...(isActive
                                        ? { boxShadow: `0 0 0 1.5px ${color}40` }
                                        : {}),
                                }}
                            >
                                <span className="text-[10px]">{icon}</span>
                                {cat}
                                <span className="opacity-60">
                                    {categoryCounts[cat]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Active filter indicator */}
            {hasFilters && (
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-[#94a3b8]">
                        Showing {filteredEntries.length} of {entries.length} words
                    </p>
                    <button
                        onClick={() => {
                            setMasteryFilter("all");
                            setCategoryFilter("all");
                        }}
                        className="text-[10px] text-[#6366f1] hover:text-[#4f46e5] transition-colors"
                        style={{ fontWeight: 500 }}
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* Word list */}
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredEntries.length === 0 ? (
                    <div className="py-6 text-center">
                        <p className="text-xs text-[#94a3b8]">
                            No words match the current filters.
                        </p>
                    </div>
                ) : (
                    filteredEntries.map((entry, i) => {
                        const masteryConf = MASTERY_CONFIG[entry.mastery];
                        const trendConf = TREND_CONFIG[entry.trend];
                        const TrendIcon = trendConf.icon;
                        const isExpanded = expandedWord === entry.word;
                        const catColor = CATEGORY_COLORS[entry.category] || "#6366f1";
                        const isAtRisk = entry.trend === "declining";

                        return (
                            <motion.div
                                key={entry.word}
                                className={`border rounded-xl overflow-hidden ${isAtRisk
                                        ? "border-red-200 bg-red-50/30"
                                        : "border-[#e2e8f0]"
                                    }`}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 0.38 + i * 0.03,
                                    duration: 0.3,
                                }}
                            >
                                <button
                                    onClick={() =>
                                        setExpandedWord(isExpanded ? null : entry.word)
                                    }
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#f8fafc] transition-colors text-left"
                                >
                                    {/* Mastery dot */}
                                    <div
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: masteryConf.color }}
                                    />

                                    {/* Word */}
                                    <span
                                        className="text-sm text-[#0f172b] flex-1 min-w-0 truncate"
                                        style={{ fontWeight: 500 }}
                                    >
                                        {entry.word}
                                        {isAtRisk && (
                                            <TrendingDown className="w-3 h-3 text-red-400 inline ml-1.5 -mt-0.5" />
                                        )}
                                    </span>

                                    {/* Spark line */}
                                    <SparkLine
                                        scores={entry.scores}
                                        color={isAtRisk ? "#ef4444" : masteryConf.color}
                                    />

                                    {/* Current score */}
                                    <span
                                        className="text-xs px-2 py-0.5 rounded-full shrink-0"
                                        style={{
                                            fontWeight: 600,
                                            backgroundColor: masteryConf.bg,
                                            color: masteryConf.color,
                                        }}
                                    >
                                        {Math.round(entry.currentScore)}%
                                    </span>

                                    {/* Trend (for non at-risk) */}
                                    {!isAtRisk && (
                                        <TrendIcon
                                            className="w-3.5 h-3.5 shrink-0"
                                            style={{ color: trendConf.color }}
                                        />
                                    )}

                                    {isExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                                    ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-3 border-t border-[#e2e8f0] pt-3">
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {/* Category badge */}
                                                    <span
                                                        className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                                                        style={{
                                                            fontWeight: 600,
                                                            backgroundColor: `${catColor}15`,
                                                            color: catColor,
                                                        }}
                                                    >
                                                        <span>{CATEGORY_ICONS[entry.category] || "📝"}</span>
                                                        {entry.category}
                                                    </span>

                                                    {/* Mastery badge */}
                                                    <span
                                                        className="text-[10px] px-2 py-0.5 rounded-full"
                                                        style={{
                                                            fontWeight: 600,
                                                            backgroundColor: masteryConf.bg,
                                                            color: masteryConf.color,
                                                        }}
                                                    >
                                                        {masteryConf.label}
                                                    </span>

                                                    {/* Trend badge */}
                                                    <span
                                                        className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                                                        style={{
                                                            fontWeight: 500,
                                                            backgroundColor: `${trendConf.color}15`,
                                                            color: trendConf.color,
                                                        }}
                                                    >
                                                        <TrendIcon className="w-2.5 h-2.5" />
                                                        {trendConf.label}
                                                    </span>

                                                    <span className="text-[10px] text-[#94a3b8]">
                                                        {entry.totalAttempts} attempt
                                                        {entry.totalAttempts !== 1 ? "s" : ""}
                                                    </span>
                                                    <span className="text-[10px] text-[#94a3b8]">
                                                        Last:{" "}
                                                        {new Date(
                                                            entry.lastPracticed
                                                        ).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                </div>

                                                {/* Score history bar */}
                                                <div className="flex items-end gap-1 mt-2">
                                                    {entry.scores.slice(-10).map((s, si) => (
                                                        <div
                                                            key={si}
                                                            className="flex-1 rounded-sm transition-all"
                                                            style={{
                                                                height: `${Math.max(4, (s / 100) * 24)}px`,
                                                                backgroundColor:
                                                                    s >= 85
                                                                        ? "#22c55e"
                                                                        : s >= 60
                                                                            ? "#f59e0b"
                                                                            : "#ef4444",
                                                                opacity: 0.7 + (si / 10) * 0.3,
                                                            }}
                                                            title={`${Math.round(s)}%`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-[#94a3b8] mt-1">
                                                    Last {Math.min(10, entry.scores.length)} scores
                                                </p>

                                                {entry.commonError && (
                                                    <p className="text-xs text-[#ef4444] mt-2">
                                                        <span style={{ fontWeight: 600 }}>
                                                            Common error:
                                                        </span>{" "}
                                                        {entry.commonError}
                                                    </p>
                                                )}

                                                {/* At-risk tip */}
                                                {isAtRisk && (
                                                    <div className="mt-3 bg-[#fef2f2] border border-red-100 rounded-lg px-3 py-2 flex items-start gap-2">
                                                        <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                                        <p className="text-[11px] text-[#dc2626] leading-relaxed">
                                                            <span style={{ fontWeight: 600 }}>
                                                                At risk:
                                                            </span>{" "}
                                                            This word&apos;s accuracy is declining. Practice it
                                                            in isolation, then in full sentences to regain
                                                            confidence.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Footer stats */}
            <div className="flex flex-wrap gap-3 mt-4">
                {stats.improving > 0 && (
                    <div className="flex items-center gap-1.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-3 py-1.5">
                        <TrendingUp className="w-3 h-3 text-[#22c55e]" />
                        <p
                            className="text-[11px] text-[#16a34a]"
                            style={{ fontWeight: 500 }}
                        >
                            {stats.improving} improving
                        </p>
                    </div>
                )}
                {stats.declining > 0 && (
                    <div className="flex items-center gap-1.5 bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3 py-1.5">
                        <TrendingDown className="w-3 h-3 text-[#ef4444]" />
                        <p
                            className="text-[11px] text-[#dc2626]"
                            style={{ fontWeight: 500 }}
                        >
                            {stats.declining} declining
                        </p>
                    </div>
                )}
                {stats.mastered > 0 && (
                    <div className="flex items-center gap-1.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-3 py-1.5">
                        <Award className="w-3 h-3 text-[#22c55e]" />
                        <p
                            className="text-[11px] text-[#16a34a]"
                            style={{ fontWeight: 500 }}
                        >
                            {stats.mastered} mastered
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
