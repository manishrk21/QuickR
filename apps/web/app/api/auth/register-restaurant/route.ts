import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  const { cafe_name, owner_name, mobile, email, password } = await req.json();

  if (!cafe_name || !email || !password) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  // Step 1: Create user via Admin API — bypasses email confirmation
  // email_confirm: true means we mark it confirmed immediately
  // This does NOT affect other users or global settings
  const { data: userData, error: createError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,   // ← key line — confirms only this user
      user_metadata: {
        cafe_name,
        owner_name,
        mobile,
        role: "restaurant_owner",
      },
    });

  if (createError) {
    // Handle duplicate email gracefully
    if (createError.message.includes("already been registered")) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: createError.message },
      { status: 500 }
    );
  }

  const userId = userData.user.id;
  const slug   = slugify(cafe_name);

  // Step 2: Create restaurant + link owner
  const { data: result, error: restaurantError } = await adminSupabase.rpc(
    "create_restaurant_and_owner",
    {
      p_user_id:       userId,
      p_cafe_name:     cafe_name,
      p_slug:          slug,
      p_owner_name:    owner_name ?? "",
      p_mobile:        mobile ?? "",
      p_primary_color: "#630102",
    }
  );

  if (restaurantError || !result?.length) {
    // Roll back — delete the auth user so they can retry
    await adminSupabase.auth.admin.deleteUser(userId);
    console.error("[register-restaurant]", restaurantError);
    return NextResponse.json(
      { error: "Failed to set up your restaurant. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok:   true,
    slug: result[0].slug,
  });
}
