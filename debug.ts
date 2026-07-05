import { adminSupabase } from "./apps/web/lib/supabase/admin";

async function checkTable() {
  const tableId = "83a4a4ce-f947-4bbf-8749-f646dff53ecf"; // Replace with your actual table ID
  const { data, error } = await adminSupabase
    .from("tables")
    .select("id, is_active")
    .eq("id", tableId)
    .single();

  if (error) console.error("Error:", error);
  else console.log("Database status:", data);
}

checkTable();
