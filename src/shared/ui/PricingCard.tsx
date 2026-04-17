import { Zap } from "lucide-react";
import { CheckIcon } from "./Icons";

export function PricingCard({
    name,
    desc,
    price,
    period,
    equivalent,
    badge,
    featured = false,
    bg = "bg-white",
    features,
    buttonText = "Suscribirme",
    onSubscribe,
}: {
    name: string;
    desc: string;
    price: string;
    period?: string;
    equivalent?: string;
    badge?: string;
    featured?: boolean;
    bg?: string;
    features: string[];
    buttonText?: string;
    onSubscribe?: () => void;
}) {
    const dark = featured;

    return (
        <div aria-label=\"PricingCard"
            className={`relative rounded-3xl p-8 h-full flex flex-col ${bg} ${featured ? "shadow-xl md:-mt-4 md:mb-[-16px]" : "border border-gray-200"
                }`}
        >
            {badge && (
                <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs shadow-lg border ${dark
                            ? "bg-white text-[#2d2d2d] border-gray-200"
                            : "bg-[#2d2d2d] text-white border-[#2d2d2d]"
                        }`}
                    style={{ fontWeight: 600 }}
                >
                    {badge}
                </div>
            )}

            <h3
                className={`text-xl mb-1 ${dark ? "text-white" : "text-gray-900"}`}
                style={{ fontWeight: 600 }}
            >
                {name}
            </h3>
            <p className={`text-sm mb-6 ${dark ? "text-gray-400" : "text-[#4B505B]"}`}>{desc}</p>

            <div className="flex items-baseline gap-1 mb-1">
                <span
                    className={`text-4xl ${dark ? "text-white" : "text-[#2d2d2d]"}`}
                    style={{ fontWeight: 800 }}
                >
                    {price}
                </span>
                <span className={`text-sm ${dark ? "text-gray-400" : "text-[#4B505B]"}`}>
                    {period ? period : "USD"}
                </span>
            </div>
            {equivalent && (
                <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs mb-6 ${dark ? "bg-white/15 text-emerald-300" : "bg-gray-100 text-[#008236]"
                        }`}
                >
                    <Zap className="w-3 h-3" />
                    <span style={{ fontWeight: 500 }}>{equivalent}</span>
                </div>
            )}
            {!equivalent && <div className="mb-6" />}

            <button
                className={`w-full py-3.5 rounded-full mb-6 transition-colors ${dark
                        ? "bg-white text-[#2d2d2d] hover:bg-gray-100 shadow-lg"
                        : "border-2 border-[#2d2d2d] text-gray-900 hover:bg-gray-50"
                    }`}
                style={{ fontWeight: 500 }}
                onClick={onSubscribe}
            >
                {buttonText}
            </button>

            <div
                className={`border-t pt-6 space-y-3 mt-auto ${dark ? "border-white/20" : "border-gray-200/60"
                    }`}
            >
                {features.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                        <CheckIcon color={dark ? "#ffffff" : "#2d2d2d"} />
                        <p className={`text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>{f}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
