import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { adminSupabase } from "@/lib/supabase/admin";
import { OrderTracker } from "@/components/customer/OrderTracker";

export default async function OrderTrackingPage({
  params,
}: {
  params: { slug: string; orderId: string };
}) {
  const session = await getCustomerSession();

  if (!session) redirect(`/r/${params.slug}/auth`);

  const { data: order } = await adminSupabase
    .from("orders")
    .select(`
      id,
      status,
      total_amount,
      special_instructions,
      created_at,
      tables(label),
      order_items(
        id,
        name_snapshot,
        price_snapshot,
        food_type_snapshot,
        quantity,
        special_instructions,
        item_status,
        is_new_addition
      )
    `)
    .eq("id", params.orderId)
    .eq("customer_id", session.customerId)
    .single();

  if (!order) redirect(`/r/${params.slug}`);

  const normalizedOrder = {
    ...order,
    tables: Array.isArray(order.tables)
      ? (order.tables[0] ?? null)
      : order.tables ?? null,
  };

  const { data: restaurant } = await adminSupabase
    .from("restaurants")
    .select("primary_color")
    .eq("slug", params.slug)
    .single();

  return (
    <OrderTracker
      order={normalizedOrder}
      orderId={params.orderId}
      slug={params.slug}
      primaryColor={restaurant?.primary_color ?? "#16a34a"}
      restaurantId={session.restaurantId}
    />
  );
}
