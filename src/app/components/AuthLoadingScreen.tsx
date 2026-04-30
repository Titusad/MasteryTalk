import { motion } from "motion/react";
import { BrandLogo } from "@/shared/ui";

export function AuthLoadingScreen() {
  return (
    <div
      className="w-full min-h-screen bg-[#0f172b] flex flex-col items-center justify-center"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <motion.div
        className="flex flex-col items-center gap-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <BrandLogo light />

        {/* Dual-ring spinner — matches brand aesthetic */}
        <div className="relative w-10 h-10">
          <motion.div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/70"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-[3px] rounded-full border-2 border-transparent border-t-[#50C878]/60"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
