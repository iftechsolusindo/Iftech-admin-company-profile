/*
  Warnings:

  - You are about to drop the column `content` on the `blogs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "content",
ADD COLUMN     "contentUrl" TEXT;
