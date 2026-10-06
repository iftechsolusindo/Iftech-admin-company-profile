/*
  Warnings:

  - You are about to drop the column `category` on the `projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projects" DROP COLUMN "category",
ADD COLUMN     "clientLocation" TEXT,
ADD COLUMN     "devices" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "galleryImageUrl" TEXT,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "ourResponsibility" TEXT,
ADD COLUMN     "ourResponsibilityImageUrl" TEXT,
ADD COLUMN     "projectDetails" TEXT,
ADD COLUMN     "projectDetailsImageUrl" TEXT,
ADD COLUMN     "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "technologies" JSONB,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "year" INTEGER;
