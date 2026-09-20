import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(120).optional(),
});

export const loginSchema = z
  .object({
    email: z.string().trim().email().max(255),
    password: z.string().max(128).optional(),
    rememberMe: z.boolean().optional().default(false),
    demoLogin: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.demoLogin && (!data.password || data.password.length < 1)) {
      ctx.addIssue({
        code: "custom",
        message: "Password is required",
        path: ["password"],
      });
    }
  });

export const updateThemeSchema = z.object({
  themePreference: z.enum(["LIGHT", "DARK"]),
});

export const updateSidebarSchema = z.object({
  sidebarCollapsed: z.boolean(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateThemeInput = z.infer<typeof updateThemeSchema>;
export type UpdateSidebarInput = z.infer<typeof updateSidebarSchema>;
