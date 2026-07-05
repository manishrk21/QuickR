"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
}

interface MenuItemFormProps {
  categories: Category[];
  slug: string;
  initialData?: {
    id: string;
    name: string;
    description: string;
    price: number;
    category_id: string;
    food_type: "veg" | "non_veg";
    allergens: string[];
    image_url?: string;
  };
}

export function MenuItemForm({ categories, slug, initialData }: MenuItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [priceStr, setPriceStr] = useState(initialData ? initialData.price.toString() : "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? categories[0]?.id ?? "");
  const [foodType, setFoodType] = useState<"veg" | "non_veg">(initialData?.food_type ?? "veg");
  const [allergens, setAllergens] = useState<string[]>(initialData?.allergens ?? []);
  const [customAllergen, setCustomAllergen] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url ?? null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddAllergen = () => {
    if (customAllergen.trim() && !allergens.includes(customAllergen.trim())) {
      setAllergens([...allergens, customAllergen.trim()]);
      setCustomAllergen("");
    }
  };

  const handleRemoveAllergen = (tag: string) => {
    setAllergens(allergens.filter(a => a !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return alert("Please select a category first.");
    setLoading(true);

    try {
      let imageUrl = initialData?.image_url ?? "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/admin/menu/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Image optimization pipeline failed");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const rawPriceCents = parseFloat(priceStr);
      
      // If initialData exists, target the item ID route, otherwise target the base creation route
      const url = initialData ? `/api/admin/menu/${initialData.id}` : "/api/admin/menu";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: rawPriceCents,
          category_id: categoryId,
          food_type: foodType,
          allergens,
          image_url: imageUrl,
          status: "available"
        }),
      });

      if (res.ok) {
        router.push(`/admin/${slug}/menu`);
        router.refresh();
      } else {
        const errData = await res.json();
        alert(typeof errData.error === "object" ? JSON.stringify(errData.error, null, 2) : errData.error ?? "Failed to save item");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl border border-[#630102]/10 bg-[#EDEBDE] p-4 shadow-sm sm:p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-[#1a0000]">Item Name</label>
        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-[#630102]/15 px-3 py-2 text-sm" placeholder="e.g., Paneer Tikka" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#1a0000]">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="h-20 w-full rounded-lg border border-[#630102]/15 px-3 py-2 text-sm" placeholder="Describe the flavors, size, or serving details..." />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a0000]">Price ($)</label>
          <input type="number" step="0.01" required value={priceStr} onChange={e => setPriceStr(e.target.value)} className="w-full rounded-lg border border-[#630102]/15 px-3 py-2 text-sm font-mono" placeholder="9.99" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1a0000]">Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="h-[38px] w-full rounded-lg border border-[#630102]/15 bg-[#EDEBDE] px-3 py-2 text-sm">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#1a0000]">Food Type</label>
        <div className="flex gap-4">
          {["veg", "non_veg"].map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
              <input type="radio" name="foodType" checked={foodType === t} onChange={() => setFoodType(t as any)} className="text-[#630102] focus:ring-[#630102]" />
              {t === "non_veg" ? "Non-Veg" : "Veg"}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#1a0000]">Allergens</label>
        <div className="mb-2 flex flex-col gap-2 sm:flex-row">
          <input type="text" value={customAllergen} onChange={e => setCustomAllergen(e.target.value)} className="flex-1 rounded-lg border border-[#630102]/15 px-3 py-1.5 text-sm" placeholder="e.g., Nuts, Dairy" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAllergen())} />
          <Button type="button" variant="outline" onClick={handleAddAllergen} className="h-[36px]">Add</Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allergens.map(a => (
            <span key={a} className="inline-flex items-center rounded border border-[#630102]/10 bg-[#630102]/[0.04] px-2 py-0.5 text-xs font-medium text-[#630102]">
              {a}
              <button type="button" onClick={() => handleRemoveAllergen(a)} className="ml-1 text-[#630102]/60 hover:text-[#630102]">×</button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#1a0000]">Dish Image Preview</label>
        <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-[#630102]/60 file:mr-4 file:rounded-full file:border-0 file:bg-[#630102]/5 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#630102] hover:file:bg-[#630102]/10" />
        {previewUrl && <img src={previewUrl} alt="Preview" className="mt-3 h-32 w-32 rounded-lg border border-[#630102]/10 object-cover" />}
      </div>

      <div className="flex flex-col gap-3 border-t border-[#630102]/10 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving Item..." : initialData ? "Update Menu Item" : "Create Menu Item"}</Button>
      </div>
    </form>
  );
}
