import { adminSupabase } from "@/lib/supabase/admin";

export async function getSignedImageUrls(paths: (string | null | undefined)[]) {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean) as string[]));
  const signedUrls: Record<string, string> = {};
  if (uniquePaths.length === 0) return signedUrls;
  const { data } = await adminSupabase.storage
    .from("menu-images")
    .createSignedUrls(uniquePaths, 3600);
  if (data) {
    data.forEach((item) => {
      if (item.signedUrl && typeof item.path === "string") {
        signedUrls[item.path] = item.signedUrl;
      }
    });
  }
  return signedUrls;
}
