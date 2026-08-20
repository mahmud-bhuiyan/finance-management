import { Router } from "express";
import { authRouter } from "./authRoutes.js";
import { healthRouter } from "./healthRoutes.js";
import { tenantRouter } from "./tenantRoutes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/tenants", tenantRouter);
