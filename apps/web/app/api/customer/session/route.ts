import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { createCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/auth/customer-session";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth");
  if (limited) return limited;

  const { customer_id, restaurant_id, table_id } = await req.json();

  if (!customer_id || !restaurant_id) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const cookieValue = await createCustomerSession(customer_id, restaurant_id, table_id ?? null);

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
