-- Step 09: expense categories, departments, vendors + FKs on financial_transactions
CREATE TABLE "expense_categories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "expense_categories_tenant_id_deleted_at_active_name_idx"
    ON "expense_categories"("tenant_id", "deleted_at", "active", "name");

CREATE INDEX "departments_tenant_id_deleted_at_active_name_idx"
    ON "departments"("tenant_id", "deleted_at", "active", "name");

CREATE INDEX "vendors_tenant_id_deleted_at_active_name_idx"
    ON "vendors"("tenant_id", "deleted_at", "active", "name");

ALTER TABLE "expense_categories"
    ADD CONSTRAINT "expense_categories_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "departments"
    ADD CONSTRAINT "departments_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vendors"
    ADD CONSTRAINT "vendors_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "financial_transactions"
    ADD COLUMN "category_id" TEXT,
    ADD COLUMN "department_id" TEXT,
    ADD COLUMN "vendor_id" TEXT;

CREATE INDEX "financial_transactions_category_id_idx"
    ON "financial_transactions"("category_id");

CREATE INDEX "financial_transactions_department_id_idx"
    ON "financial_transactions"("department_id");

CREATE INDEX "financial_transactions_vendor_id_idx"
    ON "financial_transactions"("vendor_id");

ALTER TABLE "financial_transactions"
    ADD CONSTRAINT "financial_transactions_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "financial_transactions"
    ADD CONSTRAINT "financial_transactions_department_id_fkey"
    FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "financial_transactions"
    ADD CONSTRAINT "financial_transactions_vendor_id_fkey"
    FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
