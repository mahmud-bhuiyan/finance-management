import { z } from "zod";

export const supportDataKinds = ["category", "department", "vendor"] as const;
export type SupportDataKind = (typeof supportDataKinds)[number];

export const listSupportDataQuerySchema = z.object({
  active: z
    .enum(["true", "false"])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === "true",
    ),
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export const createSupportDataSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  notes: z.string().trim().max(500).optional(),
  active: z.boolean().optional(),
});

export const updateSupportDataSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    notes: z.string().trim().max(500).nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).some((key) => data[key as keyof typeof data] !== undefined),
    { message: "Provide at least one field to update" },
  );

export const supportDataIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export type ListSupportDataQuery = z.infer<typeof listSupportDataQuerySchema>;
export type CreateSupportDataInput = z.infer<typeof createSupportDataSchema>;
export type UpdateSupportDataInput = z.infer<typeof updateSupportDataSchema>;
