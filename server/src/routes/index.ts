import { Router } from "express";
import { authRouter } from "./authRoutes.js";
import { auditRouter } from "./auditRoutes.js";
import { dashboardRouter } from "./dashboardRoutes.js";
import { reportRouter } from "./reportRoutes.js";
import { expenseRouter } from "./expenseRoutes.js";
import { incomeRouter } from "./incomeRoutes.js";
import { fieldRouter } from "./fieldRoutes.js";
import { createSupportDataRouter } from "./supportDataRoutes.js";
import { userRouter } from "./userRoutes.js";
import { rbacRouter } from "./rbacRoutes.js";
import { tenantRouter } from "./tenantRoutes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/audit", auditRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/reports", reportRouter);
apiRouter.use("/expenses", expenseRouter);
apiRouter.use("/incomes", incomeRouter);
apiRouter.use("/fields", fieldRouter);
apiRouter.use("/categories", createSupportDataRouter("category"));
apiRouter.use("/departments", createSupportDataRouter("department"));
apiRouter.use("/vendors", createSupportDataRouter("vendor"));
apiRouter.use("/users", userRouter);
apiRouter.use("/rbac", rbacRouter);
apiRouter.use("/tenants", tenantRouter);
