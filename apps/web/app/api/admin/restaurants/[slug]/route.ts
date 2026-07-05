import { rateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateRestaurantSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().max(300).optional(),
  phone: z.string().max(20).optional(),
  loyalty_streak_target: z.number().int().min(2).max(30),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;
  
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = UpdateRestaurantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { error } = await supabase
    .from("restaurants")
    .update(parsed.data)
    .eq("slug", params.slug);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
