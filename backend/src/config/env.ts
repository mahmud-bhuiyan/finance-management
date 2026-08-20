import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
});

export const env = envSchema.parse(process.env);
