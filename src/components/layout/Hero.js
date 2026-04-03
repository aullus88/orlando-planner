import { Badge } from "@/components/ui";

export function Hero({ cd, themeToggle, onSearchOpen }) {
  const units = [
    { v: cd.d, l: "dias" }, { v: cd.h, l: "hrs" },
    { v: cd.m, l: "min" }, { v: cd.s, l: "seg" },
  ];
  return (
    <div className="text-center py-8 px-5 border-b border-theme-light relative overflow-hidden"
      style={{ background: `linear-gradient(to bottom, var(--color-hero-from), var(--color-hero-to))` }}>
      <div className="absolute -top-8 -right-4 text-[100px] opacity-[0.04] rotate-[-12deg]">🏰</div>
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {onSearchOpen && (
          <button onClick={onSearchOpen}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors"
            style={{ background: "rgba(255,107,61,0.1)", color: "var(--color-text-secondary)" }}
            title="Busca global">
            🔍
          </button>
        )}
        {themeToggle}
      </div>
      <div className="text-3xl mb-1">🏰</div>
      <h1 className="text-3xl sm:text-4xl font-bold text-theme-primary" style={{ fontFamily: "var(--font-display)" }}>
        Orlando 2026
      </h1>
      <p className="text-sm text-theme-muted mt-1 tracking-wider">31 MAR — 10 ABR · 10 NOITES</p>
      <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
        <Badge color="#94A3B8">👨 Aulus</Badge>
        <Badge color="#94A3B8">👩 Patricia 🤰</Badge>
        <Badge color="#FF6B3D">👶 Malu</Badge>
      </div>
      <div className="flex gap-2.5 justify-center mt-4">
        {units.map((u) => (
          <div key={u.l} className="text-center">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-accent"
              style={{ background: "rgba(255,107,61,0.1)", border: "1px solid rgba(255,107,61,0.2)" }}>
              {String(u.v).padStart(2, "0")}
            </div>
            <div className="text-[9px] text-theme-muted mt-1 uppercase tracking-wider">{u.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
