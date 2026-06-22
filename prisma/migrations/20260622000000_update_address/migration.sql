-- AlterTable
ALTER TABLE "Address" RENAME COLUMN "mobile" TO "mobileNumber";
ALTER TABLE "Address" RENAME COLUMN "whatsApp" TO "whatsapp";
ALTER TABLE "Address" RENAME COLUMN "area" TO "city";
ALTER TABLE "Address" ADD COLUMN     "notes" TEXT;
