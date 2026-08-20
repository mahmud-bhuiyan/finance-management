import type { RequestHandler } from "express";
import {
  createCompanyAdmin,
  createTenant,
  listTenants,
  updateTenant,
} from "../services/tenantService.js";
import {
  createCompanyAdminSchema,
  createTenantSchema,
  tenantIdParamSchema,
  updateTenantSchema,
} from "../validators/tenantValidators.js";

export const list: RequestHandler = async (_req, res, next) => {
  try {
    const tenants = await listTenants();
    res.status(200).json({ ok: true, tenants });
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (req, res, next) => {
  try {
    const body = createTenantSchema.parse(req.body);
    const tenant = await createTenant(body, req.user!.id);
    res.status(201).json({ ok: true, tenant });
  } catch (error) {
    next(error);
  }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const { id } = tenantIdParamSchema.parse(req.params);
    const body = updateTenantSchema.parse(req.body);
    const tenant = await updateTenant(id, body, req.user!.id);
    res.status(200).json({ ok: true, tenant });
  } catch (error) {
    next(error);
  }
};

export const createAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { id } = tenantIdParamSchema.parse(req.params);
    const body = createCompanyAdminSchema.parse(req.body);
    const admin = await createCompanyAdmin(id, body, req.user!.id);
    res.status(201).json({ ok: true, admin });
  } catch (error) {
    next(error);
  }
};
