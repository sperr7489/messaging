/*
  Warnings:

  - Added the required column `accessToken` to the `Host` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Host` ADD COLUMN `accessToken` VARCHAR(500) NOT NULL;
