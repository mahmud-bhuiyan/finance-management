import { Router } from "express";
import { authRouter } from "./authRoutes.js";
import { healthRouter } from "./healthRoutes.js";
import { rbacRouter } from "./rbacRoutes.js";
import { tenantRouter } from "./tenantRoutes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/rbac", rbacRouter);
apiRouter.use("/tenants", tenantRouter);
