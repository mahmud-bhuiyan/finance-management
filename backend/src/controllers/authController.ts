import type { CookieOptions, RequestHandler } from "express";
import { env } from "../config/env.js";
import {
  getUserById,
  loginUser,
  registerUser,
} from "../services/authService.js";
import {
  loginSchema,
  registerSchema,
} from "../validators/authValidators.js";

const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: env.JWT_COOKIE_MAX_AGE_MS,
  path: "/",
});

export const register: RequestHandler = async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const result = await registerUser(body);

    res
      .cookie(env.JWT_COOKIE_NAME, result.accessToken, cookieOptions())
      .status(201)
      .json({ ok: true, user: result.user });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await loginUser(body);

    res
      .cookie(env.JWT_COOKIE_NAME, result.accessToken, cookieOptions())
      .status(200)
      .json({ ok: true, user: result.user });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (_req, res) => {
  res
    .clearCookie(env.JWT_COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })
    .status(200)
    .json({ ok: true });
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ ok: false, message: "Unauthorized" });
      return;
    }

    const user = await getUserById(req.user.id);
    res.status(200).json({ ok: true, user });
  } catch (error) {
    next(error);
  }
};
