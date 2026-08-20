import { Router } from "express";
import { PERMISSIONS } from "../config/permissions.js";
import {
  create,
  getById,
  list,
  remove,
  update,
} from "../controllers/fieldController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { requireTenant } from "../middleware/requireTenant.js";

export const fieldRouter = Router();

fieldRouter.use(
  requireAuth,
  requireTenant,
  requirePermission(PERMISSIONS.FIELDS_MANAGE),
);

fieldRouter.get("/", list);
fieldRouter.get("/:id", getById);
fieldRouter.post("/", create);
fieldRouter.patch("/:id", update);
fieldRouter.delete("/:id", remove);
