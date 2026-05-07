-- CreateTable
CREATE TABLE `Fasilitas` (
    `fasilitas_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_fasilitas` VARCHAR(100) NOT NULL,
    `deskripsi` TEXT NULL,
    `lokasi` VARCHAR(150) NULL,
    `kapasitas` SMALLINT UNSIGNED NULL,
    `gambar_url` VARCHAR(500) NULL,
    `gambar_public_id` VARCHAR(255) NULL,
    `status` ENUM('aktif', 'maintenance', 'nonaktif') NOT NULL DEFAULT 'aktif',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`fasilitas_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JadwalFasilitas` (
    `jadwal_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `fasilitas_id` INTEGER UNSIGNED NOT NULL,
    `hari` ENUM('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu') NOT NULL,
    `jam_buka` VARCHAR(5) NOT NULL,
    `jam_tutup` VARCHAR(5) NOT NULL,

    INDEX `JadwalFasilitas_fasilitas_id_idx`(`fasilitas_id`),
    PRIMARY KEY (`jadwal_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JadwalFasilitas` ADD CONSTRAINT `JadwalFasilitas_fasilitas_id_fkey` FOREIGN KEY (`fasilitas_id`) REFERENCES `Fasilitas`(`fasilitas_id`) ON DELETE CASCADE ON UPDATE CASCADE;
