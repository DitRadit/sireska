/*
  Warnings:

  - The `harga_per_jam` column on the `fasilitas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `payment_status` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the column `payment_type` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the column `payment_url` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the column `snap_token` on the `reservasi` table. All the data in the column will be lost.
  - You are about to drop the column `total_bayar` on the `reservasi` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[midtrans_order_id]` on the table `Reservasi` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `fasilitas` DROP COLUMN `harga_per_jam`,
    ADD COLUMN `harga_per_jam` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `reservasi` DROP COLUMN `payment_status`,
    DROP COLUMN `payment_type`,
    DROP COLUMN `payment_url`,
    DROP COLUMN `snap_token`,
    DROP COLUMN `total_bayar`,
    ADD COLUMN `midtrans_qris_url` VARCHAR(500) NULL,
    ADD COLUMN `status_pembayaran` ENUM('belum_bayar', 'menunggu_pembayaran', 'lunas', 'expired') NULL,
    ADD COLUMN `total_harga` DECIMAL(10, 2) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Reservasi_midtrans_order_id_key` ON `Reservasi`(`midtrans_order_id`);
