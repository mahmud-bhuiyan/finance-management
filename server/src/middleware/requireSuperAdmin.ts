import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";

export const requireSuperAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
    return;
  }

  if (req.user.role !== "SUPER_ADMIN") {
    next(new AppError("Super Admin access required", 403, "FORBIDDEN"));
    return;
  }

  next();
};
