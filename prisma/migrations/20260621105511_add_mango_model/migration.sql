-- CreateTable
CREATE TABLE "Variety" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variety_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mango" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "stock" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "varietyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mango_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Variety_name_key" ON "Variety"("name");

-- AddForeignKey
ALTER TABLE "Mango" ADD CONSTRAINT "Mango_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "Variety"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
