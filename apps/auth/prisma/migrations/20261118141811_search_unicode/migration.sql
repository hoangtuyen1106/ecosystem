-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "search_unicode" VARCHAR(255);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "search_unicode" VARCHAR(255);
