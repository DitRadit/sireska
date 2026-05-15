-- CreateTable
CREATE TABLE `Reservasi` (
    `reservasi_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `fasilitas_id` INTEGER UNSIGNED NOT NULL,
    `jadwal_id` INTEGER UNSIGNED NOT NULL,
    `tanggal` DATE NOT NULL,
    `keperluan` VARCHAR(255) NULL,
    `status` ENUM('menunggu', 'disetujui', 'ditolak') NOT NULL DEFAULT 'menunggu',
    `catatan_admin` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Reservasi_user_id_idx`(`user_id`),
    INDEX `Reservasi_fasilitas_id_idx`(`fasilitas_id`),
    INDEX `Reservasi_jadwal_id_idx`(`jadwal_id`),
    INDEX `Reservasi_status_idx`(`status`),
    PRIMARY KEY (`reservasi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reservasi` ADD CONSTRAINT `Reservasi_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservasi` ADD CONSTRAINT `Reservasi_fasilitas_id_fkey` FOREIGN KEY (`fasilitas_id`) REFERENCES `Fasilitas`(`fasilitas_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservasi` ADD CONSTRAINT `Reservasi_jadwal_id_fkey` FOREIGN KEY (`jadwal_id`) REFERENCES `JadwalFasilitas`(`jadwal_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
