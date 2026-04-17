/**
 * ReportSection — Reusable section wrapper with icon + title
 * Presentational component (web-specific).
 */
import { motion } from "motion/react";

interface ReportSectionProps {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  delay?: number;
  children: React.ReactNode;
}

export function ReportSection({
  icon,
  iconBg = "#0f172b",
  title,
  delay = 0,
  children,
}: ReportSectionProps) {
  return (
    <motion.div
      className="rounded-3xl bg-white border border-[#e2e8f0] p-6 md:p-8 mb-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        <h2 className="text-xl text-[#0f172b]" style={{ fontWeight: 500 }}>
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}
