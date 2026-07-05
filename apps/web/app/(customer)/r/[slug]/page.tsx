import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { adminSupabase } from "@/lib/supabase/admin";
import { MenuPageClient } from "@/components/customer/MenuPageClient";
import { Suspense } from "react";

export default async function CustomerMenuPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { t?: string };
}) {
  if (searchParams?.t) {
    redirect(`/r/${params.slug}/scan?t=${encodeURIComponent(searchParams.t)}`);
  }

  const session = await getCustomerSession();

  // 1. Fetch Restaurant
  const { data: restaurant } = await adminSupabase
    .from("restaurants")
    .select("id, name, slug, primary_color, loyalty_streak_target")
    .eq("slug", params.slug)
    .single();

  if (!restaurant) redirect("/");
  
  // 2. Auth Check
  if (!session || session.restaurantId !== restaurant.id) {
    redirect(`/r/${params.slug}/auth`);
  }

  const { data: table } = session.tableId
    ? await adminSupabase
        .from("tables")
        .select("id, label")
        .eq("id", session.tableId)
        .eq("restaurant_id", restaurant.id)
        .maybeSingle()
    : { data: null };

  // 3. Fetch Categories
  const { data: categories } = await adminSupabase
    .from("categories")
    .select("id, name, display_order")
    .eq("restaurant_id", restaurant.id)
    .order("display_order");

  // 4. Fetch available menu items only so sold-out items are hidden from the customer menu
  const { data: menuItems } = await adminSupabase
    .from("menu_items")
    .select("id, name, description, price, food_type, image_url, is_available, category_id")
    .eq("restaurant_id", restaurant.id)
    .eq("is_available", true)
    .is("deleted_at", null)
    .order("display_order");

  // 5. Refurbished Mapping: 
  // Since 'image_url' already contains the full public URL from Supabase, 
  // we pass it directly to 'signedImageUrl' without calling 'getSignedImageUrls'.
  const itemsWithImages = (menuItems ?? []).map((item) => ({
    ...item,
    signedImageUrl: item.image_url || undefined,
  }));

  // 6. Loyalty streak based on stored loyalty visits and pending rewards
  let visitCount = 0;
  let hasUnredeemedReward = false;

  try {
    const { count: visitCountResult, error: visitError } = await adminSupabase
      .from("loyalty_visits")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", session.customerId)
      .eq("restaurant_id", restaurant.id);

    if (visitError) throw visitError;
    visitCount = visitCountResult ?? 0;

    const { data: rewardData, error: rewardError } = await adminSupabase
      .from("loyalty_rewards")
      .select("id")
      .eq("customer_id", session.customerId)
      .eq("restaurant_id", restaurant.id)
      .eq("is_redeemed", false)
      .limit(1)
      .maybeSingle();

    if (rewardError) throw rewardError;
    hasUnredeemedReward = !!rewardData;
  } catch (e) {
    console.warn("Loyalty data unavailable", e);
  }

  return (
    <Suspense fallback={<div className="p-10 text-center">Loading Menu...</div>}>
      <MenuPageClient
        restaurant={restaurant}
        categories={categories ?? []}
        items={itemsWithImages}
        session={session}
        tableLabel={table?.label ?? null}
        visitCount={visitCount}
        hasUnredeemedReward={hasUnredeemedReward}
      />
    </Suspense>
  );
}