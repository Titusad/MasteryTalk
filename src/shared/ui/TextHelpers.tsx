import type React from "react";

export function highlightEnglish(text: string) {
    const parts = text.split(/('.+?')/g);
    return parts.map((part, i) =>
        part.startsWith("'") && part.endsWith("'") ? (
            <span key={i} className="text-[#6366f1] font-medium" >
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
            <span key={i} className="font-semibold">{part}</span>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}

export function stripStressMarkers(text: string): string {
    return text.replace(/\*\*/g, "");
}
