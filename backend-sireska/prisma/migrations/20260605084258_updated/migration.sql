/*
  Warnings:

  - You are about to drop the column `jadwal_id` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the `jadwalfasilitas` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `jam_mulai` to the `Reservasi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jam_selesai` to the `Reservasi` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `jadwalfasilitas` DROP FOREIGN KEY `JadwalFasilitas_fasilitas_id_fkey`;

-- DropForeignKey
ALTER TABLE `reservasi` DROP FOREIGN KEY `Reservasi_jadwal_id_fkey`;

-- AlterTable
ALTER TABLE `fasilitas` ADD COLUMN `jam_buka` VARCHAR(5) NOT NULL DEFAULT '08:00',
    ADD COLUMN `jam_tutup` VARCHAR(5) NOT NULL DEFAULT '22:00';

-- AlterTable
ALTER TABLE `reservasi` DROP COLUMN `jadwal_id`,
    ADD COLUMN `jam_mulai` VARCHAR(5) NOT NULL,
    ADD COLUMN `jam_selesai` VARCHAR(5) NOT NULL;

-- DropTable
DROP TABLE `jadwalfasilitas`;

-- CreateTable
CREATE TABLE `SlotTidakTersedia` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `fasilitas_id` INTEGER UNSIGNED NOT NULL,
    `tanggal` DATE NOT NULL,
    `jam_mulai` VARCHAR(5) NOT NULL,
    `jam_selesai` VARCHAR(5) NOT NULL,
    `keterangan` VARCHAR(255) NULL,

    INDEX `SlotTidakTersedia_fasilitas_id_idx`(`fasilitas_id`),
    INDEX `SlotTidakTersedia_tanggal_idx`(`tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Reservasi_tanggal_idx` ON `Reservasi`(`tanggal`);

-- AddForeignKey
ALTER TABLE `SlotTidakTersedia` ADD CONSTRAINT `SlotTidakTersedia_fasilitas_id_fkey` FOREIGN KEY (`fasilitas_id`) REFERENCES `Fasilitas`(`fasilitas_id`) ON DELETE CASCADE ON UPDATE CASCADE;
