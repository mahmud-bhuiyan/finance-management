import { Router } from "express";
import { PERMISSIONS } from "../config/permissions.js";
import { createSupportDataHandlers } from "../controllers/supportDataController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  requireAnyPermission,
  requirePermission,
} from "../middleware/requirePermission.js";
import { requireTenant } from "../middleware/requireTenant.js";
import type { SupportDataKind } from "../validators/supportDataValidators.js";

export const createSupportDataRouter = (kind: SupportDataKind) => {
  const router = Router();
  const handlers = createSupportDataHandlers(kind);

  router.use(requireAuth, requireTenant);

  router.get(
    "/",
    requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
    handlers.list,
  );
  router.get(
    "/:id",
    requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
    handlers.getById,
  );
  router.post("/", requirePermission(PERMISSIONS.FINANCE_WRITE), handlers.create);
  router.patch(
    "/:id",
    requirePermission(PERMISSIONS.FINANCE_WRITE),
    handlers.update,
  );
  router.delete(
    "/:id",
    requirePermission(PERMISSIONS.FINANCE_WRITE),
    handlers.remove,
  );

  return router;
};
