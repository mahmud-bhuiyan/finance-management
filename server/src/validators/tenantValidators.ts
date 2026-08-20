import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens")
    .optional(),
});

export const updateTenantSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  })
  .refine((data) => data.name !== undefined || data.status !== undefined, {
    message: "Provide name and/or status",
  });

export const createCompanyAdminSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(120).optional(),
});

export const tenantIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type CreateCompanyAdminInput = z.infer<typeof createCompanyAdminSchema>;
