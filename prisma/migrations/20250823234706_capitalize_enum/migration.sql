/*
  Warnings:

  - The values [ANUNCIADO,VENDIDO,CANCELADO] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ProductStatus_new" AS ENUM ('Anunciado', 'Vendido', 'Cancelado');
ALTER TABLE "public"."Product" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Product" ALTER COLUMN "status" TYPE "public"."ProductStatus_new" USING ("status"::text::"public"."ProductStatus_new");
ALTER TYPE "public"."ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "public"."ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "public"."ProductStatus_old";
ALTER TABLE "public"."Product" ALTER COLUMN "status" SET DEFAULT 'Anunciado';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "status" SET DEFAULT 'Anunciado';
