import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { context } from "./server-context.js";
import studioRoutes from "./routes/studioRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

const CLIENT_URLS = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function createApp() {
  const app = express();

  // CORS with credentials — the frontend sends its session cookie
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || CLIENT_URLS.includes(origin) || /\.vercel\.app$/.test(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  // BetterAuth mounted at /api/auth (frontend browser fetches go here)
  app.use("/api/auth", (req, res, next) => {
    if (!context.auth) {
      return res.status(503).json({ message: "Auth service is starting, try again" });
    }
    return toNodeHandler(context.auth)(req, res, next);
  });

  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "studiospace-api", time: new Date().toISOString() });
  });

  app.use("/api/studios", studioRoutes);
  app.use("/api/bookings", bookingRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
 export default app