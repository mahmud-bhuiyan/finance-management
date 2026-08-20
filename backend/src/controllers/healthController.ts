import type { RequestHandler } from "express";
import { checkDatabaseConnection } from "../services/healthService.js";

export const getHealth: RequestHandler = async (_req, res, next) => {
  try {
    const db = await checkDatabaseConnection();

    res.status(db.connected ? 200 : 503).json({
      ok: db.connected,
      service: "fms-api",
      timestamp: new Date().toISOString(),
      database: db,
    });
  } catch (error) {
    next(error);
  }
};
