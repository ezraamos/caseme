/*
  Warnings:

  - You are about to drop the column `auth_provider_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "auth_provider_id",
DROP COLUMN "email_verified",
ADD COLUMN     "emailVerified" BOOLEAN;
