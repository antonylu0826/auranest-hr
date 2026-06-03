-- CreateEnum
CREATE TYPE "ShiftCategory" AS ENUM ('FIXED', 'ROTATING');

-- AlterTable
ALTER TABLE "employee_profiles" ADD COLUMN     "shift_type_id" TEXT;

-- CreateTable
CREATE TABLE "shift_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "ShiftCategory" NOT NULL DEFAULT 'FIXED',
    "work_start" TEXT,
    "work_end" TEXT,
    "break_start" TEXT,
    "break_end" TEXT,
    "observe_holidays" BOOLEAN NOT NULL DEFAULT true,
    "flex_earliest_start" TEXT,
    "flex_latest_start" TEXT,
    "work_days_in_cycle" INTEGER,
    "rest_days_in_cycle" INTEGER,
    "cycle_anchor_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shift_types_name_key" ON "shift_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shift_types_code_key" ON "shift_types"("code");

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_shift_type_id_fkey" FOREIGN KEY ("shift_type_id") REFERENCES "shift_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
