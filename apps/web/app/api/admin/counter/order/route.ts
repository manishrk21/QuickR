// apps/web/app/api/admin/counter/order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { z } from "zod";

const CounterOrderSchema = z.object({
  restaurant_id: z.string().uuid(),
  table_id: z.string().uuid().nullable().optional(),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .nullable()
    .optional(),
  customer_name: z.string().max(100).nullable().optional(),
  payment_method: z.enum(["cash", "upi", "card", "other"]),
  special_instructions: z.string().max(500).nullable().optional(),
  items: z
    .array(
      z.object({
        menu_item_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(50),
        special_instructions: z.string().max(200).optional(),
      })
    )
    .min(1)
    .max(30),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CounterOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const {
    restaurant_id,
    table_id,
    mobile,
    customer_name,
    payment_method,
    special_instructions,
    items,
  } = parsed.data;

  // Verify admin belongs to this restaurant
  const { data: member } = await supabase
    .from("tenant_members")
    .select("restaurant_id")
    .eq("user_id", session.user.id)
    .eq("restaurant_id", restaurant_id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch current prices from DB — never trust client
  const menuItemIds = items.map((i) => i.menu_item_id);
  const { data: menuItems } = await adminSupabase
    .from("menu_items")
    .select("id, name, price, food_type, is_available, deleted_at")
    .in("id", menuItemIds)
    .eq("restaurant_id", restaurant_id)
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

  // Upsert customer if mobile provided
  let customerId: string;

  if (mobile) {
    const { data: customer } = await adminSupabase
      .from("customers")
      .upsert(
        {
          mobile,
          name: customer_name ?? null,
          restaurant_id,
          is_guest: false,
        },
        { onConflict: "mobile,restaurant_id" }
      )
      .select("id")
      .single();

    if (!customer) {
      return NextResponse.json({ error: "Failed to create customer." }, { status: 500 });
    }
    customerId = customer.id;

    // Update name if provided and different
    if (customer_name) {
      await adminSupabase
        .from("customers")
        .update({ name: customer_name })
        .eq("id", customerId);
    }
  } else {
    // Anonymous walk-in — create guest
    const { data: guest } = await adminSupabase
      .from("customers")
      .insert({ restaurant_id, is_guest: true })
      .select("id")
      .single();

    if (!guest) {
      return NextResponse.json({ error: "Failed to create guest." }, { status: 500 });
    }
    customerId = guest.id;
  }

  // Server-side total
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
      added_at_status: "accepted", // counter orders skip pending
      is_new_addition: false,
      item_status: "pending",
    };
  });

  // Counter orders start as "accepted" — already confirmed by staff
  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .insert({
      restaurant_id,
      customer_id: customerId,
      table_id: table_id ?? null,
      status: "accepted",
      payment_method,
      payment_status: "unpaid",
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
    await adminSupabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Failed to save order items." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, order_id: order.id, total: totalAmount });
}
