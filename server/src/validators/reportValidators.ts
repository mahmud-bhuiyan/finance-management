import { PaymentMethod } from "@prisma/client";
import { z } from "zod";
import { dashboardPresetSchema } from "./dashboardValidators.js";

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

const reportFiltersObject = z.object({
  preset: dashboardPresetSchema.default("this_month"),
  from: dateOnlySchema.optional(),
  to: dateOnlySchema.optional(),
  categoryId: optionalIdQuerySchema,
  departmentId: optionalIdQuerySchema,
  vendorId: optionalIdQuerySchema,
  paymentMethod: optionalPaymentMethodQuerySchema,
});

const refineCustomRange = (
  data: { preset: string; from?: string; to?: string },
  ctx: z.RefinementCtx,
) => {
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
};

export const reportSummaryQuerySchema =
  reportFiltersObject.superRefine(refineCustomRange);

export const reportExportQuerySchema = reportFiltersObject
  .extend({
    type: z.preprocess(
      (value) => (value === "" || value === undefined ? "ALL" : value),
      z.enum(["EXPENSE", "INCOME", "ALL"]),
    ),
  })
  .superRefine(refineCustomRange);

export type ReportSummaryQuery = z.infer<typeof reportSummaryQuerySchema>;
export type ReportExportQuery = z.infer<typeof reportExportQuerySchema>;