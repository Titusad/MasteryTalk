import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import type React from "react";

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
