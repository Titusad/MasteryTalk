import { Mic, Square } from "lucide-react";
import { motion } from "motion/react";

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
                        <span className="text-red-500 font-medium" >
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
            >
                {formatted}
            </span>
        </div>
    );
}
