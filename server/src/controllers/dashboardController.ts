import type { RequestHandler } from "express";
import { getDashboardSummary } from "../services/dashboardService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { dashboardSummaryQuerySchema } from "../validators/dashboardValidators.js";

export const summary: RequestHandler = async (req, res, next) => {
  try {
    const query = dashboardSummaryQuerySchema.parse(req.query);
    const result = await getDashboardSummary(req.user!.tenantId!, query);
    sendSuccess(res, 200, result);
  } catch (error) {
    next(error);
  }
};
