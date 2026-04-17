import { COLORS } from "./design-tokens";

export function CheckIcon({ color = COLORS.success }: { color?: string }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path
                d="M20 6L9 17L4 12"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
            />
        </svg>
    );
}

export function XIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M18 6L6 18" stroke={COLORS.auxText} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            <path d="M6 6L18 18" stroke={COLORS.auxText} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        </svg>
    );
}
