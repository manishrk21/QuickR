import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { sanitizeObject } from "@/lib/security/sanitize";
import { getCustomerSession, TABLE_COOKIE } from "@/lib/auth/customer-session";
import { adminSupabase } from "@/lib/supabase/admin";
import { PlaceOrderSchema } from "@quickr/shared";

export async function POST(req: NextRequest) {
  console.log("API Route Hit: /api/customer/orders");
  const limited = await rateLimit(req, "order");
  if (limited) return limited;

  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const rawBody = await req.json();
  const body = sanitizeObject(rawBody, {
    special_instructions: 500,
  });
  const parsed = PlaceOrderSchema.safeParse(body);
  if (!parsed.success) {
    console.error("Zod Parsing Error:", parsed.error.flatten());
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { table_id, items, special_instructions } = parsed.data;
  const cookieTableId = req.cookies.get(TABLE_COOKIE)?.value ?? null;
  const resolvedTableId = table_id ?? session.tableId ?? cookieTableId;

  if (!resolvedTableId) {
    return NextResponse.json(
      { error: "No table selected. Please scan the restaurant QR or sign in again." },
      { status: 400 }
    );
  }

  // Verify table belongs to customer's restaurant
  const { data: table } = await adminSupabase
    .from("tables")
    .select("id, restaurant_id, is_active")
    .eq("id", resolvedTableId)
    .eq("restaurant_id", session.restaurantId)
    .single();

  if (!table || !table.is_active) {
    return NextResponse.json({ error: "Invalid or inactive table." }, { status: 400 });
  }

  // Fetch current prices from DB — NEVER trust client prices
  const menuItemIds = items.map((i) => i.menu_item_id);
  const { data: menuItems } = await adminSupabase
    .from("menu_items")
    .select("id, name, price, food_type, is_available, deleted_at")
    .in("id", menuItemIds)
    .eq("restaurant_id", session.restaurantId)
    .is("deleted_at", null);

  if (!menuItems || menuItems.length !== menuItemIds.length) {
    return NextResponse.json(
      { error: "One or more items not found." },
      { status: 400 }
    );
  }

  // Validate all items are available
  const unavailable = menuItems.filter((m) => !m.is_available);
  if (unavailable.length > 0) {
    return NextResponse.json(
      {
        error: `The following items are sold out: ${unavailable
          .map((m) => m.name)
          .join(", ")}`,
      },
      { status: 409 }
    );
  }

  // Server-side total calculation
  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));
  let totalAmount = 0;
  const orderItems = items.map((item) => {
    const menuItem = menuItemMap.get(item.menu_item_id)!;
    totalAmount += menuItem.price * item.quantity;
    return {
      menu_item_id: item.menu_item_id,
      name_snapshot: menuItem.name,
      price_snapshot: menuItem.price,
      food_type_snapshot: menuItem.food_type,
      quantity: item.quantity,
      special_instructions: item.special_instructions ?? null,
      added_at_status: "pending",
      is_new_addition: false,
      item_status: "pending",
    };
  });

  // Insert order + items in a transaction via RPC
  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .insert({
      restaurant_id: session.restaurantId,
      customer_id: session.customerId,
      table_id: resolvedTableId,
      status: "pending",
      total_amount: totalAmount,
      special_instructions: special_instructions ?? null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }

  const { error: itemsError } = await adminSupabase
    .from("order_items")
    .insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));

  if (itemsError) {
    // Rollback order
    await adminSupabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Failed to save order items." }, { status: 500 });
  }

  return NextResponse.json({ order_id: order.id });
}
