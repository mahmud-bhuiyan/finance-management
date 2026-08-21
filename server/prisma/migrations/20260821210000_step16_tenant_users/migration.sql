-- Step 16: tenant user management (invite / role / deactivate)
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

ALTER TABLE "users" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX "users_tenant_id_status_idx" ON "users"("tenant_id", "status");
