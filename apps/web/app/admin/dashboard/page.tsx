import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Guard rails just in case middleware bypasses
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, Admin</p>
          </div>
          <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Authenticated
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Table Settings</h3>
            <p className="mt-2 text-xs text-slate-400">Generate secure QR tokens and register new tables.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Restaurant Profiles</h3>
            <p className="mt-2 text-xs text-slate-400">Configure theme variables, hex colors, and layout styles.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
