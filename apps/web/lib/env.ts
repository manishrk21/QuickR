const REQUIRED_SERVER = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "QR_TOKEN_SECRET",
  "NEXT_PUBLIC_WORKER_URL",
  "NEXT_PUBLIC_APP_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

export function validateEnv() {
  if (typeof window !== "undefined") return;

  const missing: string[] = [];
  for (const key of REQUIRED_SERVER) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(
      `[QuickR] Missing required environment variables:\n${missing
        .map((k) => `  - ${k}`)
        .join("\n")}\n\nCheck your .env.local file.`
    );
  }

  if ((process.env.QR_TOKEN_SECRET?.length ?? 0) < 32) {
    throw new Error(
      "[QuickR] QR_TOKEN_SECRET must be at least 32 characters. " +
        "Generate one with: openssl rand -hex 32"
    );
  }
}
