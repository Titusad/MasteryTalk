/**
 * FeedbackAccordion — Collapsible section with animation.
 * Extracted from ConversationFeedback for reuse.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

export function FeedbackAccordion({
  icon,
  title,
  badge,
  defaultOpen = false,
  isOpen,
  onToggle,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  delay?: number;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;

  const handleToggle = () => {
    if (isControlled && onToggle) {
      onToggle();
    } else {
      setInternalOpen(!open);
    }
  };

  return (
    <motion.div
      className="bg-white border border-[#e2e8f0] rounded-3xl overflow-hidden mb-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-3 p-4 md:p-6 text-left hover:bg-[#f8fafc] transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-[#0f172b] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-[#0f172b] text-base"
            style={{ fontWeight: 600 }}
          >
            {title}
          </h3>
        </div>
        {badge}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown className="w-5 h-5 text-[#94a3b8]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 md:px-6 md:pb-8">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
