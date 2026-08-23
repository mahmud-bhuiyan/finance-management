import type { CookieOptions, RequestHandler } from "express";
import { env } from "../config/env.js";
import {
  getUserById,
  loginUser,
  registerUser,
} from "../services/authService.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  loginSchema,
  registerSchema,
} from "../validators/authValidators.js";

const isProduction =
  env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

const cookieOptions = (rememberMe = true): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  // Cross-origin client ↔ API in production requires SameSite=None + Secure.
  sameSite: isProduction ? "none" : "lax",
  ...(rememberMe ? { maxAge: env.JWT_COOKIE_MAX_AGE_MS } : {}),
  path: "/",
});

export const register: RequestHandler = async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const result = await registerUser(body);

    res
      .cookie(env.JWT_COOKIE_NAME, result.accessToken, cookieOptions(true));
    sendSuccess(res, 201, { user: result.user }, "Account registered successfully");
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await loginUser(body);

    res.cookie(
      env.JWT_COOKIE_NAME,
      result.accessToken,
      cookieOptions(result.rememberMe),
    );
    sendSuccess(res, 200, { user: result.user }, "Logged in successfully");
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(env.JWT_COOKIE_NAME, cookieOptions(true));
  sendSuccess(res, 200, {}, "Logged out successfully");
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }

    const user = await getUserById(req.user.id);
    sendSuccess(res, 200, { user }, "Current user loaded");
  } catch (error) {
    next(error);
  }
};
