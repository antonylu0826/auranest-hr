-- CreateEnum
CREATE TYPE "OrgUnitLevel" AS ENUM ('COMPANY', 'DIVISION', 'DEPARTMENT', 'TEAM');

-- AlterTable
ALTER TABLE "employee_profiles" ADD COLUMN     "org_unit_id" TEXT;

-- CreateTable
CREATE TABLE "org_units" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "OrgUnitLevel" NOT NULL,
    "head_id" TEXT,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "org_units_parent_id_idx" ON "org_units"("parent_id");

-- CreateIndex
CREATE INDEX "employee_profiles_org_unit_id_idx" ON "employee_profiles"("org_unit_id");

-- AddForeignKey
ALTER TABLE "org_units" ADD CONSTRAINT "org_units_head_id_fkey" FOREIGN KEY ("head_id") REFERENCES "employee_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_units" ADD CONSTRAINT "org_units_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "org_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_org_unit_id_fkey" FOREIGN KEY ("org_unit_id") REFERENCES "org_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
