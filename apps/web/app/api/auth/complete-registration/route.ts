// apps/web/app/api/auth/complete-registration/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { adminSupabase } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  // If Supabase returned an error (expired link, already used, etc.)
  if (error) {
    return NextResponse.redirect(
      new URL(`/register?error=${encodeURIComponent(error)}`, req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/register", req.url));
  }

  // Exchange the code for a session
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get:    (name) => cookieStore.get(name)?.value,
        set:    (name, value, options) => {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove: (name, options) => {
          try { cookieStore.set({ name, value: "", ...options }); } catch {}
        },
      },
    }
  );

  const { data: { session }, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError || !session) {
    return NextResponse.redirect(
      new URL("/register?error=verification_failed", req.url)
    );
  }

  const user     = session.user;
  const metadata = user.user_metadata as {
    cafe_name?:  string;
    owner_name?: string;
    mobile?:     string;
    slug?:       string;
  };

  // Check if this user already has a restaurant (avoid duplicate on re-verification)
  const { data: existingMember } = await adminSupabase
    .from("tenant_members")
    .select("restaurant_id, restaurants(slug)")
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    // Already onboarded — send straight to dashboard
    const slug = (existingMember.restaurants as any)?.slug;
    return NextResponse.redirect(
      new URL(`/admin/${slug}`, req.url)
    );
  }

  // Create restaurant + link owner using our SQL function
  if (!metadata.cafe_name || !metadata.slug) {
    // Metadata missing — something went wrong. Send to register with error.
    return NextResponse.redirect(
      new URL("/register?error=missing_data", req.url)
    );
  }

  const { data: result, error: createError } = await adminSupabase
    .rpc("create_restaurant_and_owner", {
      p_user_id:       user.id,
      p_cafe_name:     metadata.cafe_name,
      p_slug:          metadata.slug,
      p_owner_name:    metadata.owner_name ?? "",
      p_mobile:        metadata.mobile ?? "",
      p_primary_color: "#630102",
    });

  if (createError || !result || result.length === 0) {
    console.error("[Registration] Failed to create restaurant:", createError);
    return NextResponse.redirect(
      new URL("/register?error=setup_failed", req.url)
    );
  }

  const { slug: finalSlug } = result[0];

  // Redirect to their dashboard — session cookie is already set
  const response = NextResponse.redirect(
    new URL(`/admin/${finalSlug}`, req.url)
  );

  return response;
}
