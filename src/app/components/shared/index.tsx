/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Shared Design System Components
 *  Tokens and reusable components aligned to the Design System.
 * ══════════════════════════════════════════════════════════════
 */

import svgPaths from "../../../imports/svg-tv6st9nzh5";
import { Zap, Mic, Square, CheckCircle2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ──────────────────────────────────────────────────────────────
   SMOOTH HEIGHT — ResizeObserver-based animated container
   ────────────────────────────────────────────────────────────── */

export function SmoothHeight({ children, className }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const h = el.scrollHeight;
      if (h > 0) setHeight(h);
    });
    // Defer first observation to avoid "send before connect"
    requestAnimationFrame(() => {
      observer.observe(el);
      isFirstRender.current = false;
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ height: height ?? "auto" }}
      transition={isFirstRender.current ? { duration: 0 } : { duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      style={{ overflow: "hidden" }}
      className={className}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   DESIGN TOKENS (centralised reference)
   ────────────────────────────────────────────────────────────── */

export const COLORS = {
  /* Core */
  darkPrimary: "#2d2d2d",
  darkHover: "#1a1a1a",
  textPrimary: "text-gray-900",         // titles
  textSecondary: "text-[#4B505B]",      // body, subtitles
  textMuted: "text-gray-600",           // feature lists, secondary body
  textMutedDark: "text-gray-400",       // muted on dark bg
  textOnDark: "text-white",

  /* Backgrounds */
  sectionAlt: "#f0f4f8",
  white: "#FFFFFF",

  /* Brand gradient */
  brandGradient: "linear-gradient(90deg, #00D3F3, #50C878)",
  brandCyan: "#00D3F3",
  brandGreen: "#50C878",

  /* Pastel palette — decorative only */
  peach: "#FFE9C7",
  blue: "#D9ECF0",
  green: "#DBEDDF",
  lavender: "#E1D4FF",
  softPurple: "#E1D5F8",

  /* Semantic */
  success: "#00C950",
  successAlt: "#008236",
  /** @deprecated for text — use #4b5563 for auxiliary text, #62748e for secondary text */
  mutedIcon: "#90A1B9",       /* @deprecated — migrated to #62748e (secondaryText) or #94a3b8 for placeholders. Kept only for reference. */
  auxText: "#4b5563",         /* auxiliary / hint text (dark enough for WCAG AA) */
  secondaryText: "#62748e",   /* secondary descriptions */
  simulationBg: "#0f172b",
} as const;

/* ──────────────────────────────────────────────────────────────
   BRAND LOGO
   ────────────────────────────────────────────────────────────── */

export function BrandLogo({ light = false }: { light?: boolean }) {
  const fill = light ? "#fff" : "#1C0B1E";
  const stroke = light ? "#fff" : "#000";
  return (
    <div className="flex items-center gap-1">
      <div className="h-[22px] w-[138px] relative shrink-0">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 172.632 28.1822"
        >
          <path d={svgPaths.p3dd0e3b0} fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d={svgPaths.p33029580} fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d={svgPaths.p1ab35300} fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d={svgPaths.p21eb980} fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d={svgPaths.p26b33e80} fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d={svgPaths.p27baa600} fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d={svgPaths.p26447100} fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d={svgPaths.p3820af00} fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d={svgPaths.p27b056c0} fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d={svgPaths.p229b3d00} fill={fill} stroke={stroke} strokeWidth="0.3" />
        </svg>
      </div>
      <span
        className="text-base"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          background: COLORS.brandGradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        pro
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   SECTION HEADING
   ────────────────────────────────────────────────────────────── */

export function SectionHeading({
  title,
  subtitle,
  light = false,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <h2
        className={`text-3xl md:text-4xl mb-4 ${light ? "text-white" : "text-gray-900"}`}
        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, lineHeight: 1.2 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg whitespace-pre-line ${light ? "text-gray-300" : "text-[#4B505B]"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   CHECK ICON
   ────────────────────────────────────────────────────────────── */

export function CheckIcon({ color = COLORS.success }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   X ICON
   ────────────────────────────────────────────────────────────── */

export function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M18 6L6 18" stroke={COLORS.mutedIcon} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
      <path d="M6 6L18 18" stroke={COLORS.mutedIcon} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   DOT PATTERN
   ────────────────────────────────────────────────────────────── */

export function DotPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    />
  );
}

/* ──────────────────────────────────────────────────────────────
   PASTEL BLOBS (abstract background — used on internal pages)
   ────────────────────────────────────────────────────────────── */

export function PastelBlobs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute -top-20 -left-24 w-[420px] h-[420px] rounded-full opacity-40" style={{ background: COLORS.peach, filter: "blur(100px)" }} />
      <div className="absolute -top-10 -right-32 w-[380px] h-[380px] rounded-full opacity-35" style={{ background: COLORS.blue, filter: "blur(110px)" }} />
      <div className="absolute top-1/2 -left-16 w-[300px] h-[300px] rounded-full opacity-35" style={{ background: COLORS.green, filter: "blur(100px)" }} />
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full opacity-30" style={{ background: COLORS.lavender, filter: "blur(120px)" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full opacity-20" style={{ background: COLORS.softPurple, filter: "blur(120px)" }} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   PRICING CARD
   ────────────────────────────────────────────────────────────── */

export function PricingCard({
  name,
  desc,
  price,
  period,
  equivalent,
  badge,
  featured = false,
  bg = "bg-white",
  features,
  buttonText = "Suscribirme",
  onSubscribe,
}: {
  name: string;
  desc: string;
  price: string;
  period?: string;
  equivalent?: string;
  badge?: string;
  featured?: boolean;
  bg?: string;
  features: string[];
  buttonText?: string;
  onSubscribe?: () => void;
}) {
  const dark = featured;

  return (
    <div
      className={`relative rounded-3xl p-8 h-full flex flex-col ${bg} ${
        featured ? "shadow-xl md:-mt-4 md:mb-[-16px]" : "border border-gray-200"
      }`}
    >
      {badge && (
        <div
          className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs shadow-lg border ${
            dark
              ? "bg-white text-[#2d2d2d] border-gray-200"
              : "bg-[#2d2d2d] text-white border-[#2d2d2d]"
          }`}
          style={{ fontWeight: 600 }}
        >
          {badge}
        </div>
      )}

      <h3
        className={`text-xl mb-1 ${dark ? "text-white" : "text-gray-900"}`}
        style={{ fontWeight: 600 }}
      >
        {name}
      </h3>
      <p className={`text-sm mb-6 ${dark ? "text-gray-400" : "text-[#4B505B]"}`}>{desc}</p>

      <div className="flex items-baseline gap-1 mb-1">
        <span
          className={`text-4xl ${dark ? "text-white" : "text-[#2d2d2d]"}`}
          style={{ fontWeight: 800 }}
        >
          {price}
        </span>
        <span className={`text-sm ${dark ? "text-gray-400" : "text-[#4B505B]"}`}>
          {period ? period : "USD"}
        </span>
      </div>
      {equivalent && (
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs mb-6 ${
            dark ? "bg-white/15 text-emerald-300" : "bg-gray-100 text-[#008236]"
          }`}
        >
          <Zap className="w-3 h-3" />
          <span style={{ fontWeight: 500 }}>{equivalent}</span>
        </div>
      )}
      {!equivalent && <div className="mb-6" />}

      <button
        className={`w-full py-3.5 rounded-full mb-6 transition-colors ${
          dark
            ? "bg-white text-[#2d2d2d] hover:bg-gray-100 shadow-lg"
            : "border-2 border-[#2d2d2d] text-gray-900 hover:bg-gray-50"
        }`}
        style={{ fontWeight: 500 }}
        onClick={onSubscribe}
      >
        {buttonText}
      </button>

      <div
        className={`border-t pt-6 space-y-3 mt-auto ${
          dark ? "border-white/20" : "border-gray-200/60"
        }`}
      >
        {features.map((f) => (
          <div key={f} className="flex items-start gap-3">
            <CheckIcon color={dark ? "#ffffff" : "#2d2d2d"} />
            <p className={`text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>{f}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MINI FOOTER (brand closure for internal pages)
   ────────────────────────────────────────────────────────────── */

export function MiniFooter({ light = false }: { light?: boolean }) {
  return (
    <footer
      className={`w-full py-6 mt-auto border-t ${
        light ? "border-white/10" : "border-[#e2e8f0]"
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
        <div className="opacity-60 scale-75 origin-left">
          <BrandLogo light={light} />
        </div>
        <div className="flex items-center gap-4">
          {/* DEV shortcut — remove later */}
          <a
            href="#dashboard"
            className={`text-xs underline underline-offset-2 transition-colors ${
              light
                ? "text-white/40 hover:text-white/70"
                : "text-[#4b5563] hover:text-[#0f172b]"
            }`}
          >
            Go to dashboard
          </a>
          <span
            className={`text-xs ${
              light ? "text-white/40" : "text-[#4b5563]"
            }`}
          >
            © 2026 inFluentia PRO
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────────────────────
   RECORD BUTTON
   Unified mic button with brand gradient (idle) and red (recording).
   Two sizes: "lg" (160 px container with rings+glow, for chat)
              "sm" (compact, for inline use)
   ────────────────────────────────────────────────────────────── */

export function RecordButton({
  isRecording,
  onClick,
  size = "lg",
  label,
  disabled,
}: {
  isRecording: boolean;
  onClick: () => void;
  size?: "lg" | "sm";
  label?: string;
  disabled?: boolean;
}) {
  const btnSize = size === "lg" ? 80 : 56;
  const containerSize = size === "lg" ? 160 : 80;
  const iconSize = size === "lg" ? 40 : 26;
  const squareSize = size === "lg" ? 32 : 22;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center overflow-visible pointer-events-none"
        style={{ width: containerSize, height: containerSize }}
      >
        {/* Ambient glow */}
        <motion.div
          className="absolute rounded-full blur-2xl pointer-events-none"
          style={{
            width: btnSize + 32,
            height: btnSize + 32,
            background: isRecording
              ? "rgba(239,68,68,0.25)"
              : "linear-gradient(135deg, rgba(0,211,243,0.3), rgba(80,200,120,0.35))",
          }}
          animate={
            isRecording
              ? { scale: [1, 1.4, 1], opacity: [0.5, 0.85, 0.5] }
              : { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }
          }
          transition={{
            duration: isRecording ? 1.8 : 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Pulsing rings */}
        {isRecording ? (
          <>
            <motion.div
              className="absolute rounded-full border-2 border-red-400/30"
              animate={{
                width: [btnSize, btnSize + 50],
                height: [btnSize, btnSize + 50],
                opacity: [0.6, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute rounded-full border-2 border-red-400/20"
              animate={{
                width: [btnSize, btnSize + 70],
                height: [btnSize, btnSize + 70],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.4,
              }}
            />
          </>
        ) : (
          <>
            <motion.div
              className="absolute rounded-full"
              style={{ border: "2px solid rgba(80,200,120,0.25)" }}
              animate={{
                width: [btnSize, btnSize + 40],
                height: [btnSize, btnSize + 40],
                opacity: [0.5, 0],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{ border: "2px solid rgba(0,211,243,0.2)" }}
              animate={{
                width: [btnSize, btnSize + 60],
                height: [btnSize, btnSize + 60],
                opacity: [0.35, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5,
              }}
            />
          </>
        )}

        {/* The button */}
        <motion.button
          className="relative z-10 rounded-full flex items-center justify-center pointer-events-auto"
          style={{
            width: btnSize,
            height: btnSize,
            background: isRecording
              ? "#ef4444"
              : disabled
                ? "#94a3b8"
                : "linear-gradient(135deg, #00D3F3, #50C878)",
            boxShadow: isRecording
              ? "0 8px 30px rgba(239,68,68,0.4)"
              : disabled
                ? "none"
                : "0 8px 30px rgba(40,180,100,0.35), 0 0 0 4px rgba(80,200,120,0.12)",
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
          whileHover={!isRecording && !disabled ? { scale: 1.08 } : {}}
          whileTap={!disabled ? { scale: 0.93 } : {}}
          animate={isRecording ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={
            isRecording
              ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
          onClick={disabled ? undefined : onClick}
          aria-disabled={disabled}
        >
          {isRecording ? (
            <Square
              className="text-white"
              style={{ width: squareSize, height: squareSize }}
              fill="white"
            />
          ) : (
            <Mic
              className="text-white drop-shadow-sm"
              style={{ width: iconSize, height: iconSize }}
            />
          )}
        </motion.button>
      </div>

      {label && (
        <p className="text-sm text-[#45556c]">
          {isRecording ? (
            <span className="text-red-500" style={{ fontWeight: 500 }}>
              {label}
            </span>
          ) : (
            <span
              style={{
                fontWeight: 500,
                background: "linear-gradient(90deg, #00D3F3, #50C878)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {label}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   RECORDING WAVEFORM
   Animated bars shown during voice recording.
   ────────────────────────────────────────────────────────────── */

export function RecordingWaveformBars({
  color = "#ef4444",
  count = 7,
  height = 24,
}: {
  color?: string;
  count?: number;
  height?: number;
}) {
  return (
    <div className="flex items-center gap-[3px]" style={{ height }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            height: [height * 0.25, height * 0.75, height * 0.33, height * 0.92, height * 0.25],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   RECORDING TIMER
   Red dot + elapsed time — shown while recording.
   ────────────────────────────────────────────────────────────── */

export function RecordingTimer({ timeMs }: { timeMs: number }) {
  const totalSec = Math.floor(timeMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const formatted = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="w-2.5 h-2.5 rounded-full bg-red-500"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <span
        className="text-sm text-red-500 tabular-nums"
        style={{ fontWeight: 600 }}
      >
        {formatted}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   PAGE TITLE BLOCK
   Unified pattern for internal page titles:
   circular icon (w-16 h-16) + h1 (light 300) + subtitle.
   Used in PracticeSetup, SessionFeedback, ImprovedScript, etc.
   ────────────────────────────────────────────────────────────── */

export function PageTitleBlock({
  icon,
  iconBg = "#0f172b",
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      className="text-center mb-12"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <h1
        className="text-2xl md:text-[32px] text-[#0f172b] mb-3"
        style={{ fontWeight: 300, lineHeight: 1.25 }}
      >
        {title}
      </h1>
      <p className="text-base text-[#45556c]">{subtitle}</p>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   HIGHLIGHT ENGLISH
   Renders text between single quotes ('…') in purple (#6366f1).
   Used in feedback opportunities and coaching tips.
   ────────────────────────────────────────────────────────────── */

export function highlightEnglish(text: string) {
  const parts = text.split(/('.+?')/g);
  return parts.map((part, i) =>
    part.startsWith("'") && part.endsWith("'") ? (
      <span key={i} className="text-[#6366f1]" style={{ fontWeight: 500 }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

/* ──────────────────────────────────────────────────────────────
   STRESSED PHRASE HELPERS
   Render **stressed** syllables as bold spans,
   and strip markers for plain-text / length calculations.
   ───────────────────────────────────────────────────────────── */

export function renderStressedPhrase(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={{ fontWeight: 600 }}>{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function stripStressMarkers(text: string): string {
  return text.replace(/\*\*/g, "");
}

/* ──────────────────────────────────────────────────────────────
   ACCURACY RING
   Circular SVG score ring with color thresholds:
     80 green · ≥60 amber · <60 red
   Animated fill on mount. Used in feedback screens.
   ────────────────────────────────────────────────────────────── */

export function AccuracyRing({ score }: { score: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="6"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl text-[#0f172b]"
          style={{ fontWeight: 600 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {score}%
        </motion.span>
        <span className="text-[10px] text-[#45556c] uppercase tracking-wider">
          accuracy
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   HIGHLIGHT WITH TOOLTIP
   Colored inline highlight that reveals a coaching tooltip
   on hover / tap. Supports viewport-edge nudging.
   Categories: Estructura (#E1D5F8), Impacto (#FFE9C7),
               Engagement (#D9ECF0).
   ────────────────────────────────────────────────────────────── */

/** Boost saturation of a hex color by a given factor (0–1 = 0–100%) */
function boostSaturation(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  const ns = Math.min(1, s + amount);
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + ns) : l + ns - l * ns;
  const p = 2 * l - q;
  const nr = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const ng = Math.round(hue2rgb(p, q, h) * 255);
  const nb = Math.round(hue2rgb(p, q, h - 1/3) * 255);
  return `#${nr.toString(16).padStart(2,"0")}${ng.toString(16).padStart(2,"0")}${nb.toString(16).padStart(2,"0")}`;
}

const HIGHLIGHT_META: Record<string, { category: string; icon: string }> = {
  "#E1D5F8": { category: "Estructura", icon: "\u{1F9E9}" },
  "#FFE9C7": { category: "Impacto", icon: "\u{1F4CA}" },
  "#D9ECF0": { category: "Engagement", icon: "\u{1F4AC}" },
};

export function HighlightWithTooltip({
  phrase,
  color,
  tooltip,
}: {
  phrase: string;
  color: string;
  tooltip?: string;
}) {
  const [show, setShow] = useState(false);
  const meta = HIGHLIGHT_META[color];
  const borderColor = boostSaturation(color, 0.3);
  const spanRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [nudge, setNudge] = useState(0);

  /* Close tooltip when tapping outside (mobile) */
  useEffect(() => {
    if (!show) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (spanRef.current && !spanRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [show]);

  /* Prevent tooltip from clipping viewport edges */
  useEffect(() => {
    if (!show || !tooltipRef.current) {
      setNudge(0);
      return;
    }
    const rect = tooltipRef.current.getBoundingClientRect();
    const pad = 12;
    if (rect.left < pad) {
      setNudge(pad - rect.left);
    } else if (rect.right > window.innerWidth - pad) {
      setNudge(window.innerWidth - pad - rect.right);
    } else {
      setNudge(0);
    }
  }, [show]);

  return (
    <span
      ref={spanRef}
      className="relative inline px-0.5 mx-0.5 cursor-default transition-all"
      style={{
        borderBottom: `2px solid ${borderColor}`,
        fontWeight: 500,
        boxShadow:
          show && tooltip
            ? `0 2px 8px ${borderColor}80`
            : "none",
      }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={(e) => {
        e.stopPropagation();
        setShow((prev) => !prev);
      }}
    >
      {phrase}
      <AnimatePresence>
        {show && tooltip && meta && (
          <motion.span
            ref={tooltipRef}
            className="absolute left-1/2 bottom-full mb-2.5 z-50 pointer-events-none"
            style={{
              width: "min(256px, 80vw)",
              transform: `translateX(calc(-50% + ${nudge}px))`,
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
          >
            <span
              className="block bg-[#0f172b] text-white rounded-xl px-4 py-3 shadow-lg text-left"
              style={{ fontSize: 13, lineHeight: 1.5 }}
            >
              <span className="flex items-center gap-2 mb-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span style={{ fontWeight: 600, fontSize: 12 }}>
                  {meta.category}
                </span>
              </span>
              <span style={{ fontWeight: 400 }}>{tooltip}</span>
            </span>
            {/* Arrow — stays centered on the highlight */}
            <span
              className="absolute left-1/2 -bottom-1 w-2.5 h-2.5 bg-[#0f172b]"
              style={{
                transform: `translateX(calc(-50% - ${nudge}px)) rotate(45deg)`,
              }}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   ANALYZING SCREEN
   Full-screen dark transition loader with progress bar
   and sequential step indicators.
   Variants: "feedback" | "script" | "results"
   ──────────────────────────────────────────────────────────── */

interface AnalysisConfig {
  title: string;
  subtitle: string;
  steps: { text: string; duration: number }[];
  /** Motivational messages — rotate during loading */
  affirmations: string[];
}

const ANALYSIS_CONFIGS: Record<string, AnalysisConfig> = {
  feedback: {
    title: "Analyzing your presentation",
    subtitle: "Our AI is reviewing every detail of your practice",
    steps: [
      { text: "Transcribing your conversation...", duration: 1200 },
      { text: "Analyzing pronunciation and fluency...", duration: 1400 },
      { text: "Evaluating vocabulary and grammar...", duration: 1300 },
      { text: "Generating personalized feedback...", duration: 1600 },
    ],
    affirmations: [
      "People have a better impression of you than you think. It's called the Liking Gap — and science confirms it.",
      "Every conversation you face brings you closer to fluency. Progress isn't always visible, but it's always real.",
      "Your accent isn't a barrier — it's your story. Clarity and confidence matter more than perfection.",
    ],
  },
  script: {
    title: "Preparing your improved script",
    subtitle: "AI is optimizing your speech with professional suggestions",
    steps: [
      { text: "Reviewing speech structure...", duration: 900 },
      { text: "Identifying areas for improvement...", duration: 1100 },
      { text: "Applying vocabulary enhancements...", duration: 1000 },
      { text: "Generating optimized script...", duration: 1200 },
    ],
    affirmations: [
      "Professional English fluency isn't about speaking fast — it's about strategic pauses, clarity, and control.",
      "A small grammar mistake is human and doesn't diminish your arguments. Authenticity builds trust.",
    ],
  },
  results: {
    title: "Calculating your results",
    subtitle: "We're preparing the complete summary of your session",
    steps: [
      { text: "Evaluating your performance...", duration: 1100 },
      { text: "Comparing with your initial practice...", duration: 1300 },
      { text: "Calculating progress metrics...", duration: 1200 },
      { text: "Preparing final summary...", duration: 1300 },
    ],
    affirmations: [
      "Clarity over speed. Your accent tells your story — it doesn't limit your impact.",
      "Practicing is more valuable than memorizing. Each session builds neural pathways that stick.",
      "The most successful professionals aren't the ones who never make mistakes — they're the ones who practice more.",
    ],
  },
  "generating-script": {
    title: "Generating your personalized script",
    subtitle: "Our AI is building your narrative strategy",
    steps: [
      { text: "Analyzing your value pillars...", duration: 1200 },
      { text: "Building your narrative arc...", duration: 1400 },
      { text: "Selecting power phrases for your context...", duration: 1300 },
      { text: "Personalizing your conversation script...", duration: 1400 },
    ],
    affirmations: [
      "Your ideas have value. Language is just the vehicle.",
      "90% of success in executive communication is preparation. You're already one step ahead by being here.",
      "Structure beats improvisation. Having a plan gives you freedom to be natural.",
    ],
  },
};

export function AnalyzingScreen({
  variant = "feedback",
  onComplete,
}: {
  variant?: "feedback" | "script" | "results" | "generating-script";
  onComplete: () => void;
}) {
  const config = ANALYSIS_CONFIGS[variant];
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [affirmationIdx, setAffirmationIdx] = useState(0);

  useEffect(() => {
    // Step progression
    let cumulative = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    config.steps.forEach((s, i) => {
      if (i > 0) {
        cumulative += config.steps[i - 1].duration;
        timers.push(setTimeout(() => setActiveStep(i), cumulative));
      }
    });

    // Smooth progress bar
    const totalDuration = config.steps.reduce((sum, s) => sum + s.duration, 0);
    const interval = 40;
    let elapsed = 0;
    const progressTimer = setInterval(() => {
      elapsed += interval;
      const pct = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(progressTimer);
    }, interval);

    // Affirmation rotation — switch every ~3.5s so user can read
    const affirmationTimer = setInterval(() => {
      setAffirmationIdx((prev) => (prev + 1) % config.affirmations.length);
    }, 3500);

    // Auto-advance
    const finishTimer = setTimeout(() => {
      onComplete();
    }, totalDuration + 400);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progressTimer);
      clearInterval(affirmationTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div
      className="w-full min-h-[calc(100dvh-4rem)] bg-[#0f172b] flex flex-col items-center justify-center px-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <motion.div
        className="text-center max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-10">
          <BrandLogo light />
        </div>

        {/* Animated analysis icon */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${COLORS.brandCyan}40, ${COLORS.brandGreen}40, transparent)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full bg-white/5 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${COLORS.brandCyan}15, transparent 70%)`,
              }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="flex items-center gap-[3px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{
                    background: `linear-gradient(to top, ${COLORS.brandCyan}, ${COLORS.brandGreen})`,
                  }}
                  animate={{
                    height: [8, 20 + Math.random() * 10, 8],
                  }}
                  transition={{
                    duration: 0.6 + i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Title */}
        <motion.h2
          className="text-white text-xl mb-2"
          style={{ fontWeight: 500 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {config.title}
        </motion.h2>
        <motion.p
          className="text-white/50 text-sm mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {config.subtitle}
        </motion.p>

        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto mb-8">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${COLORS.brandCyan}, ${COLORS.brandGreen})`,
                width: `${progress}%`,
              }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
          <p className="text-white/30 text-xs mt-2 text-right">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-left max-w-xs mx-auto">
          {config.steps.map((s, i) => {
            const isActive = activeStep === i;
            const isDone = activeStep > i;
            return (
              <motion.div
                key={i}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: activeStep >= i ? 1 : 0.25,
                  x: 0,
                }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
              >
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#50C878]" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    className="w-4 h-4 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <div
                      className="w-3 h-3 rounded-full border-2 border-transparent border-t-white/80"
                    />
                  </motion.div>
                ) : (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  </div>
                )}
                <span
                  className={`text-sm transition-colors duration-500 ${
                    isDone
                      ? "text-[#50C878]/80"
                      : isActive
                        ? "text-white/90"
                        : "text-white/30"
                  }`}
                >
                  {s.text}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* ── Mindset Affirmation — large, rotating ── */}
        <div className="mt-10 mb-2 min-h-[80px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={affirmationIdx}
              className="text-white/70 text-base md:text-lg leading-relaxed max-w-sm mx-auto italic"
              style={{ fontWeight: 300 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              &ldquo;{config.affirmations[affirmationIdx]}&rdquo;
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Skip button — lets users skip the analyzing animation */}
        <motion.button
          className="mt-8 text-sm text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={onComplete}
        >
          Skip
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   STAGE BADGE
   Colored status pill shown during shadowing and voice practice.
   Variants: idle, active (blue), warning (amber), success (green),
             recording (red), analyzing (purple).
   ────────────────────────────────────────────────────────────── */

type StageBadgeVariant =
  | "idle"
  | "active"
  | "warning"
  | "success"
  | "recording"
  | "analyzing";

const BADGE_STYLES: Record<StageBadgeVariant, string> = {
  idle: "bg-[#f8fafc] border-[#e2e8f0] text-[#45556c]",
  active: "bg-[#eff6ff] border-[#bfdbfe] text-[#2563eb]",
  warning: "bg-[#fff7ed] border-[#fed7aa] text-[#c2410c]",
  success: "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]",
  recording: "bg-[#fef2f2] border-[#fecaca] text-[#dc2626]",
  analyzing: "bg-[#f5f3ff] border-[#ddd6fe] text-[#6366f1]",
};

export function StageBadge({
  variant = "idle",
  children,
}: {
  variant?: StageBadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={`rounded-full px-5 py-2 text-sm border ${BADGE_STYLES[variant]}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   SUBTLE TEXT LINK
   Discreet underline link ("Finalizar práctica") used as
   secondary action on feedback / script screens.
   ────────────────────────────────────────────────────────────── */

export function SubtleTextLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-[#45556c]/70 hover:text-[#0f172b] transition-colors underline underline-offset-2"
    >
      {children}
    </button>
  );
}