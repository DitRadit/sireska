-- AlterTable
ALTER TABLE `fasilitas` MODIFY `status` ENUM('aktif', 'maintenance', 'nonaktif', 'sedang_digunakan') NOT NULL DEFAULT 'aktif';

-- AlterTable
ALTER TABLE `reservasi` MODIFY `status` ENUM('menunggu', 'disetujui', 'ditolak', 'selesai') NOT NULL DEFAULT 'menunggu';
