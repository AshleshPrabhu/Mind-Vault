/*
  Warnings:

  - The values [NGO,MOOD] on the enum `RoomType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."RoomType_new" AS ENUM ('GLOBAL', 'PRIVATE', 'AI');
ALTER TABLE "public"."ChatRooms" ALTER COLUMN "type" TYPE "public"."RoomType_new" USING ("type"::text::"public"."RoomType_new");
ALTER TYPE "public"."RoomType" RENAME TO "RoomType_old";
ALTER TYPE "public"."RoomType_new" RENAME TO "RoomType";
DROP TYPE "public"."RoomType_old";
COMMIT;
