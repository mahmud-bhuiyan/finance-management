import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      ok: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      ok: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  console.error(err);

  const message =
    err instanceof Error ? err.message : "Unexpected server error";

  res.status(500).json({
    ok: false,
    message,
  });
};
