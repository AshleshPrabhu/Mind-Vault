-- AlterTable
ALTER TABLE "public"."Messages" ADD COLUMN     "encryptedData" TEXT,
ADD COLUMN     "isEncrypted" BOOLEAN NOT NULL DEFAULT false;
