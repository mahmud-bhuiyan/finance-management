import jwt, { type SignOptions } from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { env } from "../config/env.js";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  tenantId?: string | null;
};

export const signAccessToken = (
  payload: AuthTokenPayload,
  expiresIn: SignOptions["expiresIn"] = env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== "object" || decoded === null || !("sub" in decoded)) {
    throw new Error("Invalid token payload");
  }

  return decoded as AuthTokenPayload;
};
