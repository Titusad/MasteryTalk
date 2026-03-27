/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Lesson Library Page
 *
 *  Shows all available micro-lessons grouped by pillar.
 *  Accessible from the Dashboard header "Library" link.
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  Clock,
  ChevronRight,
  ArrowLeft,
  Search,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";
import { BrandLogo, MiniFooter } from "./shared";
import { MICRO_LESSONS, isLessonComplete, syncLessonProgress } from "@/services/microLessons";
import type { MicroLesson } from "@/services/microLessons";
import { LessonModal } from "./LessonModal";

/* ─── Pillar config ─── */
const PILLAR_META: Record<string, { color: string; emoji: string }> = {
  Grammar: { color: "#0ea5e9", emoji: "📐" },
  Vocabulary: { color: "#6366f1", emoji: "⚡" },
  Fluency: { color: "#22c55e", emoji: "🎯" },
  Pronunciation: { color: "#f59e0b", emoji: "🔊" },
  "Professional Tone": { color: "#ec4899", emoji: "👔" },
  Persuasion: { color: "#8b5cf6", emoji: "🏗️" },
};

const ALL_PILLARS = Object.keys(PILLAR_META);

/* ─── Props ─── */
interface LibraryPageProps {
  onBack: () => void;
}

export function LibraryPage({ onBack }: LibraryPageProps) {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonModalIndex, setLessonModalIndex] = useState(0);
  const [modalLessons, setModalLessons] = useState<MicroLesson[]>([]);
  const [, setCompletionTick] = useState(0); // force re-render on completion

  // Sync lesson progress from backend on mount
  useEffect(() => { syncLessonProgress().then(() => setCompletionTick((t) => t + 1)).catch(() => {}); }, []);

  /* Filter lessons */
  const filteredLessons = useMemo(() => {
    let lessons = MICRO_LESSONS;
    if (selectedPillar) {
      lessons = lessons.filter((l) => l.pillar === selectedPillar);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      lessons = lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.subtitle.toLowerCase().includes(q) ||
          l.pillar.toLowerCase().includes(q)
      );
    }
    return lessons;
  }, [selectedPillar, searchQuery]);

  /* Group by pillar */
  const groupedLessons = useMemo(() => {
    const groups: Record<string, MicroLesson[]> = {};
    for (const l of filteredLessons) {
      if (!groups[l.pillar]) groups[l.pillar] = [];
      groups[l.pillar].push(l);
    }
    return groups;
  }, [filteredLessons]);

  const openLesson = (lesson: MicroLesson) => {
    const list = filteredLessons;
    const idx = list.indexOf(lesson);
    setModalLessons(list);
    setLessonModalIndex(idx >= 0 ? idx : 0);
    setLessonModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 md:px-8 h-16 md:h-20">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors cursor-pointer"
              style={{ fontWeight: 500 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </div>
          <BrandLogo />
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-8 py-8 md:py-12">
        {/* ── Page title ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-7 h-7 text-[#0f172b]" />
            <h1
              className="text-2xl md:text-3xl text-[#0f172b]"
              style={{ fontWeight: 700 }}
            >
              Lesson Library
            </h1>
          </div>
          <p className="text-sm text-[#62748e] max-w-xl">
            All {MICRO_LESSONS.length} executive communication lessons. Study at
            your own pace, then practice skills in live sessions.
          </p>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lessons..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#0f172b] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all placeholder:text-[#cbd5e1]"
            />
          </div>

          {/* Pillar pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedPillar(null)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                !selectedPillar
                  ? "bg-[#0f172b] text-white"
                  : "bg-white border border-[#e2e8f0] text-[#45556c] hover:bg-[#f1f5f9]"
              }`}
              style={{ fontWeight: 500 }}
            >
              All
            </button>
            {ALL_PILLARS.map((pillar) => {
              const meta = PILLAR_META[pillar];
              const isActive = selectedPillar === pillar;
              return (
                <button
                  key={pillar}
                  onClick={() =>
                    setSelectedPillar(isActive ? null : pillar)
                  }
                  className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                    isActive
                      ? "text-white"
                      : "bg-white border border-[#e2e8f0] text-[#45556c] hover:bg-[#f1f5f9]"
                  }`}
                  style={{
                    fontWeight: 500,
                    ...(isActive
                      ? { backgroundColor: meta.color }
                      : {}),
                  }}
                >
                  {meta.emoji} {pillar}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Lesson grid ── */}
        {filteredLessons.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#94a3b8]">
              No lessons found. Try a different filter.
            </p>
          </div>
        ) : selectedPillar ? (
          /* Flat grid when filtering by pillar */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((lesson, i) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                index={i}
                onOpen={() => openLesson(lesson)}
              />
            ))}
          </div>
        ) : (
          /* Grouped by pillar */
          <div className="space-y-10">
            {ALL_PILLARS.filter((p) => groupedLessons[p]).map((pillar) => {
              const meta = PILLAR_META[pillar];
              const lessons = groupedLessons[pillar];
              return (
                <section key={pillar}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{meta.emoji}</span>
                    <h2
                      className="text-lg text-[#0f172b]"
                      style={{ fontWeight: 600 }}
                    >
                      {pillar}
                    </h2>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        fontWeight: 600,
                        backgroundColor: `${meta.color}12`,
                        color: meta.color,
                      }}
                    >
                      {lessons.length} lessons
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lessons.map((lesson, i) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        index={i}
                        onOpen={() => openLesson(lesson)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      <MiniFooter />

      {/* Lesson Modal */}
      {lessonModalOpen && (
        <LessonModal
          lessons={modalLessons}
          currentIndex={lessonModalIndex}
          onClose={() => setLessonModalOpen(false)}
          onNavigate={(i) => setLessonModalIndex(i)}
          onComplete={() => setCompletionTick((t) => t + 1)}
        />
      )}
    </div>
  );
}

/* ─── Lesson Card Component ─── */
function LessonCard({
  lesson,
  index,
  onOpen,
}: {
  lesson: MicroLesson;
  index: number;
  onOpen: () => void;
}) {
  const meta = PILLAR_META[lesson.pillar] || { color: "#6366f1" };
  const done = isLessonComplete(lesson.id);

  return (
    <motion.button
      onClick={onOpen}
      className={`w-full bg-white rounded-2xl border p-5 flex items-start gap-3 hover:shadow-lg transition-all text-left cursor-pointer group ${done ? "border-[#bbf7d0]" : "border-[#e2e8f0] hover:border-[#cbd5e1]"}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="relative shrink-0 mt-0.5">
        <span className="text-2xl">{lesson.icon}</span>
        {done && (
          <CheckCircle2 className="w-4 h-4 text-[#22c55e] absolute -top-1 -right-1.5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-sm text-[#0f172b] mb-1 group-hover:text-[#6366f1] transition-colors"
          style={{ fontWeight: 600 }}
        >
          {lesson.title}
        </p>
        <p className="text-[11px] text-[#62748e] leading-relaxed line-clamp-2 mb-2">
          {lesson.subtitle}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{
              fontWeight: 600,
              backgroundColor: `${meta.color}12`,
              color: meta.color,
            }}
          >
            {lesson.pillar}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
            <Clock className="w-3 h-3" />
            {lesson.duration}
          </span>
          {done && (
            <span className="flex items-center gap-1 text-[10px] text-[#22c55e]" style={{ fontWeight: 600 }}>
              ✓ Done
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[#cbd5e1] group-hover:text-[#6366f1] shrink-0 mt-3 transition-colors" />
    </motion.button>
  );
}
