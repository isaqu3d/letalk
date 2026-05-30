/*
  Warnings:

  - You are about to drop the column `snapshotId` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the `company_snapshots` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `razaoSocial` to the `leads` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_snapshotId_fkey";

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "snapshotId",
ADD COLUMN     "capitalSocial" DOUBLE PRECISION,
ADD COLUMN     "cnaeDescription" TEXT,
ADD COLUMN     "cnaePrincipal" TEXT,
ADD COLUMN     "dataAbertura" TIMESTAMP(3),
ADD COLUMN     "nomeFantasia" TEXT,
ADD COLUMN     "porte" TEXT,
ADD COLUMN     "razaoSocial" TEXT NOT NULL,
ADD COLUMN     "situacao" TEXT;

-- DropTable
DROP TABLE "company_snapshots";
