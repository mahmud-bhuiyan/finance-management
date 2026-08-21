import { Router } from "express";
import { PERMISSIONS } from "../config/permissions.js";
import {
  create as createAttachment,
  download as downloadAttachment,
  list as listAttachments,
  remove as removeAttachment,
  uploadMiddleware,
} from "../controllers/attachmentController.js";
import {
  create,
  getById,
  list,
  remove,
  update,
} from "../controllers/incomeController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  requireAnyPermission,
  requirePermission,
} from "../middleware/requirePermission.js";
import { requireTenant } from "../middleware/requireTenant.js";

export const incomeRouter = Router();

incomeRouter.use(requireAuth, requireTenant);

incomeRouter.get(
  "/",
  requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
  list,
);
incomeRouter.get(
  "/:id/attachments",
  requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
  listAttachments,
);
incomeRouter.post(
  "/:id/attachments",
  requirePermission(PERMISSIONS.FINANCE_WRITE),
  uploadMiddleware,
  createAttachment,
);
incomeRouter.get(
  "/:id/attachments/:attachmentId/download",
  requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
  downloadAttachment,
);
incomeRouter.delete(
  "/:id/attachments/:attachmentId",
  requirePermission(PERMISSIONS.FINANCE_WRITE),
  removeAttachment,
);
incomeRouter.get(
  "/:id",
  requireAnyPermission(PERMISSIONS.FINANCE_WRITE, PERMISSIONS.REPORTS_READ),
  getById,
);
incomeRouter.post("/", requirePermission(PERMISSIONS.FINANCE_WRITE), create);
incomeRouter.patch(
  "/:id",
  requirePermission(PERMISSIONS.FINANCE_WRITE),
  update,
);
incomeRouter.delete(
  "/:id",
  requirePermission(PERMISSIONS.FINANCE_WRITE),
  remove,
);
