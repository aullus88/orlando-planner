"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase, TRIP_ID } from "@/lib/supabase";

// ─── Countdown Hook ───
function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const d = new Date(target) - now;
  if (d <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(d / 864e5),
    h: Math.floor((d % 864e5) / 36e5),
    m: Math.floor((d % 36e5) / 6e4),
    s: Math.floor((d % 6e4) / 1e3),
  };
}

// ─── Reusable Components ───
function Badge({ children, color = "#38BDF8" }) {
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: color + "20", color }}
    >
      {children}
    </span>
  );
}

function Card({ children, className = "", border, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 mb-2.5 transition-all ${onClick ? "cursor-pointer hover:bg-white/[0.04]" : ""} ${className}`}
      style={{
        background: "rgba(255,255,255,0.025)",
        border: border || "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#151d2e] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#151d2e] px-5 py-4 border-b border-white/5 flex justify-between items-center z-10">
          <h3 className="text-base font-bold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, textarea }) {
  const cls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#FF6B3D]/50";
  return (
    <div className="mb-3">
      {label && <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>}
      {textarea ? (
        <textarea className={cls} value={value} onChange={onChange} placeholder={placeholder} rows={3} />
      ) : (
        <input className={cls} type={type} value={value} onChange={onChange} placeholder={placeholder} />
      )}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", className = "", disabled }) {
  const base = "px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40";
  const v = {
    primary: "bg-[#FF6B3D] text-white hover:bg-[#e85a2c]",
    secondary: "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${v[variant]} ${className}`}>
      {children}
    </button>
  );
}

