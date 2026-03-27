import { BrandLogo } from "./BrandLogo";

export function MiniFooter({ light = false }: { light?: boolean }) {
    return (
        <footer
            className={`w-full py-6 mt-auto border-t ${light ? "border-white/10" : "border-[#e2e8f0]"
                }`}
        >
            <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                <div className="opacity-60 scale-75 origin-left">
                    <BrandLogo light={light} />
                </div>
                <span
                    className={`text-xs ${light ? "text-white/40" : "text-[#4b5563]"
                        }`}
                >
                    © 2026 inFluentia PRO
                </span>
            </div>
        </footer>
    );
}
