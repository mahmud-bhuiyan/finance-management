import { Router } from "express";
import { PERMISSIONS } from "../config/permissions.js";
import { summary } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAnyPermission } from "../middleware/requirePermission.js";
import { requireTenant } from "../middleware/requireTenant.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth, requireTenant);

dashboardRouter.get(
  "/summary",
  requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
  summary,
);
