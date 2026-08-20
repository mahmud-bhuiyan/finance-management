import type { RequestHandler } from "express";
import {
  roleHasPermission,
  type Permission,
} from "../config/permissions.js";
import { AppError } from "../utils/AppError.js";

export const requirePermission = (permission: Permission): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
      return;
    }

    if (!roleHasPermission(req.user.role, permission)) {
      next(new AppError("Permission denied", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
};

export const requireAnyPermission = (
  ...permissions: Permission[]
): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
      return;
    }

    const allowed = permissions.some((permission) =>
      roleHasPermission(req.user!.role, permission),
    );

    if (!allowed) {
      next(new AppError("Permission denied", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
};
