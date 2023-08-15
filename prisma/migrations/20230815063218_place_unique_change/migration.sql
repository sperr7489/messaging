/*
  Warnings:

  - A unique constraint covering the columns `[hostId,description]` on the table `Place` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Place_description_key` ON `Place`;

-- CreateIndex
CREATE UNIQUE INDEX `Place_hostId_description_key` ON `Place`(`hostId`, `description`);
