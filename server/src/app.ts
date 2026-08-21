import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { API_PREFIX, API_VERSION } from "./config/api.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";
import { ensureSuperAdmin } from "./services/bootstrapService.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/", (_req, res) => {
    res.json({
      ok: true,
      message: "Finance Management System API",
      version: API_VERSION,
      docs: `${API_PREFIX}/health`,
    });
  });

  app.use(API_PREFIX, apiRouter);
  app.use(errorHandler);

  return app;
};

const app = createApp();

if (env.NODE_ENV !== "test") {
  void ensureSuperAdmin().catch((error) => {
    console.error("Super Admin bootstrap failed:", error);
  });
}

export default app;
