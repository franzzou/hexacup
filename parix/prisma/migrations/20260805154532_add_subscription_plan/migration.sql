-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('ECONOMIQUE', 'CLASSIQUE', 'PREMIUM');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "plan" "PlanType";
