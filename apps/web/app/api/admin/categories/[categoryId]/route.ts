import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const RenameSchema = z.object({ name: z.string().min(1).max(60) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const parsed = RenameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { error } = await supabase
    .from("categories")
    .update({ name: parsed.data.name })
    .eq("id", params.categoryId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { count } = await supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("category_id", params.categoryId)
    .is("deleted_at", null);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Move or delete all items in this category first." },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", params.categoryId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
