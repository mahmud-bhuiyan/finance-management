import { z } from "zod";

export const fieldTargetSchema = z.enum(["EXPENSE", "INCOME"]);

export const fieldTypeSchema = z.enum([
  "TEXT",
  "LONG_TEXT",
  "NUMBER",
  "CURRENCY",
  "DATE",
  "BOOLEAN",
  "DROPDOWN",
  "FILE",
]);

const fieldKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(
    /^[a-z][a-z0-9_]*$/,
    "Key must start with a letter and use lowercase letters, numbers, and underscores",
  );

const fieldOptionsSchema = z.object({
  choices: z.array(z.string().trim().min(1).max(120)).min(1).max(100),
});

const dropdownRefine = (
  data: { fieldType?: string; options?: z.infer<typeof fieldOptionsSchema> },
  ctx: z.RefinementCtx,
) => {
  if (data.fieldType === "DROPDOWN" && !data.options) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Dropdown fields require options.choices",
      path: ["options"],
    });
  }
};

export const listFieldsQuerySchema = z.object({
  target: fieldTargetSchema.optional(),
  enabled: z
    .enum(["true", "false"])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === "true",
    ),
});

export const createFieldSchema = z
  .object({
    target: fieldTargetSchema,
    key: fieldKeySchema.optional(),
    label: z.string().trim().min(1).max(120),
    fieldType: fieldTypeSchema,
    required: z.boolean().optional(),
    enabled: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
    options: fieldOptionsSchema.optional(),
    showInReports: z.boolean().optional(),
    visibleToNormalUser: z.boolean().optional(),
    defaultValue: z.unknown().optional(),
  })
  .superRefine(dropdownRefine);

export const updateFieldSchema = z
  .object({
    label: z.string().trim().min(1).max(120).optional(),
    fieldType: fieldTypeSchema.optional(),
    required: z.boolean().optional(),
    enabled: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
    options: fieldOptionsSchema.nullable().optional(),
    showInReports: z.boolean().optional(),
    visibleToNormalUser: z.boolean().optional(),
    defaultValue: z.unknown().nullable().optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).some(
        (key) => data[key as keyof typeof data] !== undefined,
      ),
    { message: "Provide at least one field to update" },
  )
  .superRefine((data, ctx) => {
    if (data.fieldType === "DROPDOWN" && data.options === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Changing to DROPDOWN requires options.choices",
        path: ["options"],
      });
    }
  });

export const fieldIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export type ListFieldsQuery = z.infer<typeof listFieldsQuerySchema>;
export type CreateFieldInput = z.infer<typeof createFieldSchema>;
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>;
