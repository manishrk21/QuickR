import { rateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { generateTableToken } from "@/lib/qr/tokens";
import { generateTableQR } from "@/lib/qr/generate";
import { z } from "zod";

const CreateTableSchema = z.object({
  label: z.string().min(1).max(50),
});

// GET /api/admin/tables — list all tables for the admin's restaurant
export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: tables, error } = await supabase
    .from("tables")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tables });
}

// POST /api/admin/tables — create table + generate QR
export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateTableSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Get restaurant id and slug
  const { data: member } = await supabase
    .from("tenant_members")
    .select("restaurant_id, restaurants(slug)")
    .eq("user_id", session.user.id)
    .single();

  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurantId = member.restaurant_id;
  const slug = (member.restaurants as any).slug;

  // Insert table first to get UUID string
  const { data: table, error: insertError } = await supabase
    .from("tables")
    .insert({
      restaurant_id: restaurantId,
      label: parsed.data.label,
      token: "pending", 
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: `A table named "${parsed.data.label}" already exists.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Generate real HMAC token now that we have the table ID
  const token = generateTableToken(table.id, restaurantId);

  // Use the current request origin so QR codes work on the same host/port
  // the app is actually running on, including local dev ports like 3002/3001.
  const requestUrl = new URL(req.url);
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const appUrl = forwardedProto && forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;

  // Generate QR PNG
  const qrBuffer = await generateTableQR(
    table.id,
    restaurantId,
    slug,
    appUrl
  );

  // Upload QR to Supabase Storage
  const storagePath = `${restaurantId}/${table.id}.png`;
  const { error: uploadError } = await adminSupabase.storage
    .from("qr-codes")
    .upload(storagePath, qrBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    // Rollback table insert if bucket breaks
    await supabase.from("tables").delete().eq("id", table.id);
    return NextResponse.json({ error: "QR upload failed." }, { status: 500 });
  }

  // Get signed URL (1 year expiry — admin downloads it)
  const { data: signedUrl } = await adminSupabase.storage
    .from("qr-codes")
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

  // Update table with real token and QR URL
  await supabase
    .from("tables")
    .update({ token, qr_url: signedUrl?.signedUrl })
    .eq("id", table.id);

  return NextResponse.json({ ok: true, table: { ...table, token, qr_url: signedUrl?.signedUrl } });
}
