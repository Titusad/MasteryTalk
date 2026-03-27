export function DotPattern() {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                backgroundImage: `radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
            }}
        />
    );
}
