import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";

/** Requires an authenticated user who belongs to a company (not Super Admin). */
export const requireTenant: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
    return;
  }

  if (!req.user.tenantId) {
    next(new AppError("Company membership required", 403, "TENANT_REQUIRED"));
    return;
  }

  next();
};
