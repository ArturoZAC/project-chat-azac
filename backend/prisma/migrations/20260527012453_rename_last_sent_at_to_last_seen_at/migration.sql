/*
  Warnings:

  - You are about to drop the column `last_sent_at` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "last_sent_at",
ADD COLUMN     "last_seen_at" TIMESTAMP(3);
