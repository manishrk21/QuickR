// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   let response = NextResponse.next({ request: { headers: request.headers } });
//   const { pathname } = request.nextUrl;
//   if (pathname.startsWith("/api")) {
//     return NextResponse.next();
//   }

//   // ── Admin routes ──────────────────────────────────────────
//   if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           get: (name) => request.cookies.get(name)?.value,
//           set: (name, value, options) => {
//             request.cookies.set({ name, value, ...options });
//             response = NextResponse.next({ request: { headers: request.headers } });
//             response.cookies.set({ name, value, ...options });
//           },
//           remove: (name, options) => {
//             request.cookies.set({ name, value: "", ...options });
//             response = NextResponse.next({ request: { headers: request.headers } });
//             response.cookies.set({ name, value: "", ...options });
//           },
//         },
//       }
//     );

//     const { data: { session } } = await supabase.auth.getSession();
//     if (!session) {
//       return NextResponse.redirect(new URL("/admin/login", request.url));
//     }
//   }

//   // ── Customer menu routes ──────────────────────────────────
//   return response;
// }

// export const config = {
//   matcher: ["/admin/:path*", "/r/:path*"],
// };
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run auth logic for admin routes. 
  // Let /r/:path* routes pass through freely to be handled by the Server Component
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
      // Keep your existing admin auth logic here...
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/r/:path*"],
};