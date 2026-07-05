"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Pencil, Trash2, Check, X, Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  display_order: number;
}

export function CategoriesClient({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError("");

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), display_order: categories.length }),
    });

    const data = await res.json();
    setCreating(false);

    if (!res.ok) { setError(data.error ?? "Failed."); return; }

    setCategories((prev) => [...prev, data.category]);
    setNewName("");
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return;

    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });

    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: editName.trim() } : c))
      );
    }
    setEditingId(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? It must have no items.`)) return;

    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) { setError(data.error); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    const reordered = Array.from(categories);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updated = reordered.map((c, i) => ({ ...c, display_order: i }));
    setCategories(updated);

    await fetch("/api/admin/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: updated.map(({ id, display_order }) => ({ id, display_order })),
      }),
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#630102]/10 bg-[#EDEBDE] p-4 shadow-sm sm:p-5">
      <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={creating || !newName.trim()}>
          <Plus size={16} className="mr-1.5" />
          {creating ? "Adding…" : "Add"}
        </Button>
      </form>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {categories.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[#630102]/15 p-10 text-center">
          <p className="text-sm text-[#630102]/50">No categories yet. Add one above.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="overflow-hidden rounded-xl border border-[#630102]/10 divide-y divide-[#630102]/8"
              >
                {categories.map((cat, index) => (
                  <Draggable key={cat.id} draggableId={cat.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{ ...provided.draggableProps.style, ...(snapshot.isDragging ? { zIndex: 1000 } : {}) }}
                        className={`flex items-center gap-3 bg-[#EDEBDE] px-4 py-3
                          ${snapshot.isDragging ? "shadow-lg ring-1 ring-[#630102]/15" : ""}`}
                      >
                        <span
                          {...provided.dragHandleProps}
                          className="cursor-grab text-[#630102]/20 hover:text-[#630102]/50 active:cursor-grabbing"
                        >
                          <GripVertical size={16} />
                        </span>

                        {editingId === cat.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(cat.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="h-8 flex-1"
                            autoFocus
                          />
                        ) : (
                          <span className="flex-1 text-sm font-medium text-[#1a0000]">
                            {cat.name}
                          </span>
                        )}

                        <div className="flex gap-1">
                          {editingId === cat.id ? (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-green-700"
                                onClick={() => handleRename(cat.id)}
                              >
                                <Check size={14} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-[#630102]/35"
                                onClick={() => setEditingId(null)}
                              >
                                <X size={14} />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-[#630102]/35 hover:text-[#630102]"
                                onClick={() => {
                                  setEditingId(cat.id);
                                  setEditName(cat.name);
                                }}
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-[#630102]/35 hover:text-red-600"
                                onClick={() => handleDelete(cat.id, cat.name)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
