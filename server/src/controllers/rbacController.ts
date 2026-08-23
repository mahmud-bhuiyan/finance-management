import type { RequestHandler } from "express";
import {
  getRbacProfile,
  probeFinanceWrite,
  probeReportsRead,
  probeTenantsManage,
} from "../services/rbacService.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const profile: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }

    sendSuccess(res, 200, { rbac: getRbacProfile(req.user) });
  } catch (error) {
    next(error);
  }
};

export const financeWriteProbe: RequestHandler = (_req, res) => {
  sendSuccess(res, 200, probeFinanceWrite());
};

export const reportsReadProbe: RequestHandler = (_req, res) => {
  sendSuccess(res, 200, probeReportsRead());
};

export const tenantsManageProbe: RequestHandler = (_req, res) => {
  sendSuccess(res, 200, probeTenantsManage());
};
