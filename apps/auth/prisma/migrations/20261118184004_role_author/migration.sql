-- AlterTable: đổi tên cột thay vì drop/add để giữ dữ liệu created_by hiện có.
ALTER TABLE "roles" RENAME COLUMN "created_by" TO "author_id";

-- RenameForeignKey
ALTER TABLE "roles" RENAME CONSTRAINT "roles_created_by_fkey" TO "roles_author_id_fkey";
