import type { RequestHandler } from "express";
import {
  createTenantUser,
  listTenantUsers,
  updateTenantUser,
} from "../services/userService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  createTenantUserSchema,
  updateTenantUserSchema,
  userIdParamSchema,
} from "../validators/userValidators.js";

export const list: RequestHandler = async (req, res, next) => {
  try {
    const users = await listTenantUsers(req.user!.tenantId!);
    sendSuccess(res, 200, { users });
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (req, res, next) => {
  try {
    const body = createTenantUserSchema.parse(req.body);
    const user = await createTenantUser(
      req.user!.tenantId!,
      body,
      req.user!.id,
    );
    sendSuccess(res, 201, { user });
  } catch (error) {
    next(error);
  }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const body = updateTenantUserSchema.parse(req.body);
    const user = await updateTenantUser(
      req.user!.tenantId!,
      id,
      body,
      req.user!.id,
    );
    sendSuccess(res, 200, { user });
  } catch (error) {
    next(error);
  }
};
