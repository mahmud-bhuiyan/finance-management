import { Router } from "express";
import {
  listDemoAccounts,
  login,
  logout,
  me,
  register,
  updateSidebar,
  updateTheme,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const authRouter = Router();

authRouter.get("/demo-users", listDemoAccounts);
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
authRouter.patch("/me/theme", requireAuth, updateTheme);
authRouter.patch("/me/sidebar", requireAuth, updateSidebar);
