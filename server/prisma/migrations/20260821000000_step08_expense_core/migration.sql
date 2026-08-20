-- Step 08: shared financial_transactions (expense CRUD + soft delete)
CREATE TYPE "TransactionType" AS ENUM ('EXPENSE', 'INCOME');

CREATE TABLE "financial_transactions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "occurred_on" DATE NOT NULL,
    "amount" DECIMAL(19,2) NOT NULL,
    "notes" TEXT,
    "custom_values" JSONB NOT NULL DEFAULT '{}',
    "deleted_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "financial_transactions_tenant_id_type_deleted_at_occurred_on_idx"
    ON "financial_transactions"("tenant_id", "type", "deleted_at", "occurred_on");

ALTER TABLE "financial_transactions"
    ADD CONSTRAINT "financial_transactions_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "financial_transactions"
    ADD CONSTRAINT "financial_transactions_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
