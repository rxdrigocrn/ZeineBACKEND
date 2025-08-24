/*
  Warnings:

  - A unique constraint covering the columns `[slug,userId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Product_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_userId_key" ON "public"."Product"("slug", "userId");
