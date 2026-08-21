import type { RequestHandler } from "express";
import {
  createIncome,
  deleteIncome,
  getIncome,
  listIncomes,
  updateIncome,
} from "../services/incomeService.js";
import {
  createIncomeSchema,
  incomeIdParamSchema,
  listIncomesQuerySchema,
  updateIncomeSchema,
} from "../validators/incomeValidators.js";

export const list: RequestHandler = async (req, res, next) => {
  try {
    const query = listIncomesQuerySchema.parse(req.query);
    const result = await listIncomes(
      req.user!.tenantId!,
      query,
      req.user!.role,
    );
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = incomeIdParamSchema.parse(req.params);
    const result = await getIncome(
      req.user!.tenantId!,
      id,
      req.user!.role,
    );
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (req, res, next) => {
  try {
    const body = createIncomeSchema.parse(req.body);
    const result = await createIncome(
      req.user!.tenantId!,
      body,
      req.user!.id,
    );
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const { id } = incomeIdParamSchema.parse(req.params);
    const body = updateIncomeSchema.parse(req.body);
    const result = await updateIncome(
      req.user!.tenantId!,
      id,
      body,
      req.user!.id,
    );
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const { id } = incomeIdParamSchema.parse(req.params);
    await deleteIncome(req.user!.tenantId!, id, req.user!.id);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
