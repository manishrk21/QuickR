// apps/web/app/superadmin/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/admin/login");

  const { data: superadmin } = await supabase
    .from("superadmins")
    .select("user_id")
    .eq("user_id", session.user.id)
    .single();

  if (!superadmin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="bg-[#0d0000] border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/superadmin" className="text-lg font-bold text-white tracking-tight">
              Quick<span className="text-[#630102]">R</span>
              <span className="ml-2 text-xs font-normal text-white/40 uppercase tracking-widest">
                Superadmin
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-white/40">
              {session.user.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
