-- AlterTable
ALTER TABLE "roles" ADD COLUMN "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "role_permissions";

-- DropTable
DROP TABLE "permissions";
