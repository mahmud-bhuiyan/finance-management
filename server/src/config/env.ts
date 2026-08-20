import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_COOKIE_NAME: z.string().default("fms_token"),
  JWT_COOKIE_MAX_AGE_MS: z.coerce.number().default(7 * 24 * 60 * 60 * 1000),
});

export const env = envSchema.parse(process.env);
