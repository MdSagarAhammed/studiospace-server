import express from "express";
import cors from "cors";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import { connectDB } from "./config/db.js";
import { initAuth } from "./lib/auth.js";
import { context } from "./server-context.js";
import { CLIENT_URLS, validateBackendEnvironment } from "./config/env.js";
import studioRoutes from "./routes/studioRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

let initializationPromise;

export function initializeBackend() {
  if (context.auth) return Promise.resolve();
  if (!initializationPromise) {
    initializationPromise = (async () => {
      validateBackendEnvironment();
      const uri = process.env.MONGODB_URI;

      const db = await connectDB(uri);
      context.auth = initAuth(db);
    })().catch((error) => {
      initializationPromise = undefined;
      throw error;
    });
  }
  return initializationPromise;
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || CLIENT_URLS.includes(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.use((req, res, next) => {
    initializeBackend().then(() => next(), next);
  });

  app.use("/api/backend/auth", (req, res, next) => {
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

const app = createApp();
export default app;
 
