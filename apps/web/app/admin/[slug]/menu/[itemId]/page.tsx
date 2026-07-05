import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MenuItemForm } from "@/components/admin/MenuItemForm";

export default async function EditMenuItemPage({
  params,
}: {
  params: { slug: string; itemId: string };
}) {
  const supabase = createClient();

  const [{ data: item }, { data: categories }] = await Promise.all([
    supabase
      .from("menu_items")
      .select("*")
      .eq("id", params.itemId)
      .single(),
    supabase
      .from("categories")
      .select("id, name")
      .order("display_order"),
  ]);

  if (!item) return notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Modify Menu Item</h1>
        <p className="text-slate-500 mt-1">Update price balances, dietary classifications, or change names.</p>
      </div>
      <MenuItemForm 
        categories={categories ?? []} 
        slug={params.slug} 
        initialData={item} 
      />
    </div>
  );
}
