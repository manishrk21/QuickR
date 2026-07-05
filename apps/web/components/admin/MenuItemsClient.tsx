"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Search } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  status: string;
  category_id: string;
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
}

interface MenuItemsClientProps {
  initialItems: MenuItem[];
  categories: Category[];
  slug: string;
}

export function MenuItemsClient({ initialItems, categories, slug }: MenuItemsClientProps) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleStatus = async (itemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "available" ? "sold_out" : "available";
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: nextStatus } : item));

    const res = await fetch(`/api/admin/menu/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!res.ok) {
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: currentStatus } : item));
      const errText = await res.text();
      alert("Server Error: " + errText);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to archive this item?")) return;

    const res = await fetch(`/api/admin/menu/${itemId}`, { method: "DELETE" });

    if (res.ok) {
      setItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      alert("Failed to delete item");
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border-2 border-dashed border-[#630102]/15 bg-[#EDEBDE] px-4 py-12 text-center">
        <h3 className="font-medium text-[#1a0000]">No menu items yet</h3>
        <p className="mb-4 mt-1 text-sm text-[#630102]/45">Get started by creating your first dish entry.</p>
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/admin/${slug}/menu/new`}>Add your first item</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <div className="relative w-full sm:max-w-xs px-1 sm:px-0">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#630102]/35 sm:left-3" />
        <input
          type="text"
          placeholder="Search items by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-[#630102]/15 py-2 pl-10 pr-4 text-sm transition-all focus:border-[#630102] focus:outline-none focus:ring-2 focus:ring-[#630102]/10 sm:pl-9"
        />
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-[#630102]/10 bg-[#EDEBDE] shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-[#630102]/10 bg-[#630102]/[0.03] text-xs font-semibold uppercase tracking-wider text-[#630102]/60">
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap w-[40%]">Item Details</th>
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap w-[20%]">Category</th>
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap w-[15%]">Price</th>
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap w-[15%]">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right whitespace-nowrap w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#630102]/8 text-sm text-[#1a0000]/80">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const catName = categories.find(c => c.id === item.category_id)?.name ?? "Unassigned";
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-[#630102]/[0.03]">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="h-12 w-12 flex-shrink-0 rounded-lg border border-[#630102]/10 bg-[#630102]/[0.03] object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 flex-shrink-0 select-none items-center justify-center rounded-lg border border-[#630102]/10 bg-[#630102]/[0.03] text-xl">
                              🥣
                            </div>
                          )}
                          <div className="truncate font-medium text-[#1a0000]">
                            {item.name}
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[120px] truncate px-4 py-4 text-[#630102]/50 sm:px-6">{catName}</td>
                      <td className="whitespace-nowrap px-4 py-4 font-mono sm:px-6">{Number(item.price).toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(item.id, item.status)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors select-none ${
                            item.status === "available"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-[#630102]/10 bg-[#630102]/[0.04] text-[#630102]/55"
                          }`}
                        >
                          {item.status === "available" ? "Available" : "Sold out"}
                        </button>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#630102]/45 hover:text-[#630102]" asChild>
                          <Link href={`/admin/${slug}/menu/${item.id}`}>
                            <Pencil size={14} />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700">
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#630102]/45">
                    No items match "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
