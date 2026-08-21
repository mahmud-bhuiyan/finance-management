import { Router } from "express";
import { PERMISSIONS } from "../config/permissions.js";
import * as userController from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { requireTenant } from "../middleware/requireTenant.js";

export const userRouter = Router();

userRouter.use(
  requireAuth,
  requireTenant,
  requirePermission(PERMISSIONS.USERS_MANAGE),
);

userRouter.get("/", userController.list);
userRouter.post("/", userController.create);
userRouter.patch("/:id", userController.update);
