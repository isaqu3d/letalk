-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "municipio" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "socios" JSONB,
ADD COLUMN     "uf" TEXT;
