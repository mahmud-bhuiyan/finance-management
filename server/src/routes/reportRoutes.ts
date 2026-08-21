import { Router } from "express";
import { PERMISSIONS } from "../config/permissions.js";
import {
  exportCsv,
  exportExcel,
  exportPdf,
  summary,
} from "../controllers/reportController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAnyPermission } from "../middleware/requirePermission.js";
import { requireTenant } from "../middleware/requireTenant.js";

export const reportRouter = Router();

reportRouter.use(requireAuth, requireTenant);

reportRouter.get(
  "/summary",
  requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
  summary,
);

reportRouter.get(
  "/export.csv",
  requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
  exportCsv,
);

reportRouter.get(
  "/export.xlsx",
  requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
  exportExcel,
);

reportRouter.get(
  "/export.pdf",
  requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
  exportPdf,
);
