-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Place` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reservation` (
    `userId` INTEGER NOT NULL,
    `placeId` INTEGER NOT NULL,
    `reservationNum` INTEGER NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `tagReservation` VARCHAR(191) NOT NULL,
    `dateReservation` VARCHAR(191) NOT NULL,

    INDEX `Reservation_userId_idx`(`userId`),
    INDEX `Reservation_placeId_idx`(`placeId`),
    UNIQUE INDEX `Reservation_userId_placeId_key`(`userId`, `placeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
