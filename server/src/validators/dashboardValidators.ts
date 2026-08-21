import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

const dateOnlySchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

const optionalIdQuerySchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.string().trim().min(1).optional(),
);

const optionalPaymentMethodQuerySchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.nativeEnum(PaymentMethod).optional(),
);

export const dashboardPresetSchema = z.enum([
  "this_month",
  "last_month",
  "this_year",
  "last_30_days",
  "custom",
]);

export const dashboardSummaryQuerySchema = z
  .object({
    preset: dashboardPresetSchema.default("this_month"),
    from: dateOnlySchema.optional(),
    to: dateOnlySchema.optional(),
    categoryId: optionalIdQuerySchema,
    departmentId: optionalIdQuerySchema,
    vendorId: optionalIdQuerySchema,
    paymentMethod: optionalPaymentMethodQuerySchema,
  })
  .superRefine((data, ctx) => {
    if (data.preset === "custom") {
      if (!data.from || !data.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Custom range requires from and to (YYYY-MM-DD)",
          path: ["from"],
        });
        return;
      }
      if (data.from > data.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "from must be on or before to",
          path: ["from"],
        });
      }
    }
  });

export type DashboardSummaryQuery = z.infer<typeof dashboardSummaryQuerySchema>;
