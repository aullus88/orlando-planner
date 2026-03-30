"use client";
import { useState } from "react";
import { SHOPPING_PERSONS, SHOPPING_CATEGORIES } from "@/lib/constants";
import { Modal, Input, Btn } from "@/components/ui";

const EMPTY_FORM = { item: "", category: "outro", quantity: "1", store: "", notes: "" };

export function TabCompras({
  shoppingItems,
  addShoppingItem,
  updateShoppingItem,
  toggleShoppingChecked,
  deleteShoppingItem,
  moveShoppingItem,
}) {
  const [activePerson, setActivePerson] = useState("aulus");
  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [moveItem, setMoveItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // ── Computed values ──
  const totalCount = shoppingItems.length;
  const checkedCount = shoppingItems.filter((i) => i.is_checked).length;

  const personCounts = SHOPPING_PERSONS.map((p) => ({
    ...p,
    total: shoppingItems.filter((i) => i.person === p.id).length,
    checked: shoppingItems.filter((i) => i.person === p.id && i.is_checked).length,
  }));

  const personItems = shoppingItems
    .filter((i) => i.person === activePerson)
    .sort((a, b) => a.sort_order - b.sort_order);

  const grouped = SHOPPING_CATEGORIES
    .map((cat) => ({ ...cat, items: personItems.filter((i) => i.category === cat.id) }))
    .filter((g) => g.items.length > 0);

  // ── Handlers ──
  async function handleAdd() {
    await addShoppingItem({ ...form, person: activePerson });
    setAddModal(false);
    setForm(EMPTY_FORM);
  }

  async function handleUpdate() {
    await updateShoppingItem(editItem.id, {
      item: form.item,
      category: form.category,
      quantity: Number(form.quantity) || 1,
      store: form.store || null,
      notes: form.notes || null,
    });
    setEditItem(null);
  }

  async function handleDelete(id) {
    if (!confirm("Remover item da lista?")) return;
    await deleteShoppingItem(id);
  }

  async function handleMove(targetPerson) {
    await moveShoppingItem(moveItem.id, targetPerson);
    setMoveItem(null);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      item: item.item,
      category: item.category,
      quantity: String(item.quantity),
      store: item.store || "",
      notes: item.notes || "",
    });
  }

  return (
    <div>
      {/* ── Progress Summary ── */}
      <div className="text-center p-5 rounded-xl mb-3" style={{ background: "rgba(255,107,61,0.06)", border: "1px solid rgba(255,107,61,0.15)" }}>
        <div className="text-[10px] text-theme-secondary uppercase tracking-wider">Progresso Geral</div>
        <div className="text-3xl font-bold text-accent" style={{ fontFamily: "var(--font-display)" }}>
          {checkedCount} de {totalCount}
        </div>
        <div className="text-[10px] text-theme-muted mt-1">itens comprados</div>
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: totalCount ? `${(checkedCount / totalCount) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* ── Person Sub-Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
        {personCounts.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePerson(p.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activePerson === p.id
                ? "bg-accent/15 text-accent border border-accent/30"
                : "bg-theme-card text-theme-secondary border border-theme hover:bg-theme-card-hover"
            }`}
          >
            <span>{p.emoji}</span>
            <span>{p.label}</span>
            <span className="text-[10px] opacity-70">({p.checked}/{p.total})</span>
          </button>
        ))}
      </div>

      {/* ── Category Groups ── */}
      {grouped.length === 0 && (
        <div className="text-center py-8 text-theme-muted text-sm">
          Nenhum item ainda. Toque + para adicionar.
        </div>
      )}

      {grouped.map((group) => (
        <div key={group.id} className="mb-4">
          <div className="text-xs font-bold text-theme-secondary mb-2 flex items-center gap-1.5">
            <span>{group.emoji}</span>
            <span>{group.label}</span>
            <span className="text-theme-muted font-normal">({group.items.length})</span>
          </div>

          {group.items.map((item) => (
            <div key={item.id} className="flex gap-2 mb-1.5 group items-start py-1.5 border-b border-white/[0.04]">
              {/* Checkbox */}
              <button
                onClick={() => toggleShoppingChecked(item)}
                className={`w-4 h-4 mt-0.5 rounded border shrink-0 flex items-center justify-center text-[9px] transition-colors ${
                  item.is_checked
                    ? "bg-emerald-500/30 border-emerald-500 text-emerald-300"
                    : "border-theme-muted hover:border-theme-secondary"
                }`}
              >
                {item.is_checked && "✓"}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold text-theme-primary ${item.is_checked ? "line-through opacity-50" : ""}`}>
                  {item.item}
                  {item.quantity > 1 && <span className="text-theme-muted font-normal"> x{item.quantity}</span>}
                </div>
                <div className="flex gap-2 flex-wrap mt-0.5">
                  {item.store && (
                    <span className="text-[10px] bg-sky-500/10 text-sky-400 px-1.5 rounded">{item.store}</span>
                  )}
                  {item.notes && (
                    <span className="text-[10px] text-theme-muted">{item.notes}</span>
                  )}
                </div>
              </div>

              {/* Hover actions */}
              <div className="opacity-0 group-hover:opacity-100 flex gap-1 shrink-0 transition-opacity">
                <button onClick={() => openEdit(item)} className="text-[10px] text-theme-muted hover:text-sky-400">✏️</button>
                <button onClick={() => setMoveItem(item)} className="text-[10px] text-theme-muted hover:text-violet-400" title="Mover para outra pessoa">↗️</button>
                <button onClick={() => handleDelete(item.id)} className="text-[10px] text-theme-muted hover:text-red-400">🗑</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* ── Add Button ── */}
      <Btn onClick={() => { setForm(EMPTY_FORM); setAddModal(true); }} className="mt-3 w-full" variant="secondary">
        + Novo item para {SHOPPING_PERSONS.find((p) => p.id === activePerson)?.label}
      </Btn>

      {/* ── Add Modal ── */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Novo item de compra">
        <Input label="Item" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="Ex: Protetor solar baby" />
        <Input label="Quantidade" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} type="number" placeholder="1" />
        <div className="mb-3">
          <label className="block text-xs font-medium text-theme-secondary mb-1">Categoria</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm text-theme-primary"
          >
            {SHOPPING_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>
        <Input label="Loja sugerida" value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} placeholder="Walmart, Target, outlet..." />
        <Input label="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} textarea />
        <Btn onClick={handleAdd} disabled={!form.item}>Adicionar</Btn>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Editar item">
        <Input label="Item" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
        <Input label="Quantidade" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} type="number" />
        <div className="mb-3">
          <label className="block text-xs font-medium text-theme-secondary mb-1">Categoria</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm text-theme-primary"
          >
            {SHOPPING_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>
        <Input label="Loja sugerida" value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} />
        <Input label="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} textarea />
        <Btn onClick={handleUpdate} disabled={!form.item}>Salvar</Btn>
      </Modal>

      {/* ── Move Modal ── */}
      <Modal open={!!moveItem} onClose={() => setMoveItem(null)} title="Mover item">
        <p className="text-xs text-theme-secondary mb-3">
          Mover &ldquo;{moveItem?.item}&rdquo; para:
        </p>
        <div className="flex flex-col gap-2">
          {SHOPPING_PERSONS.filter((p) => p.id !== moveItem?.person).map((p) => (
            <Btn key={p.id} variant="secondary" onClick={() => handleMove(p.id)}>
              {p.emoji} {p.label}
            </Btn>
          ))}
        </div>
      </Modal>
    </div>
  );
}
