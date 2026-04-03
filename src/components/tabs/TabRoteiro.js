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
import { CROWD_COLORS } from "@/lib/constants";
import { Card, Modal, Input, Btn } from "@/components/ui";

const TODAY = new Date().toISOString().slice(0, 10);

function getDayStatus(day, items) {
  if (items.length === 0) return day.date <= TODAY ? "past" : "future";
  const done = items.filter((i) => i.status === "done").length;
  if (done === items.length) return "complete";
  if (done > 0) return "partial";
  return day.date <= TODAY ? "past" : "future";
}

const STATUS_ICONS = {
  complete: "✅",
  partial: "🔄",
  future: "📅",
  past: "⬜",
};

function SortableDayItem({ item, onToggle, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 mb-2 group items-start">
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 mt-1 cursor-grab active:cursor-grabbing touch-none select-none"
        style={{ color: "var(--color-text-muted)", fontSize: "12px", lineHeight: 1, padding: "2px" }}
        tabIndex={-1}
      >
        ⠿
      </button>

      <button
        onClick={() => onToggle(item)}
        className={`w-4 h-4 mt-1 rounded border shrink-0 flex items-center justify-center text-[9px]
          ${item.status === "done" ? "bg-emerald-500/30 border-emerald-500 text-emerald-300" : "border-theme-muted hover:border-theme-secondary"}`}
      >
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
        <button onClick={() => onEdit(item)} className="text-[10px] text-theme-muted hover:text-sky-400">✏️</button>
        <button onClick={() => onDelete(item.id)} className="text-[10px] text-theme-muted hover:text-red-400">🗑</button>
      </div>
    </div>
  );
}

export function TabRoteiro({ days, dayItems, addDayItem, updateDayItem, deleteDayItem, toggleDayItemDone, reorderDayItems }) {
  const [exp, setExp] = useState(null);
  const [addModal, setAddModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", time_slot: "", is_highlight: false, is_warning: false });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  function handleDragEnd(event, dayId) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const items = dayItems.filter((i) => i.day_id === dayId).sort((a, b) => a.sort_order - b.sort_order);
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    reorderDayItems(dayId, reordered.map((i) => i.id));
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
            <span className="text-xs text-theme-secondary">
              <strong className="text-theme-primary">{c.d}</strong> — {c.n}
            </span>
          </div>
        ))}
      </Card>

      {days.map((d) => {
        const open = exp === d.id;
        const items = dayItems.filter((i) => i.day_id === d.id).sort((a, b) => a.sort_order - b.sort_order);
        const status = getDayStatus(d, items);
        const doneCount = items.filter((i) => i.status === "done").length;

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
              {/* Status icon + progress */}
              <div className="flex items-center gap-1.5 shrink-0">
                {items.length > 0 && (
                  <span className="text-[10px] text-theme-muted">{doneCount}/{items.length}</span>
                )}
                <span className="text-base" title={status}>{STATUS_ICONS[status]}</span>
                <div className={`text-theme-muted transition-transform ${open ? "rotate-180" : ""}`}>▾</div>
              </div>
            </div>

            {open && (
              <div className="mt-3 pl-2 fade-up" onClick={(e) => e.stopPropagation()}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, d.id)}
                >
                  <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {items.map((item) => (
                      <SortableDayItem
                        key={item.id}
                        item={item}
                        onToggle={toggleDayItemDone}
                        onEdit={(item) => {
                          setEditItem(item);
                          setForm({ title: item.title, description: item.description || "", time_slot: item.time_slot || "", is_highlight: item.is_highlight, is_warning: item.is_warning });
                        }}
                        onDelete={handleDelete}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                <button
                  onClick={() => { setAddModal(d.id); setForm({ title: "", description: "", time_slot: "", is_highlight: false, is_warning: false }); }}
                  className="text-xs text-accent hover:text-accent-hover mt-2 font-semibold"
                >
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
