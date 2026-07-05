import { createClient } from "@/lib/supabase/server";
import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { redirect } from "next/navigation";

export default async function NewMenuItemPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("display_order");

  // Relational redirect guardrail checks
  if (!categories || categories.length === 0) {
    redirect(`/admin/${params.slug}/menu/categories`);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Add New Menu Item</h1>
        <p className="text-slate-500 mt-1">Configure your dish metadata, tags, and asset media files.</p>
      </div>
      <MenuItemForm categories={categories} slug={params.slug} />
    </div>
  );
}
