import { Router } from "express";
import { auditRouter } from "./auditRoutes.js";
import { authRouter } from "./authRoutes.js";
import { healthRouter } from "./healthRoutes.js";
import { rbacRouter } from "./rbacRoutes.js";
import { tenantRouter } from "./tenantRoutes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/audit", auditRouter);
apiRouter.use("/rbac", rbacRouter);
apiRouter.use("/tenants", tenantRouter);
