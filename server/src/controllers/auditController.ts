import type { RequestHandler } from "express";
import { listAuditLogs } from "../services/auditService.js";
import { listAuditLogsSchema } from "../validators/auditValidators.js";

export const list: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ ok: false, message: "Unauthorized" });
      return;
    }

    const query = listAuditLogsSchema.parse(req.query);

    if (query.tenantId && req.user.role !== "SUPER_ADMIN") {
      res.status(403).json({ ok: false, message: "Permission denied" });
      return;
    }

    const logs = await listAuditLogs(req.user, query);
    res.status(200).json({ ok: true, logs });
  } catch (error) {
    next(error);
  }
};
