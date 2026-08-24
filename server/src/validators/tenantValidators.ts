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
    slug: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase letters, numbers, and hyphens",
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.status !== undefined ||
      data.slug !== undefined,
    {
      message: "Provide name, slug, and/or status",
    },
  );

export const createCompanyAdminSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(120).optional(),
});

export const tenantIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const listTenantsQuerySchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  q: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z.enum(["name", "slug", "admins", "createdAt"]).default("name"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type CreateCompanyAdminInput = z.infer<typeof createCompanyAdminSchema>;
export type ListTenantsQuery = z.infer<typeof listTenantsQuerySchema>;
