import { Card } from "@/components/ui";
import { Badge } from "@/components/ui";

export function TabVoos({ flights }) {
  const ida = flights.filter((f) => f.direction === "outbound").sort((a, b) => a.sort_order - b.sort_order);
  const volta = flights.filter((f) => f.direction === "return").sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      <Card border="1px solid rgba(56,189,248,0.2)" className="!bg-sky-500/[0.03]">
        <div className="flex justify-between mb-3 flex-wrap gap-1">
          <Badge color="#38BDF8">Reserva {flights[0]?.booking_ref || "—"}</Badge>
          <Badge color="#10B981">✅ Pago</Badge>
        </div>
        <p className="text-xs font-semibold text-theme-secondary mb-2">IDA — 31 MAR (Economy)</p>
        {ida.map((f) => (
          <div key={f.id} className="bg-white/[0.03] rounded-lg p-3 mb-1.5">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-theme-primary">{f.origin} → {f.destination}</span>
              <span className="text-[11px] text-sky-400">{f.flight_number}</span>
            </div>
            <div className="text-xs text-theme-secondary mt-1">Saída {f.departure_time} · Chegada {f.arrival_time} · {f.duration}</div>
          </div>
        ))}
        <p className="text-xs font-semibold text-amber-400 mt-3 mb-2">VOLTA — 10 ABR (Business! 🥂)</p>
        {volta.map((f) => (
          <div key={f.id} className="rounded-lg p-3 mb-1.5" style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.1)" }}>
            <div className="flex justify-between">
              <span className="text-sm font-bold text-theme-primary">{f.origin} → {f.destination}</span>
              <span className="text-[11px] text-amber-400">{f.flight_number} · {f.class}</span>
            </div>
            <div className="text-xs text-theme-secondary mt-1">Saída {f.departure_time} · Chegada {f.arrival_time} · {f.duration}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}
