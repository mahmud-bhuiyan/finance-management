import type { RequestHandler } from "express";
import { listAuditLogs } from "../services/auditService.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { listAuditLogsSchema } from "../validators/auditValidators.js";

export const list: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }

    const query = listAuditLogsSchema.parse(req.query);

    if (query.tenantId && req.user.role !== "SUPER_ADMIN") {
      throw new AppError("Permission denied", 403, "FORBIDDEN");
    }

    const logs = await listAuditLogs(req.user, query);
    sendSuccess(res, 200, { logs });
  } catch (error) {
    next(error);
  }
};
