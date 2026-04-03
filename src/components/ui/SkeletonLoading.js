"use client";

export function SkeletonLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      {/* Hero skeleton */}
      <div className="animate-pulse" style={{ background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="h-6 w-48 rounded-lg mb-3" style={{ background: "var(--color-border)" }} />
          <div className="h-8 w-72 rounded-lg mb-4" style={{ background: "var(--color-border)" }} />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-xl" style={{ background: "var(--color-border)" }} />
            ))}
          </div>
        </div>
      </div>

      {/* TabBar skeleton */}
      <div className="animate-pulse px-2 py-2" style={{ background: "var(--color-bg-tabbar)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex gap-2 max-w-2xl mx-auto overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 w-20 rounded-lg shrink-0" style={{ background: "var(--color-border)" }} />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-2xl mx-auto px-3 py-5 space-y-3 animate-pulse">
        {[80, 64, 80, 56, 80].map((h, i) => (
          <div key={i} className="rounded-xl" style={{ height: `${h}px`, background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }} />
        ))}
      </div>
    </div>
  );
}
