-- CreateTable
CREATE TABLE `Reservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `placeDescription` VARCHAR(191) NOT NULL,
    `reservationNum` INTEGER NOT NULL,
    `tagReservation` VARCHAR(191) NOT NULL,
    `dateReservation` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Reservation_reservationNum_key`(`reservationNum`),
    INDEX `Reservation_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userName` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `User_phoneNumber_key`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messageBase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `maxReservationNum` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `messageBase_maxReservationNum_key`(`maxReservationNum`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
