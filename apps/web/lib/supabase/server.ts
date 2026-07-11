// apps/web/lib/supabase/server.ts
// Safe version — cookie.set and cookie.remove are wrapped in try/catch
// so they don't crash when called from read-only Server Components
// (only Route Handlers and Server Actions can set cookies)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          // Only works in Route Handlers and Server Actions
          // Silently ignore in Server Components (read-only context)
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Expected when called from a Server Component during GET request
            // The session will still be read correctly on the next request
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Same as above — safe to ignore in read-only context
          }
        },
      },
    }
  );
}



// old working  

// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";

// export function createClient() {
//   const cookieStore = cookies();
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name) { return cookieStore.get(name)?.value; },
//         set(name, value, options) { cookieStore.set({ name, value, ...options }); },
//         remove(name, options) { cookieStore.set({ name, value: "", ...options }); },
//       },
//     }
//   );
// }
