

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { adminSupabase } from "@/lib/supabase/admin";
import { verifyTableToken } from "@/lib/qr/tokens";
import { TABLE_COOKIE } from "@/lib/auth/customer-session";

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "customer");
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("t");
  const slug = searchParams.get("slug");

  if (!token || !slug) return NextResponse.json({ error: "Missing parameters." }, { status: 400 });

  try {
    // 1. Verify the token format/signature
    const decoded = verifyTableToken(token);
    const targetTableId = decoded?.tableId || token;

    // 2. Query Supabase to ensure the table is REAL and ACTIVE
    const { data: table, error } = await adminSupabase
      .from("tables")
      .select("id, is_active, restaurant_id")
      .eq("id", targetTableId)
      .single();

    // 3. Strict Validation: Reject if table not found or inactive
    if (error || !table || !table.is_active) {
      console.error("QR Verification Failed: Table invalid or inactive");
      return NextResponse.json({ error: "Invalid or inactive table" }, { status: 403 });
    }

    // 4. If valid, set cookie and redirect
    const redirectUrl = new URL(`/r/${slug}`, req.url);
    const response = NextResponse.redirect(redirectUrl);
    
    response.cookies.set(TABLE_COOKIE, table.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 4, // 4 hours
    });

    return response;
  } catch (err) {
    console.error("QR Decoding Error:", err);
    return NextResponse.redirect(new URL(`/r/${slug}/auth`, req.url));
  }
}
