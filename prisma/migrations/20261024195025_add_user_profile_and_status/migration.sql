-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" VARCHAR(30),
ADD COLUMN     "photo" VARCHAR(255);

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");
