import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { adminSupabase } from "@/lib/supabase/admin";
import { createCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/auth/customer-session";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth");
  if (limited) return limited;

  const { google_id, email, name, restaurant_id, table_id } = await req.json();

  if (!google_id || !restaurant_id) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const { data: existingCustomer, error: lookupError } = await adminSupabase
    .from("customers")
    .select("id")
    .eq("restaurant_id", restaurant_id)
    .eq("google_id", google_id)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: "Failed to look up customer." }, { status: 500 });
  }

  let customerId = existingCustomer?.id;

  if (!customerId) {
    const { data: createdCustomer, error: insertError } = await adminSupabase
      .from("customers")
      .insert({ google_id, email, name, restaurant_id, is_guest: false })
      .select("id")
      .single();

    if (insertError || !createdCustomer) {
      return NextResponse.json({ error: "Failed to create customer." }, { status: 500 });
    }

    customerId = createdCustomer.id;
  }

  const cookieValue = await createCustomerSession(customerId, restaurant_id, table_id ?? null);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
