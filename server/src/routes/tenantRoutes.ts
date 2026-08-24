import { Router } from "express";
import {
  create,
  createAdmin,
  destroy,
  list,
  update,
} from "../controllers/tenantController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin.js";

export const tenantRouter = Router();

tenantRouter.use(requireAuth, requireSuperAdmin);

tenantRouter.get("/", list);
tenantRouter.post("/", create);
tenantRouter.patch("/:id", update);
tenantRouter.delete("/:id", destroy);
tenantRouter.post("/:id/admins", createAdmin);
