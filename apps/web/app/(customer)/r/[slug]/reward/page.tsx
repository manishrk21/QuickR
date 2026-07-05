import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { adminSupabase } from "@/lib/supabase/admin";

export default async function RewardPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getCustomerSession();
  if (!session) redirect(`/r/${params.slug}/auth`);

  const { data: restaurant } = await adminSupabase
    .from("restaurants")
    .select("id, name, primary_color, loyalty_streak_target")
    .eq("slug", params.slug)
    .single();

  if (!restaurant || session.restaurantId !== restaurant.id) {
    redirect(`/r/${params.slug}`);
  }

  const { data: reward } = await adminSupabase
    .from("loyalty_rewards")
    .select("id, created_at, is_redeemed")
    .eq("customer_id", session.customerId)
    .eq("restaurant_id", restaurant.id)
    .eq("is_redeemed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!reward) redirect(`/r/${params.slug}`);

  return (
    <div className="flex flex-col items-center pb-8 pt-10 text-center">
      <div
        className="w-full max-w-xs rounded-2xl p-8 text-white shadow-2xl"
        style={{ background: restaurant.primary_color }}
      >
        <div className="mb-4 text-5xl">🎁</div>
        <h1 className="mb-1 text-2xl font-bold">You earned a reward!</h1>
        <p className="text-sm opacity-80">
          You completed a {restaurant.loyalty_streak_target}-visit streak at {restaurant.name}
        </p>

        <div className="mt-6 rounded-xl bg-white/20 px-4 py-3">
          <p className="mb-1 text-xs opacity-70">Show this to staff</p>
          <p className="font-mono text-lg font-bold tracking-widest">
            {reward.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <p className="mt-4 text-xs opacity-60">
          Earned on{" "}
          {new Date(reward.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <p className="mt-6 max-w-xs text-sm text-slate-500">
        Show this screen to our staff to claim your reward. They&apos;ll mark it as redeemed.
      </p>

      <a href={`/r/${params.slug}`} className="mt-6 text-sm text-slate-400 underline">
        Back to menu
      </a>
    </div>
  );
}
