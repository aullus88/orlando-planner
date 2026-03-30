export function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="sticky top-0 z-40 border-b border-theme-light"
      style={{ background: "var(--color-bg-tabbar)", backdropFilter: "blur(12px)" }}>
      <div className="flex overflow-x-auto max-w-2xl mx-auto px-2" style={{ scrollbarWidth: "none" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className="px-3 py-2.5 text-xs whitespace-nowrap transition-all border-b-2"
            style={{
              fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? "var(--color-accent)" : "var(--color-tab-inactive)",
              background: activeTab === t.id ? "rgba(255,107,61,0.08)" : "transparent",
              borderBottomColor: activeTab === t.id ? "var(--color-accent)" : "transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
