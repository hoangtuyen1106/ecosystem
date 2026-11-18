/*
  Warnings:

  - You are about to drop the column `active` on the `roles` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RoleStatus" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "active",
ADD COLUMN     "status" "RoleStatus" NOT NULL DEFAULT 'active';
