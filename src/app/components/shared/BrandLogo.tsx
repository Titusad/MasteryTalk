import svgPaths from "../../../imports/svg-tv6st9nzh5";
import { COLORS } from "./design-tokens";

export function BrandLogo({ light = false }: { light?: boolean }) {
    const fill = light ? "#fff" : "#1C0B1E";
    const stroke = light ? "#fff" : "#000";
    return (
        <div className="flex items-center gap-1">
            <div className="h-[22px] w-[138px] relative shrink-0">
                <svg
                    className="block size-full"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 172.632 28.1822"
                >
                    <path d={svgPaths.p3dd0e3b0} fill={fill} stroke={stroke} strokeWidth="0.3" />
                    <path d={svgPaths.p33029580} fill={fill} stroke={stroke} strokeWidth="0.3" />
                    <path d={svgPaths.p1ab35300} fill={fill} stroke={stroke} strokeWidth="0.3" />
                    <path d={svgPaths.p21eb980} fill={fill} stroke={stroke} strokeWidth="0.3" />
                    <path d={svgPaths.p26b33e80} fill={fill} stroke={stroke} strokeWidth="0.3" />
                    <path d={svgPaths.p27baa600} fill={fill} stroke={stroke} strokeWidth="0.3" />
                    <path d={svgPaths.p26447100} fill={fill} stroke={stroke} strokeWidth="0.3" />
                    <path d={svgPaths.p3820af00} fill={fill} stroke={stroke} strokeWidth="0.3" />
                    <path d={svgPaths.p27b056c0} fill={fill} stroke={stroke} strokeWidth="0.3" />
                    <path d={svgPaths.p229b3d00} fill={fill} stroke={stroke} strokeWidth="0.3" />
                </svg>
            </div>
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
