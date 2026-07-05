import { createClient } from "@/lib/supabase/server";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export default async function CategoriesPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
        <p className="text-slate-500 mt-1">
          Drag to reorder. Categories appear in this order on the menu.
        </p>
      </div>
      <CategoriesClient initialCategories={categories ?? []} />
    </div>
  );
}
