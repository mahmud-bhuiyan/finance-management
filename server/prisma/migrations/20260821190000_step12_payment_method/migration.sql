-- Step 12: payment method on financial transactions (dashboard filter + charts)

CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'CHECK', 'OTHER');

ALTER TABLE "financial_transactions" ADD COLUMN "payment_method" "PaymentMethod";

CREATE INDEX "financial_transactions_payment_method_idx" ON "financial_transactions"("payment_method");
