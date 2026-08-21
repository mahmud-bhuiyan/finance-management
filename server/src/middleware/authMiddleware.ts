import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { UserRole } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
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

const loadActiveSessionUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      tenantId: true,
      status: true,
    },
  });

  if (!user) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  }

  if (user.status === "INACTIVE") {
    throw new AppError("This account is inactive", 403, "USER_INACTIVE");
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  };
};

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = readToken(req);
    if (!token) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const payload = verifyAccessToken(token);
    req.user = await loadActiveSessionUser(payload.sub);
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
  }
};

export const optionalAuth = async (
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
    req.user = await loadActiveSessionUser(payload.sub);
  } catch {
    // ignore invalid / inactive optional tokens
  }
  next();
};
