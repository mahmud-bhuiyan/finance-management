export const PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "CHECK",
  "OTHER",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  CHECK: "Check",
  OTHER: "Other",
};

export const paymentMethodLabel = (value: PaymentMethod | null | undefined) =>
  value ? PAYMENT_METHOD_LABELS[value] : "—";
