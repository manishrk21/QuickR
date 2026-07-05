import { rateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateTableSchema = z.object({
  is_active: z.boolean(),
});

// PATCH /api/admin/tables/[tableId] — toggle active/inactive status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { tableId: string } }
) {


  const limited = await rateLimit(req, "admin");
  if (limited) return limited;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = UpdateTableSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { error } = await supabase
    .from("tables")
    .update({ is_active: parsed.data.is_active })
    .eq("id", params.tableId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/tables/[tableId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { tableId: string } }
) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;
  
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("tables")
    .delete()
    .eq("id", params.tableId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