// ─── HERO ───
function Hero({ cd }) {
  const units = [
    { v: cd.d, l: "dias" }, { v: cd.h, l: "hrs" },
    { v: cd.m, l: "min" }, { v: cd.s, l: "seg" },
  ];
  return (
    <div className="text-center py-8 px-5 bg-gradient-to-b from-[#0B1120] to-[#0F172A] border-b border-white/5 relative overflow-hidden">
      <div className="absolute -top-8 -right-4 text-[100px] opacity-[0.04] rotate-[-12deg]">🏰</div>
      <div className="text-3xl mb-1">🏰</div>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-100" style={{ fontFamily: "var(--font-display)" }}>
        Orlando 2026
      </h1>
      <p className="text-sm text-slate-500 mt-1 tracking-wider">31 MAR — 10 ABR · 10 NOITES</p>
      <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
        <Badge color="#94A3B8">👨 Aulus</Badge>
        <Badge color="#94A3B8">👩 Patricia 🤰</Badge>
        <Badge color="#FF6B3D">👶 Malu</Badge>
      </div>
      <div className="flex gap-2.5 justify-center mt-4">
        {units.map((u) => (
          <div key={u.l} className="text-center">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-[#FF6B3D]"
              style={{ background: "rgba(255,107,61,0.1)", border: "1px solid rgba(255,107,61,0.2)" }}>
              {String(u.v).padStart(2, "0")}
            </div>
            <div className="text-[9px] text-slate-600 mt-1 uppercase tracking-wider">{u.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TAB: ROTEIRO ───
function TabRoteiro({ days, dayItems, attractions, parks, refresh }) {
  const [exp, setExp] = useState(null);
  const [addModal, setAddModal] = useState(null); // day_id
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", time_slot: "", is_highlight: false, is_warning: false });

  const crowdColor = { low: "#10B981", moderate: "#10B981", high: "#F59E0B", extreme: "#DC2626" };

  async function addItem(dayId) {
    await supabase.from("day_items").insert({
      day_id: dayId,
      title: form.title,
      description: form.description || null,
      time_slot: form.time_slot || null,
      is_highlight: form.is_highlight,
      is_warning: form.is_warning,
      sort_order: (dayItems.filter((i) => i.day_id === dayId).length + 1) * 10,
    });
    setForm({ title: "", description: "", time_slot: "", is_highlight: false, is_warning: false });
    setAddModal(null);
    refresh();
  }

  async function updateItem() {
    await supabase.from("day_items").update({
      title: form.title,
      description: form.description || null,
      time_slot: form.time_slot || null,
      is_highlight: form.is_highlight,
      is_warning: form.is_warning,
    }).eq("id", editItem.id);
    setEditItem(null);
    refresh();
  }

  async function deleteItem(id) {
    if (!confirm("Remover este item?")) return;
    await supabase.from("day_items").delete().eq("id", id);
    refresh();
  }

  async function toggleItemDone(item) {
    await supabase.from("day_items").update({
      status: item.status === "done" ? "planned" : "done",
    }).eq("id", item.id);
    refresh();
  }

  return (
    <div>
      <Card border="1px solid rgba(56,189,248,0.15)" className="!bg-sky-500/[0.04]">
        <p className="text-xs font-bold text-amber-400 mb-2">📊 Estratégia: Disney na Semana 2!</p>
        {[
          { d: "31 Mar – 5 Abr", l: "Alta/Máxima", c: "#EF4444", n: "Universal, Epic, SeaWorld, day trips" },
          { d: "5 Abr (Easter)", l: "Máxima", c: "#DC2626", n: "Descanso · Piscina" },
          { d: "6 – 10 Abr", l: "Moderada ✅", c: "#10B981", n: "Disney aqui! Filas menores" },
        ].map((c) => (
          <div key={c.d} className="flex items-center gap-2 mt-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.c }} />
            <span className="text-xs"><strong className="text-slate-200">{c.d}</strong> — {c.n}</span>
          </div>
        ))}
      </Card>

      {days.map((d) => {
        const open = exp === d.id;
        const items = dayItems.filter((i) => i.day_id === d.id).sort((a, b) => a.sort_order - b.sort_order);
        return (
          <Card key={d.id} onClick={() => setExp(open ? null : d.id)} border={open ? `1px solid ${d.color}44` : undefined}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ background: (d.color || "#666") + "18" }}>{d.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold text-slate-500">
                  DIA {d.day_number} · {d.date?.slice(5)}
                  {d.crowd_level && (
                    <span className="ml-1" style={{ color: crowdColor[d.crowd_level] }}>
                      · {d.crowd_level}
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-200 truncate">{d.title}</div>
              </div>
              <div className={`text-slate-600 transition-transform ${open ? "rotate-180" : ""}`}>▾</div>
            </div>

            {open && (
              <div className="mt-3 pl-2 fade-up" onClick={(e) => e.stopPropagation()}>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2 mb-2 group items-start">
                    <button onClick={() => toggleItemDone(item)}
                      className={`w-4 h-4 mt-1 rounded border shrink-0 flex items-center justify-center text-[9px]
                        ${item.status === "done" ? "bg-emerald-500/30 border-emerald-500 text-emerald-300" : "border-slate-600 hover:border-slate-400"}`}>
                      {item.status === "done" && "✓"}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs leading-relaxed ${item.is_warning ? "text-amber-400" : item.is_highlight ? "text-slate-200" : "text-slate-400"}
                        ${item.status === "done" ? "line-through opacity-50" : ""}`}>
                        {item.time_slot && <span className="text-slate-600 font-mono mr-1">{item.time_slot}</span>}
                        <strong>{item.title}</strong>
                        {item.description && <span className="text-slate-500"> — {item.description}</span>}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 shrink-0">
                      <button onClick={() => { setEditItem(item); setForm({ title: item.title, description: item.description || "", time_slot: item.time_slot || "", is_highlight: item.is_highlight, is_warning: item.is_warning }); }}
                        className="text-[10px] text-slate-500 hover:text-sky-400">✏️</button>
                      <button onClick={() => deleteItem(item.id)} className="text-[10px] text-slate-500 hover:text-red-400">🗑</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => { setAddModal(d.id); setForm({ title: "", description: "", time_slot: "", is_highlight: false, is_warning: false }); }}
                  className="text-xs text-[#FF6B3D] hover:text-[#ff8a66] mt-2 font-semibold">
                  + Adicionar item
                </button>
              </div>
            )}
          </Card>
        );
      })}

      {/* Add Modal */}
      <Modal open={!!addModal} onClose={() => setAddModal(null)} title="Novo item no dia">
        <Input label="Horário" value={form.time_slot} onChange={(e) => setForm({ ...form, time_slot: e.target.value })} placeholder="09:00" />
        <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nome da atividade" />
        <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhes, dicas..." textarea />
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={form.is_highlight} onChange={(e) => setForm({ ...form, is_highlight: e.target.checked })} className="accent-emerald-500" /> Destaque
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={form.is_warning} onChange={(e) => setForm({ ...form, is_warning: e.target.checked })} className="accent-amber-500" /> Alerta
          </label>
        </div>
        <Btn onClick={() => addItem(addModal)} disabled={!form.title}>Adicionar</Btn>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Editar item">
        <Input label="Horário" value={form.time_slot} onChange={(e) => setForm({ ...form, time_slot: e.target.value })} />
        <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} textarea />
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={form.is_highlight} onChange={(e) => setForm({ ...form, is_highlight: e.target.checked })} className="accent-emerald-500" /> Destaque
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={form.is_warning} onChange={(e) => setForm({ ...form, is_warning: e.target.checked })} className="accent-amber-500" /> Alerta
          </label>
        </div>
        <Btn onClick={updateItem} disabled={!form.title}>Salvar</Btn>
      </Modal>
    </div>
  );
}

// ─── TAB: PARQUES & ATRAÇÕES ───
function TabParques({ parks, attractions, refresh }) {
  const [expPark, setExpPark] = useState(null);
  const [addModal, setAddModal] = useState(null);
  const [form, setForm] = useState({ name: "", type: "ride", min_height_cm: "", description: "", tips: "", pregnant_ok: true, has_child_swap: false, indoor: false, thrill_level: 1 });

  async function addAttraction(parkId) {
    await supabase.from("attractions").insert({
      park_id: parkId,
      name: form.name,
      type: form.type,
      min_height_cm: form.min_height_cm ? Number(form.min_height_cm) : null,
      description: form.description || null,
      tips: form.tips || null,
      pregnant_ok: form.pregnant_ok,
      has_child_swap: form.has_child_swap,
      indoor: form.indoor,
      thrill_level: Number(form.thrill_level),
      sort_order: (attractions.filter((a) => a.park_id === parkId).length + 1) * 10,
    });
    setAddModal(null);
    setForm({ name: "", type: "ride", min_height_cm: "", description: "", tips: "", pregnant_ok: true, has_child_swap: false, indoor: false, thrill_level: 1 });
    refresh();
  }

  async function deleteAttraction(id) {
    if (!confirm("Remover atração?")) return;
    await supabase.from("attractions").delete().eq("id", id);
    refresh();
  }

  const typeIcons = { ride: "🎢", show: "🎭", meet_greet: "🤝", playground: "🛝", trail: "🌿", dining: "🍽️", shopping: "🛍️", experience: "⭐", other: "📌" };

  return (
    <div>
      <p className="text-xs text-slate-500 mb-3">Toque num parque para ver/editar atrações. Toque ⊕ para adicionar.</p>
      {parks.map((p) => {
        const open = expPark === p.id;
        const parkAttr = attractions.filter((a) => a.park_id === p.id).sort((a, b) => a.sort_order - b.sort_order);
        const toddlerCount = parkAttr.filter((a) => !a.min_height_cm || a.min_height_cm <= 87).length;
        return (
          <Card key={p.id} onClick={() => setExpPark(open ? null : p.id)} border={open ? `1px solid ${p.color}44` : undefined}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{p.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-200">{p.name}</div>
                  <div className="text-[10px] text-slate-500">{parkAttr.length} atrações · {toddlerCount} pra Malu</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400">{"⭐".repeat(p.rating || 0)}</span>
                <span className={`text-slate-600 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
              </div>
            </div>

            {open && (
              <div className="mt-3 fade-up" onClick={(e) => e.stopPropagation()}>
                {parkAttr.map((a) => (
                  <div key={a.id} className={`flex gap-2 mb-2 p-2 rounded-lg group ${a.is_closed ? "opacity-40 bg-red-500/5" : "hover:bg-white/[0.03]"}`}>
                    <span className="text-sm shrink-0 mt-0.5">{typeIcons[a.type] || "📌"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200">
                        {a.name}
                        {a.is_closed && <span className="text-red-400 ml-1">FECHADO</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 flex gap-2 flex-wrap mt-0.5">
                        {a.min_height_cm && (
                          <span className={a.min_height_cm <= 87 ? "text-emerald-400" : "text-amber-400"}>
                            📏 {a.min_height_cm}cm {a.min_height_cm <= 87 ? "✓ Malu" : "✗ Malu"}
                          </span>
                        )}
                        {!a.min_height_cm && !a.is_closed && <span className="text-emerald-400">📏 Sem restrição ✓</span>}
                        {a.pregnant_ok && <span className="text-sky-400">🤰 OK</span>}
                        {!a.pregnant_ok && <span className="text-red-400">🤰 Não</span>}
                        {a.has_child_swap && <span className="text-violet-400">🔄 Swap</span>}
                        {a.indoor && <span>❄️ AC</span>}
                      </div>
                      {a.description && <div className="text-[10px] text-slate-500 mt-1">{a.description}</div>}
                      {a.tips && <div className="text-[10px] text-amber-400/70 mt-0.5">💡 {a.tips}</div>}
                    </div>
                    <button onClick={() => deleteAttraction(a.id)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-600 hover:text-red-400 shrink-0 self-start">🗑</button>
                  </div>
                ))}
                <button onClick={() => { setAddModal(p.id); setForm({ name: "", type: "ride", min_height_cm: "", description: "", tips: "", pregnant_ok: true, has_child_swap: false, indoor: false, thrill_level: 1 }); }}
                  className="text-xs text-[#FF6B3D] hover:text-[#ff8a66] mt-1 font-semibold">
                  + Nova atração
                </button>
              </div>
            )}
          </Card>
        );
      })}

      <Modal open={!!addModal} onClose={() => setAddModal(null)} title="Nova atração">
        <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Space Mountain" />
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-400 mb-1">Tipo</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200">
            {["ride", "show", "meet_greet", "playground", "trail", "dining", "shopping", "experience", "other"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <Input label="Altura mínima (cm)" value={form.min_height_cm} onChange={(e) => setForm({ ...form, min_height_cm: e.target.value })} placeholder="Vazio = sem restrição" type="number" />
        <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} textarea />
        <Input label="Dicas" value={form.tips} onChange={(e) => setForm({ ...form, tips: e.target.value })} textarea />
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={form.pregnant_ok} onChange={(e) => setForm({ ...form, pregnant_ok: e.target.checked })} /> 🤰 OK grávida
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={form.has_child_swap} onChange={(e) => setForm({ ...form, has_child_swap: e.target.checked })} /> 🔄 Child Swap
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={form.indoor} onChange={(e) => setForm({ ...form, indoor: e.target.checked })} /> ❄️ Indoor/AC
          </label>
        </div>
        <Btn onClick={() => addAttraction(addModal)} disabled={!form.name}>Adicionar</Btn>
      </Modal>
    </div>
  );
}

// ─── TAB: CUSTOS ───
function TabCustos({ costs, refresh }) {
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ category: "other", description: "", amount: "", is_paid: false, notes: "", icon: "📌" });

  const paid = costs.filter((c) => c.is_paid).reduce((s, c) => s + Number(c.amount), 0);
  const total = costs.reduce((s, c) => s + Number(c.amount), 0);

  async function togglePaid(c) {
    await supabase.from("trip_costs").update({ is_paid: !c.is_paid }).eq("id", c.id);
    refresh();
  }

  async function deleteCost(id) {
    if (!confirm("Remover custo?")) return;
    await supabase.from("trip_costs").delete().eq("id", id);
    refresh();
  }

  async function addCost() {
    await supabase.from("trip_costs").insert({
      trip_id: TRIP_ID,
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      is_paid: form.is_paid,
      notes: form.notes || null,
      icon: form.icon,
      sort_order: costs.length + 1,
    });
    setAddModal(false);
    setForm({ category: "other", description: "", amount: "", is_paid: false, notes: "", icon: "📌" });
    refresh();
  }

  return (
    <div>
      <div className="text-center p-5 rounded-xl mb-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Já Pago</div>
        <div className="text-3xl font-bold text-emerald-400" style={{ fontFamily: "var(--font-display)" }}>
          R$ {paid.toLocaleString("pt-BR")}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-center p-3 rounded-xl" style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.12)" }}>
          <div className="text-[9px] text-slate-500 uppercase">Total Estimado</div>
          <div className="text-lg font-bold text-sky-400">R$ {total.toLocaleString("pt-BR")}</div>
        </div>
        <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,107,61,0.06)", border: "1px solid rgba(255,107,61,0.12)" }}>
          <div className="text-[9px] text-slate-500 uppercase">Pendente</div>
          <div className="text-lg font-bold text-[#FF6B3D]">R$ {(total - paid).toLocaleString("pt-BR")}</div>
        </div>
      </div>

      {costs.sort((a, b) => a.sort_order - b.sort_order).map((c) => (
        <div key={c.id} className="flex justify-between items-start py-3 border-b border-white/[0.04] group">
          <div className="flex gap-2 flex-1 min-w-0">
            <span className="text-base">{c.icon}</span>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                {c.description}
                {c.is_paid && <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 rounded">✓ pago</span>}
              </div>
              <div className="text-[10px] text-slate-600">{c.notes}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-bold ${c.is_paid ? "text-emerald-400" : "text-sky-400"}`}>
              R$ {Number(c.amount).toLocaleString("pt-BR")}
            </span>
            <button onClick={() => togglePaid(c)} className="text-[10px] opacity-0 group-hover:opacity-100 text-slate-500 hover:text-emerald-400" title="Toggle pago">
              {c.is_paid ? "↩" : "✓"}
            </button>
            <button onClick={() => deleteCost(c.id)} className="text-[10px] opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400">🗑</button>
          </div>
        </div>
      ))}
      <Btn onClick={() => setAddModal(true)} className="mt-3 w-full" variant="secondary">+ Novo custo</Btn>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Novo custo">
        <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Ingresso Universal" />
        <Input label="Valor (R$)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" placeholder="1500" />
        <Input label="Emoji/Ícone" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🎢" />
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-400 mb-1">Categoria</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200">
            {["flight", "hotel", "car", "park_ticket", "dining", "shopping", "transport", "insurance", "other"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <Input label="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} textarea />
        <label className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <input type="checkbox" checked={form.is_paid} onChange={(e) => setForm({ ...form, is_paid: e.target.checked })} className="accent-emerald-500" /> Já pago
        </label>
        <Btn onClick={addCost} disabled={!form.description || !form.amount}>Adicionar</Btn>
      </Modal>
    </div>
  );
}

// ─── TAB: VOOS ───
function TabVoos({ flights }) {
  const ida = flights.filter((f) => f.direction === "outbound").sort((a, b) => a.sort_order - b.sort_order);
  const volta = flights.filter((f) => f.direction === "return").sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      <Card border="1px solid rgba(56,189,248,0.2)" className="!bg-sky-500/[0.03]">
        <div className="flex justify-between mb-3 flex-wrap gap-1">
          <Badge color="#38BDF8">Reserva {flights[0]?.booking_ref || "—"}</Badge>
          <Badge color="#10B981">✅ Pago</Badge>
        </div>
        <p className="text-xs font-semibold text-slate-500 mb-2">IDA — 31 MAR (Economy)</p>
        {ida.map((f) => (
          <div key={f.id} className="bg-white/[0.03] rounded-lg p-3 mb-1.5">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-slate-200">{f.origin} → {f.destination}</span>
              <span className="text-[11px] text-sky-400">{f.flight_number}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Saída {f.departure_time} · Chegada {f.arrival_time} · {f.duration}</div>
          </div>
        ))}
        <p className="text-xs font-semibold text-amber-400 mt-3 mb-2">VOLTA — 10 ABR (Business! 🥂)</p>
        {volta.map((f) => (
          <div key={f.id} className="rounded-lg p-3 mb-1.5" style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.1)" }}>
            <div className="flex justify-between">
              <span className="text-sm font-bold text-slate-200">{f.origin} → {f.destination}</span>
              <span className="text-[11px] text-amber-400">{f.flight_number} · {f.class}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Saída {f.departure_time} · Chegada {f.arrival_time} · {f.duration}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── TAB: MALU ───
function TabMalu({ attractions }) {
  const maluOk = attractions.filter((a) => !a.is_closed && (!a.min_height_cm || a.min_height_cm <= 87));
  const maluMaybe = attractions.filter((a) => !a.is_closed && a.min_height_cm && a.min_height_cm > 87 && a.min_height_cm <= 92);
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
        <div className="text-lg font-bold text-slate-200 mt-1" style={{ fontFamily: "var(--font-display)" }}>Guia da Malu</div>
        <div className="text-xs text-slate-500 mt-1">Aniversário 12/04 · Dinos 🦕 · Panda 🐼 · Dragões 🐉</div>
      </div>

      {tips.map((m, i) => (
        <Card key={i}>
          <div className="flex gap-3 items-start">
            <span className="text-lg shrink-0">{m.e}</span>
            <span className="text-xs text-slate-300 leading-relaxed">{m.t}</span>
          </div>
        </Card>
      ))}

      <p className="text-xs font-bold text-emerald-400 mt-4 mb-2">✅ Atrações que Malu PODE ir ({maluOk.length})</p>
      <div className="grid grid-cols-1 gap-1">
        {maluOk.map((a) => (
          <div key={a.id} className="flex items-center gap-2 text-[11px] text-slate-400 py-1">
            <span className="text-emerald-400">✓</span>
            <span className="font-medium text-slate-300">{a.name}</span>
            {a.min_height_cm && <span className="text-emerald-500/60">({a.min_height_cm}cm)</span>}
          </div>
        ))}
      </div>

      {maluMaybe.length > 0 && (
        <>
          <p className="text-xs font-bold text-amber-400 mt-4 mb-2">⚠️ Medir antes — no limite ({maluMaybe.length})</p>
          {maluMaybe.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-[11px] text-slate-400 py-1">
              <span className="text-amber-400">?</span>
              <span className="font-medium text-slate-300">{a.name}</span>
              <span className="text-amber-400/60">({a.min_height_cm}cm)</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── MAIN APP ───
const TABS = [
  { id: "roteiro", label: "🗓 Roteiro" },
  { id: "parques", label: "🏰 Parques" },
  { id: "custos", label: "💰 Custos" },
  { id: "voos", label: "✈️ Voos" },
  { id: "malu", label: "👶 Malu" },
];

export default function App() {
  const [tab, setTab] = useState("roteiro");
  const [days, setDays] = useState([]);
  const [dayItems, setDayItems] = useState([]);
  const [parks, setParks] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [costs, setCosts] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const cd = useCountdown("2026-03-31T02:00:00");

  const fetchAll = useCallback(async () => {
    const [dRes, diRes, pRes, aRes, cRes, fRes] = await Promise.all([
      supabase.from("trip_days").select("*").eq("trip_id", TRIP_ID).order("sort_order"),
      supabase.from("day_items").select("*").order("sort_order"),
      supabase.from("parks").select("*").eq("trip_id", TRIP_ID).order("sort_order"),
      supabase.from("attractions").select("*").order("sort_order"),
      supabase.from("trip_costs").select("*").eq("trip_id", TRIP_ID).order("sort_order"),
      supabase.from("trip_flights").select("*").eq("trip_id", TRIP_ID).order("sort_order"),
    ]);
    setDays(dRes.data || []);
    setDayItems(diRes.data || []);
    setParks(pRes.data || []);
    setAttractions(aRes.data || []);
    setCosts(cRes.data || []);
    setFlights(fRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🏰</div>
          <p className="text-sm text-slate-500">Carregando viagem...</p>
        </div>
      </div>
    );
  }

  const tabContent = {
    roteiro: <TabRoteiro days={days} dayItems={dayItems} attractions={attractions} parks={parks} refresh={fetchAll} />,
    parques: <TabParques parks={parks} attractions={attractions} refresh={fetchAll} />,
    custos: <TabCustos costs={costs} refresh={fetchAll} />,
    voos: <TabVoos flights={flights} />,
    malu: <TabMalu attractions={attractions} />,
  };

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <Hero cd={cd} />

      {/* Tabs */}
      <div className="sticky top-0 z-40 border-b border-white/[0.04]" style={{ background: "rgba(11,17,32,0.96)", backdropFilter: "blur(12px)" }}>
        <div className="flex overflow-x-auto max-w-2xl mx-auto px-2" style={{ scrollbarWidth: "none" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-3 py-2.5 text-xs whitespace-nowrap transition-all border-b-2"
              style={{
                fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? "#FF6B3D" : "#556677",
                background: tab === t.id ? "rgba(255,107,61,0.08)" : "transparent",
                borderBottomColor: tab === t.id ? "#FF6B3D" : "transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3 py-5 pb-16">
        {tabContent[tab]}
      </div>

      <div className="text-center pb-6">
        <p className="text-[10px] text-slate-800">Planejado com ❤️ · Orlando 2026 · Atualizado mar/2026</p>
      </div>
    </div>
  );
}
