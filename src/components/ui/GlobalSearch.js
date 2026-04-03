"use client";
import { useState, useMemo, useRef, useEffect } from "react";

const GROUP_META = {
  roteiro: { label: "Roteiro", emoji: "🗓", tab: "roteiro" },
  parques: { label: "Atrações", emoji: "🏰", tab: "parques" },
  custos: { label: "Custos", emoji: "💰", tab: "custos" },
  compras: { label: "Compras", emoji: "🛍️", tab: "compras" },
};

export function GlobalSearch({ days, dayItems, attractions, costs, shoppingItems, onTabChange, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;

    const dayMap = Object.fromEntries((days || []).map((d) => [d.id, d]));

    const roteiroResults = (dayItems || [])
      .filter((i) => i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q))
      .slice(0, 5)
      .map((i) => {
        const day = dayMap[i.day_id];
        return { id: i.id, label: i.title, sub: day ? `Dia ${day.day_number} · ${day.title || ""}` : "", group: "roteiro" };
      });

    const parquesResults = (attractions || [])
      .filter((a) => a.name?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q) || a.tips?.toLowerCase().includes(q))
      .slice(0, 5)
      .map((a) => ({ id: a.id, label: a.name, sub: a.description || "", group: "parques" }));

    const custosResults = (costs || [])
      .filter((c) => c.description?.toLowerCase().includes(q) || c.notes?.toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({ id: c.id, label: c.description, sub: `R$ ${Number(c.amount).toLocaleString("pt-BR")}`, group: "custos" }));

    const comprasResults = (shoppingItems || [])
      .filter((s) => s.item?.toLowerCase().includes(q) || s.store?.toLowerCase().includes(q))
      .slice(0, 5)
      .map((s) => ({ id: s.id, label: s.item, sub: s.store || "", group: "compras" }));

    const all = [...roteiroResults, ...parquesResults, ...custosResults, ...comprasResults];
    if (all.length === 0) return [];

    const groups = {};
    for (const r of all) {
      if (!groups[r.group]) groups[r.group] = [];
      groups[r.group].push(r);
    }
    return groups;
  }, [query, days, dayItems, attractions, costs, shoppingItems]);

  const hasResults = results && Object.keys(results).length > 0;
  const noResults = results !== null && !hasResults;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="max-w-2xl w-full mx-auto mt-16 px-3" onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: "var(--color-bg-modal)", border: "1px solid var(--color-border)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          <span className="text-lg">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar atrações, atividades, custos..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--color-text-primary)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-xs" style={{ color: "var(--color-text-muted)" }}>✕</button>
          )}
        </div>

        {/* Results */}
        {(hasResults || noResults) && (
          <div className="mt-2 rounded-xl overflow-hidden"
            style={{ background: "var(--color-bg-modal)", border: "1px solid var(--color-border)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", maxHeight: "60vh", overflowY: "auto" }}>
            {noResults && (
              <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                Nenhum resultado para &ldquo;{query}&rdquo;
              </div>
            )}
            {hasResults && Object.entries(results).map(([group, items]) => {
              const meta = GROUP_META[group];
              return (
                <div key={group}>
                  <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border-light)" }}>
                    {meta.emoji} {meta.label}
                  </div>
                  {items.map((item) => (
                    <button key={item.id} onClick={() => { onTabChange(meta.tab); onClose(); }}
                      className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-white/[0.04] transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                          {item.label}
                        </div>
                        {item.sub && (
                          <div className="text-[10px] truncate mt-0.5" style={{ color: "var(--color-text-muted)" }}>{item.sub}</div>
                        )}
                      </div>
                      <span className="text-[10px] mt-0.5 shrink-0" style={{ color: "var(--color-text-muted)" }}>→</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {!results && (
          <p className="mt-3 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
            Digite pelo menos 2 caracteres para buscar
          </p>
        )}
      </div>
    </div>
  );
}
