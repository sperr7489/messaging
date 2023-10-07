-- AlterTable
ALTER TABLE `Reservation` ADD COLUMN `spaceId` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Space` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `imageUrl` VARCHAR(1000) NOT NULL,
    `isPublic` VARCHAR(4) NOT NULL DEFAULT 'Y',
    `message` VARCHAR(2000) NULL,
    `hostId` INTEGER NOT NULL,
    `registedAt` TIMESTAMP(0) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Space_hostId_idx`(`hostId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `isPublic` VARCHAR(4) NOT NULL DEFAULT 'Y',
    `registedAt` TIMESTAMP(0) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `spaceId` INTEGER NOT NULL,

    INDEX `Product_spaceId_idx`(`spaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Reservation_spaceId_idx` ON `Reservation`(`spaceId`);
