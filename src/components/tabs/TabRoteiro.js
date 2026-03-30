"use client";
import { useState } from "react";
import { CROWD_COLORS } from "@/lib/constants";
import { Card, Modal, Input, Btn } from "@/components/ui";

export function TabRoteiro({ days, dayItems, addDayItem, updateDayItem, deleteDayItem, toggleDayItemDone }) {
  const [exp, setExp] = useState(null);
  const [addModal, setAddModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", time_slot: "", is_highlight: false, is_warning: false });

  async function handleAdd(dayId) {
    await addDayItem(dayId, form);
    setForm({ title: "", description: "", time_slot: "", is_highlight: false, is_warning: false });
    setAddModal(null);
  }

  async function handleUpdate() {
    await updateDayItem(editItem.id, {
      title: form.title,
      description: form.description || null,
      time_slot: form.time_slot || null,
      is_highlight: form.is_highlight,
      is_warning: form.is_warning,
    });
    setEditItem(null);
  }

  async function handleDelete(id) {
    if (!confirm("Remover este item?")) return;
    await deleteDayItem(id);
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
            <span className="text-xs text-theme-secondary"><strong className="text-theme-primary">{c.d}</strong> — {c.n}</span>
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
                <div className="text-[10px] font-semibold text-theme-muted">
                  DIA {d.day_number} · {d.date?.slice(5)}
                  {d.crowd_level && (
                    <span className="ml-1" style={{ color: CROWD_COLORS[d.crowd_level] }}>
                      · {d.crowd_level}
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-theme-primary truncate">{d.title}</div>
              </div>
              <div className={`text-theme-muted transition-transform ${open ? "rotate-180" : ""}`}>▾</div>
            </div>

            {open && (
              <div className="mt-3 pl-2 fade-up" onClick={(e) => e.stopPropagation()}>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2 mb-2 group items-start">
                    <button onClick={() => toggleDayItemDone(item)}
                      className={`w-4 h-4 mt-1 rounded border shrink-0 flex items-center justify-center text-[9px]
                        ${item.status === "done" ? "bg-emerald-500/30 border-emerald-500 text-emerald-300" : "border-theme-muted hover:border-theme-secondary"}`}>
                      {item.status === "done" && "✓"}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs leading-relaxed ${item.is_warning ? "text-amber-400" : item.is_highlight ? "text-theme-primary" : "text-theme-secondary"}
                        ${item.status === "done" ? "line-through opacity-50" : ""}`}>
                        {item.time_slot && <span className="text-theme-muted font-mono mr-1">{item.time_slot}</span>}
                        <strong>{item.title}</strong>
                        {item.description && <span className="text-theme-muted"> — {item.description}</span>}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 shrink-0">
                      <button onClick={() => { setEditItem(item); setForm({ title: item.title, description: item.description || "", time_slot: item.time_slot || "", is_highlight: item.is_highlight, is_warning: item.is_warning }); }}
                        className="text-[10px] text-theme-muted hover:text-sky-400">✏️</button>
                      <button onClick={() => handleDelete(item.id)} className="text-[10px] text-theme-muted hover:text-red-400">🗑</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => { setAddModal(d.id); setForm({ title: "", description: "", time_slot: "", is_highlight: false, is_warning: false }); }}
                  className="text-xs text-accent hover:text-accent-hover mt-2 font-semibold">
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
          <label className="flex items-center gap-2 text-xs text-theme-secondary">
            <input type="checkbox" checked={form.is_highlight} onChange={(e) => setForm({ ...form, is_highlight: e.target.checked })} className="accent-emerald-500" /> Destaque
          </label>
          <label className="flex items-center gap-2 text-xs text-theme-secondary">
            <input type="checkbox" checked={form.is_warning} onChange={(e) => setForm({ ...form, is_warning: e.target.checked })} className="accent-amber-500" /> Alerta
          </label>
        </div>
        <Btn onClick={() => handleAdd(addModal)} disabled={!form.title}>Adicionar</Btn>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Editar item">
        <Input label="Horário" value={form.time_slot} onChange={(e) => setForm({ ...form, time_slot: e.target.value })} />
        <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} textarea />
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 text-xs text-theme-secondary">
            <input type="checkbox" checked={form.is_highlight} onChange={(e) => setForm({ ...form, is_highlight: e.target.checked })} className="accent-emerald-500" /> Destaque
          </label>
          <label className="flex items-center gap-2 text-xs text-theme-secondary">
            <input type="checkbox" checked={form.is_warning} onChange={(e) => setForm({ ...form, is_warning: e.target.checked })} className="accent-amber-500" /> Alerta
          </label>
        </div>
        <Btn onClick={handleUpdate} disabled={!form.title}>Salvar</Btn>
      </Modal>
    </div>
  );
}
