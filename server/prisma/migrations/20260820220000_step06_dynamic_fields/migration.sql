-- Step 06: dynamic field definitions (tenant-scoped)
CREATE TYPE "FieldTarget" AS ENUM ('EXPENSE', 'INCOME');

CREATE TYPE "FieldType" AS ENUM (
    'TEXT',
    'LONG_TEXT',
    'NUMBER',
    'CURRENCY',
    'DATE',
    'BOOLEAN',
    'DROPDOWN',
    'FILE'
);

CREATE TABLE "field_definitions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "target" "FieldTarget" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "field_type" "FieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "show_in_reports" BOOLEAN NOT NULL DEFAULT true,
    "visible_to_normal_user" BOOLEAN NOT NULL DEFAULT false,
    "default_value" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_definitions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "field_definitions_tenant_id_target_key_key" ON "field_definitions"("tenant_id", "target", "key");
CREATE INDEX "field_definitions_tenant_id_target_enabled_sort_order_idx" ON "field_definitions"("tenant_id", "target", "enabled", "sort_order");

ALTER TABLE "field_definitions" ADD CONSTRAINT "field_definitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
