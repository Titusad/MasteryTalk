import { COLORS } from "./design-tokens";

export function PastelBlobs() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute -top-20 -left-24 w-[420px] h-[420px] rounded-full opacity-40" style={{ background: COLORS.peach, filter: "blur(100px)" }} />
            <div className="absolute -top-10 -right-32 w-[380px] h-[380px] rounded-full opacity-35" style={{ background: COLORS.blue, filter: "blur(110px)" }} />
            <div className="absolute top-1/2 -left-16 w-[300px] h-[300px] rounded-full opacity-35" style={{ background: COLORS.green, filter: "blur(100px)" }} />
            <div className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full opacity-30" style={{ background: COLORS.lavender, filter: "blur(120px)" }} />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full opacity-20" style={{ background: COLORS.softPurple, filter: "blur(120px)" }} />
        </div>
    );
}
