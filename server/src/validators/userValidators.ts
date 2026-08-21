import { z } from "zod";

export const tenantUserRoleSchema = z.enum(["COMPANY_ADMIN", "NORMAL_USER"]);
export const userStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const createTenantUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(120).optional(),
  role: tenantUserRoleSchema.default("NORMAL_USER"),
});

export const updateTenantUserSchema = z
  .object({
    name: z.string().trim().min(1).max(120).nullable().optional(),
    role: tenantUserRoleSchema.optional(),
    status: userStatusSchema.optional(),
  })
  .refine(
    (body) =>
      body.name !== undefined ||
      body.role !== undefined ||
      body.status !== undefined,
    { message: "Provide at least one of name, role, or status" },
  );

export const userIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CreateTenantUserInput = z.infer<typeof createTenantUserSchema>;
export type UpdateTenantUserInput = z.infer<typeof updateTenantUserSchema>;
