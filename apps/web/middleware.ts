// apps/web/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const { pathname } = request.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // ── Superadmin routes ──────────────────────────────────────────────────────
  if (pathname.startsWith("/superadmin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Verify this user is actually a superadmin
    const { data: superadmin } = await supabase
      .from("superadmins")
      .select("user_id")
      .eq("user_id", session.user.id)
      .single();

    if (!superadmin) {
      // Logged in but not superadmin — redirect to their restaurant
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // ── Admin routes ───────────────────────────────────────────────────────────
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*"],
};








// //middleware old working without the superadmin 
// import { NextResponse, type NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Only run auth logic for admin routes. 
//   // Let /r/:path* routes pass through freely to be handled by the Server Component
//   if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
//       // Keep your existing admin auth logic here...
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*", "/r/:path*"],
// };
