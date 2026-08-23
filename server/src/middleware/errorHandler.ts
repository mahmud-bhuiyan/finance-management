import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    sendError(res, 400, "Validation failed", "VALIDATION_ERROR", err.issues.map(
      (issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }),
    ));
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.code);
    return;
  }

  console.error(err);

  const message =
    err instanceof Error ? err.message : "Unexpected server error";

  sendError(res, 500, message);
};
