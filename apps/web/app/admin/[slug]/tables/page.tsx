import { createClient } from "@/lib/supabase/server";
import { TablesClient } from "@/components/admin/TablesClient";

export default async function TablesPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: tables } = await supabase
    .from("tables")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tables & QR codes</h1>
          <p className="text-slate-500 mt-1">
            Create tables and download QR codes to place on them.
          </p>
        </div>
      </div>

      <TablesClient initialTables={tables ?? []} slug={params.slug} />
    </div>
  );
}
