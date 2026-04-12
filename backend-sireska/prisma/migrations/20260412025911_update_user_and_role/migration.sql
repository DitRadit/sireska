-- CreateTable
CREATE TABLE `Role` (
    `role_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(30) NOT NULL,
    `deskripsi` VARCHAR(120) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Role_role_name_key`(`role_name`),
    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `user_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id` TINYINT UNSIGNED NOT NULL,
    `nim_nip` VARCHAR(20) NOT NULL,
    `nama_lengkap` VARCHAR(120) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `no_hp` VARCHAR(20) NULL,
    `foto_ktm_url` VARCHAR(255) NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_nim_nip_key`(`nim_nip`),
    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_role_id_idx`(`role_id`),
    INDEX `User_is_verified_idx`(`is_verified`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
