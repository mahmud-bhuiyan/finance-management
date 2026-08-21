import { PaymentMethod } from "@prisma/client";

export const PAYMENT_METHODS = [
  PaymentMethod.CASH,
  PaymentMethod.CARD,
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.CHECK,
  PaymentMethod.OTHER,
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodValue, string> = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  CHECK: "Check",
  OTHER: "Other",
};

export const paymentMethodLabel = (value: PaymentMethodValue | null | undefined) =>
  value ? PAYMENT_METHOD_LABELS[value] : "Unspecified";
