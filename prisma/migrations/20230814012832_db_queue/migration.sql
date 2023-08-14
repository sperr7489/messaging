/*
  Warnings:

  - Added the required column `hostId` to the `MessageBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hostId` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MessageBase` ADD COLUMN `hostId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Place` ADD COLUMN `hostId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Host` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `spaceCloudEmail` VARCHAR(191) NOT NULL,
    `spaceCloudPw` VARCHAR(191) NOT NULL,
    `aligoId` VARCHAR(191) NOT NULL,
    `aligoKey` VARCHAR(191) NOT NULL,
    `aligoSender` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `MessageBase_hostId_idx` ON `MessageBase`(`hostId`);

-- CreateIndex
CREATE INDEX `Place_hostId_idx` ON `Place`(`hostId`);
