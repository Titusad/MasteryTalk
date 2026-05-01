import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

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
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    const q = l < 0.5 ? l * (1 + ns) : l + ns - l * ns;
    const p = 2 * l - q;
    const nr = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    const ng = Math.round(hue2rgb(p, q, h) * 255);
    const nb = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
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
                                <span style={{ fontSize: 12 }}>
                                    {meta.category}
                                </span>
                            </span>
                            <span style={{ fontWeight: 400 }}>{tooltip}</span>
                        </span>
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
