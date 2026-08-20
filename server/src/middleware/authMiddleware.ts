import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { UserRole } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        tenantId: string | null;
      };
    }
  }
}

const readToken = (req: Request): string | null => {
  const cookieToken = req.cookies?.[env.JWT_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }

  return null;
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  try {
    const token = readToken(req);
    if (!token) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId ?? null,
    };
    next();
  } catch {
    next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
  }
};

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = readToken(req);
    if (!token) {
      next();
      return;
    }

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId ?? null,
    };
  } catch {
    // ignore invalid optional tokens
  }
  next();
};
