"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TIMEOUT_MS = 2 * 60 * 60 * 1000;
const WARNING_MS = 5 * 60 * 1000;

export function useAdminSessionTimeout(slug: string) {
  const router = useRouter();
  const supabase = createClient();
  const timeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resetTimer() {
    if (timeoutRef.current)  clearTimeout(timeoutRef.current);
    if (warningRef.current)  clearTimeout(warningRef.current);

    warningRef.current = setTimeout(() => {
      const stay = confirm(
        "You've been inactive for a while. Click OK to stay signed in, or Cancel to sign out."
      );
      if (!stay) signOut();
    }, TIMEOUT_MS - WARNING_MS);

    timeoutRef.current = setTimeout(() => signOut(), TIMEOUT_MS);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    resetTimer();
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));

    return () => {
      if (timeoutRef.current)  clearTimeout(timeoutRef.current);
      if (warningRef.current)  clearTimeout(warningRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);
}
