import type { RequestHandler } from "express";
import {
  createFieldDefinition,
  deleteFieldDefinition,
  getFieldDefinition,
  listFieldDefinitions,
  updateFieldDefinition,
} from "../services/fieldService.js";
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
    res.status(200).json({ ok: true, fields });
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = fieldIdParamSchema.parse(req.params);
    const field = await getFieldDefinition(req.user!.tenantId!, id);
    res.status(200).json({ ok: true, field });
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
    res.status(201).json({ ok: true, field });
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
    res.status(200).json({ ok: true, field });
  } catch (error) {
    next(error);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const { id } = fieldIdParamSchema.parse(req.params);
    await deleteFieldDefinition(req.user!.tenantId!, id, req.user!.id);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
