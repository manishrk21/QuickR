import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ReorderSchema = z.object({
  items: z.array(
    z.object({ id: z.string().uuid(), display_order: z.number().int().min(0) })
  ),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await Promise.all(
    parsed.data.items.map(({ id, display_order }) =>
      supabase
        .from("categories")
        .update({ display_order })
        .eq("id", id)
    )
  );

  return NextResponse.json({ ok: true });
}
