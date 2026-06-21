-- AlterTable
ALTER TABLE "Variety" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
