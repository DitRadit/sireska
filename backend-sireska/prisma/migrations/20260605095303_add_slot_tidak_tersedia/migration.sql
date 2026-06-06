/*
  Warnings:

  - You are about to drop the column `alamat` on the `fasilitas` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `fasilitas` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `fasilitas` table. All the data in the column will be lost.
  - The primary key for the `slottidaktersedia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `slottidaktersedia` table. All the data in the column will be lost.
  - Added the required column `slot_id` to the `SlotTidakTersedia` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Reservasi_status_idx` ON `reservasi`;

-- DropIndex
DROP INDEX `Reservasi_tanggal_idx` ON `reservasi`;

-- AlterTable
ALTER TABLE `fasilitas` DROP COLUMN `alamat`,
    DROP COLUMN `latitude`,
    DROP COLUMN `longitude`,
    ALTER COLUMN `jam_buka` DROP DEFAULT,
    ALTER COLUMN `jam_tutup` DROP DEFAULT;

-- AlterTable
ALTER TABLE `slottidaktersedia` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `slot_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`slot_id`);
