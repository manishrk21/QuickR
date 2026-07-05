import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { adminSupabase } from "@/lib/supabase/admin";
import { AddItemsToOrderSchema } from "@quickr/shared";

export async function POST(
  req: NextRequest,
  { params }: { params: { orderid?: string; orderId?: string } }
) {
  const limited = await rateLimit(req, "order");
  if (limited) return limited;

  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const orderId = params.orderid ?? params.orderId;
  if (!orderId) {
    return NextResponse.json({ error: "Order ID missing." }, { status: 400 });
  }

  const body = await req.json();
  const parsed = AddItemsToOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Fetch the order and verify ownership + status
  const { data: order } = await adminSupabase
    .from("orders")
    .select("id, status, restaurant_id, customer_id, total_amount")
    .eq("id", orderId)
    .eq("customer_id", session.customerId)
    .eq("restaurant_id", session.restaurantId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Can only add items if order is pending or accepted
  if (!["pending", "accepted"].includes(order.status)) {
    return NextResponse.json(
      {
        error: `Cannot add items — order is already ${order.status}. Please place a new order.`,
      },
      { status: 409 }
    );
  }

  // Server-side price lookup
  const menuItemIds = parsed.data.items.map((i) => i.menu_item_id);
  const { data: menuItems } = await adminSupabase
    .from("menu_items")
    .select("id, name, price, food_type, is_available, deleted_at")
    .in("id", menuItemIds)
    .eq("restaurant_id", session.restaurantId)
    .is("deleted_at", null);

  if (!menuItems || menuItems.length !== menuItemIds.length) {
    return NextResponse.json({ error: "One or more items not found." }, { status: 400 });
  }

  const unavailable = menuItems.filter((m) => !m.is_available);
  if (unavailable.length > 0) {
    return NextResponse.json(
      { error: `Sold out: ${unavailable.map((m) => m.name).join(", ")}` },
      { status: 409 }
    );
  }

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));
  let additionalTotal = 0;
  const newItems = parsed.data.items.map((item) => {
    const menuItem = menuItemMap.get(item.menu_item_id)!;
    additionalTotal += menuItem.price * item.quantity;
    return {
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      name_snapshot: menuItem.name,
      price_snapshot: menuItem.price,
      food_type_snapshot: menuItem.food_type,
      quantity: item.quantity,
      special_instructions: item.special_instructions ?? null,
      added_at_status: order.status,
      is_new_addition: true,
      item_status: "pending",
    };
  });

  // Insert new items + update order total
  const [itemsResult] = await Promise.all([
    adminSupabase.from("order_items").insert(newItems),
    adminSupabase
      .from("orders")
      .update({ total_amount: Number(order.total_amount) + additionalTotal })
      .eq("id", order.id),
  ]);

  if (itemsResult.error) {
    return NextResponse.json({ error: "Failed to add items." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, order_id: order.id });
}
