/**
 * DashboardSkeleton — Full-layout skeleton shown while dashboard data loads.
 * Mirrors the 3-row layout: HeroCard → 4 action cards → sidebar + paths.
 */
export function DashboardSkeleton() {
  const shimmer = "bg-[#e2e8f0] rounded animate-pulse";

  return (
    <div className="w-full px-6 md:px-8 lg:px-12 pt-6 pb-20 space-y-12">

      {/* Row 1: HeroCard skeleton */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr]">
          <div className="p-6 md:border-r border-[#e2e8f0] space-y-4">
            <div className={`h-7 w-48 ${shimmer}`} />
            <div className="space-y-2">
              <div className={`h-4 w-full ${shimmer}`} />
              <div className={`h-4 w-3/4 ${shimmer}`} />
            </div>
            <div className={`h-20 w-full rounded-2xl ${shimmer}`} />
            <div className="flex gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`h-2.5 w-5 ${shimmer}`} />
                  <div className={`w-6 h-6 rounded-full ${shimmer}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 flex flex-col items-center justify-center gap-4">
            <div className={`w-28 h-28 rounded-full ${shimmer}`} />
            <div className={`h-5 w-20 ${shimmer}`} />
            <div className={`h-4 w-28 ${shimmer}`} />
          </div>
        </div>
      </div>

      {/* Row 2: 4 action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 space-y-3">
            <div className={`h-2.5 w-24 ${shimmer}`} />
            <div className={`h-4 w-32 ${shimmer}`} />
            <div className={`h-3.5 w-full ${shimmer}`} />
            <div className={`h-3.5 w-3/4 ${shimmer}`} />
            <div className={`h-9 w-full rounded-lg ${shimmer} mt-2`} />
          </div>
        ))}
      </div>

      {/* Row 3: title + sidebar + practice paths */}
      <div className="space-y-4">
        <div className={`h-6 w-44 ${shimmer}`} />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 items-start">
          {/* Sidebar */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 space-y-3">
            <div className={`h-2.5 w-32 ${shimmer}`} />
            <div className={`h-4 w-28 ${shimmer}`} />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className={`h-3 w-24 ${shimmer}`} />
                  <div className={`h-3 w-16 ${shimmer}`} />
                </div>
                <div className={`h-1.5 w-full rounded-full ${shimmer}`} />
              </div>
            ))}
          </div>
          {/* Practice paths */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <div className="flex gap-1 p-1 bg-[#f1f5f9] rounded-xl overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`h-8 flex-1 rounded-lg ${shimmer}`} />
                ))}
              </div>
            </div>
            <div className="px-5 pb-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${shimmer} shrink-0`} />
                  <div className="flex-1 space-y-1.5">
                    <div className={`h-4 w-40 ${shimmer}`} />
                    <div className={`h-3 w-full ${shimmer}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
