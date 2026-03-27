import type React from "react";

export function SubtleTextLink({
    onClick,
    children,
}: {
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className="text-sm text-[#45556c]/70 hover:text-[#0f172b] transition-colors underline underline-offset-2"
        >
            {children}
        </button>
    );
}
