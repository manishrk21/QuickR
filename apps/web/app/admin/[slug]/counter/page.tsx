// apps/web/app/admin/[slug]/counter/page.tsx
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { CounterClient } from "@/components/admin/counter/CounterClient";
import { redirect } from "next/navigation";

export default async function CounterPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/admin/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, slug, primary_color")
    .eq("slug", params.slug)
    .single();

  if (!restaurant) redirect("/admin/login");

  const { data: categories } = await adminSupabase
    .from("categories")
    .select("id, name, display_order")
    .eq("restaurant_id", restaurant.id)
    .order("display_order");

  const { data: menuItems } = await adminSupabase
    .from("menu_items")
    .select("id, name, description, price, food_type, is_available, category_id, image_url")
    .eq("restaurant_id", restaurant.id)
    .is("deleted_at", null)
    .eq("is_available", true)
    .order("display_order");

  const { data: tables } = await adminSupabase
    .from("tables")
    .select("id, label")
    .eq("restaurant_id", restaurant.id)
    .eq("is_active", true)
    .order("label");

  return (
    <CounterClient
      restaurant={restaurant}
      categories={categories ?? []}
      items={menuItems ?? []}
      tables={tables ?? []}
    />
  );
}
