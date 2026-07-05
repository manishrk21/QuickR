// import cron from "node-cron";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// export function startCleanupJobs() {
//   cron.schedule("*/15 * * * *", async () => {
//     const now = new Date().toISOString();

//     await supabase.from("otp_requests").delete().lt("expires_at", now);
//     await supabase.from("customer_sessions").delete().lt("expires_at", now);

//     console.log("[cleanup] Expired OTPs and sessions deleted at", now);
//   });
// }

import "dotenv/config";

import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export function startCleanupJobs() {
  if (!supabase) {
    console.warn("[cleanup] Supabase not configured; cleanup jobs disabled.");
    return;
  }
  // Every 15 minutes: expired OTPs and sessions
  cron.schedule("*/15 * * * *", async () => {
    const now = new Date().toISOString();

    const [otpResult, sessionResult] = await Promise.all([
      supabase.from("otp_requests").delete().lt("expires_at", now),
      supabase.from("customer_sessions").delete().lt("expires_at", now),
    ]);

    const otpCount = otpResult.count ?? 0;
    const sessionCount = sessionResult.count ?? 0;
    if (otpCount > 0 || sessionCount > 0) {
      console.log(
        `[cleanup] Deleted ${otpCount} expired OTPs, ${sessionCount} expired sessions`
      );
    }
  });

  // Daily at 3am: delete guest customers with no orders (orphaned guests)
  cron.schedule("0 3 * * *", async () => {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    // Find guest customers older than 48h with zero orders
    const { data: orphanedGuests } = await supabase
      .from("customers")
      .select("id")
      .eq("is_guest", true)
      .lt("created_at", cutoff);

    if (!orphanedGuests || orphanedGuests.length === 0) return;

    const guestIds = orphanedGuests.map((g) => g.id);

    // Only delete guests who have no orders
    const { data: guestsWithOrders } = await supabase
      .from("orders")
      .select("customer_id")
      .in("customer_id", guestIds);

    const withOrdersSet = new Set((guestsWithOrders ?? []).map((o) => o.customer_id));
    const toDelete = guestIds.filter((id) => !withOrdersSet.has(id));

    if (toDelete.length > 0) {
      await supabase.from("customers").delete().in("id", toDelete);
      console.log(`[cleanup] Deleted ${toDelete.length} orphaned guest customers`);
    }
  });

  console.log("[cleanup] Jobs scheduled");
}