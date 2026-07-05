import { createClient } from "@/lib/supabase/server";
import { OrdersClient } from "@/components/admin/OrdersClient";

export default async function OrdersPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("slug", params.slug)
    .single();

  if (!restaurant) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id, status, total_amount, special_instructions,
      payment_method, payment_status, created_at, updated_at,
      tables(id, label),
      customers(id, name, mobile),
      order_items(
        id, name_snapshot, price_snapshot, food_type_snapshot,
        quantity, special_instructions, item_status, is_new_addition, created_at
      )
    `)
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  const normalizedOrders = (orders ?? []).map((order) => ({
    ...order,
    tables: Array.isArray(order.tables)
      ? (order.tables[0] ?? null)
      : order.tables ?? null,
    customers: Array.isArray(order.customers)
      ? (order.customers[0] ?? null)
      : order.customers ?? null,
  }));

  const { data: tables } = await supabase
    .from("tables")
    .select("id, label")
    .eq("restaurant_id", restaurant.id)
    .eq("is_active", true)
    .order("label");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Live orders</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            New orders appear automatically.
          </p>
        </div>
      </div>

      <OrdersClient
        initialOrders={normalizedOrders}
        tables={tables ?? []}
        restaurantId={restaurant.id}
        slug={params.slug}
      />
    </div>
  );
}