"use client";

import { useAdminSessionTimeout } from "@/hooks/useAdminSessionTimeout";

export function SessionTimeoutGuard({ slug }: { slug: string }) {
  useAdminSessionTimeout(slug);
  return null;
}
