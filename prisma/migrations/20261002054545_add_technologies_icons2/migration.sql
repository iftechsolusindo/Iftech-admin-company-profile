/*
  Warnings:

  - You are about to drop the `technologies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "technologies";

-- CreateTable
CREATE TABLE "technologiesicons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technologiesicons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "technologiesicons_name_key" ON "technologiesicons"("name");
