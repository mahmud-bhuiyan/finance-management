import type { RequestHandler } from "express";
import { getDashboardSummary } from "../services/dashboardService.js";
import { dashboardSummaryQuerySchema } from "../validators/dashboardValidators.js";

export const summary: RequestHandler = async (req, res, next) => {
  try {
    const query = dashboardSummaryQuerySchema.parse(req.query);
    const result = await getDashboardSummary(req.user!.tenantId!, query);
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};
