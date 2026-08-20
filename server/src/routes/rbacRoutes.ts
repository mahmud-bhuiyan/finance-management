import { Router } from "express";
import { PERMISSIONS } from "../config/permissions.js";
import {
  financeWriteProbe,
  profile,
  reportsReadProbe,
  tenantsManageProbe,
} from "../controllers/rbacController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { requireTenant } from "../middleware/requireTenant.js";

export const rbacRouter = Router();

rbacRouter.get("/me", requireAuth, profile);
rbacRouter.get(
  "/probes/tenants-manage",
  requireAuth,
  requirePermission(PERMISSIONS.TENANTS_MANAGE),
  tenantsManageProbe,
);
rbacRouter.get(
  "/probes/finance-write",
  requireAuth,
  requireTenant,
  requirePermission(PERMISSIONS.FINANCE_WRITE),
  financeWriteProbe,
);
rbacRouter.get(
  "/probes/reports-read",
  requireAuth,
  requireTenant,
  requirePermission(PERMISSIONS.REPORTS_READ),
  reportsReadProbe,
);
