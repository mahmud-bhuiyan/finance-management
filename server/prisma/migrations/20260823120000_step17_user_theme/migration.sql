-- CreateEnum
CREATE TYPE "UserTheme" AS ENUM ('LIGHT', 'DARK');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "theme_preference" "UserTheme" NOT NULL DEFAULT 'LIGHT';
