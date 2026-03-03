import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BrandLogo } from "./shared";

export function LoadingScreen({ scenario }: { scenario: string }) {
  const [step, setStep] = useState(0);

  const steps = [
    "Analyzing your scenario...",
    "Configuring AI interlocutor...",
    "Preparing your simulator...",
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 800);
    const timer2 = setTimeout(() => setStep(2), 1700);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div
      className="w-full h-full bg-[#0f172b] flex flex-col items-center justify-center px-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-10">
          <BrandLogo light />
        </div>

        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-8">
          <motion.div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/80"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#50C878]/60"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Scenario preview */}
        {scenario && (
          <motion.div
            className="bg-white/5 rounded-2xl px-5 py-4 mb-8 border border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p
              className="text-white/40 text-xs mb-1"
              style={{ fontWeight: 500 }}
            >
              Your scenario
            </p>
            <p className="text-white/80 text-sm">{scenario}</p>
          </motion.div>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((text, i) => (
            <motion.div
              key={text}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: step >= i ? 1 : 0.3,
                x: 0,
              }}
              transition={{ duration: 0.4, delay: i * 0.3 }}
            >
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                  step >= i ? "bg-[#50C878]" : "bg-white/20"
                }`}
              />
              <span
                className={`text-sm transition-colors duration-500 ${
                  step >= i ? "text-white/80" : "text-white/30"
                }`}
              >
                {text}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}