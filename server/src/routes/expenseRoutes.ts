import { Router } from "express";
import { PERMISSIONS } from "../config/permissions.js";
import {
  create,
  getById,
  list,
  remove,
  update,
} from "../controllers/expenseController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  requireAnyPermission,
  requirePermission,
} from "../middleware/requirePermission.js";
import { requireTenant } from "../middleware/requireTenant.js";

export const expenseRouter = Router();

expenseRouter.use(requireAuth, requireTenant);

expenseRouter.get(
  "/",
  requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
  list,
);
expenseRouter.get(
  "/:id",
  requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
  getById,
);
expenseRouter.post("/", requirePermission(PERMISSIONS.FINANCE_WRITE), create);
expenseRouter.patch(
  "/:id",
  requirePermission(PERMISSIONS.FINANCE_WRITE),
  update,
);
expenseRouter.delete(
  "/:id",
  requirePermission(PERMISSIONS.FINANCE_WRITE),
  remove,
);
