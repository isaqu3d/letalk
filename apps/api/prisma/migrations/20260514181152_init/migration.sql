-- CreateTable
CREATE TABLE "company_snapshots" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnaePrincipal" TEXT,
    "cnaeDescription" TEXT,
    "capitalSocial" DOUBLE PRECISION,
    "porte" TEXT,
    "situacao" TEXT,
    "dataAbertura" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "contactRole" TEXT,
    "segment" TEXT NOT NULL,
    "employeeRange" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshotId" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_snapshots_cnpj_key" ON "company_snapshots"("cnpj");

-- CreateIndex
CREATE INDEX "leads_cnpj_idx" ON "leads"("cnpj");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "leads_email_cnpj_key" ON "leads"("email", "cnpj");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "company_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
