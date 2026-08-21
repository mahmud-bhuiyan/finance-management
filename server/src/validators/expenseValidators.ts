import { z } from "zod";

const dateOnlySchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

const optionalSupportIdSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.union([z.string().trim().min(1), z.null()]).optional(),
);

export const amountSchema = z
  .union([z.number(), z.string()])
  .transform((value, ctx) => {
    const raw = typeof value === "number" ? value.toFixed(2) : value.trim();
    if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(raw)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be a number with up to 2 decimal places",
      });
      return z.NEVER;
    }
    if (Number(raw) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be greater than 0",
      });
      return z.NEVER;
    }
    if (Number(raw) > 999_999_999.99) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount is too large",
      });
      return z.NEVER;
    }
    return raw;
  });

export const listExpensesQuerySchema = z
  .object({
    year: z.coerce.number().int().min(2000).max(2100).optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
  })
  .superRefine((data, ctx) => {
    if ((data.year === undefined) !== (data.month === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide both year and month, or neither",
        path: ["month"],
      });
    }
  });

export const createExpenseSchema = z.object({
  occurredOn: dateOnlySchema,
  amount: amountSchema,
  notes: z.string().trim().max(500).optional(),
  customValues: z.record(z.string(), z.unknown()).optional(),
  categoryId: optionalSupportIdSchema,
  departmentId: optionalSupportIdSchema,
  vendorId: optionalSupportIdSchema,
});

export const updateExpenseSchema = z
  .object({
    occurredOn: dateOnlySchema.optional(),
    amount: amountSchema.optional(),
    notes: z.string().trim().max(500).nullable().optional(),
    customValues: z.record(z.string(), z.unknown()).optional(),
    categoryId: optionalSupportIdSchema,
    departmentId: optionalSupportIdSchema,
    vendorId: optionalSupportIdSchema,
  })
  .refine(
    (data) =>
      Object.keys(data).some((key) => data[key as keyof typeof data] !== undefined),
    { message: "Provide at least one field to update" },
  );

export const expenseIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
