import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
    }),
  );
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      ok: true,
      message: "Finance Management System API",
      docs: "/api/health",
    });
  });

  app.use("/api", apiRouter);
  app.use(errorHandler);

  return app;
};
