"use client";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { COST_CATEGORIES } from "@/lib/constants";
import { Modal, Input, Btn } from "@/components/ui";

function SortableCostItem({ cost, onTogglePaid, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cost.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={{ ...style, borderBottom: "1px solid var(--color-border-light)" }}
      className="flex justify-between items-start py-3 group">
      <div className="flex gap-2 items-start flex-1 min-w-0">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing touch-none select-none mt-0.5 text-[12px]"
          style={{ color: "var(--color-text-muted)" }}
          tabIndex={-1}
        >
          ⠿
        </button>
        <span className="text-base shrink-0">{cost.icon}</span>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-theme-primary flex items-center gap-2">
            {cost.description}
            {cost.is_paid && <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 rounded">✓ pago</span>}
          </div>
          <div className="text-[10px] text-theme-muted">{cost.notes}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-bold ${cost.is_paid ? "text-emerald-400" : "text-sky-400"}`}>
          R$ {Number(cost.amount).toLocaleString("pt-BR")}
        </span>
        <button onClick={() => onTogglePaid(cost)}
          className="text-[10px] opacity-0 group-hover:opacity-100 text-theme-secondary hover:text-emerald-400"
          title="Toggle pago">
          {cost.is_paid ? "↩" : "✓"}
        </button>
        <button onClick={() => onDelete(cost.id)}
          className="text-[10px] opacity-0 group-hover:opacity-100 text-theme-secondary hover:text-red-400">
          🗑
        </button>
      </div>
    </div>
  );
}

export function TabCustos({ costs, addCost, toggleCostPaid, deleteCost, reorderCosts }) {
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ category: "other", description: "", amount: "", is_paid: false, notes: "", icon: "📌" });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sorted = [...costs].sort((a, b) => a.sort_order - b.sort_order);
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

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((i) => i.id === active.id);
    const newIndex = sorted.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex);
    reorderCosts(reordered.map((i) => i.id));
  }

  return (
    <div>
      <div className="text-center p-5 rounded-xl mb-3"
        style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="text-[10px] text-theme-secondary uppercase tracking-wider">Já Pago</div>
        <div className="text-3xl font-bold text-emerald-400" style={{ fontFamily: "var(--font-display)" }}>
          R$ {paid.toLocaleString("pt-BR")}
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 rounded-full overflow-hidden mx-4" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${total > 0 ? Math.round((paid / total) * 100) : 0}%`, background: "#10B981" }}
          />
        </div>
        <div className="text-[9px] text-theme-muted mt-1">
          {total > 0 ? Math.round((paid / total) * 100) : 0}% pago
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-center p-3 rounded-xl"
          style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.12)" }}>
          <div className="text-[9px] text-theme-secondary uppercase">Total Estimado</div>
          <div className="text-lg font-bold text-sky-400">R$ {total.toLocaleString("pt-BR")}</div>
        </div>
        <div className="text-center p-3 rounded-xl"
          style={{ background: "rgba(255,107,61,0.06)", border: "1px solid rgba(255,107,61,0.12)" }}>
          <div className="text-[9px] text-theme-secondary uppercase">Pendente</div>
          <div className="text-lg font-bold text-accent">R$ {(total - paid).toLocaleString("pt-BR")}</div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {sorted.map((c) => (
            <SortableCostItem key={c.id} cost={c} onTogglePaid={toggleCostPaid} onDelete={handleDelete} />
          ))}
        </SortableContext>
      </DndContext>

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
