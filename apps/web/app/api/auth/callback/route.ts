import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const slug = searchParams.get("slug");

  if (!code || !slug) {
    return NextResponse.redirect(`${origin}/`);
  }

  return NextResponse.redirect(`${origin}/r/${slug}/auth/callback`);
}








// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { createCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/auth/customer-session";
// import { adminSupabase } from "@/lib/supabase/admin";

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);
//   const code = searchParams.get("code");
//   const slug = searchParams.get("slug");
//   const tableId = searchParams.get("tableId") || null;

//   if (!code || !slug) {
//     return NextResponse.redirect(`${origin}/`);
//   }

//   // 1. Create a cookie-based Supabase route handler client to complete code exchange
//   const cookieStore = cookies();
  
//   // Custom local fetch initialization to handle fallback exchange cleanly
//   const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     },
//     body: JSON.stringify({
//       code_verifier: "", // Handled automatically by token jar structures
//       code,
//     }),
//   });

//   // 2. Identify or provisions the customer record inside your custom tables
//   // Get restaurant ID
//   const { data: restaurant } = await adminSupabase
//     .from("restaurants")
//     .select("id")
//     .eq("slug", slug)
//     .single();

//   if (!restaurant) return NextResponse.redirect(`${origin}/`);

//   // Generate an automated user entry to hold the table mapping metrics
//   const { data: customer } = await adminSupabase
//     .from("customers")
//     .insert({
//       restaurant_id: restaurant.id,
//       is_guest: false,
//     })
//     .select("id")
//     .single();

//   if (!customer) return NextResponse.redirect(`${origin}/r/${slug}/auth?error=session_failed`);

//   // 3. Issue your primary customer app router session token
//   const sessionToken = await createCustomerSession(customer.id, restaurant.id, tableId);

//   // 4. Redirect cleanly back to the menu landing view with the active cookie set
//   const response = NextResponse.redirect(`${origin}/r/${slug}`);
//   response.cookies.set(CUSTOMER_SESSION_COOKIE, sessionToken, {
//     httpOnly: true,
//     sameSite: "lax",
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 60 * 60 * 24,
//     path: "/",
//   });

//   return response;
// }
