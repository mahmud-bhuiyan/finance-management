import type { RequestHandler } from "express";
import {
  createFieldDefinition,
  deleteFieldDefinition,
  getFieldDefinition,
  listFieldDefinitions,
  updateFieldDefinition,
} from "../services/fieldService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  createFieldSchema,
  fieldIdParamSchema,
  listFieldsQuerySchema,
  updateFieldSchema,
} from "../validators/fieldValidators.js";

export const list: RequestHandler = async (req, res, next) => {
  try {
    const query = listFieldsQuerySchema.parse(req.query);
    const fields = await listFieldDefinitions(req.user!.tenantId!, query);
    sendSuccess(res, 200, { fields });
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = fieldIdParamSchema.parse(req.params);
    const field = await getFieldDefinition(req.user!.tenantId!, id);
    sendSuccess(res, 200, { field });
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (req, res, next) => {
  try {
    const body = createFieldSchema.parse(req.body);
    const field = await createFieldDefinition(
      req.user!.tenantId!,
      body,
      req.user!.id,
    );
    sendSuccess(res, 201, { field });
  } catch (error) {
    next(error);
  }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const { id } = fieldIdParamSchema.parse(req.params);
    const body = updateFieldSchema.parse(req.body);
    const field = await updateFieldDefinition(
      req.user!.tenantId!,
      id,
      body,
      req.user!.id,
    );
    sendSuccess(res, 200, { field });
  } catch (error) {
    next(error);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const { id } = fieldIdParamSchema.parse(req.params);
    await deleteFieldDefinition(req.user!.tenantId!, id, req.user!.id);
    sendSuccess(res, 200, {});
  } catch (error) {
    next(error);
  }
};
