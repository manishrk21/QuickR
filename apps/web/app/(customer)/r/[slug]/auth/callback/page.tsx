"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OAuthCallbackPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError("Google sign-in failed. Please try again.");
        return;
      }

      const tableId = localStorage.getItem("qr_pending_table");
      const restaurantId = localStorage.getItem("qr_pending_restaurant");
      localStorage.removeItem("qr_pending_table");
      localStorage.removeItem("qr_pending_restaurant");

      if (!restaurantId) {
        setError("Session context lost. Please scan the QR code again.");
        return;
      }

      const res = await fetch("/api/customer/google-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          google_id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name ?? null,
          restaurant_id: restaurantId,
          table_id: tableId ?? null,
        }),
      });

      if (!res.ok) {
        setError("Failed to create session. Please try again.");
        return;
      }

      await supabase.auth.signOut();
      router.push(`/r/${params.slug}`);
    }

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="pt-12 text-center">
        <p className="text-red-600 text-sm">{error}</p>
        <button onClick={() => router.push(`/r/${params.slug}/auth`)} className="mt-4 text-sm text-violet-600 underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="pt-12 text-center">
      <p className="text-slate-500 text-sm">Signing you in…</p>
    </div>
  );
}













// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/lib/supabase/client";

// export default function OAuthCallbackPage({ params }: { params: { slug: string } }) {
//   const router = useRouter();
//   const supabase = createClient();
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function handleCallback() {
//       const { data: { session }, error: sessionError } = await supabase.auth.getSession();

//       if (sessionError || !session) {
//         setError("Google sign-in failed. Please try again.");
//         return;
//       }

//       const tableId = localStorage.getItem("qr_pending_table");
//       const restaurantId = localStorage.getItem("qr_pending_restaurant");
//       localStorage.removeItem("qr_pending_table");
//       localStorage.removeItem("qr_pending_restaurant");

//       if (!restaurantId) {
//         setError("Session context lost. Please scan the QR code again.");
//         return;
//       }

//       const res = await fetch("/api/customer/google-session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           google_id: session.user.id,
//           email: session.user.email,
//           name: session.user.user_metadata?.full_name ?? null,
//           restaurant_id: restaurantId,
//           table_id: tableId ?? null,
//         }),
//       });

//       if (!res.ok) {
//         setError("Failed to create session. Please try again.");
//         return;
//       }

//       await supabase.auth.signOut();
//       router.push(`/r/${params.slug}`);
//     }

//     handleCallback();
//   }, []);

//   if (error) {
//     return (
//       <div className="pt-12 text-center">
//         <p className="text-red-600 text-sm">{error}</p>
//         <button onClick={() => router.push(`/r/${params.slug}/auth`)} className="mt-4 text-sm text-violet-600 underline">
//           Go back
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="pt-12 text-center">
//       <p className="text-slate-500 text-sm">Signing you in…</p>
//     </div>
//   );
// }
