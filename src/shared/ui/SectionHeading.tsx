export function SectionHeading({
    title,
    subtitle,
    light = false,
}: {
    title: string;
    subtitle?: string;
    light?: boolean;
}) {
    return (
        <div className="text-center max-w-3xl mx-auto mb-16">
            <h2
                className={`text-3xl md:text-4xl mb-4 ${light ? "text-white" : "text-gray-900"}`}
                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300, lineHeight: 1.2 }}
            >
                {title}
            </h2>
            {subtitle && (
                <p className={`text-lg whitespace-pre-line ${light ? "text-gray-300" : "text-[#4B505B]"}`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
