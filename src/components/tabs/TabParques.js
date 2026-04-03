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
import { MALU_HEIGHT_CM, TYPE_ICONS, ATTRACTION_TYPES } from "@/lib/constants";
import { Card, Modal, Input, Btn } from "@/components/ui";

function MapLink({ name }) {
  const query = encodeURIComponent(`${name} Orlando FL`);
  const isApple = typeof navigator !== "undefined" && /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
  const href = isApple
    ? `https://maps.apple.com/?q=${query}`
    : `https://maps.google.com/?q=${query}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Abrir no mapa"
      className="text-[10px] shrink-0 hover:opacity-80 transition-opacity"
      onClick={(e) => e.stopPropagation()}
    >
      🗺️
    </a>
  );
}

function SortableAttraction({ attraction, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: attraction.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  const a = attraction;

  return (
    <div ref={setNodeRef} style={style}
      className={`flex gap-2 mb-2 p-2 rounded-lg group ${a.is_closed ? "opacity-40 bg-red-500/5" : "hover:bg-theme-card-hover"}`}>
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing touch-none select-none text-[12px] mt-0.5"
        style={{ color: "var(--color-text-muted)" }}
        tabIndex={-1}
      >
        ⠿
      </button>
      <span className="text-sm shrink-0 mt-0.5">{TYPE_ICONS[a.type] || "📌"}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
          {a.name}
          {a.is_closed && <span className="text-red-400 ml-1">FECHADO</span>}
          <MapLink name={a.name} />
        </div>
        <div className="text-[10px] text-theme-secondary flex gap-2 flex-wrap mt-0.5">
          {a.min_height_cm && (
            <span className={a.min_height_cm <= MALU_HEIGHT_CM ? "text-emerald-400" : "text-amber-400"}>
              📏 {a.min_height_cm}cm {a.min_height_cm <= MALU_HEIGHT_CM ? "✓ Malu" : "✗ Malu"}
            </span>
          )}
          {!a.min_height_cm && !a.is_closed && <span className="text-emerald-400">📏 Sem restrição ✓</span>}
          {a.pregnant_ok && <span className="text-sky-400">🤰 OK</span>}
          {!a.pregnant_ok && <span className="text-red-400">🤰 Não</span>}
          {a.has_child_swap && <span className="text-violet-400">🔄 Swap</span>}
          {a.indoor && <span>❄️ AC</span>}
        </div>
        {a.description && <div className="text-[10px] text-theme-secondary mt-1">{a.description}</div>}
        {a.tips && <div className="text-[10px] text-amber-400/70 mt-0.5">💡 {a.tips}</div>}
      </div>
      <button onClick={() => onDelete(a.id)}
        className="opacity-0 group-hover:opacity-100 text-[10px] text-theme-muted hover:text-red-400 shrink-0 self-start">
        🗑
      </button>
    </div>
  );
}

export function TabParques({ parks, attractions, addAttraction, deleteAttraction, reorderAttractions }) {
  const [expPark, setExpPark] = useState(null);
  const [addModal, setAddModal] = useState(null);
  const [form, setForm] = useState({ name: "", type: "ride", min_height_cm: "", description: "", tips: "", pregnant_ok: true, has_child_swap: false, indoor: false, thrill_level: 1 });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleAdd(parkId) {
    await addAttraction(parkId, form);
    setAddModal(null);
    setForm({ name: "", type: "ride", min_height_cm: "", description: "", tips: "", pregnant_ok: true, has_child_swap: false, indoor: false, thrill_level: 1 });
  }

  async function handleDelete(id) {
    if (!confirm("Remover atração?")) return;
    await deleteAttraction(id);
  }

  function handleDragEnd(event, parkId) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const items = attractions.filter((a) => a.park_id === parkId).sort((a, b) => a.sort_order - b.sort_order);
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    reorderAttractions(reordered.map((i) => i.id));
  }

  return (
    <div>
      <p className="text-xs text-theme-secondary mb-3">Toque num parque para ver/editar atrações. Arraste ⠿ para reordenar.</p>
      {parks.map((p) => {
        const open = expPark === p.id;
        const parkAttr = attractions.filter((a) => a.park_id === p.id).sort((a, b) => a.sort_order - b.sort_order);
        const toddlerCount = parkAttr.filter((a) => !a.min_height_cm || a.min_height_cm <= MALU_HEIGHT_CM).length;
        return (
          <Card key={p.id} onClick={() => setExpPark(open ? null : p.id)} border={open ? `1px solid ${p.color}44` : undefined}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{p.icon}</span>
                <div>
                  <div className="text-sm font-bold text-theme-primary">{p.name}</div>
                  <div className="text-[10px] text-theme-secondary">{parkAttr.length} atrações · {toddlerCount} pra Malu</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400">{"⭐".repeat(p.rating || 0)}</span>
                <span className={`text-theme-muted transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
              </div>
            </div>

            {open && (
              <div className="mt-3 fade-up" onClick={(e) => e.stopPropagation()}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, p.id)}
                >
                  <SortableContext items={parkAttr.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                    {parkAttr.map((a) => (
                      <SortableAttraction key={a.id} attraction={a} onDelete={handleDelete} />
                    ))}
                  </SortableContext>
                </DndContext>
                <button
                  onClick={() => { setAddModal(p.id); setForm({ name: "", type: "ride", min_height_cm: "", description: "", tips: "", pregnant_ok: true, has_child_swap: false, indoor: false, thrill_level: 1 }); }}
                  className="text-xs text-accent hover:text-accent-hover mt-1 font-semibold"
                >
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
          <label className="block text-xs font-medium text-theme-secondary mb-1">Tipo</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm text-theme-primary">
            {ATTRACTION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <Input label="Altura mínima (cm)" value={form.min_height_cm} onChange={(e) => setForm({ ...form, min_height_cm: e.target.value })} placeholder="Vazio = sem restrição" type="number" />
        <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} textarea />
        <Input label="Dicas" value={form.tips} onChange={(e) => setForm({ ...form, tips: e.target.value })} textarea />
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex items-center gap-2 text-xs text-theme-secondary">
            <input type="checkbox" checked={form.pregnant_ok} onChange={(e) => setForm({ ...form, pregnant_ok: e.target.checked })} /> 🤰 OK grávida
          </label>
          <label className="flex items-center gap-2 text-xs text-theme-secondary">
            <input type="checkbox" checked={form.has_child_swap} onChange={(e) => setForm({ ...form, has_child_swap: e.target.checked })} /> 🔄 Child Swap
          </label>
          <label className="flex items-center gap-2 text-xs text-theme-secondary">
            <input type="checkbox" checked={form.indoor} onChange={(e) => setForm({ ...form, indoor: e.target.checked })} /> ❄️ Indoor/AC
          </label>
        </div>
        <Btn onClick={() => handleAdd(addModal)} disabled={!form.name}>Adicionar</Btn>
      </Modal>
    </div>
  );
}
