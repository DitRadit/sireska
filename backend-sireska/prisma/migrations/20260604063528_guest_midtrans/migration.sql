-- AlterTable
ALTER TABLE `fasilitas` ADD COLUMN `harga_per_jam` INTEGER UNSIGNED NULL;

-- AlterTable
ALTER TABLE `reservasi` ADD COLUMN `midtrans_order_id` VARCHAR(100) NULL,
    ADD COLUMN `payment_status` VARCHAR(30) NULL,
    ADD COLUMN `payment_type` VARCHAR(30) NULL,
    ADD COLUMN `payment_url` VARCHAR(255) NULL,
    ADD COLUMN `snap_token` VARCHAR(255) NULL,
    ADD COLUMN `total_bayar` INTEGER UNSIGNED NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `nim_nip` VARCHAR(20) NULL;
