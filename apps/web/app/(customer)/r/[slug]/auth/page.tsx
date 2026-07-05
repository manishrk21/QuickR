import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminSupabase } from "@/lib/supabase/admin";
import { TABLE_COOKIE } from "@/lib/auth/customer-session";
import AuthClient from "@/components/customer/AuthClient";

export default async function CustomerAuthPage({
  params,
}: {
  params: { slug: string };
}) {
  const cookieStore = await cookies();

  // Get restaurant layout configurations
  const { data: restaurant } = await adminSupabase
    .from("restaurants")
    .select("id, name")
    .eq("slug", params.slug)
    .single();

  if (!restaurant) redirect("/");

  // Pull existing context cookies if present
  const tableCookie = cookieStore.get(TABLE_COOKIE)?.value;
  let tableId: string | null = null;
  if (tableCookie) {
    const [cookieTableId] = tableCookie.split(":");
    tableId = cookieTableId || null;
  }

  return (
    <AuthClient
      restaurantId={restaurant.id}
      restaurantName={restaurant.name}
      slug={params.slug}
      tableId={tableId}
    />
  );
}
