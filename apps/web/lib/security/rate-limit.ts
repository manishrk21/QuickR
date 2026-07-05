import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest, NextResponse } from "next/server";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasValidRedisConfig = Boolean(
  redisUrl && redisToken && !redisUrl.includes("xxx") && !redisToken.includes("your_token_here")
);

const redis = hasValidRedisConfig
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

export const limiters = {
  auth: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "10 m"), prefix: "rl:auth", analytics: false })
    : null,
  order: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 m"), prefix: "rl:order", analytics: false })
    : null,
  customer: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1 m"), prefix: "rl:customer", analytics: false })
    : null,
  admin: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(120, "1 m"), prefix: "rl:admin", analytics: false })
    : null,
};

export function getIp(req: NextRequest): string {
  return req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
}

export async function rateLimit(req: NextRequest, limiterKey: keyof typeof limiters): Promise<NextResponse | null> {
  const limiter = limiters[limiterKey];
  if (!limiter) {
    return null;
  }

  try {
    const ip = getIp(req);
    const { success, limit, remaining, reset } = await limiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      });
    }
    return null;
  } catch (error) {
    console.warn("[rate-limit] Falling back without Redis", error);
    return null;
  }
}
