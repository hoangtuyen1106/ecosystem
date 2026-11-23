-- Rename enum values in place so existing rows keep their data.
ALTER TYPE "UserGender" RENAME VALUE 'MALE' TO 'male';
ALTER TYPE "UserGender" RENAME VALUE 'FEMALE' TO 'female';
ALTER TYPE "UserGender" RENAME VALUE 'OTHER' TO 'other';
ALTER TYPE "UserGender" RENAME VALUE 'UNKNOWN' TO 'unknown';
