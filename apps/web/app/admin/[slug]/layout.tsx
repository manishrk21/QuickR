import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionTimeoutGuard } from "@/components/admin/SessionTimeoutGuard";
import dynamic from "next/dynamic";

const AdminShell = dynamic(() => import("@/components/admin/AdminShell"), { ssr: false });

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/admin/login");

  // Get restaurant and verify this user belongs to it
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .single();

  if (!restaurant) redirect("/admin/login");

  const { data: member } = await supabase
    .from("tenant_members")
    .select("must_change_password")
    .eq("user_id", session.user.id)
    .eq("restaurant_id", restaurant.id)
    .single();

  if (!member) redirect("/admin/login");

  // CRITICAL LOOP BREAK: If they are already navigating to change-password, 
  // do not trigger another redirect loop sequence!
  if (member.must_change_password) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }

  return (
    <div>
      <SessionTimeoutGuard slug={params.slug} />
      <AdminShell slug={params.slug} restaurantName={restaurant.name}>
        {children}
      </AdminShell>
    </div>
  );
}
