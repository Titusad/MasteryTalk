import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useNarration } from "@/shared/lib/useNarration";
import type { InterlocutorKey } from "@/features/practice-session/model/narrator-audio";

/* ── Interlocutor metadata ── */

interface InterlocutorMeta {
  name: string;
  role: string;
  hook: string;
  initials: string;
  color: string;
  tagline: string;
}

const INTERLOCUTOR_META: Record<string, InterlocutorMeta> = {
  recruiter: {
    name: "Sarah Chen",
    role: "Corporate Talent Acquisition",
    hook: "15-20 candidates a day. You have 60 seconds to make her remember you.",
    initials: "SC",
    color: "#6366f1",
    tagline: "Fast, evaluative, remembers everything.",
  },
  hiring_manager: {
    name: "Marcus Rivera",
    role: "Your Future Direct Manager",
    hook: "He speaks in outcomes. Show him what you've delivered, not what you've done.",
    initials: "MR",
    color: "#0ea5e9",
    tagline: "Outcome-focused. No time for backstory.",
  },
  sme: {
    name: "Dr. Priya Nair",
    role: "Senior Technical Evaluator",
    hook: "She'll probe until she finds the edge of your knowledge. Don't fake it.",
    initials: "PN",
    color: "#14b8a6",
    tagline: "Precise, patient, relentless on depth.",
  },
  hr: {
    name: "Jordan Lee",
    role: "Culture & Sustainability Evaluator",
    hook: "They want the real story. Corporate answers will work against you.",
    initials: "JL",
    color: "#a78bfa",
    tagline: "Reads between the lines. Authenticity wins.",
  },
  gatekeeper: {
    name: "Chris Avery",
    role: "Sales Development Representative",
    hook: "He filters 15 vendors a day. You have 5 minutes. Lead with value.",
    initials: "CA",
    color: "#f59e0b",
    tagline: "Skeptical by design. Earn the next call.",
  },
  technical_buyer: {
    name: "Elena Kovacs",
    role: "Internal Technical Specialist",
    hook: "Marketing promises mean nothing. She wants proof of concept.",
    initials: "EK",
    color: "#10b981",
    tagline: "Data over narrative. Show, don't tell.",
  },
  champion: {
    name: "Diana Park",
    role: "Department Head & Internal Ally",
    hook: "She wants to buy. Help her build the business case for her VP.",
    initials: "DP",
    color: "#22c55e",
    tagline: "On your side — if you give her the right ammunition.",
  },
  decision_maker: {
    name: "Robert Walsh",
    role: "C-Level Executive",
    hook: "15 minutes. Cost, savings, risk. That's all he wants to hear.",
    initials: "RW",
    color: "#ef4444",
    tagline: "Impatient, strategic, unforgiving of vagueness.",
  },
  meeting_facilitator: {
    name: "Alex Morgan",
    role: "Structured Timekeeper",
    hook: "They keep the agenda moving. Ramble and they'll cut you off.",
    initials: "AM",
    color: "#0ea5e9",
    tagline: "Process over politics. Conciseness is respect.",
  },
  senior_stakeholder: {
    name: "Victoria Osei",
    role: "VP / Director",
    hook: "She goes on tangents. Your job: redirect diplomatically and close with decisions.",
    initials: "VO",
    color: "#8b5cf6",
    tagline: "Strategic vision, scattered attention. Guide her.",
  },
  egalitarian_leader: {
    name: "Sam Torres",
    role: "Flat-Hierarchy U.S. Leader",
    hook: "Titles mean nothing here. Ideas and ownership are what count.",
    initials: "ST",
    color: "#06b6d4",
    tagline: "Direct, inclusive, allergic to hierarchy theatre.",
  },
};

/* ── Waveform bars — animate while audio plays ── */

function Waveform({ active }: { active: boolean }) {
  const bars = [4, 8, 14, 10, 6, 12, 8, 5, 11, 7, 13, 9, 5];
  return (
    <div className="flex items-center gap-[3px] h-8">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-white/60"
          animate={active
            ? { height: [`${h}px`, `${h * 2.2}px`, `${h}px`] }
            : { height: "3px" }
          }
          transition={{
            repeat: active ? Infinity : 0,
            duration: 0.5 + i * 0.07,
            ease: "easeInOut",
            delay: i * 0.04,
          }}
        />
      ))}
    </div>
  );
}

/* ── Main component ── */

export function InterlocutorIntroScreen({
  interlocutor,
  narratorUrl,
  onReady,
}: {
  interlocutor: string;
  narratorUrl?: string;
  onReady: () => void;
}) {
  const meta = INTERLOCUTOR_META[interlocutor] ?? INTERLOCUTOR_META.recruiter;
  const { isPlaying, isDone } = useNarration(narratorUrl || null);

  // Allow proceeding after 3s even if audio hasn't started (autoplay blocked)
  const [canProceed, setCanProceed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setCanProceed(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const ready = isDone || canProceed;

  return (
    <div
      className="w-full min-h-[calc(100dvh-4rem)] bg-[#0f172b] flex flex-col items-center justify-center px-6"
     
    >
      <motion.div
        className="text-center max-w-md w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Label */}
        <motion.p
          className="text-white/35 text-xs uppercase tracking-widest mb-8"
          style={{ fontWeight: 500 }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          You're about to speak with
        </motion.p>

        {/* Avatar */}
        <motion.div
          className="relative w-24 h-24 mx-auto mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35, type: "spring", stiffness: 200 }}
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-white/15"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -inset-2 rounded-full border border-white/8"
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.4 }}
          />
          {/* Avatar circle — unique color per interlocutor */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-white/20"
            style={{ backgroundColor: `${meta.color}22`, boxShadow: `0 0 0 1px ${meta.color}44` }}
          >
            <span className="text-xl" style={{ fontWeight: 700, color: meta.color }}>
              {meta.initials}
            </span>
          </div>
        </motion.div>

        {/* Name */}
        <motion.h1
          className="text-white text-2xl mb-1"
          style={{ fontWeight: 600 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {meta.name}
        </motion.h1>

        {/* Role */}
        <motion.p
          className="text-white/45 text-sm mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          {meta.role}
        </motion.p>

        {/* Tagline — coaching style in one line */}
        <motion.p
          className="text-xs mb-8"
          style={{ color: meta.color, fontWeight: 500 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        >
          {meta.tagline}
        </motion.p>

        {/* Waveform or hook text */}
        <motion.div
          className="flex flex-col items-center gap-4 mb-10 min-h-[60px] justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {isPlaying ? (
            <Waveform active={isPlaying} />
          ) : (
            <p className="text-white/60 text-base leading-relaxed max-w-sm mx-auto italic" style={{ fontWeight: 300 }}>
              "{meta.hook}"
            </p>
          )}
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={onReady}
          disabled={!ready}
          className={`flex items-center gap-2.5 mx-auto px-8 py-3.5 rounded-full text-base transition-all ${
            ready
              ? "bg-white text-[#0f172b] hover:bg-gray-100 shadow-lg cursor-pointer"
              : "bg-white/10 text-white/25 cursor-not-allowed"
          }`}
          style={{ fontWeight: 600 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          I'm ready — Start the session
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        {!ready && (
          <motion.p
            className="text-white/20 text-xs mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Listen to the briefing first
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
