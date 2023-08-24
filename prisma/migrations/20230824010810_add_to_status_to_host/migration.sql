/*
  Warnings:

  - Added the required column `status` to the `Host` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Host` ADD COLUMN `status` VARCHAR(4) NOT NULL;
