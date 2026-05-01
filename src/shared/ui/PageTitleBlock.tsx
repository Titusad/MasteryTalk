import { motion } from "motion/react";
import type React from "react";

export function PageTitleBlock({
    icon,
    iconBg = "#0f172b",
    title,
    subtitle,
    children,
}: {
    icon?: React.ReactNode;
    iconBg?: string;
    title: string;
    subtitle: string;
    children?: React.ReactNode;
}) {
    return (
        <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-center gap-4 mb-3">
                {icon && (
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: iconBg }}
                    >
                        {icon}
                    </div>
                )}
                <h1
                    className="text-2xl md:text-[32px] text-[#0f172b] text-left"
                    style={{ lineHeight: 1.25 }}
                >
                    {title}
                </h1>
            </div>
            <p className="text-base text-[#45556c] max-w-2xl mx-auto">{subtitle}</p>
            {children && <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-3">{children}</div>}
        </motion.div>
    );
}
