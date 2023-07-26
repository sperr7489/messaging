/*
  Warnings:

  - You are about to drop the column `placeDescription` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the `messageBase` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `placeId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Reservation` DROP COLUMN `placeDescription`,
    ADD COLUMN `placeId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `messageBase`;

-- CreateTable
CREATE TABLE `MessageBase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `maxReservationNum` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `MessageBase_maxReservationNum_key`(`maxReservationNum`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Place` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,

    UNIQUE INDEX `Place_description_key`(`description`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Reservation_placeId_idx` ON `Reservation`(`placeId`);
