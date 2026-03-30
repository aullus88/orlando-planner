import { Card } from "@/components/ui";
import { MALU_HEIGHT_CM } from "@/lib/constants";

export function TabMalu({ attractions }) {
  const maluOk = attractions.filter((a) => !a.is_closed && (!a.min_height_cm || a.min_height_cm <= MALU_HEIGHT_CM));
  const maluMaybe = attractions.filter((a) => !a.is_closed && a.min_height_cm && a.min_height_cm > MALU_HEIGHT_CM && a.min_height_cm <= MALU_HEIGHT_CM + 5);
  const tips = [
    { e: "🎟️", t: "GRÁTIS: Disney, Universal, Epic Universe, SeaWorld, Dinosaur World (< 3 anos)" },
    { e: "✈️", t: "Infant R$ 915 (vs R$ 5.743!) — volta 10/04, antes do aniversário 12/04" },
    { e: "🐉", t: "Epic Universe dia 3: Viking Training Camp (melhor playground!), Fyre Drill (sem altura mínima), Yoshi (86cm)" },
    { e: "🐼", t: "DreamWorks Land dia 2: Po's Kung Fu Training Camp + Po Live!" },
    { e: "🦕", t: "Dinos: T-Rex Café (dia 1), Dinosaur World (dia 4)" },
    { e: "❌", t: "DinoLand/Boneyard NÃO EXISTE MAIS. Animal Kingdom: foco em Safári, Pandora, Lion King" },
    { e: "⭐", t: "Super Mario Galaxy Movie (1/abr): experiências exclusivas no Epic Universe até 13/abr!" },
    { e: "🔄", t: "Rider Swap: adultos revezam nas atrações grandes sem fila extra" },
    { e: "😴", t: "Soneca pós-almoço no hotel — voltem pro parque à noite" },
    { e: "🧴", t: "Protetor solar + chapéu — abril é ~27°C em Orlando" },
  ];

  return (
    <div>
      <div className="text-center p-5 rounded-xl mb-4" style={{ background: "rgba(255,107,61,0.05)", border: "1px solid rgba(255,107,61,0.1)" }}>
        <div className="text-3xl">👶✨</div>
        <div className="text-lg font-bold text-theme-primary mt-1" style={{ fontFamily: "var(--font-display)" }}>Guia da Malu</div>
        <div className="text-xs text-theme-secondary mt-1">Aniversário 12/04 · Dinos 🦕 · Panda 🐼 · Dragões 🐉</div>
      </div>

      {tips.map((m, i) => (
        <Card key={i}>
          <div className="flex gap-3 items-start">
            <span className="text-lg shrink-0">{m.e}</span>
            <span className="text-xs text-theme-primary leading-relaxed">{m.t}</span>
          </div>
        </Card>
      ))}

      <p className="text-xs font-bold text-emerald-400 mt-4 mb-2">✅ Atrações que Malu PODE ir ({maluOk.length})</p>
      <div className="grid grid-cols-1 gap-1">
        {maluOk.map((a) => (
          <div key={a.id} className="flex items-center gap-2 text-[11px] text-theme-secondary py-1">
            <span className="text-emerald-400">✓</span>
            <span className="font-medium text-theme-primary">{a.name}</span>
            {a.min_height_cm && <span className="text-emerald-500/60">({a.min_height_cm}cm)</span>}
          </div>
        ))}
      </div>

      {maluMaybe.length > 0 && (
        <>
          <p className="text-xs font-bold text-amber-400 mt-4 mb-2">⚠️ Medir antes — no limite ({maluMaybe.length})</p>
          {maluMaybe.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-[11px] text-theme-secondary py-1">
              <span className="text-amber-400">?</span>
              <span className="font-medium text-theme-primary">{a.name}</span>
              <span className="text-amber-400/60">({a.min_height_cm}cm)</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
