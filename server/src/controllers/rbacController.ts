import type { RequestHandler } from "express";
import {
  getRbacProfile,
  probeFinanceWrite,
  probeReportsRead,
  probeTenantsManage,
} from "../services/rbacService.js";

export const profile: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ ok: false, message: "Unauthorized" });
      return;
    }

    res.status(200).json({ ok: true, rbac: getRbacProfile(req.user) });
  } catch (error) {
    next(error);
  }
};

export const financeWriteProbe: RequestHandler = (_req, res) => {
  res.status(200).json(probeFinanceWrite());
};

export const reportsReadProbe: RequestHandler = (_req, res) => {
  res.status(200).json(probeReportsRead());
};

export const tenantsManageProbe: RequestHandler = (_req, res) => {
  res.status(200).json(probeTenantsManage());
};
