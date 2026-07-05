import { cookies } from "next/headers";
import { adminSupabase } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";

export const CUSTOMER_SESSION_COOKIE = "qr_session";
export const TABLE_COOKIE = "qr_table"; // Must match the name in the route handler
const SESSION_DURATION_MS = 86400000; // 24 hours

export async function getCustomerSession() {
  const cookieStore = await cookies();
  
  // 1. Get the session token
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;

  // 2. Extract tableId from the cookie using the shared constant
  const tableId = cookieStore.get(TABLE_COOKIE)?.value || null;

  // 3. Validate Session
  const [sessionId, rawToken] = token.split(":");
  const { data: session } = await adminSupabase
    .from("customer_sessions")
    .select("id, customer_id, restaurant_id, token_hash, expires_at, table_id")
    .eq("id", sessionId)
    .single();

  if (!session || new Date(session.expires_at) < new Date()) return null;
  if (!(await bcrypt.compare(rawToken, session.token_hash))) return null;

  const resolvedTableId = tableId ?? session.table_id ?? null;

  return {
    customerId: session.customer_id,
    restaurantId: session.restaurant_id,
    tableId: resolvedTableId,
    sessionId: session.id,
  };
}

export async function createCustomerSession(
  customerId: string,
  restaurantId: string,
  tableId: string | null
): Promise<string> {
  const rawToken = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = await bcrypt.hash(rawToken, 8);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  const { data: session } = await adminSupabase
    .from("customer_sessions")
    .insert({
      customer_id: customerId,
      restaurant_id: restaurantId,
      table_id: tableId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  return `${session!.id}:${rawToken}`;
}