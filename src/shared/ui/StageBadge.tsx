import { motion } from "motion/react";
import type React from "react";

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
