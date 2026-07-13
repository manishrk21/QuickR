// apps/web/app/api/superadmin/restaurants/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { z } from "zod";

const Schema = z.object({ is_active: z.boolean() });

async function verifySuperadmin() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data } = await supabase
    .from("superadmins")
    .select("user_id")
    .eq("user_id", session.user.id)
    .single();
  return data ? session : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await verifySuperadmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { error } = await adminSupabase
    .from("restaurants")
    .update({ is_active: parsed.data.is_active })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, is_active: parsed.data.is_active });
}
