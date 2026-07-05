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
      <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-white mx-auto max-w-xl">
        <h3 className="text-slate-700 font-medium">No menu items yet</h3>
        <p className="text-slate-400 text-sm mt-1 mb-4">Get started by creating your first dish entry.</p>
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/admin/${slug}/menu/new`}>Add your first item</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <div className="relative w-full sm:max-w-xs px-1 sm:px-0">
        <Search className="absolute left-4 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search items by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 sm:pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm w-full">
        <div className="w-full overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[600px] text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap w-[40%]">Item Details</th>
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap w-[20%]">Category</th>
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap w-[15%]">Price</th>
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap w-[15%]">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right whitespace-nowrap w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const catName = categories.find(c => c.id === item.category_id)?.name ?? "Unassigned";
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="h-12 w-12 rounded-lg object-cover bg-slate-50 border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xl flex-shrink-0 select-none">
                              🥣
                            </div>
                          )}
                          <div className="truncate font-medium text-slate-900">
                            {item.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-slate-500 max-w-[120px] truncate">{catName}</td>
                      <td className="px-4 sm:px-6 py-4 font-mono whitespace-nowrap">${(item.price / 100).toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(item.id, item.status)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors select-none ${
                            item.status === "available"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-slate-100 border-slate-200 text-slate-600"
                          }`}
                        >
                          {item.status === "available" ? "Available" : "Sold out"}
                        </button>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900" asChild>
                          <Link href={`/admin/${slug}/menu/${item.id}`}>
                            <Pencil size={14} />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
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
