import "dotenv/config";
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'
import express from "express";
import helmet from "helmet";
// import rateLimit from "express-rate-limit";
import { otpRouter } from "./routes/otp";
import { startCleanupJobs } from "./jobs/cleanup";

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy (needed for Render deployment — gets real IP)
app.set("trust proxy", 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "same-site" },
}));

// Strict body size limit — prevents large payload attacks
app.use(express.json({ limit: "16kb" }));

// Global rate limit — secondary to per-route Redis limits
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,                    // tighter than before
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests." },
    // Use real IP behind Render proxy
    // keyGenerator: (req) =>
    //   req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ??
    //   req.ip ??
    //   "unknown",
    keyGenerator: (req) => {
      const clientIp = req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ?? req.ip ?? "unknown";
      return ipKeyGenerator(clientIp);
    },
  })
);

// CORS — allow the web app origin and localhost dev origins
const allowedOrigins = new Set([
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.WEB_APP_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3004",
].filter(Boolean) as string[]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isLocalhost = origin?.startsWith("http://localhost");

  if (origin && (allowedOrigins.has(origin) || (process.env.NODE_ENV !== "production" && isLocalhost))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

app.use("/otp", otpRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Global error handler — never expose stack traces
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Worker Error]", err.message);
  res.status(500).json({ error: "Internal server error." });
});

startCleanupJobs();

app.listen(PORT, () => console.log(`Worker running on :${PORT}`));