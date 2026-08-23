import type { RequestHandler } from "express";
import {
  createSupportItem,
  deleteSupportItem,
  getSupportItem,
  listSupportItems,
  updateSupportItem,
} from "../services/supportDataService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import type { SupportDataKind } from "../validators/supportDataValidators.js";
import {
  createSupportDataSchema,
  listSupportDataQuerySchema,
  supportDataIdParamSchema,
  updateSupportDataSchema,
} from "../validators/supportDataValidators.js";

const responseKey: Record<SupportDataKind, string> = {
  category: "categories",
  department: "departments",
  vendor: "vendors",
};

const itemKey: Record<SupportDataKind, string> = {
  category: "category",
  department: "department",
  vendor: "vendor",
};

export const createSupportDataHandlers = (kind: SupportDataKind) => {
  const list: RequestHandler = async (req, res, next) => {
    try {
      const query = listSupportDataQuerySchema.parse(req.query);
      const items = await listSupportItems(kind, req.user!.tenantId!, query);
      sendSuccess(res, 200, { [responseKey[kind]]: items });
    } catch (error) {
      next(error);
    }
  };

  const getById: RequestHandler = async (req, res, next) => {
    try {
      const { id } = supportDataIdParamSchema.parse(req.params);
      const item = await getSupportItem(kind, req.user!.tenantId!, id);
      sendSuccess(res, 200, { [itemKey[kind]]: item });
    } catch (error) {
      next(error);
    }
  };

  const create: RequestHandler = async (req, res, next) => {
    try {
      const body = createSupportDataSchema.parse(req.body);
      const item = await createSupportItem(
        kind,
        req.user!.tenantId!,
        body,
        req.user!.id,
      );
      sendSuccess(res, 201, { [itemKey[kind]]: item });
    } catch (error) {
      next(error);
    }
  };

  const update: RequestHandler = async (req, res, next) => {
    try {
      const { id } = supportDataIdParamSchema.parse(req.params);
      const body = updateSupportDataSchema.parse(req.body);
      const item = await updateSupportItem(
        kind,
        req.user!.tenantId!,
        id,
        body,
        req.user!.id,
      );
      sendSuccess(res, 200, { [itemKey[kind]]: item });
    } catch (error) {
      next(error);
    }
  };

  const remove: RequestHandler = async (req, res, next) => {
    try {
      const { id } = supportDataIdParamSchema.parse(req.params);
      await deleteSupportItem(kind, req.user!.tenantId!, id, req.user!.id);
      sendSuccess(res, 200, {});
    } catch (error) {
      next(error);
    }
  };

  return { list, getById, create, update, remove };
};
