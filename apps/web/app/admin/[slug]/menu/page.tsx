import { createClient } from "@/lib/supabase/server";
import { MenuItemsClient } from "@/components/admin/MenuItemsClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from "lucide-react";

export default async function MenuPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const [{ data: rawItems }, { data: categories }] = await Promise.all([
    supabase
      .from("menu_items")
      .select("*, categories(name)")
      .is("deleted_at", null)
      .order("category_id")
      .order("display_order"),
    supabase
      .from("categories")
      .select("*")
      .order("display_order"),
  ]);

  // Map database boolean back to frontend status string format
  const items = (rawItems ?? []).map(item => ({
    ...item,
    status: item.is_available ? "available" : "sold_out"
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Menu</h1>
          <p className="text-slate-500 mt-1">
            {items.length} items across {categories?.length ?? 0} categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/${params.slug}/menu/categories`}>
              <FolderOpen size={16} className="mr-2" />
              Manage categories
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/${params.slug}/menu/new`}>
              <Plus size={16} className="mr-2" />
              Add item
            </Link>
          </Button>
        </div>
      </div>

      <MenuItemsClient
        initialItems={items}
        categories={categories ?? []}
        slug={params.slug}
      />
    </div>
  );
}
