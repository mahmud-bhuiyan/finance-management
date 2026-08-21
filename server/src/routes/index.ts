import { Router } from "express";
import { auditRouter } from "./auditRoutes.js";
import { authRouter } from "./authRoutes.js";
import { dashboardRouter } from "./dashboardRoutes.js";
import { expenseRouter } from "./expenseRoutes.js";
import { fieldRouter } from "./fieldRoutes.js";
import { healthRouter } from "./healthRoutes.js";
import { rbacRouter } from "./rbacRoutes.js";
import { reportRouter } from "./reportRoutes.js";
import { createSupportDataRouter } from "./supportDataRoutes.js";
import { tenantRouter } from "./tenantRoutes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/audit", auditRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/reports", reportRouter);
apiRouter.use("/expenses", expenseRouter);
apiRouter.use("/fields", fieldRouter);
apiRouter.use("/categories", createSupportDataRouter("category"));
apiRouter.use("/departments", createSupportDataRouter("department"));
apiRouter.use("/vendors", createSupportDataRouter("vendor"));
apiRouter.use("/rbac", rbacRouter);
apiRouter.use("/tenants", tenantRouter);
