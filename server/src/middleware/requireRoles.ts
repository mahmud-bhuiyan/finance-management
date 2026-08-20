import type { UserRole } from "@prisma/client";
import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";

export const requireRoles = (...roles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("Insufficient role", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
};
