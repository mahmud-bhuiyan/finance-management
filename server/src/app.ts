import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { API_PREFIX } from "./config/api.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { ensureSuperAdmin } from "./services/bootstrapService.js";

export const createApp = () => {
  const app = express();

  // SPA origin; credentials required for httpOnly fms_token cookies.
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  // Plain-text root — quick browser check, not part of the versioned API.
  app.get("/", (_req, res) => {
    res.type("text").send("Finance Management Server is running");
  });

  // Ops / load-balancer probe; lives outside /api/v1 on purpose.
  app.use("/health", healthRouter);

  // Versioned REST surface — routers in routes/index.ts.
  app.use(API_PREFIX, apiRouter);

  // Must run after all routes so handlers can forward errors here.
  app.use(errorHandler);

  return app;
};

const app = createApp();

// Seed the default Super Admin once at startup; tests bootstrap their own data.
if (env.NODE_ENV !== "test") {
  void ensureSuperAdmin().catch((error) => {
    console.error("Super Admin bootstrap failed:", error);
  });
}

export default app;
