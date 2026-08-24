import type { RequestHandler } from "express";
import {
  createCompanyAdmin,
  createTenant,
  deleteTenant,
  listTenants,
  updateTenant,
} from "../services/tenantService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  createCompanyAdminSchema,
  createTenantSchema,
  tenantIdParamSchema,
  updateTenantSchema,
} from "../validators/tenantValidators.js";

export const list: RequestHandler = async (_req, res, next) => {
  try {
    const tenants = await listTenants();
    sendSuccess(res, 200, { tenants });
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (req, res, next) => {
  try {
    const body = createTenantSchema.parse(req.body);
    const tenant = await createTenant(body, req.user!.id);
    sendSuccess(res, 201, { tenant });
  } catch (error) {
    next(error);
  }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const { id } = tenantIdParamSchema.parse(req.params);
    const body = updateTenantSchema.parse(req.body);
    const tenant = await updateTenant(id, body, req.user!.id);
    sendSuccess(res, 200, { tenant });
  } catch (error) {
    next(error);
  }
};

export const createAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { id } = tenantIdParamSchema.parse(req.params);
    const body = createCompanyAdminSchema.parse(req.body);
    const admin = await createCompanyAdmin(id, body, req.user!.id);
    sendSuccess(res, 201, { admin });
  } catch (error) {
    next(error);
  }
};

export const destroy: RequestHandler = async (req, res, next) => {
  try {
    const { id } = tenantIdParamSchema.parse(req.params);
    await deleteTenant(id, req.user!.id);
    sendSuccess(res, 200, { deleted: true });
  } catch (error) {
    next(error);
  }
};
