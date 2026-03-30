"use client";
import { useState } from "react";
import { COST_CATEGORIES } from "@/lib/constants";
import { Modal, Input, Btn } from "@/components/ui";

export function TabCustos({ costs, addCost, toggleCostPaid, deleteCost }) {
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ category: "other", description: "", amount: "", is_paid: false, notes: "", icon: "📌" });

  const paid = costs.filter((c) => c.is_paid).reduce((s, c) => s + Number(c.amount), 0);
  const total = costs.reduce((s, c) => s + Number(c.amount), 0);

  async function handleAdd() {
    await addCost(form);
    setAddModal(false);
    setForm({ category: "other", description: "", amount: "", is_paid: false, notes: "", icon: "📌" });
  }

  async function handleDelete(id) {
    if (!confirm("Remover custo?")) return;
    await deleteCost(id);
  }

  return (
    <div>
      <div className="text-center p-5 rounded-xl mb-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="text-[10px] text-theme-secondary uppercase tracking-wider">Já Pago</div>
        <div className="text-3xl font-bold text-emerald-400" style={{ fontFamily: "var(--font-display)" }}>
          R$ {paid.toLocaleString("pt-BR")}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-center p-3 rounded-xl" style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.12)" }}>
          <div className="text-[9px] text-theme-secondary uppercase">Total Estimado</div>
          <div className="text-lg font-bold text-sky-400">R$ {total.toLocaleString("pt-BR")}</div>
        </div>
        <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,107,61,0.06)", border: "1px solid rgba(255,107,61,0.12)" }}>
          <div className="text-[9px] text-theme-secondary uppercase">Pendente</div>
          <div className="text-lg font-bold text-accent">R$ {(total - paid).toLocaleString("pt-BR")}</div>
        </div>
      </div>

      {costs.sort((a, b) => a.sort_order - b.sort_order).map((c) => (
        <div key={c.id} className="flex justify-between items-start py-3 border-b border-white/[0.04] group">
          <div className="flex gap-2 flex-1 min-w-0">
            <span className="text-base">{c.icon}</span>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-theme-primary flex items-center gap-2">
                {c.description}
                {c.is_paid && <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 rounded">✓ pago</span>}
              </div>
              <div className="text-[10px] text-theme-muted">{c.notes}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-bold ${c.is_paid ? "text-emerald-400" : "text-sky-400"}`}>
              R$ {Number(c.amount).toLocaleString("pt-BR")}
            </span>
            <button onClick={() => toggleCostPaid(c)} className="text-[10px] opacity-0 group-hover:opacity-100 text-theme-secondary hover:text-emerald-400" title="Toggle pago">
              {c.is_paid ? "↩" : "✓"}
            </button>
            <button onClick={() => handleDelete(c.id)} className="text-[10px] opacity-0 group-hover:opacity-100 text-theme-secondary hover:text-red-400">🗑</button>
          </div>
        </div>
      ))}
      <Btn onClick={() => setAddModal(true)} className="mt-3 w-full" variant="secondary">+ Novo custo</Btn>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Novo custo">
        <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Ingresso Universal" />
        <Input label="Valor (R$)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" placeholder="1500" />
        <Input label="Emoji/Ícone" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🎢" />
        <div className="mb-3">
          <label className="block text-xs font-medium text-theme-secondary mb-1">Categoria</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm text-theme-primary">
            {COST_CATEGORIES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <Input label="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} textarea />
        <label className="flex items-center gap-2 text-xs text-theme-secondary mb-4">
          <input type="checkbox" checked={form.is_paid} onChange={(e) => setForm({ ...form, is_paid: e.target.checked })} className="accent-emerald-500" /> Já pago
        </label>
        <Btn onClick={handleAdd} disabled={!form.description || !form.amount}>Adicionar</Btn>
      </Modal>
    </div>
  );
}
