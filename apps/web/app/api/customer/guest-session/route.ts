import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { adminSupabase } from "@/lib/supabase/admin";
import { createCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/auth/customer-session";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth");
  if (limited) return limited;

  const body = await req.json();
  let restaurant_id = body.restaurant_id;
  let table_id = body.table_id;

  // FORCE SERVER-SIDE COOKIE EXTRACTION IF CLIENT TRANSFERRED NULL
  if (!table_id) {
    const tableCookie = req.cookies.get("qr_table")?.value;
    if (tableCookie) {
      const [cookieTableId] = tableCookie.split(":");
      if (cookieTableId) {
        table_id = cookieTableId;
      }
    }
  }

  if (!restaurant_id) {
    return NextResponse.json({ error: "Missing restaurant_id." }, { status: 400 });
  }

  const { data: customer, error } = await adminSupabase
    .from("customers")
    .insert({ restaurant_id, is_guest: true })
    .select("id")
    .single();

  if (error || !customer) {
    return NextResponse.json({ error: "Failed to create guest." }, { status: 500 });
  }

  // Create session with the resolved table_id
  const cookieValue = await createCustomerSession(customer.id, restaurant_id, table_id || null);

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
