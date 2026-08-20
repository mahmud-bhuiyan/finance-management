import type { RequestHandler } from "express";
import {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense,
} from "../services/expenseService.js";
import {
  createExpenseSchema,
  expenseIdParamSchema,
  listExpensesQuerySchema,
  updateExpenseSchema,
} from "../validators/expenseValidators.js";

export const list: RequestHandler = async (req, res, next) => {
  try {
    const query = listExpensesQuerySchema.parse(req.query);
    const result = await listExpenses(
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
    const { id } = expenseIdParamSchema.parse(req.params);
    const result = await getExpense(
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
    const body = createExpenseSchema.parse(req.body);
    const result = await createExpense(
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
    const { id } = expenseIdParamSchema.parse(req.params);
    const body = updateExpenseSchema.parse(req.body);
    const result = await updateExpense(
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
    const { id } = expenseIdParamSchema.parse(req.params);
    await deleteExpense(req.user!.tenantId!, id, req.user!.id);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
