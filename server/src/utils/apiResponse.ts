import type { Response } from "express";

export type ApiErrorDetail = {
  path: string;
  message: string;
};

export type ApiErrorBody = {
  message: string;
  code?: string;
  details?: ApiErrorDetail[];
};

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiErrorBody;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export const successResponse = <T>(
  data: T,
  message = "Request completed successfully",
): ApiSuccessResponse<T> => ({
  success: true,
  message,
  data,
});

export const defaultSuccessMessage = (statusCode: number) => {
  if (statusCode === 201) {
    return "Created successfully";
  }
  if (statusCode === 204) {
    return "Deleted successfully";
  }
  return "Request completed successfully";
};

export const errorResponse = (
  message: string,
  code?: string,
  details?: ApiErrorDetail[],
): ApiErrorResponse => ({
  success: false,
  error: {
    message,
    ...(code ? { code } : {}),
    ...(details?.length ? { details } : {}),
  },
});

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message?: string,
): Response =>
  res
    .status(statusCode)
    .json(successResponse(data, message ?? defaultSuccessMessage(statusCode)));

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  code?: string,
  details?: ApiErrorDetail[],
): Response =>
  res.status(statusCode).json(errorResponse(message, code, details));
