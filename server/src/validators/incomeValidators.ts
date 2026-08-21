import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

const dateOnlySchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

const optionalSupportIdSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.union([z.string().trim().min(1), z.null()]).optional(),
);

const optionalIdQuerySchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.string().trim().min(1).optional(),
);

const optionalPaymentMethodSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.union([z.nativeEnum(PaymentMethod), z.null()]).optional(),
);

const optionalPaymentMethodQuerySchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.nativeEnum(PaymentMethod).optional(),
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

export const listIncomesQuerySchema = z
  .object({
    year: z.coerce.number().int().min(2000).max(2100).optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    q: z.string().trim().max(200).optional(),
    categoryId: optionalIdQuerySchema,
    departmentId: optionalIdQuerySchema,
    vendorId: optionalIdQuerySchema,
    paymentMethod: optionalPaymentMethodQuerySchema,
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z
      .enum(["occurredOn", "amount", "createdAt"])
      .default("occurredOn"),
    sortDir: z.enum(["asc", "desc"]).default("desc"),
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

export const createIncomeSchema = z.object({
  occurredOn: dateOnlySchema,
  amount: amountSchema,
  notes: z.string().trim().max(500).optional(),
  paymentMethod: optionalPaymentMethodSchema,
  customValues: z.record(z.string(), z.unknown()).optional(),
  categoryId: optionalSupportIdSchema,
  departmentId: optionalSupportIdSchema,
  vendorId: optionalSupportIdSchema,
});

export const updateIncomeSchema = z
  .object({
    occurredOn: dateOnlySchema.optional(),
    amount: amountSchema.optional(),
    notes: z.string().trim().max(500).nullable().optional(),
    paymentMethod: optionalPaymentMethodSchema,
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

export const incomeIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export type ListIncomesQuery = z.infer<typeof listIncomesQuerySchema>;
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
