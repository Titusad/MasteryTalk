import { COLORS } from "./design-tokens";
import { BrandLogo } from "./BrandLogo";
import { motion } from "motion/react";
import type React from "react";

/* ─── Section Heading ─── */

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

/* ─── Check Icon ─── */

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

/* ─── X Icon ─── */

export function XIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M18 6L6 18" stroke={COLORS.auxText} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            <path d="M6 6L18 18" stroke={COLORS.auxText} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        </svg>
    );
}

/* ─── Dot Pattern ─── */

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

/* ─── Pastel Blobs ─── */

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

/* ─── Mini Footer ─── */

export function MiniFooter({ light = false }: { light?: boolean }) {
    return (
        <footer
            className={`w-full py-6 mt-auto border-t ${light ? "border-white/10" : "border-[#e2e8f0]"
                }`}
        >
            <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                <div className="opacity-60 scale-75 origin-left">
                    <BrandLogo light={light} />
                </div>
                <span
                    className={`text-xs ${light ? "text-white/40" : "text-[#4b5563]"
                        }`}
                >
                    © 2026 inFluentia PRO
                </span>
            </div>
        </footer>
    );
}

/* ─── Page Title Block ─── */

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

/* ─── Accuracy Ring ─── */

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

/* ─── Stage Badge ─── */

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

/* ─── Subtle Text Link ─── */

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

/* ─── Text Helpers ─── */

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

/* ─── Pricing Card ─── */

import { Zap } from "lucide-react";

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
            className={`relative rounded-3xl p-8 h-full flex flex-col ${bg} ${featured ? "shadow-xl md:-mt-4 md:mb-[-16px]" : "border border-gray-200"
                }`}
        >
            {badge && (
                <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs shadow-lg border ${dark
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs mb-6 ${dark ? "bg-white/15 text-emerald-300" : "bg-gray-100 text-[#008236]"
                        }`}
                >
                    <Zap className="w-3 h-3" />
                    <span style={{ fontWeight: 500 }}>{equivalent}</span>
                </div>
            )}
            {!equivalent && <div className="mb-6" />}

            <button
                className={`w-full py-3.5 rounded-full mb-6 transition-colors ${dark
                        ? "bg-white text-[#2d2d2d] hover:bg-gray-100 shadow-lg"
                        : "border-2 border-[#2d2d2d] text-gray-900 hover:bg-gray-50"
                    }`}
                style={{ fontWeight: 500 }}
                onClick={onSubscribe}
            >
                {buttonText}
            </button>

            <div
                className={`border-t pt-6 space-y-3 mt-auto ${dark ? "border-white/20" : "border-gray-200/60"
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
