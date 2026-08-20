import { Router } from "express";
import { PERMISSIONS } from "../config/permissions.js";
import { list } from "../controllers/auditController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/requirePermission.js";

export const auditRouter = Router();

auditRouter.get(
  "/logs",
  requireAuth,
  requirePermission(PERMISSIONS.AUDIT_READ),
  list,
);
