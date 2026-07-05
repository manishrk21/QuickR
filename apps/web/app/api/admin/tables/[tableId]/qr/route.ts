import { rateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

// GET /api/admin/tables/[tableId]/qr — returns fresh signed short-lived download URL
export async function GET(
  req: NextRequest,
  { params }: { params: { tableId: string } }
) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;
  
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("tenant_members")
    .select("restaurant_id")
    .eq("user_id", session.user.id)
    .single();

  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storagePath = `${member.restaurant_id}/${params.tableId}.png`;

  const { data, error } = await adminSupabase.storage
    .from("qr-codes")
    .createSignedUrl(storagePath, 60 * 5); // 5-minute secure lease window

  if (error || !data) {
    return NextResponse.json({ error: "QR not found." }, { status: 404 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
