import { COLORS } from "./design-tokens";

export function BrandLogo({ light = false }: { light?: boolean }) {
    return (
        <div className="flex items-center gap-0">
            <span
                className="text-xl tracking-tight"
                style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    color: light ? "#fff" : "#1C0B1E",
                }}
            >
                MasteryTalk
            </span>
            <span
                className="inline-block w-[5px] h-[5px] rounded-full mx-[2px]"
                style={{ background: COLORS.brandGradient }}
            />
            <span
                className="text-base"
                style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    background: COLORS.brandGradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                pro
            </span>
        </div>
    );
}

