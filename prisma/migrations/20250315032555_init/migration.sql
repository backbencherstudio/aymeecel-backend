/*
  Warnings:

  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_postId_fkey";

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "descriptions" JSONB;

-- DropTable
DROP TABLE "categories";

-- DropEnum
DROP TYPE "CategoryName";
