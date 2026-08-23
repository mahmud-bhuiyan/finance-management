import type { RequestHandler } from "express";
import { checkDatabaseConnection } from "../services/healthService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getHealth: RequestHandler = async (_req, res, next) => {
  try {
    const db = await checkDatabaseConnection();
    const payload = {
      service: "fms-api",
      timestamp: new Date().toISOString(),
      database: db,
    };

    if (db.connected) {
      sendSuccess(res, 200, payload, "Service is healthy");
      return;
    }

    res.status(503).json({
      success: false,
      error: {
        message: db.message,
        code: "DB_UNAVAILABLE",
      },
      data: payload,
    });
  } catch (error) {
    next(error);
  }
};
