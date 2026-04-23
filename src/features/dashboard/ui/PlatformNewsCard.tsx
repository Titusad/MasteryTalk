/**
 * PlatformNewsCard — Static news announcements for the dashboard left column.
 * Max 2 items. Design System compliant.
 */

const NEWS_ITEMS = [
  {
    type: "feature" as const,
    text: <>New <strong className="text-[#0f172b] font-medium">Interview Mastery</strong> path with 6 guided sessions</>,
  },
  {
    type: "report" as const,
    text: <>WhatsApp Coach now supports <strong className="text-[#0f172b] font-medium">daily pronunciation drills</strong></>,
  },
];

const DOT_COLOR = { feature: "bg-[#0f172b]", report: "bg-[#6366f1]" };

export function PlatformNewsCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-3">
        News & Updates
      </p>
      {NEWS_ITEMS.map((item, i) => (
        <div
          key={i}
          className={`flex gap-3 py-2 ${
            i < NEWS_ITEMS.length - 1 ? "border-b border-[#e2e8f0]" : ""
          }`}
        >
          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${DOT_COLOR[item.type]}`} />
          <p className="text-sm text-[#45556c] leading-relaxed">{item.text}</p>
        </div>
      ))}
    </div>
  );
}
